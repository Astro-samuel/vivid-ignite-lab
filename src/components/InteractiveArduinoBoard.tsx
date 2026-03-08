import { useState, useRef, useCallback, useEffect } from "react";

interface PinInfo {
  label: string;
  type: "digital" | "analog" | "power" | "gnd" | "tx" | "rx";
  description: string;
}

const DIGITAL_PINS: PinInfo[] = [
  { label: "0", type: "rx", description: "RX - Serial Receive" },
  { label: "1", type: "tx", description: "TX - Serial Transmit" },
  { label: "2", type: "digital", description: "Digital Pin 2 / INT0" },
  { label: "3", type: "digital", description: "Digital Pin 3 ~ PWM" },
  { label: "4", type: "digital", description: "Digital Pin 4" },
  { label: "5", type: "digital", description: "Digital Pin 5 ~ PWM" },
  { label: "6", type: "digital", description: "Digital Pin 6 ~ PWM" },
  { label: "7", type: "digital", description: "Digital Pin 7" },
  { label: "8", type: "digital", description: "Digital Pin 8" },
  { label: "9", type: "digital", description: "Digital Pin 9 ~ PWM" },
  { label: "10", type: "digital", description: "Digital Pin 10 ~ PWM" },
  { label: "11", type: "digital", description: "Digital Pin 11 ~ PWM / MOSI" },
  { label: "12", type: "digital", description: "Digital Pin 12 / MISO" },
  { label: "13", type: "digital", description: "Digital Pin 13 / SCK / LED" },
];

const ANALOG_PINS: PinInfo[] = [
  { label: "A0", type: "analog", description: "Analog Input 0" },
  { label: "A1", type: "analog", description: "Analog Input 1" },
  { label: "A2", type: "analog", description: "Analog Input 2" },
  { label: "A3", type: "analog", description: "Analog Input 3" },
  { label: "A4", type: "analog", description: "Analog Input 4 / SDA" },
  { label: "A5", type: "analog", description: "Analog Input 5 / SCL" },
];

const POWER_PINS: PinInfo[] = [
  { label: "VIN", type: "power", description: "Voltage Input (7-12V)" },
  { label: "5V", type: "power", description: "5V Regulated Output" },
  { label: "3.3V", type: "power", description: "3.3V Regulated Output" },
  { label: "GND", type: "gnd", description: "Ground" },
  { label: "GND", type: "gnd", description: "Ground" },
  { label: "RST", type: "power", description: "Reset Pin" },
];

function pinColor(type: string) {
  switch (type) {
    case "digital": return "hsl(var(--primary))";
    case "analog": return "hsl(var(--purple))";
    case "power": return "hsl(var(--destructive))";
    case "gnd": return "hsl(var(--foreground-muted))";
    case "tx": return "hsl(var(--secondary))";
    case "rx": return "hsl(var(--success))";
    default: return "hsl(var(--foreground-muted))";
  }
}

