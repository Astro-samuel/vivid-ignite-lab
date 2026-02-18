import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import { Globe, MessageSquare, ChevronDown } from "lucide-react";

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
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleFeedbackSend = () => {
    if (feedbackText.trim()) {
      setFeedbackSent(true);
      setTimeout(() => {
        setFeedbackSent(false);
        setFeedbackText("");
        setFeedbackOpen(false);
      }, 2000);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "hsl(229, 48%, 10%)" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center justify-end gap-2 px-4 py-2 border-b flex-shrink-0"
          style={{
            background: "hsl(229, 48%, 8%)",
            borderColor: "hsl(229, 42%, 20%)",
            minHeight: "48px",
          }}
        >
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => { setLangOpen(!langOpen); setFeedbackOpen(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
              style={{
                background: "rgba(0,245,255,0.08)",
                border: "1px solid rgba(0,245,255,0.2)",
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
                  background: "hsl(229, 45%, 16%)",
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

          {/* Feedback Button */}
          <div className="relative">
            <button
              onClick={() => { setFeedbackOpen(!feedbackOpen); setLangOpen(false); }}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 relative"
              style={{
                background: "linear-gradient(135deg, #FF1493, #B744FF)",
                boxShadow: feedbackOpen ? "0 0 15px rgba(255,20,147,0.5)" : "none",
              }}
            >
              <MessageSquare size={15} style={{ color: "#FFFFFF" }} />
              <span
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                style={{ background: "#00FF88", border: "2px solid hsl(229, 48%, 8%)" }}
              />
            </button>

            {feedbackOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-72 rounded-2xl border p-4 z-50 shadow-2xl"
                style={{
                  background: "hsl(229, 45%, 16%)",
                  borderColor: "rgba(255,20,147,0.3)",
                  boxShadow: "0 15px 40px rgba(0,0,0,0.6)",
                }}
              >
                <h3 className="font-bold text-sm mb-1" style={{ color: "#FFFFFF" }}>Share Feedback</h3>
                <p className="text-xs mb-3" style={{ color: "#A0AED9" }}>Help us improve MakerLab</p>
                {feedbackSent ? (
                  <div className="text-center py-4">
                    <div className="text-2xl mb-2">🎉</div>
                    <p className="text-sm font-semibold" style={{ color: "#00FF88" }}>Thank you!</p>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="What's on your mind?"
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl text-sm resize-none focus:outline-none mb-3"
                      style={{
                        background: "hsl(229, 42%, 22%)",
                        border: "1px solid rgba(255,20,147,0.3)",
                        color: "#FFFFFF",
                      }}
                    />
                    <button
                      onClick={handleFeedbackSend}
                      className="w-full py-2 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
                      style={{
                        background: "linear-gradient(135deg, #FF1493, #B744FF)",
                        color: "#FFFFFF",
                        boxShadow: "0 0 15px rgba(255,20,147,0.3)",
                      }}
                    >
                      Send Feedback
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Click outside handler */}
        {(langOpen || feedbackOpen) && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => { setLangOpen(false); setFeedbackOpen(false); }}
          />
        )}

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
