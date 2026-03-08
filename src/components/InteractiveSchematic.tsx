import { useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Info, X } from "lucide-react";

// ── KiCad-style SVG symbol renderers ─────────────────────────────────

function SymbolResistor({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <line x1="-20" y1="0" x2="-14" y2="0" stroke="#00FF88" strokeWidth="1.5" />
      <polyline points="-14,-6 -10,6 -6,-6 -2,6 2,-6 6,6 10,-6 14,6" fill="none" stroke="#00FF88" strokeWidth="1.5" />
      <line x1="14" y1="0" x2="20" y2="0" stroke="#00FF88" strokeWidth="1.5" />
    </g>
  );
}

function SymbolLED({ x, y, color = "#FF4500" }: { x: number; y: number; color?: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <line x1="-20" y1="0" x2="-8" y2="0" stroke={color} strokeWidth="1.5" />
      <polygon points="-8,-7 -8,7 6,0" fill="none" stroke={color} strokeWidth="1.5" />
      <line x1="6" y1="-7" x2="6" y2="7" stroke={color} strokeWidth="1.5" />
      <line x1="6" y1="0" x2="20" y2="0" stroke={color} strokeWidth="1.5" />
      {/* emission arrows */}
      <line x1="2" y1="-9" x2="6" y2="-14" stroke={color} strokeWidth="1" />
      <line x1="5" y1="-8" x2="9" y2="-13" stroke={color} strokeWidth="1" />
      <polygon points="5,-15 7,-14 6,-12" fill={color} />
      <polygon points="8,-14 10,-13 9,-11" fill={color} />
    </g>
  );
}

function SymbolCapacitor({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <line x1="-20" y1="0" x2="-3" y2="0" stroke="#FFD700" strokeWidth="1.5" />
      <line x1="-3" y1="-8" x2="-3" y2="8" stroke="#FFD700" strokeWidth="2" />
      <line x1="3" y1="-8" x2="3" y2="8" stroke="#FFD700" strokeWidth="2" />
      <line x1="3" y1="0" x2="20" y2="0" stroke="#FFD700" strokeWidth="1.5" />
    </g>
  );
}

function SymbolIC({ x, y, label, pins }: { x: number; y: number; label: string; pins: string[] }) {
  const h = Math.max(60, pins.length * 12 + 20);
  const w = 80;
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="none" stroke="#00F5FF" strokeWidth="1.5" />
      <text x="0" y={-h / 2 + 14} fill="#00F5FF" fontSize="9" textAnchor="middle" fontWeight="bold" fontFamily="monospace">{label}</text>
      {pins.map((pin, i) => {
        const py = -h / 2 + 24 + i * 12;
        const isLeft = i % 2 === 0;
        return (
          <g key={pin}>
            <line x1={isLeft ? -w / 2 - 12 : w / 2} y1={py} x2={isLeft ? -w / 2 : w / 2 + 12} y2={py} stroke="#A0AED9" strokeWidth="1" />
            <circle cx={isLeft ? -w / 2 - 12 : w / 2 + 12} cy={py} r="2" fill="#A0AED9" />
            <text x={isLeft ? -w / 2 + 4 : w / 2 - 4} y={py + 3} fill="#A0AED9" fontSize="7" textAnchor={isLeft ? "start" : "end"} fontFamily="monospace">{pin}</text>
          </g>
        );
      })}
    </g>
  );
}

