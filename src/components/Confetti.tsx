import { motion } from "framer-motion";

const DEFAULT_COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6"];

interface ConfettiProps {
  colors?: string[];
  count?: number;
}

export default function Confetti({ colors = DEFAULT_COLORS, count = 80 }: ConfettiProps) {
  const particles = Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
    y: -20,
    size: Math.random() * 8 + 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 3,
    duration: Math.random() * 2 + 2,
    angle: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: p.x, y: p.y, opacity: 1, rotate: 0 }}
          animate={{
            y: (typeof window !== "undefined" ? window.innerHeight : 800) + 20,
            x: p.x + (Math.random() * 200 - 100),
            rotate: p.angle + 720,
            opacity: 0
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeOut"
          }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "3px",
          }}
        />
      ))}
    </div>
  );
}
