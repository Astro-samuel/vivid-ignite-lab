import { useState } from "react";
import { Code, Copy, Download, Play, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast as sonnerToast } from "sonner";
import ExplainCode from "@/components/ExplainCode";

interface ProjectCodeSectionProps {
  basicCode: string;
  optimizedCode: string;
  projectTitle: string;
}

export default function ProjectCodeSection({ basicCode, optimizedCode, projectTitle }: ProjectCodeSectionProps) {
  const navigate = useNavigate();
  const [codeType, setCodeType] = useState<"basic" | "optimized">("basic");
  const activeCode = codeType === "basic" ? basicCode : optimizedCode;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(activeCode);
      sonnerToast.success("Copied code to clipboard!");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([activeCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectTitle.toLowerCase().replace(/\s+/g, "_")}.ino`;
    a.click();
    URL.revokeObjectURL(url);
    sonnerToast.success("Downloaded sketch file!");
  };

  const handleOpenInIDE = () => {
    localStorage.setItem("activeIDECode", activeCode);
    sonnerToast.success("Transferred sketch code to IDE!");
    navigate("/ide");
  };

  return (
    <div className="rounded-2xl border p-5 bg-card border-border mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Code size={18} className="text-primary" />
          <h2 className="text-sm font-bold text-foreground">Project Code</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-xl bg-muted border border-border">
            <button
              onClick={() => setCodeType("basic")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                codeType === "basic"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setCodeType("optimized")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                codeType === "optimized"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Optimized
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-2 rounded-xl border bg-muted/50 border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
            title="Copy code"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-xl border bg-muted/50 border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
            title="Download .ino file"
          >
            <Download size={14} />
          </button>
          <button
            onClick={handleOpenInIDE}
            className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1.5 shadow-sm hover:scale-105 transition-all"
          >
            <Play size={12} /> Open in IDE
          </button>
        </div>
      </div>

      <pre className="p-4 rounded-xl font-mono text-xs overflow-x-auto bg-slate-950 text-emerald-400 border border-slate-800 leading-relaxed mb-4">
        <code>{activeCode}</code>
      </pre>

      <ExplainCode code={activeCode} />
    </div>
  );
}
