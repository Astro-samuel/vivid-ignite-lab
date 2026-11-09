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
        className="flex-shrink-0 select-none text-right pr-3 pt-5 pb-5 overflow-hidden"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "14px",
          lineHeight: "1.75",
          color: "hsl(210, 12%, 42%)",
          background: "hsl(var(--code-bg))",
          borderRight: "1px solid hsl(var(--code-border))",
          width: "56px",
          minWidth: "56px",
        }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className="px-1" style={{ height: "calc(14px * 1.75)" }}>
            {i + 1}
          </div>
        ))}
      </div>

      {/* Code content */}
      {readOnly ? (
        <pre
          ref={preRef}
          className="flex-1 px-5 py-5 overflow-auto text-sm"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "14px",
            lineHeight: "1.75",
            color: "hsl(var(--code-fg))",
            background: "hsl(var(--code-bg))",
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
          className="flex-1 px-5 py-5 text-sm resize-none focus:outline-none"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "14px",
            lineHeight: "1.75",
            color: "hsl(var(--code-fg))",
            background: "hsl(var(--code-bg))",
            caretColor: "hsl(var(--gold-bright))",
            border: "none",
          }}
          spellCheck={false}
        />
      )}
    </div>
  );
}
