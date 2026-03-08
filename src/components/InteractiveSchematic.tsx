import { useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Info, X } from "lucide-react";

interface Component {
  name: string;
  x: number;
  y: number;
  pin?: string;
  description: string;
  color: string;
}

interface Wire {
  from: [number, number];
  to: [number, number];
  color: string;
  label?: string;
}

interface InteractiveSchematicProps {
  components: string[];
  title: string;
}

function getSchematicData(components: string[]): { parts: Component[]; wires: Wire[] } {
  const parts: Component[] = [
    { name: "Arduino Uno", x: 200, y: 150, description: "Microcontroller board — the brain of your project. Has digital and analog pins for I/O.", color: "#00F5FF" },
  ];
  const wires: Wire[] = [];

  let yOffset = 0;
  components.forEach((comp, i) => {
    if (comp.toLowerCase().includes("arduino")) return;
    const y = 60 + (i * 55) % 270;
    const x = i % 2 === 0 ? 50 : 370;

    let pin = "";
    let desc = comp;
    let color = "#B744FF";

    if (comp.toLowerCase().includes("led")) {
      pin = "Pin 13"; desc = `${comp} — Light-emitting diode. Connect anode (long leg) through a resistor to the Arduino pin.`; color = "#FF4500";
    } else if (comp.toLowerCase().includes("resistor")) {
      desc = `${comp} — Limits current flow to protect components like LEDs.`; color = "#FFD700";
    } else if (comp.toLowerCase().includes("servo")) {
      pin = "Pin 9"; desc = `${comp} — Positional motor controlled via PWM signal. Range: 0-180°.`; color = "#00FF88";
    } else if (comp.toLowerCase().includes("sensor") || comp.toLowerCase().includes("dht") || comp.toLowerCase().includes("ldr") || comp.toLowerCase().includes("photoresistor")) {
      pin = "A0"; desc = `${comp} — Reads environmental data. Connect to an analog or digital pin.`; color = "#00F5FF";
    } else if (comp.toLowerCase().includes("buzzer") || comp.toLowerCase().includes("piezo")) {
      pin = "Pin 8"; desc = `${comp} — Produces sound when given a frequency signal via tone().`; color = "#FF1493";
    } else if (comp.toLowerCase().includes("motor")) {
      pin = "Pin 5-8"; desc = `${comp} — Converts electrical energy to rotational motion.`; color = "#FFA500";
    } else if (comp.toLowerCase().includes("lcd") || comp.toLowerCase().includes("oled") || comp.toLowerCase().includes("display")) {
      pin = "I2C (A4/A5)"; desc = `${comp} — Visual display for data output. Uses I2C communication.`; color = "#00F5FF";
    } else if (comp.toLowerCase().includes("relay")) {
      pin = "Pin 7"; desc = `${comp} — Electrically-operated switch for high-power devices.`; color = "#FF4500";
    } else if (comp.toLowerCase().includes("bluetooth") || comp.toLowerCase().includes("hc-05")) {
      pin = "RX/TX"; desc = `${comp} — Wireless communication module for phone/computer control.`; color = "#0099FF";
    } else if (comp.toLowerCase().includes("ultrasonic") || comp.toLowerCase().includes("hc-sr04")) {
      pin = "Pin 9/10"; desc = `${comp} — Measures distance using sound waves (2-400cm range).`; color = "#B744FF";
    } else if (comp.toLowerCase().includes("potentiometer")) {
      pin = "A0"; desc = `${comp} — Variable resistor for analog input control (0-1023).`; color = "#FFD700";
    } else if (comp.toLowerCase().includes("button")) {
      pin = "Pin 2"; desc = `${comp} — Digital input, reads HIGH or LOW when pressed.`; color = "#00FF88";
    } else if (comp.toLowerCase().includes("breadboard") || comp.toLowerCase().includes("jumper")) {
      desc = `${comp} — Used for prototyping connections without soldering.`; color = "#A0AED9";
    } else {
      desc = `${comp} — Electronic component used in this project.`; color = "#B744FF";
    }

    parts.push({ name: comp, x, y, pin, description: desc, color });

    if (pin) {
      wires.push({ from: [x + 60, y + 15], to: [200, 150 + (i * 20) % 80], color, label: pin });
    }
  });

  return { parts, wires };
}