export default function InteractiveArduinoBoard() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [hoveredPin, setHoveredPin] = useState<PinInfo | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [activeLeds, setActiveLeds] = useState<boolean[]>([false, false, false, false]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMouse({ x, y });
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  // Animate LEDs based on cursor proximity
  useEffect(() => {
    const ledPositions = [
      { x: 0.78, y: 0.18 }, // L LED
      { x: 0.73, y: 0.18 }, // TX LED
      { x: 0.68, y: 0.18 }, // RX LED
      { x: 0.83, y: 0.18 }, // ON LED
    ];
    const newActive = ledPositions.map(pos => {
      const dist = Math.sqrt((mouse.x - pos.x) ** 2 + (mouse.y - pos.y) ** 2);
      return dist < 0.15;
    });
    setActiveLeds(newActive);
  }, [mouse]);

  // Trace glow intensity based on cursor
  const traceGlow = Math.max(0, 1 - Math.sqrt((mouse.x - 0.5) ** 2 + (mouse.y - 0.5) ** 2) * 2);

  const boardWidth = 680;
  const boardHeight = 380;

  return (
    <div className="relative w-full max-w-3xl mx-auto select-none">
      {/* Ambient glow behind the board */}
      <div
        className="absolute inset-0 rounded-3xl blur-3xl opacity-30 transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at ${mouse.x * 100}% ${mouse.y * 100}%, hsl(var(--primary) / 0.4), hsl(var(--purple) / 0.2), transparent 70%)`,
        }}
      />

      <svg
        ref={svgRef}
        viewBox={`0 0 ${boardWidth} ${boardHeight}`}
        className="w-full h-auto relative z-10 cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setHoveredPin(null); setMouse({ x: 0.5, y: 0.5 }); }}
      >
        <defs>
          <filter id="glow-teal">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-led-green">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-led-red">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="board-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(197 70% 18%)" />
            <stop offset="100%" stopColor="hsl(200 60% 12%)" />
          </linearGradient>
          <linearGradient id="trace-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={`hsl(var(--primary) / ${0.15 + traceGlow * 0.4})`} />
            <stop offset="100%" stopColor={`hsl(var(--purple) / ${0.1 + traceGlow * 0.3})`} />
          </linearGradient>
        </defs>

        {/* PCB Board */}
        <rect x="20" y="20" width={boardWidth - 40} height={boardHeight - 40} rx="12" ry="12"
          fill="url(#board-grad)" stroke="hsl(var(--primary) / 0.2)" strokeWidth="1.5" />

        {/* PCB Texture - solder mask pattern */}
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`trace-h-${i}`}
            x1="30" y1={50 + i * 26} x2={boardWidth - 30} y2={50 + i * 26}
            stroke="url(#trace-grad)" strokeWidth="0.5" opacity={0.3 + traceGlow * 0.3} />
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={`trace-v-${i}`}
            x1={50 + i * 32} y1="30" x2={50 + i * 32} y2={boardHeight - 30}
            stroke="url(#trace-grad)" strokeWidth="0.3" opacity={0.2 + traceGlow * 0.2} />
        ))}

        {/* Mounting holes */}
        {[[40, 40], [boardWidth - 60, 40], [40, boardHeight - 60], [boardWidth - 60, boardHeight - 60]].map(([cx, cy], i) => (
          <g key={`mount-${i}`}>
            <circle cx={cx} cy={cy} r="6" fill="none" stroke="hsl(var(--foreground-muted) / 0.3)" strokeWidth="1" />
            <circle cx={cx} cy={cy} r="3" fill="hsl(var(--background))" />
          </g>
        ))}

        {/* ATmega328P Chip */}
        <g>
          <rect x="240" y="130" width="100" height="120" rx="4"
            fill="hsl(232 45% 10%)" stroke="hsl(var(--foreground-muted) / 0.4)" strokeWidth="1" />
          <circle cx="255" cy="145" r="4" fill="none" stroke="hsl(var(--foreground-muted) / 0.3)" strokeWidth="0.5" />
          {/* Chip pins */}
          {Array.from({ length: 14 }).map((_, i) => (
            <g key={`chip-l-${i}`}>
              <rect x="232" y={135 + i * 8} width="10" height="3" rx="0.5"
                fill={`hsl(var(--foreground-muted) / ${0.3 + traceGlow * 0.4})`} />
              <rect x="338" y={135 + i * 8} width="10" height="3" rx="0.5"
                fill={`hsl(var(--foreground-muted) / ${0.3 + traceGlow * 0.4})`} />
            </g>
          ))}
          <text x="290" y="185" textAnchor="middle" fill="hsl(var(--foreground-muted) / 0.6)"
            fontSize="7" fontFamily="monospace">ATmega328P</text>
          <text x="290" y="197" textAnchor="middle" fill="hsl(var(--foreground-muted) / 0.4)"
            fontSize="5" fontFamily="monospace">ARDUINO UNO</text>
        </g>

        {/* Crystal Oscillator */}
        <rect x="360" y="160" width="20" height="30" rx="3"
          fill="hsl(var(--foreground-muted) / 0.15)" stroke="hsl(var(--foreground-muted) / 0.3)" strokeWidth="0.5" />
        <text x="370" y="180" textAnchor="middle" fill="hsl(var(--foreground-muted) / 0.4)"
          fontSize="4" fontFamily="monospace">16MHz</text>

        {/* USB Connector */}
        <rect x="30" y="140" width="45" height="80" rx="3"
          fill="hsl(var(--foreground-muted) / 0.2)" stroke="hsl(var(--foreground-muted) / 0.4)" strokeWidth="1" />
        <rect x="20" y="150" width="15" height="60" rx="2"
          fill="hsl(var(--foreground-muted) / 0.15)" stroke="hsl(var(--foreground-muted) / 0.3)" strokeWidth="0.5" />
        <text x="52" y="184" textAnchor="middle" fill="hsl(var(--foreground-muted) / 0.5)"
          fontSize="5" fontFamily="monospace">USB</text>

        {/* DC Power Jack */}
        <rect x="30" y="270" width="40" height="50" rx="4"
          fill="hsl(var(--foreground-muted) / 0.15)" stroke="hsl(var(--foreground-muted) / 0.3)" strokeWidth="1" />
        <circle cx="50" cy="295" r="8" fill="none" stroke="hsl(var(--foreground-muted) / 0.3)" strokeWidth="1" />
        <circle cx="50" cy="295" r="3" fill="hsl(var(--foreground-muted) / 0.2)" />
        <text x="50" y="328" textAnchor="middle" fill="hsl(var(--foreground-muted) / 0.4)"
          fontSize="4" fontFamily="monospace">DC</text>

        {/* Reset Button */}
        <g className="cursor-pointer">
          <rect x="100" y="105" width="22" height="16" rx="2"
            fill="hsl(var(--foreground-muted) / 0.15)" stroke="hsl(var(--foreground-muted) / 0.3)" strokeWidth="0.5" />
          <circle cx="111" cy="113" r="5" fill="hsl(var(--foreground-muted) / 0.25)"
            stroke="hsl(var(--foreground-muted) / 0.4)" strokeWidth="0.5" />
          <text x="111" y="132" textAnchor="middle" fill="hsl(var(--foreground-muted) / 0.4)"
            fontSize="4" fontFamily="monospace">RESET</text>
        </g>

        {/* LEDs */}
        {[
          { cx: 520, cy: 70, label: "L", active: activeLeds[0], color: "var(--success)" },
          { cx: 495, cy: 70, label: "TX", active: activeLeds[1], color: "var(--secondary)" },
          { cx: 470, cy: 70, label: "RX", active: activeLeds[2], color: "var(--success)" },
          { cx: 545, cy: 70, label: "ON", active: activeLeds[3], color: "var(--destructive)" },
        ].map(({ cx, cy, label, active, color }) => (
          <g key={label}>
            <rect x={cx - 5} y={cy - 3} width="10" height="6" rx="1"
              fill={active ? `hsl(${color})` : `hsl(${color} / 0.15)`}
              filter={active ? "url(#glow-led-green)" : undefined}
              style={{ transition: "fill 0.3s ease" }} />
            {active && (
              <circle cx={cx} cy={cy} r="12" fill={`hsl(${color} / 0.15)`}
                style={{ transition: "opacity 0.3s" }} />
            )}
            <text x={cx} y={cy + 14} textAnchor="middle" fill={`hsl(${color} / ${active ? 0.9 : 0.4})`}
              fontSize="5" fontFamily="monospace" style={{ transition: "fill 0.3s" }}>{label}</text>
          </g>
        ))}

        {/* Digital Pin Headers (top) */}
        <g>
          <text x="440" y="42" textAnchor="middle" fill="hsl(var(--foreground-muted) / 0.5)"
            fontSize="5" fontFamily="monospace">DIGITAL (PWM~)</text>
          {DIGITAL_PINS.map((pin, i) => {
            const px = 370 + i * 17;
            const py = 52;
            const isHovered = hoveredPin === pin;
            const dist = Math.sqrt(((px / boardWidth) - mouse.x) ** 2 + ((py / boardHeight) - mouse.y) ** 2);
            const proximity = Math.max(0, 1 - dist * 4);
            return (
              <g key={`d-${i}`}
                onMouseEnter={() => setHoveredPin(pin)}
                onMouseLeave={() => setHoveredPin(null)}
                className="cursor-pointer"
              >
                <rect x={px - 5} y={py - 5} width="10" height="14" rx="1.5"
                  fill={isHovered ? pinColor(pin.type) : `hsl(var(--foreground-muted) / ${0.12 + proximity * 0.3})`}
                  stroke={pinColor(pin.type)}
                  strokeWidth={isHovered ? "1.5" : "0.5"}
                  strokeOpacity={isHovered ? 1 : 0.3 + proximity * 0.5}
                  style={{ transition: "all 0.2s ease" }}
                  filter={isHovered ? "url(#glow-teal)" : undefined} />
                <text x={px} y={py + 20} textAnchor="middle"
                  fill={`hsl(var(--primary) / ${0.4 + proximity * 0.5})`}
                  fontSize="4.5" fontFamily="monospace"
                  style={{ transition: "fill 0.2s" }}>{pin.label}</text>
              </g>
            );
          })}
        </g>

        {/* Analog Pin Headers (bottom) */}
        <g>
          <text x="500" y={boardHeight - 28} textAnchor="middle" fill="hsl(var(--foreground-muted) / 0.5)"
            fontSize="5" fontFamily="monospace">ANALOG IN</text>
          {ANALOG_PINS.map((pin, i) => {
            const px = 460 + i * 20;
            const py = boardHeight - 52;
            const isHovered = hoveredPin === pin;
            const dist = Math.sqrt(((px / boardWidth) - mouse.x) ** 2 + ((py / boardHeight) - mouse.y) ** 2);
            const proximity = Math.max(0, 1 - dist * 4);
            return (
              <g key={`a-${i}`}
                onMouseEnter={() => setHoveredPin(pin)}
                onMouseLeave={() => setHoveredPin(null)}
                className="cursor-pointer"
              >
                <rect x={px - 5} y={py - 5} width="10" height="14" rx="1.5"
                  fill={isHovered ? pinColor(pin.type) : `hsl(var(--foreground-muted) / ${0.12 + proximity * 0.3})`}
                  stroke={pinColor(pin.type)}
                  strokeWidth={isHovered ? "1.5" : "0.5"}
                  strokeOpacity={isHovered ? 1 : 0.3 + proximity * 0.5}
                  style={{ transition: "all 0.2s ease" }}
                  filter={isHovered ? "url(#glow-teal)" : undefined} />
                <text x={px} y={py + 20} textAnchor="middle"
                  fill={`hsl(var(--purple) / ${0.5 + proximity * 0.5})`}
                  fontSize="4.5" fontFamily="monospace"
                  style={{ transition: "fill 0.2s" }}>{pin.label}</text>
              </g>
            );
          })}
        </g>

        {/* Power Pin Headers (bottom-left) */}
        <g>
          <text x="180" y={boardHeight - 28} textAnchor="middle" fill="hsl(var(--foreground-muted) / 0.5)"
            fontSize="5" fontFamily="monospace">POWER</text>
          {POWER_PINS.map((pin, i) => {
            const px = 120 + i * 22;
            const py = boardHeight - 52;
            const isHovered = hoveredPin === pin;
            const dist = Math.sqrt(((px / boardWidth) - mouse.x) ** 2 + ((py / boardHeight) - mouse.y) ** 2);
            const proximity = Math.max(0, 1 - dist * 4);
            return (
              <g key={`p-${i}`}
                onMouseEnter={() => setHoveredPin(pin)}
                onMouseLeave={() => setHoveredPin(null)}
                className="cursor-pointer"
              >
                <rect x={px - 5} y={py - 5} width="10" height="14" rx="1.5"
                  fill={isHovered ? pinColor(pin.type) : `hsl(var(--foreground-muted) / ${0.12 + proximity * 0.3})`}
                  stroke={pinColor(pin.type)}
                  strokeWidth={isHovered ? "1.5" : "0.5"}
                  strokeOpacity={isHovered ? 1 : 0.3 + proximity * 0.5}
                  style={{ transition: "all 0.2s ease" }}
                  filter={isHovered ? "url(#glow-teal)" : undefined} />
                <text x={px} y={py + 20} textAnchor="middle"
                  fill={`hsl(var(--foreground-muted) / ${0.4 + proximity * 0.5})`}
                  fontSize="4" fontFamily="monospace"
                  style={{ transition: "fill 0.2s" }}>{pin.label}</text>
              </g>
            );
          })}
        </g>

        {/* Capacitors */}
        {[[395, 155], [405, 195]].map(([cx, cy], i) => (
          <g key={`cap-${i}`}>
            <rect x={cx - 4} y={cy - 6} width="8" height="12" rx="2"
              fill="hsl(var(--secondary) / 0.15)" stroke="hsl(var(--secondary) / 0.25)" strokeWidth="0.5" />
          </g>
        ))}

        {/* Voltage Regulator */}
        <rect x="90" y="260" width="25" height="15" rx="1"
          fill="hsl(var(--foreground-muted) / 0.2)" stroke="hsl(var(--foreground-muted) / 0.3)" strokeWidth="0.5" />
        <text x="102" y="271" textAnchor="middle" fill="hsl(var(--foreground-muted) / 0.35)"
          fontSize="3.5" fontFamily="monospace">REG</text>

        {/* ARDUINO UNO Label */}
        <text x="180" y="185" textAnchor="middle"
          fill={`hsl(var(--primary) / ${0.15 + traceGlow * 0.25})`}
          fontSize="18" fontFamily="monospace" fontWeight="bold"
          style={{ transition: "fill 0.5s" }}>ARDUINO</text>
        <text x="180" y="210" textAnchor="middle"
          fill={`hsl(var(--primary) / ${0.1 + traceGlow * 0.2})`}
          fontSize="28" fontFamily="monospace" fontWeight="bold"
          letterSpacing="4"
          style={{ transition: "fill 0.5s" }}>UNO</text>

        {/* Cursor-following highlight beam */}
        <circle cx={mouse.x * boardWidth} cy={mouse.y * boardHeight} r="60"
          fill="url(#trace-grad)" opacity={0.08} style={{ transition: "cx 0.1s, cy 0.1s" }} />
      </svg>

      {/* Tooltip */}
      {hoveredPin && (
        <div
          className="absolute z-20 px-3 py-2 rounded-lg border pointer-events-none"
          style={{
            left: tooltipPos.x + 15,
            top: tooltipPos.y - 10,
            background: "hsl(var(--background))",
            borderColor: pinColor(hoveredPin.type),
            boxShadow: `0 0 15px ${pinColor(hoveredPin.type)}33`,
          }}
        >
          <p className="text-xs font-bold font-mono" style={{ color: pinColor(hoveredPin.type) }}>
            {hoveredPin.label}
          </p>
          <p className="text-[10px]" style={{ color: "hsl(var(--foreground-muted))" }}>
            {hoveredPin.description}
          </p>
        </div>
      )}
    </div>
  );
}
