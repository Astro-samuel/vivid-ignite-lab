import { useState, useRef } from "react";
import { motion } from "framer-motion";
import type { ReactNode, MouseEvent } from "react";

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function FlipCard({ front, back, className = "", style }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent) => {
    if (flipped || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -15;
    setTilt({ x: y, y: x });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      className={`relative cursor-pointer ${className}`}
      style={{ perspective: "1000px", ...style }}
      onClick={() => setFlipped(!flipped)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          rotateY: flipped ? 180 : tilt.y,
          rotateX: flipped ? 0 : tilt.x,
        }}
        transition={{
          rotateY: { duration: flipped || tilt.y === 0 ? 0.6 : 0.1, ease: "easeOut" },
          rotateX: { duration: 0.1, ease: "easeOut" },
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          {front}
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
}
