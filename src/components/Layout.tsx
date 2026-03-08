import { ReactNode, useEffect, useRef, useState } from "react";
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
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "zh-CN", label: "中文", flag: "🇨🇳" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
];

// Inject Google Translate script once
let gtScriptLoaded = false;
function loadGoogleTranslate() {
  if (gtScriptLoaded) return;
  gtScriptLoaded = true;

  // Define the callback Google Translate expects
  (window as any).googleTranslateElementInit = () => {
    new (window as any).google.translate.TranslateElement(
      {
        pageLanguage: "en",
        autoDisplay: false,
        layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
      },
      "google_translate_element"
    );
  };

  const script = document.createElement("script");
  script.src =
    "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
}

function triggerGoogleTranslate(langCode: string) {
  // Google Translate stores language in a cookie and uses a hidden select
  const frame = document.querySelector<HTMLIFrameElement>(".goog-te-menu-frame");
  if (frame) {
    const doc = frame.contentDocument || frame.contentWindow?.document;
    if (doc) {
      const items = doc.querySelectorAll<HTMLAnchorElement>(".goog-te-menu2-item a");
      items.forEach((item) => {
        // Match by lang code in the anchor's text or value
        if (item.getAttribute("href")?.includes(`#${langCode}`)) {
          item.click();
          return;
        }
      });
    }
  }

  // Fallback: set cookie directly and reload translate frame
  document.cookie = `googtrans=/en/${langCode}; path=/`;
  document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}`;

  // Try triggering via the select element Google injects
  const selectEl = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (selectEl) {
    selectEl.value = langCode;
    selectEl.dispatchEvent(new Event("change"));
  }
}

export default function Layout({ children }: LayoutProps) {
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(languages[0]);

  useEffect(() => {
    loadGoogleTranslate();
  }, []);

  const handleSelectLang = (lang: typeof languages[0]) => {
    setSelectedLang(lang);
    setLangOpen(false);

    if (lang.code === "en") {
      // Reset to English — remove translation
      document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
      document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
      const selectEl = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (selectEl) {
        selectEl.value = "en";
        selectEl.dispatchEvent(new Event("change"));
      }
      // Fallback: reload to clear translation
      setTimeout(() => {
        if (document.querySelector(".goog-te-banner-frame")) {
          window.location.reload();
        }
      }, 300);
    } else {
      triggerGoogleTranslate(lang.code);
    }
  };

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
          {/* Hidden Google Translate element */}
          <div id="google_translate_element" style={{ display: "none" }} />

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
                className="absolute right-0 top-full mt-1 w-44 rounded-xl border py-1 z-50 shadow-xl max-h-64 overflow-y-auto"
                style={{
                  background: "hsl(229, 45%, 14%)",
                  borderColor: "rgba(0,245,255,0.2)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                }}
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleSelectLang(lang)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-left transition-all hover:bg-white/5"
                    style={{
                      color: lang.code === selectedLang.code ? "#00F5FF" : "#E0E7FF",
                    }}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                    {lang.code === selectedLang.code && (
                      <span className="ml-auto text-xs" style={{ color: "#00F5FF" }}>✓</span>
                    )}
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

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* AI Mentor - floating bottom right */}
      <AIMentor />

      {/* Hide Google Translate UI artifacts */}
      <style>{`
        .goog-te-banner-frame, .goog-te-balloon-frame,
        #goog-gt-tt, .goog-te-ftab-frame,
        .VIpgJd-ZVi9od-aZ2wEe-wOHMyf, .VIpgJd-ZVi9od-aZ2wEe-OiiCO {
          display: none !important;
        }
        body { top: 0 !important; }
        .skiptranslate { display: none !important; }
        .goog-te-gadget { display: none !important; }
      `}</style>
    </div>
  );
}
