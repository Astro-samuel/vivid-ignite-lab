import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

const container = (staggerDelay: number) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: staggerDelay,
    },
  },
});

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function StaggerContainer({ children, className, staggerDelay = 0.1 }: StaggerContainerProps) {
  return (
    <motion.div
      variants={container(staggerDelay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-30px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