function SymbolServo({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="-22" y="-14" width="44" height="28" rx="3" fill="none" stroke="#00FF88" strokeWidth="1.5" />
      <circle cx="0" cy="0" r="8" fill="none" stroke="#00FF88" strokeWidth="1.2" />
      <line x1="0" y1="0" x2="6" y2="-5" stroke="#00FF88" strokeWidth="1.5" strokeLinecap="round" />
      <text x="0" y="22" fill="#A0AED9" fontSize="7" textAnchor="middle" fontFamily="monospace">M</text>
      {/* pins */}
      <line x1="-22" y1="-6" x2="-32" y2="-6" stroke="#FF4500" strokeWidth="1" />
      <line x1="-22" y1="0" x2="-32" y2="0" stroke="#A0AED9" strokeWidth="1" />
      <line x1="-22" y1="6" x2="-32" y2="6" stroke="#FFA500" strokeWidth="1" />
      <text x="-34" y="-4" fill="#FF4500" fontSize="6" textAnchor="end" fontFamily="monospace">VCC</text>
      <text x="-34" y="2" fill="#A0AED9" fontSize="6" textAnchor="end" fontFamily="monospace">GND</text>
      <text x="-34" y="8" fill="#FFA500" fontSize="6" textAnchor="end" fontFamily="monospace">SIG</text>
    </g>
  );
}

function SymbolSensor({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="-25" y="-14" width="50" height="28" rx="4" fill="none" stroke="#B744FF" strokeWidth="1.5" strokeDasharray="4 2" />
      <text x="0" y="4" fill="#B744FF" fontSize="8" textAnchor="middle" fontWeight="bold" fontFamily="monospace">{label.length > 8 ? label.slice(0, 7) + "…" : label}</text>
      <line x1="-25" y1="0" x2="-35" y2="0" stroke="#B744FF" strokeWidth="1" />
      <line x1="25" y1="0" x2="35" y2="0" stroke="#B744FF" strokeWidth="1" />
      <circle cx="-35" cy="0" r="2" fill="#B744FF" />
      <circle cx="35" cy="0" r="2" fill="#B744FF" />
    </g>
  );
}

function SymbolBuzzer({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="-12" y="-10" width="24" height="20" rx="2" fill="none" stroke="#FF1493" strokeWidth="1.5" />
      <text x="0" y="3" fill="#FF1493" fontSize="9" textAnchor="middle" fontFamily="monospace">♪</text>
      <line x1="-12" y1="0" x2="-22" y2="0" stroke="#FF1493" strokeWidth="1.5" />
      <line x1="12" y1="0" x2="22" y2="0" stroke="#FF1493" strokeWidth="1.5" />
      <circle cx="-22" cy="0" r="2" fill="#FF1493" />
      <circle cx="22" cy="0" r="2" fill="#FF1493" />
    </g>
  );
}

function SymbolButton({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <line x1="-20" y1="0" x2="-8" y2="0" stroke="#00FF88" strokeWidth="1.5" />
      <line x1="8" y1="0" x2="20" y2="0" stroke="#00FF88" strokeWidth="1.5" />
      <circle cx="-8" cy="0" r="2.5" fill="none" stroke="#00FF88" strokeWidth="1.5" />
      <circle cx="8" cy="0" r="2.5" fill="none" stroke="#00FF88" strokeWidth="1.5" />
      <line x1="-6" y1="-8" x2="6" y2="-8" stroke="#00FF88" strokeWidth="1.5" />
      <line x1="0" y1="-8" x2="0" y2="-3" stroke="#00FF88" strokeWidth="1" strokeDasharray="2 1" />
    </g>
  );
}

function SymbolGround({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <line x1="0" y1="-8" x2="0" y2="0" stroke="#A0AED9" strokeWidth="1.5" />
      <line x1="-8" y1="0" x2="8" y2="0" stroke="#A0AED9" strokeWidth="1.5" />
      <line x1="-5" y1="3" x2="5" y2="3" stroke="#A0AED9" strokeWidth="1.5" />
      <line x1="-2" y1="6" x2="2" y2="6" stroke="#A0AED9" strokeWidth="1.5" />
    </g>
  );
}

function SymbolPower({ x, y, label = "5V" }: { x: number; y: number; label?: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <line x1="0" y1="8" x2="0" y2="0" stroke="#FF4500" strokeWidth="1.5" />
      <circle cx="0" cy="-2" r="5" fill="none" stroke="#FF4500" strokeWidth="1.5" />
      <text x="0" y="1" fill="#FF4500" fontSize="6" textAnchor="middle" fontWeight="bold" fontFamily="monospace">{label}</text>
    </g>
  );
}

