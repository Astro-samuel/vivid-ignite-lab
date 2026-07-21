import { useState } from "react";
import { BookOpen, CheckSquare, Square } from "lucide-react";

interface ProjectInstructionsProps {
  instructions: string[];
}

export default function ProjectInstructions({ instructions }: ProjectInstructionsProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (idx: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="rounded-2xl border p-5 bg-card border-border mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-secondary" />
          <h2 className="text-sm font-bold text-foreground">Step-by-Step Instructions</h2>
        </div>
        <span className="text-xs font-bold text-muted-foreground">
          {completedSteps.size} / {instructions.length} completed
        </span>
      </div>

      <div className="space-y-2.5">
        {instructions.map((step, idx) => {
          const isDone = completedSteps.has(idx);
          return (
            <div
              key={idx}
              onClick={() => toggleStep(idx)}
              className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                isDone
                  ? "bg-success/10 border-success/30 text-muted-foreground line-through"
                  : "bg-muted/30 border-border hover:bg-muted/50 text-foreground"
              }`}
            >
              <div className="mt-0.5 text-primary flex-shrink-0">
                {isDone ? <CheckSquare size={16} className="text-success" /> : <Square size={16} />}
              </div>
              <span className="leading-relaxed font-medium">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
