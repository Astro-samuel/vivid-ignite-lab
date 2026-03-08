import { useEffect, useState, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

export default function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const prevKey = useRef(location.key);
  const [content, setContent] = useState(children);

  useEffect(() => {
    if (location.key !== prevKey.current) {
      // Fade out
      setVisible(false);
      const timer = setTimeout(() => {
        prevKey.current = location.key;
        setContent(children);
        // Small delay to let new content mount before fading in
        requestAnimationFrame(() => {
          setVisible(true);
        });
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setContent(children);
    }
  }, [location.key, children]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 200ms ease-out, transform 200ms ease-out",
        minHeight: "100vh",
      }}
    >
      {content}
    </div>
  );
}