// ── Component type detection & schematic layout ──────────────────────

interface SchematicPart {
  id: string;
  name: string;
  type: "ic" | "resistor" | "led" | "servo" | "sensor" | "buzzer" | "button" | "capacitor" | "generic";
  x: number;
  y: number;
  pin?: string;
  description: string;
  refDes: string; // KiCad reference designator (R1, D1, U1, etc.)
  color: string;
  icPins?: string[];
}

interface SchematicWire {
  points: [number, number][];
  color: string;
  netLabel?: string;
}

function classifyComponent(name: string): { type: SchematicPart["type"]; refPrefix: string; color: string; pin: string; desc: string } {
  const n = name.toLowerCase();
  if (n.includes("arduino")) return { type: "ic", refPrefix: "U", color: "#00F5FF", pin: "", desc: "ATmega328P microcontroller board with 14 digital and 6 analog I/O pins." };
  if (n.includes("led") && n.includes("rgb")) return { type: "led", refPrefix: "D", color: "#B744FF", pin: "Pin 9,10,11", desc: "RGB LED — Common cathode LED with separate red, green, blue channels controlled via PWM." };
  if (n.includes("led")) return { type: "led", refPrefix: "D", color: "#FF4500", pin: "Pin 13", desc: "Light-emitting diode. Anode → resistor → digital pin. Cathode → GND." };
  if (n.includes("resistor")) return { type: "resistor", refPrefix: "R", color: "#00FF88", pin: "", desc: "Current-limiting resistor. Protects LEDs and provides pull-up/pull-down for inputs." };
  if (n.includes("servo")) return { type: "servo", refPrefix: "M", color: "#00FF88", pin: "Pin 9", desc: "SG90 micro servo. VCC→5V, GND→GND, Signal→PWM pin. 0-180° range." };
  if (n.includes("potentiometer")) return { type: "sensor", refPrefix: "RV", color: "#FFD700", pin: "A0", desc: "Variable resistor. Outer pins → 5V and GND. Wiper → analog pin (0-1023)." };
  if (n.includes("dht") || n.includes("temperature")) return { type: "sensor", refPrefix: "U", color: "#B744FF", pin: "Pin 2", desc: "Digital temperature & humidity sensor. Requires 10kΩ pull-up on data line." };
  if (n.includes("ldr") || n.includes("photoresistor")) return { type: "sensor", refPrefix: "R", color: "#FFD700", pin: "A0", desc: "Light-dependent resistor. Forms voltage divider with fixed resistor for light sensing." };
  if (n.includes("soil") || n.includes("moisture")) return { type: "sensor", refPrefix: "U", color: "#00FF88", pin: "A0", desc: "Capacitive or resistive soil moisture sensor. Analog output 0-1023." };
  if (n.includes("ultrasonic") || n.includes("hc-sr04")) return { type: "sensor", refPrefix: "U", color: "#B744FF", pin: "Pin 9/10", desc: "HC-SR04 ultrasonic distance sensor. Trig → digital out, Echo → digital in. Range: 2-400cm." };
  if (n.includes("buzzer") || n.includes("piezo")) return { type: "buzzer", refPrefix: "BZ", color: "#FF1493", pin: "Pin 8", desc: "Piezoelectric buzzer. Use tone(pin, frequency) to generate sounds." };
  if (n.includes("button")) return { type: "button", refPrefix: "SW", color: "#00FF88", pin: "Pin 2", desc: "Momentary push button. Wire with pull-down resistor or use INPUT_PULLUP." };
  if (n.includes("relay")) return { type: "sensor", refPrefix: "K", color: "#FF4500", pin: "Pin 7", desc: "Relay module. Signal pin controls high-power switching (up to 10A/250VAC)." };
  if (n.includes("motor") && !n.includes("servo")) return { type: "sensor", refPrefix: "M", color: "#FFA500", pin: "Pin 5-8", desc: "DC motor controlled via H-bridge driver (L298N). Requires external power supply." };
  if (n.includes("lcd") || n.includes("oled") || n.includes("display")) return { type: "ic", refPrefix: "U", color: "#00F5FF", pin: "I2C (A4/A5)", desc: "Display module using I2C bus. SDA→A4, SCL→A5. Address typically 0x3C or 0x27." };
  if (n.includes("bluetooth") || n.includes("hc-05")) return { type: "ic", refPrefix: "U", color: "#0099FF", pin: "RX/TX", desc: "HC-05 Bluetooth module. TX→Arduino RX, RX→Arduino TX (use voltage divider!)." };
  if (n.includes("breadboard") || n.includes("jumper")) return { type: "generic", refPrefix: "", color: "#A0AED9", pin: "", desc: "Prototyping hardware — not shown in schematic." };
  if (n.includes("battery")) return { type: "generic", refPrefix: "BT", color: "#FFD700", pin: "", desc: "External power supply for motors and high-current loads." };
  return { type: "generic", refPrefix: "X", color: "#A0AED9", pin: "", desc: "Electronic component used in this project." };
}

