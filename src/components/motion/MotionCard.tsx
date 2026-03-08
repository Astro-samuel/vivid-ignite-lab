import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface MotionCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  onClick?: () => void;
}

export default function MotionCard({ children, className, style, delay = 0, onClick }: MotionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={className}
      style={style}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
