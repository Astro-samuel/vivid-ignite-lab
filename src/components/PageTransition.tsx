import { useEffect, useState, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

export default function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const prevKey = useRef(location.key);
  const [content, setContent] = useState(children);

  useEffect(() => {
    if (location.key !== prevKey.current) {
      // Fade out slowly
      setVisible(false);
      const timer = setTimeout(() => {
        prevKey.current = location.key;
        setContent(children);
        // Let new content mount, then fade in
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setVisible(true);
          });
        });
      }, 350); // longer exit duration
      return () => clearTimeout(timer);
    } else {
      setContent(children);
    }
  }, [location.key, children]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 400ms ease-in-out, transform 400ms ease-in-out",
        minHeight: "100vh",
      }}
    >
      {content}
    </div>
  );
}
