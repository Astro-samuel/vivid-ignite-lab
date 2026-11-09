interface MascotProps {
  size?: number;
  /** "happy" smiles; "cheer" opens the mouth. */
  mood?: "happy" | "cheer";
  bob?: boolean;
  className?: string;
}

/** Volt — a friendly chip-bot. Green body with a thick edge, two big eyes, pins on both sides, a gold LED antenna. */
export default function Mascot({ size = 120, mood = "happy", bob = false, className = "" }: MascotProps) {
  const body = "hsl(96 98% 40%)";
  const edge = "hsl(96 100% 30%)";
  const gold = "hsl(47 100% 50%)";
  const goldEdge = "hsl(44 100% 42%)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      role="img"
      aria-label="Volt, the ArduinoLab mascot"
      className={`${bob ? "mascot-bob" : ""} ${className}`}
    >
      {/* antenna */}
      <rect x="57" y="12" width="6" height="16" rx="3" fill={edge} />
      <circle cx="60" cy="12" r="8" fill={goldEdge} />
      <circle cx="60" cy="10" r="8" fill={gold} />
      {/* pins */}
      {[44, 62, 80].map((y) => (
        <g key={y}>
          <rect x="6" y={y} width="16" height="8" rx="4" fill={goldEdge} />
          <rect x="98" y={y} width="16" height="8" rx="4" fill={goldEdge} />
        </g>
      ))}
      {/* body with thick bottom edge */}
      <rect x="18" y="32" width="84" height="76" rx="22" fill={edge} />
      <rect x="18" y="28" width="84" height="76" rx="22" fill={body} />
      {/* face plate */}
      <rect x="28" y="40" width="64" height="44" rx="16" fill="#fff" />
      {/* eyes */}
      <g className="mascot-eye">
        <circle cx="46" cy="60" r="9" fill="hsl(210 18% 14%)" />
        <circle cx="49" cy="57" r="3" fill="#fff" />
      </g>
      <g className="mascot-eye">
        <circle cx="74" cy="60" r="9" fill="hsl(210 18% 14%)" />
        <circle cx="77" cy="57" r="3" fill="#fff" />
      </g>
      {/* mouth */}
      {mood === "cheer" ? (
        <path d="M50 74 Q60 88 70 74 Z" fill="hsl(0 72% 48%)" stroke="hsl(210 18% 14%)" strokeWidth="2.5" strokeLinejoin="round" />
      ) : (
        <path d="M51 74 Q60 82 69 74" stroke="hsl(210 18% 14%)" strokeWidth="3" strokeLinecap="round" fill="none" />
      )}
      {/* cheeks */}
      <circle cx="36" cy="74" r="4" fill="hsl(0 100% 80%)" opacity="0.7" />
      <circle cx="84" cy="74" r="4" fill="hsl(0 100% 80%)" opacity="0.7" />
    </svg>
  );
}
