import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

export default function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [stage, setStage] = useState<"enter" | "exit">("enter");

  useEffect(() => {
    // On route change: fade out, swap content, fade in
    if (children !== displayChildren) {
      setStage("exit");
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setStage("enter");
      }, 150); // exit duration
      return () => clearTimeout(timer);
    }
  }, [children, displayChildren]);

  return (
    <div
      className="min-h-screen"
      style={{
        opacity: stage === "enter" ? 1 : 0,
        transform: stage === "enter" ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 200ms ease-out, transform 200ms ease-out",
      }}
    >
      {displayChildren}
    </div>
  );
}