function buildSchematic(components: string[]): { parts: SchematicPart[]; wires: SchematicWire[] } {
  const parts: SchematicPart[] = [];
  const wires: SchematicWire[] = [];
  const refCounts: Record<string, number> = {};

  // Arduino is always the central IC
  const arduinoPins = ["D13", "D12", "D11", "D10", "D9", "D8", "D7", "D6", "D5", "D4", "D3", "D2", "A0", "A1", "A2", "A3", "A4", "A5", "5V", "3V3", "GND", "VIN", "RST", "TX", "RX"];
  parts.push({
    id: "arduino",
    name: "Arduino Uno",
    type: "ic",
    x: 340,
    y: 190,
    description: "ATmega328P microcontroller — 14 digital I/O, 6 analog inputs, 16MHz clock.",
    refDes: "U1",
    color: "#00F5FF",
    icPins: arduinoPins.slice(0, 16),
  });

  // Layout external components on the left side
  let leftY = 50;
  let rightY = 50;
  let useLeft = true;

  components.forEach((comp) => {
    if (comp.toLowerCase().includes("arduino")) return;
    const info = classifyComponent(comp);
    if (info.type === "generic" && !info.refPrefix) return; // skip breadboard/jumpers

    const prefix = info.refPrefix;
    refCounts[prefix] = (refCounts[prefix] || 0) + 1;
    const refDes = prefix + refCounts[prefix];

    const x = useLeft ? 100 : 580;
    const y = useLeft ? leftY : rightY;

    parts.push({
      id: `${refDes}-${comp}`,
      name: comp,
      type: info.type,
      x,
      y,
      pin: info.pin,
      description: info.desc,
      refDes,
      color: info.color,
    });

    // Draw wire to Arduino
    if (info.pin) {
      const arduinoX = useLeft ? 300 : 380;
      const junctionY = y;
      wires.push({
        points: [[x + (useLeft ? 35 : -35), y], [useLeft ? 240 : 440, y], [useLeft ? 240 : 440, junctionY], [arduinoX, junctionY]],
        color: info.color,
        netLabel: info.pin,
      });
    }

    if (useLeft) leftY += 65; else rightY += 65;
    useLeft = !useLeft;
  });

  // Power and ground symbols
  parts.push({ id: "vcc", name: "5V", type: "generic", x: 340, y: 35, description: "5V power rail from USB or external supply.", refDes: "+5V", color: "#FF4500" });
  parts.push({ id: "gnd", name: "GND", type: "generic", x: 340, y: 345, description: "Ground reference — 0V.", refDes: "GND", color: "#A0AED9" });

  wires.push({ points: [[340, 55], [340, 95]], color: "#FF4500", netLabel: "+5V" });
  wires.push({ points: [[340, 285], [340, 335]], color: "#A0AED9", netLabel: "GND" });

  return { parts, wires };
}

