import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { ReactNode } from "react";

interface ScrollParallaxProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  depth?: number; // 0-1, higher = more parallax
  fadeIn?: boolean;
}

export default function ScrollParallax({
  children,
  className,
  style,
  depth = 0.3,
  fadeIn = true,
}: ScrollParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60 * depth, -60 * depth]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], fadeIn ? [0, 1, 1, 0.8] : [1, 1, 1, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity, ...style }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
