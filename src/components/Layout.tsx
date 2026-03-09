import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import AIMentor from "./AIMentor";
import { Globe, ChevronDown } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
];

export default function Layout({ children }: LayoutProps) {
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(languages[0]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "hsl(232, 45%, 8%)" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center justify-end gap-2 px-4 py-2 border-b flex-shrink-0"
          style={{
            background: "hsl(232, 48%, 6%)",
            borderColor: "hsl(232, 40%, 16%)",
            minHeight: "48px",
          }}
        >
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
              style={{
                background: "rgba(0,245,255,0.06)",
                border: "1px solid rgba(0,245,255,0.15)",
                color: "#E0E7FF",
              }}
            >
              <span>{selectedLang.flag}</span>
              <Globe size={12} style={{ color: "#00F5FF" }} />
              <span>{selectedLang.label}</span>
              <ChevronDown size={11} style={{ color: "#A0AED9" }} />
            </button>

            {langOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-40 rounded-xl border py-1 z-50 shadow-xl"
                style={{
                  background: "hsl(229, 45%, 14%)",
                  borderColor: "rgba(0,245,255,0.2)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                }}
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setSelectedLang(lang); setLangOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-left transition-all hover:bg-white/5"
                    style={{
                      color: lang.code === selectedLang.code ? "#00F5FF" : "#E0E7FF",
                    }}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Click outside handler */}
        {langOpen && (
          <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
        )}

        <main className="flex-1 overflow-y-auto page-transition-enter">
          {children}
        </main>
      </div>

      {/* AI Mentor - floating bottom right (like original) */}
      <AIMentor />
    </div>
  );
}