// ── Main component ───────────────────────────────────────────────────

interface InteractiveSchematicProps {
  components: string[];
  title: string;
}

export default function InteractiveSchematic({ components, title }: InteractiveSchematicProps) {
  const [zoom, setZoom] = useState(1);
  const [selectedPart, setSelectedPart] = useState<SchematicPart | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const { parts, wires } = buildSchematic(components);

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(2.5, Math.max(0.4, z + (e.deltaY > 0 ? -0.1 : 0.1))));
  };

  const renderSymbol = (part: SchematicPart) => {
    switch (part.type) {
      case "resistor": return <SymbolResistor x={part.x} y={part.y} />;
      case "led": return <SymbolLED x={part.x} y={part.y} color={part.color} />;
      case "servo": return <SymbolServo x={part.x} y={part.y} />;
      case "sensor": return <SymbolSensor x={part.x} y={part.y} label={part.refDes} />;
      case "buzzer": return <SymbolBuzzer x={part.x} y={part.y} />;
      case "button": return <SymbolButton x={part.x} y={part.y} />;
      case "capacitor": return <SymbolCapacitor x={part.x} y={part.y} />;
      case "ic":
        return <SymbolIC x={part.x} y={part.y} label={part.refDes === "U1" ? "ATMEGA328P" : part.refDes} pins={part.icPins || ["VCC", "GND", "SIG"]} />;
      default:
        if (part.id === "vcc") return <SymbolPower x={part.x} y={part.y} label="5V" />;
        if (part.id === "gnd") return <SymbolGround x={part.x} y={part.y} />;
        return null;
    }
  };

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: "#0D1117", borderColor: "hsl(229, 42%, 22%)" }}
    >
      {/* KiCad-style toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ background: "#161B22", borderColor: "#30363D" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: "#00FF88" }} />
          <span className="text-xs font-bold font-mono" style={{ color: "#00F5FF" }}>
            KiCad Schematic — {title}
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: "#21262D", color: "#8B949E" }}>
            .kicad_sch
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom((z) => Math.min(z + 0.2, 2.5))} className="p-1.5 rounded hover:bg-white/10 transition-all" style={{ color: "#8B949E" }}>
            <ZoomIn size={14} />
          </button>
          <button onClick={() => setZoom((z) => Math.max(z - 0.2, 0.4))} className="p-1.5 rounded hover:bg-white/10 transition-all" style={{ color: "#8B949E" }}>
            <ZoomOut size={14} />
          </button>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="p-1.5 rounded hover:bg-white/10 transition-all" style={{ color: "#8B949E" }}>
            <RotateCcw size={14} />
          </button>
          <span className="text-xs font-mono ml-1" style={{ color: "#484F58" }}>{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        className="relative overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ height: "420px", background: "#0D1117" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 680 400"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: "center",
          }}
        >
          {/* KiCad-style grid */}
          <defs>
            <pattern id="kicad-grid-sm" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="5" r="0.3" fill="#21262D" />
            </pattern>
            <pattern id="kicad-grid-lg" width="50" height="50" patternUnits="userSpaceOnUse">
              <rect width="50" height="50" fill="url(#kicad-grid-sm)" />
              <line x1="0" y1="0" x2="50" y2="0" stroke="#161B22" strokeWidth="0.5" />
              <line x1="0" y1="0" x2="0" y2="50" stroke="#161B22" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="680" height="400" fill="url(#kicad-grid-lg)" />

          {/* Title block (bottom-right) */}
          <g transform="translate(480, 365)">
            <rect width="190" height="30" fill="none" stroke="#30363D" strokeWidth="0.5" />
            <text x="95" y="12" fill="#484F58" fontSize="6" textAnchor="middle" fontFamily="monospace">Title: {title}</text>
            <text x="95" y="22" fill="#484F58" fontSize="5" textAnchor="middle" fontFamily="monospace">Rev: 1.0 | Sheet: 1/1</text>
          </g>

          {/* Wires — orthogonal routing like KiCad */}
          {wires.map((w, i) => {
            const pathData = w.points.map((p, j) => `${j === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
            return (
              <g key={`wire-${i}`}>
                <path d={pathData} fill="none" stroke={w.color} strokeWidth="1.2" opacity="0.7" />
                {/* Junction dots */}
                {w.points.map((p, j) => (
                  j > 0 && j < w.points.length - 1 ? <circle key={j} cx={p[0]} cy={p[1]} r="2" fill={w.color} opacity="0.5" /> : null
                ))}
                {/* Net label */}
                {w.netLabel && (
                  <g transform={`translate(${w.points[1][0]}, ${w.points[1][1] - 8})`}>
                    <rect x="-14" y="-7" width="28" height="12" rx="2" fill="#0D1117" stroke={w.color} strokeWidth="0.5" opacity="0.9" />
                    <text x="0" y="2" fill={w.color} fontSize="6" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                      {w.netLabel}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Component symbols */}
          {parts.map((part) => (
            <g
              key={part.id}
              className="cursor-pointer"
              onClick={(e) => { e.stopPropagation(); setSelectedPart(part); }}
              opacity={selectedPart && selectedPart.id !== part.id ? 0.4 : 1}
              style={{ transition: "opacity 0.2s" }}
            >
              {renderSymbol(part)}
              {/* Reference designator label */}
              {part.type !== "generic" && part.type !== "ic" && (
                <text
                  x={part.x}
                  y={part.y - 18}
                  fill={part.color}
                  fontSize="7"
                  textAnchor="middle"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {part.refDes}
                </text>
              )}
              {/* Component value/name below */}
              {part.type !== "generic" && part.type !== "ic" && (
                <text
                  x={part.x}
                  y={part.y + (part.type === "servo" ? 32 : 22)}
                  fill="#484F58"
                  fontSize="6"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {part.name.length > 18 ? part.name.slice(0, 17) + "…" : part.name}
                </text>
              )}
            </g>
          ))}
        </svg>

        {/* Component info panel */}
        {selectedPart && selectedPart.type !== "generic" && (
          <div
            className="absolute top-3 right-3 w-60 rounded-lg border p-3 z-10 animate-fade-in"
            style={{ background: "#161B22", borderColor: selectedPart.color + "44", boxShadow: `0 0 20px ${selectedPart.color}15` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded" style={{ background: selectedPart.color + "22", color: selectedPart.color }}>
                  {selectedPart.refDes}
                </span>
                <span className="font-bold text-xs" style={{ color: "#E6EDF3" }}>{selectedPart.name}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setSelectedPart(null); }} className="p-0.5 rounded hover:bg-white/10" style={{ color: "#8B949E" }}>
                <X size={12} />
              </button>
            </div>
            {selectedPart.pin && (
              <div className="text-xs font-mono mb-2 px-2 py-1 rounded flex items-center gap-1" style={{ background: "#0D1117", color: "#00F5FF", border: "1px solid #21262D" }}>
                <span style={{ color: "#484F58" }}>NET:</span> {selectedPart.pin}
              </div>
            )}
            <p className="text-xs leading-relaxed" style={{ color: "#8B949E" }}>{selectedPart.description}</p>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div
        className="flex items-center justify-between px-4 py-1.5 border-t text-xs font-mono"
        style={{ background: "#161B22", borderColor: "#30363D", color: "#484F58" }}
      >
        <span>🖱 Click component for details • Scroll to zoom • Drag to pan</span>
        <span>{parts.filter((p) => p.type !== "generic").length} components • {wires.length} nets</span>
      </div>
    </div>
  );
}