export default function InteractiveSchematic({ components, title }: InteractiveSchematicProps) {
  const [zoom, setZoom] = useState(1);
  const [selectedPart, setSelectedPart] = useState<Component | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const { parts, wires } = getSchematicData(components);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName !== "svg" && (e.target as HTMLElement).tagName !== "line") return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setDragging(false);

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: "hsl(229, 45%, 14%)", borderColor: "hsl(229, 42%, 26%)" }}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "hsl(229, 42%, 22%)" }}>
        <span className="text-sm font-bold" style={{ color: "#00F5FF" }}>Interactive Schematic — {title}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom((z) => Math.min(z + 0.2, 2))} className="p-1.5 rounded-lg hover:bg-white/10 transition-all" style={{ color: "#A0AED9" }}>
            <ZoomIn size={16} />
          </button>
          <button onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))} className="p-1.5 rounded-lg hover:bg-white/10 transition-all" style={{ color: "#A0AED9" }}>
            <ZoomOut size={16} />
          </button>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="p-1.5 rounded-lg hover:bg-white/10 transition-all" style={{ color: "#A0AED9" }}>
            <RotateCcw size={16} />
          </button>
          <span className="text-xs ml-2" style={{ color: "#A0AED9" }}>{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        className="relative overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ height: "360px" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 480 340"
          style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`, transformOrigin: "center" }}
        >
          {/* Grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(229, 42%, 18%)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="480" height="340" fill="url(#grid)" />

          {/* Wires */}
          {wires.map((w, i) => (
            <g key={`wire-${i}`}>
              <line x1={w.from[0]} y1={w.from[1]} x2={w.to[0]} y2={w.to[1]} stroke={w.color} strokeWidth="2" strokeDasharray="6 3" opacity="0.6" />
              {w.label && (
                <text x={(w.from[0] + w.to[0]) / 2} y={(w.from[1] + w.to[1]) / 2 - 6} fill={w.color} fontSize="8" textAnchor="middle" fontFamily="monospace">
                  {w.label}
                </text>
              )}
            </g>
          ))}

          {/* Components */}
          {parts.map((part, i) => (
            <g
              key={i}
              className="cursor-pointer"
              onClick={(e) => { e.stopPropagation(); setSelectedPart(part); }}
              style={{ transition: "transform 0.15s" }}
            >
              <rect
                x={part.x - 10}
                y={part.y - 10}
                width={120}
                height={30}
                rx="8"
                fill={`${part.color}22`}
                stroke={part.color}
                strokeWidth="1.5"
              />
              <text
                x={part.x + 50}
                y={part.y + 6}
                fill={part.color}
                fontSize="9"
                textAnchor="middle"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                {part.name.length > 16 ? part.name.slice(0, 15) + "…" : part.name}
              </text>
              {part.pin && (
                <text x={part.x + 50} y={part.y + 26} fill="#A0AED9" fontSize="7" textAnchor="middle" fontFamily="monospace">
                  {part.pin}
                </text>
              )}
              {/* Info icon */}
              <circle cx={part.x + 100} cy={part.y} r="6" fill={part.color} opacity="0.3" />
              <text x={part.x + 100} y={part.y + 3} fill="#fff" fontSize="8" textAnchor="middle" fontWeight="bold">i</text>
            </g>
          ))}
        </svg>

        {/* Info Tooltip */}
        {selectedPart && (
          <div
            className="absolute top-4 right-4 w-64 rounded-xl border p-4 z-10 animate-fade-in"
            style={{ background: "hsl(229, 45%, 12%)", borderColor: selectedPart.color + "66" }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Info size={14} style={{ color: selectedPart.color }} />
                <span className="font-bold text-sm" style={{ color: selectedPart.color }}>{selectedPart.name}</span>
              </div>
              <button onClick={() => setSelectedPart(null)} className="p-0.5 rounded hover:bg-white/10" style={{ color: "#A0AED9" }}>
                <X size={12} />
              </button>
            </div>
            {selectedPart.pin && (
              <div className="text-xs font-mono mb-2 px-2 py-1 rounded" style={{ background: "rgba(0,245,255,0.1)", color: "#00F5FF" }}>
                Connected to: {selectedPart.pin}
              </div>
            )}
            <p className="text-xs leading-relaxed" style={{ color: "#A0AED9" }}>{selectedPart.description}</p>
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t text-xs" style={{ borderColor: "hsl(229, 42%, 22%)", color: "#A0AED9" }}>
        💡 Click any component for details • Scroll to zoom • Drag to pan
      </div>
    </div>
  );
}
