import { useRef, useEffect, useCallback } from "react";

interface CodeEditorProps {
  code: string;
  onChange?: (code: string) => void;
  readOnly?: boolean;
  maxHeight?: string;
  minHeight?: string;
}

export default function CodeEditor({ code, onChange, readOnly = false, maxHeight = "none", minHeight = "400px" }: CodeEditorProps) {
  const lineRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const syncScroll = useCallback(() => {
    const source = readOnly ? preRef.current : codeRef.current;
    if (lineRef.current && source) {
      lineRef.current.scrollTop = source.scrollTop;
    }
  }, [readOnly]);

  useEffect(() => {
    const source = readOnly ? preRef.current : codeRef.current;
    if (!source) return;
    source.addEventListener("scroll", syncScroll);
    return () => source.removeEventListener("scroll", syncScroll);
  }, [syncScroll, readOnly]);

  const lineCount = code.split("\n").length;

  return (
    <div className="flex overflow-hidden" style={{ maxHeight, minHeight }}>
      {/* Line numbers */}
      <div
        ref={lineRef}
        className="flex-shrink-0 select-none text-right pr-3 pt-4 pb-4 overflow-hidden"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "13px",
          lineHeight: "1.7",
          color: "hsl(228, 25%, 35%)",
          background: "hsl(229, 48%, 7%)",
          borderRight: "1px solid hsl(232, 38%, 18%)",
          width: "48px",
          minWidth: "48px",
        }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className="px-1" style={{ height: "calc(13px * 1.7)" }}>
            {i + 1}
          </div>
        ))}
      </div>

      {/* Code content */}
      {readOnly ? (
        <pre
          ref={preRef}
          className="flex-1 p-4 overflow-auto text-sm"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "13px",
            lineHeight: "1.7",
            color: "#E0E7FF",
            background: "hsl(232, 48%, 8%)",
            margin: 0,
            border: "none",
            whiteSpace: "pre",
          }}
        >
          <code>{code}</code>
        </pre>
      ) : (
        <textarea
          ref={codeRef}
          value={code}
          onChange={(e) => onChange?.(e.target.value)}
          className="flex-1 p-4 text-sm resize-none focus:outline-none"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "13px",
            lineHeight: "1.7",
            color: "#E0E7FF",
            background: "hsl(232, 48%, 8%)",
            caretColor: "#3B82F6",
            border: "none",
          }}
          spellCheck={false}
        />
      )}
    </div>
  );
}
