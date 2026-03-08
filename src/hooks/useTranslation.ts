import { useState, useCallback, useRef } from "react";
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

function getTextNodes(root: Node): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName;
      if (["SCRIPT", "STYLE", "NOSCRIPT", "SVG"].includes(tag)) return NodeFilter.FILTER_REJECT;
      if (parent.closest("[data-no-translate]")) return NodeFilter.FILTER_REJECT;
      const text = node.textContent?.trim();
      if (!text || text.length < 2) return NodeFilter.FILTER_REJECT;
      // Skip pure numbers/symbols
      if (/^[\d\s\W]+$/.test(text)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  while (walker.nextNode()) {
    nodes.push(walker.currentNode as Text);
  }
  return nodes;
}

export function useTranslation() {
  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [translating, setTranslating] = useState(false);
  const originalTextsRef = useRef<Map<Text, string>>(new Map());

  const translatePage = useCallback(async (langCode: string, langLabel: string) => {
    const mainEl = document.querySelector("main");
    if (!mainEl) return;

    const textNodes = getTextNodes(mainEl);
    if (textNodes.length === 0) return;

    // Store originals on first translation
    if (originalTextsRef.current.size === 0) {
      textNodes.forEach((node) => {
        originalTextsRef.current.set(node, node.textContent || "");
      });
    }

    // Collect texts to translate
    const textsToTranslate: string[] = [];
    const nodeIndices: number[] = [];
    const cacheKey = langCode;

    textNodes.forEach((node, i) => {
      const original = originalTextsRef.current.get(node) || node.textContent || "";
      if (translationCache[cacheKey]?.[original]) {
        // Use cached
        node.textContent = translationCache[cacheKey][original];
      } else {
        textsToTranslate.push(original);
        nodeIndices.push(i);
      }
    });

    if (textsToTranslate.length === 0) return;

    setTranslating(true);

    try {
      // Batch in chunks of 50
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
          node.textContent = translated;
        });
      }
    } catch (err) {
      console.error("Translation failed:", err);
    } finally {
      setTranslating(false);
    }
  }, []);

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
      if (lang.code === "en") {
        restoreOriginal();
      } else {
        // Restore first so we translate from originals
        restoreOriginal();
        // Small delay to let DOM settle
        await new Promise((r) => setTimeout(r, 50));
        await translatePage(lang.code, lang.label);
      }
    },
    [translatePage, restoreOriginal]
  );

  return { languages, selectedLang, translating, selectLanguage };
}
