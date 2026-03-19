import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import AIMentor from "./AIMentor";
import { Globe, ChevronDown, Loader2, Menu, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [langOpen, setLangOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { languages, selectedLang, translating, selectLanguage } = useTranslation();

  const handleSelectLang = async (lang: typeof languages[0]) => {
    setLangOpen(false);
    await selectLanguage(lang);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center gap-2 px-4 py-2 border-b flex-shrink-0"
          style={{
            background: "hsl(var(--sidebar-background))",
            borderColor: "hsl(var(--border))",
            minHeight: "48px",
          }}
        >
          {/* Hamburger toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200"
            style={{
              color: "hsl(var(--primary))",
              background: "hsl(var(--primary) / 0.06)",
              border: "1px solid hsl(var(--primary) / 0.12)",
            }}
          >
            {sidebarCollapsed ? <Menu size={16} /> : <X size={16} />}
          </button>

          <div className="flex-1" />

          {/* Language Switcher */}
          <div className="relative" data-no-translate>
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 22, delay: 0.1 }}
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: "hsl(var(--primary) / 0.06)",
                border: "1px solid hsl(var(--primary) / 0.12)",
                color: "hsl(var(--foreground))",
              }}
            >
              {translating ? (
                <Loader2 size={12} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
              ) : (
                <span>{selectedLang.flag}</span>
              )}
              <Globe size={12} style={{ color: "hsl(var(--primary))" }} />
              <span>{selectedLang.label}</span>
              <ChevronDown size={11} style={{ color: "hsl(var(--muted-foreground))" }} />
            </motion.button>

            {/* Language panel */}
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-1 w-44 rounded-xl border py-1 z-50 max-h-64 overflow-y-auto"
                  style={{
                    background: "hsl(var(--popover))",
                    borderColor: "hsl(var(--border))",
                    boxShadow: "0 8px 24px hsl(0 0% 0% / 0.4)",
                  }}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleSelectLang(lang)}
                      disabled={translating}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-left transition-all hover:bg-white/5 disabled:opacity-50"
                      style={{
                        color: lang.code === selectedLang.code ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                      }}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                      {lang.code === selectedLang.code && (
                        <span className="ml-auto text-xs" style={{ color: "hsl(var(--primary))" }}>✓</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Click outside handler */}
        {langOpen && (
          <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
        )}

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <AIMentor />
    </div>
  );
}
