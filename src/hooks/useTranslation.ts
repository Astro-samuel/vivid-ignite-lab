import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

// Cache translations to avoid re-translating
const translationCache: Record<string, Record<string, string>> = {};

// Track nodes we've already translated to avoid re-processing
const translatedNodes = new WeakSet<Text>();

function isTranslatableText(node: Node): boolean {
  const parent = node.parentElement;
  if (!parent) return false;
  const tag = parent.tagName;
  if (["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "TEXTAREA", "CODE", "PRE"].includes(tag)) return false;
  if (parent.closest("[data-no-translate]")) return false;
  if (parent.closest("code, pre, textarea")) return false;
  const text = node.textContent?.trim();
  if (!text || text.length < 2) return false;
  if (/^[\d\s\W]+$/.test(text)) return false;
  return true;
}

function getTextNodes(root: Node): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return isTranslatableText(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });

  const nodes: Text[] = [];
  while (walker.nextNode()) {
    nodes.push(walker.currentNode as Text);
  }
  return nodes;
}

function getSavedLang() {
  try {
    const saved = localStorage.getItem("app-language");
    if (saved) {
      const found = languages.find((l) => l.code === saved);
      if (found) return found;
    }
  } catch {}
  return languages[0];
}

export function useTranslation() {
  const [selectedLang, setSelectedLang] = useState(getSavedLang);
  const [translating, setTranslating] = useState(false);
  const originalTextsRef = useRef<Map<Text, string>>(new Map());
  const location = useLocation();
  const observerRef = useRef<MutationObserver | null>(null);
  const pendingNodesRef = useRef<Text[]>([]);
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentLangRef = useRef(getSavedLang());

  // Batch-translate a set of new text nodes
  const translateNodes = useCallback(async (textNodes: Text[], langCode: string, langLabel: string) => {
    if (textNodes.length === 0) return;

    // Store originals
    textNodes.forEach((node) => {
      if (!originalTextsRef.current.has(node)) {
        originalTextsRef.current.set(node, node.textContent || "");
      }
    });

    // Separate cached vs uncached
    const textsToTranslate: string[] = [];
    const nodeIndices: number[] = [];
    const cacheKey = langCode;

    textNodes.forEach((node, i) => {
      const original = originalTextsRef.current.get(node) || node.textContent || "";
      if (translationCache[cacheKey]?.[original]) {
        node.textContent = translationCache[cacheKey][original];
        translatedNodes.add(node);
      } else {
        textsToTranslate.push(original);
        nodeIndices.push(i);
      }
    });

    if (textsToTranslate.length === 0) return;

    setTranslating(true);

    try {
      const BATCH_SIZE = 50;
      for (let i = 0; i < textsToTranslate.length; i += BATCH_SIZE) {
        const batch = textsToTranslate.slice(i, i + BATCH_SIZE);
        const batchIndices = nodeIndices.slice(i, i + BATCH_SIZE);

        const { data, error } = await supabase.functions.invoke("translate", {
          body: { texts: batch, targetLanguage: langLabel },
        });

        if (error) {
          console.error("Translation error:", error);
          continue;
        }

        const translations: string[] = data?.translations || [];
        if (!translationCache[cacheKey]) translationCache[cacheKey] = {};

        translations.forEach((translated, j) => {
          const nodeIdx = batchIndices[j];
          const node = textNodes[nodeIdx];
          const original = originalTextsRef.current.get(node) || "";
          translationCache[cacheKey][original] = translated;
          if (node.parentNode) {
            node.textContent = translated;
          }
          translatedNodes.add(node);
        });
      }
    } catch (err) {
      console.error("Translation failed:", err);
    } finally {
      setTranslating(false);
    }
  }, []);

  // Translate the full page
  const translatePage = useCallback(async (langCode: string, langLabel: string) => {
    const root = document.body;
    if (!root) return;

    const textNodes = getTextNodes(root);
    // Mark all as needing translation
    translatedNodes.delete = translatedNodes.delete; // no-op, just for clarity
    await translateNodes(textNodes, langCode, langLabel);
  }, [translateNodes]);

  // Queue new nodes for batch translation (from MutationObserver)
  const queueNewNodes = useCallback((nodes: Text[]) => {
    pendingNodesRef.current.push(...nodes);

    if (batchTimerRef.current) clearTimeout(batchTimerRef.current);
    batchTimerRef.current = setTimeout(async () => {
      const lang = currentLangRef.current;
      if (lang.code === "en") return;

      const toTranslate = pendingNodesRef.current.filter(
        (n) => n.parentNode && !translatedNodes.has(n)
      );
      pendingNodesRef.current = [];

      if (toTranslate.length > 0) {
        await translateNodes(toTranslate, lang.code, lang.label);
      }
    }, 300);
  }, [translateNodes]);

  // Set up MutationObserver to catch dynamically added content
  useEffect(() => {
    if (currentLangRef.current.code === "en") {
      // Clean up observer if switching back to English
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    observerRef.current = new MutationObserver((mutations) => {
      const newTextNodes: Text[] = [];

      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE && isTranslatableText(node) && !translatedNodes.has(node as Text)) {
              newTextNodes.push(node as Text);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as Element;
              if (el.closest("[data-no-translate]")) return;
              const textNodes = getTextNodes(el);
              textNodes.forEach((tn) => {
                if (!translatedNodes.has(tn)) {
                  newTextNodes.push(tn);
                }
              });
            }
          });
        }
      }

      if (newTextNodes.length > 0) {
        queueNewNodes(newTextNodes);
      }
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [selectedLang.code, queueNewNodes]);

  // On route change, the MutationObserver will automatically pick up
  // new DOM nodes and translate them. No need to re-translate the full page
  // or clear originals — that causes a flash of untranslated content.

  const restoreOriginal = useCallback(() => {
    originalTextsRef.current.forEach((original, node) => {
      if (node.parentNode) {
        node.textContent = original;
      }
    });
    originalTextsRef.current.clear();
  }, []);

  const selectLanguage = useCallback(
    async (lang: typeof languages[0]) => {
      setSelectedLang(lang);
      currentLangRef.current = lang;
      localStorage.setItem("app-language", lang.code);
      if (lang.code === "en") {
        restoreOriginal();
      } else {
        restoreOriginal();
        await new Promise((r) => setTimeout(r, 100));
        await translatePage(lang.code, lang.label);
      }
    },
    [translatePage, restoreOriginal]
  );

  return { languages, selectedLang, translating, selectLanguage };
}
