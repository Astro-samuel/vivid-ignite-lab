import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Flame, Lock, Pause, Play, Star, Zap } from "lucide-react";
import Layout from "@/components/Layout";
import Mascot from "@/components/Mascot";
import FadeInView from "@/components/motion/FadeInView";
import { useAuth } from "@/contexts/AuthContext";

/* ── Content ─────────────────────────────────────────────── */

const starters = [
  { id: 1, title: "LED Blink", desc: "The classic first sketch. Make an LED blink on pin 13.", level: "Beginner", time: "15 min", xp: 50 },
  { id: 2, title: "Temperature Monitor", desc: "Read a sensor and print the temperature to your computer.", level: "Beginner", time: "30 min", xp: 75 },
  { id: 4, title: "RGB LED Mixer", desc: "Blend colors with an RGB LED and three potentiometers.", level: "Beginner", time: "30 min", xp: 80 },
  { id: 3, title: "Servo Motor Control", desc: "Drive a servo to precise angles from code.", level: "Intermediate", time: "45 min", xp: 100 },
];

/* ── Signature: the blink sketch, running ────────────────── */

const SKETCH: { text: string; line?: "on" | "off" }[] = [
  { text: "void setup() {" },
  { text: "  pinMode(13, OUTPUT);" },
  { text: "}" },
  { text: "" },
  { text: "void loop() {" },
  { text: "  digitalWrite(13, HIGH);", line: "on" },
  { text: "  delay(1000);" },
  { text: "  digitalWrite(13, LOW);", line: "off" },
  { text: "  delay(1000);" },
  { text: "}" },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/* Simulation geometry (viewBox 0 0 440 300) */
const DIGITAL_LEFT = ["", "", "", "GND", "13", "12", "11", "10", "9", "8"];
const DIGITAL_RIGHT = ["7", "6", "5", "4", "3", "2", "1", "0"];
const PIN13 = { x: 96, y: 146 };
const PIN_GND = { x: 88, y: 146 };
const WIRE_13 = "M96 146 C96 100 225 130 225 56";
const WIRE_GND = "M88 146 C88 96 165 126 165 66";
const SCOPE = { x: 290, w: 130, hi: 190, lo: 232, seconds: 4 };
const SCOPE_WAVE = (() => {
  const u = SCOPE.w / SCOPE.seconds;
  const xs = [0, 1, 2, 3, 4].map((s) => SCOPE.x + s * u);
  return `M${xs[0]} ${SCOPE.hi} H${xs[1]} V${SCOPE.lo} H${xs[2]} V${SCOPE.hi} H${xs[3]} V${SCOPE.lo} H${xs[4]}`;
})();

function BlinkBench() {
  const reduced = usePrefersReducedMotion();
  const [running, setRunning] = useState(true);
  const [ms, setMs] = useState(0);

  useEffect(() => {
    if (reduced) setRunning(false);
  }, [reduced]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setMs((v) => v + 100), 100);
    return () => window.clearInterval(id);
  }, [running]);

  const on = Math.floor(ms / 1000) % 2 === 0;
  const phase = ms % (SCOPE.seconds * 1000);
  const sweep = (SCOPE.w * phase) / (SCOPE.seconds * 1000);
  const sweepTransition = phase === 0 ? "none" : "all 100ms linear";

  const gold = "hsl(var(--gold-bright))";
  const silk = "hsl(210 20% 90%)";
  const muted = "hsl(210 12% 64%)";
  const fade = "opacity 120ms, fill 120ms";

  return (
    <div className="rounded-2xl overflow-hidden border-2 border-b-4 border-[hsl(var(--code-border))]">
      <div className="relative bg-[hsl(var(--code-bg))] px-4 pt-3 pb-3">
        <div className="flex items-center justify-between mb-2 gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              aria-pressed={running}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider transition-transform active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: running ? "transparent" : gold,
                color: running ? silk : "hsl(210 20% 10%)",
                border: `1.5px solid ${running ? "hsl(210 14% 34%)" : gold}`,
                outlineColor: gold,
              }}
            >
              {running ? <Pause size={12} strokeWidth={3} /> : <Play size={12} strokeWidth={3} />}
              {running ? "Pause" : "Run"}
            </button>
            <span className="silk tabular-nums" style={{ color: muted }}>
              {running ? "Simulating" : "Paused"} · {(ms / 1000).toFixed(1)} s
            </span>
          </div>
          <span className="silk tabular-nums" style={{ color: on ? gold : muted }}>
            D13 {on ? "HIGH · 5 V" : "LOW · 0 V"}
          </span>
        </div>

        <svg viewBox="0 0 440 300" className="w-full h-auto block" role="img" aria-label={`Arduino Uno simulation: pin 13 drives a red LED through a 220 ohm resistor on a breadboard. The LED is currently ${on ? "on" : "off"}.`}>
          <defs>
            <pattern id="bench-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.9" fill="hsl(210 14% 20%)" />
            </pattern>
            <pattern id="bb-holes" x="120" y="31" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect x="3.5" y="3.5" width="3" height="3" rx="0.6" fill="#5d574a" />
            </pattern>
            <radialGradient id="led-glow">
              <stop offset="0" stopColor="#ff4a3a" stopOpacity="0.85" />
              <stop offset="0.45" stopColor="#ff4a3a" stopOpacity="0.28" />
              <stop offset="1" stopColor="#ff4a3a" stopOpacity="0" />
            </radialGradient>
            <clipPath id="scope-reveal">
              <rect x={SCOPE.x} y="170" height="80" style={{ width: sweep, transition: sweepTransition }} />
            </clipPath>
          </defs>
          <rect width="440" height="300" fill="url(#bench-grid)" />

          {/* Breadboard */}
          <rect x="120" y="18" width="310" height="100" rx="5" fill="#e8e2d2" stroke="#b9b29c" strokeWidth="1" />
          <rect x="120" y="18" width="310" height="100" rx="5" fill="url(#bb-holes)" />
          <rect x="120" y="72" width="310" height="20" fill="#d6cfbc" />
          <rect x="120" y="80" width="310" height="4" fill="#bdb59c" />

          {/* Arduino Uno */}
          <rect x="8" y="172" width="40" height="34" rx="2" fill="#b8bec4" stroke="#8a9096" />
          <rect x="8" y="178" width="30" height="22" fill="#6b7278" />
          <rect x="8" y="244" width="34" height="36" rx="2" fill="#1d1d1d" stroke="#000" />
          <circle cx="22" cy="262" r="6" fill="#0c0c0c" />
          <rect x="20" y="148" width="210" height="146" rx="7" fill="#00979d" stroke="#006a6f" strokeWidth="1.5" />
          <circle cx="30" cy="158" r="3" fill="#006a6f" />
          <circle cx="220" cy="158" r="3" fill="#006a6f" />
          <circle cx="30" cy="284" r="3" fill="#006a6f" />
          <circle cx="220" cy="284" r="3" fill="#006a6f" />

          <rect x="58" y="140" width="84" height="12" rx="1.5" fill="#15191c" />
          <rect x="146" y="140" width="68" height="12" rx="1.5" fill="#15191c" />
          {DIGITAL_LEFT.map((label, i) => (
            <g key={`l${i}`}>
              <rect x={60 + i * 8 + 1.75} y="143.75" width="4.5" height="4.5" fill="#3a4147" />
              {label && <text x={60 + i * 8 + 4} y="162" textAnchor="middle" fill="#fff" fillOpacity="0.9" fontSize="5" fontFamily="JetBrains Mono, monospace">{label}</text>}
            </g>
          ))}
          {DIGITAL_RIGHT.map((label, i) => (
            <g key={`r${i}`}>
              <rect x={148 + i * 8 + 1.75} y="143.75" width="4.5" height="4.5" fill="#3a4147" />
              <text x={148 + i * 8 + 4} y="162" textAnchor="middle" fill="#fff" fillOpacity="0.9" fontSize="5" fontFamily="JetBrains Mono, monospace">{label}</text>
            </g>
          ))}
          <text x="130" y="171" textAnchor="middle" fill="#fff" fillOpacity="0.55" fontSize="4.5" letterSpacing="0.8" fontFamily="JetBrains Mono, monospace">DIGITAL (PWM ~)</text>

          <circle cx="66" cy="184" r="5" fill="#cfd3d6" />
          <circle cx="66" cy="184" r="3" fill="#c0392b" />
          <text x="66" y="195" textAnchor="middle" fill="#fff" fillOpacity="0.7" fontSize="4" fontFamily="JetBrains Mono, monospace">RESET</text>

          {[
            { y: 205, label: "L", lit: on, color: "#ffb020", dim: "#5a4716" },
            { y: 213, label: "TX", lit: false, color: "#ffb020", dim: "#5a4716" },
            { y: 221, label: "RX", lit: false, color: "#ffb020", dim: "#5a4716" },
            { y: 229, label: "ON", lit: true, color: "#45e06a", dim: "#1c4a2a" },
          ].map((d) => (
            <g key={d.label}>
              <rect x="60" y={d.y} width="7" height="4" rx="1" fill={d.lit ? d.color : d.dim} style={{ transition: "fill 120ms" }} />
              <text x="71" y={d.y + 3.6} fill="#fff" fillOpacity="0.8" fontSize="4.5" fontFamily="JetBrains Mono, monospace">{d.label}</text>
            </g>
          ))}

          <rect x="130" y="232" width="74" height="22" rx="1.5" fill="#1b1b1b" stroke="#000" />
          {Array.from({ length: 14 }).map((_, i) => (
            <g key={i}>
              <rect x={133 + i * 5} y="229.5" width="2" height="2.5" fill="#aeb4b9" />
              <rect x={133 + i * 5} y="254" width="2" height="2.5" fill="#aeb4b9" />
            </g>
          ))}
          <circle cx="136" cy="238" r="1.6" fill="#333" />
          <text x="167" y="246.5" textAnchor="middle" fill="#9aa4ac" fontSize="5" fontFamily="JetBrains Mono, monospace">ATMEGA328P</text>
          <rect x="100" y="238" width="18" height="8" rx="3" fill="#cfd3d6" stroke="#8a9096" />

          <text x="125" y="276" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="800" letterSpacing="2" fontFamily="Nunito, system-ui, sans-serif">ARDUINO</text>
          <text x="125" y="287" textAnchor="middle" fill="#fff" fillOpacity="0.8" fontSize="7" fontWeight="700" letterSpacing="3" fontFamily="Nunito, system-ui, sans-serif">UNO</text>

          {/* Resistor R1 220 Ω: red red brown gold */}
          <line x1="175" y1="66" x2="225" y2="66" stroke="#b9bec2" strokeWidth="1.6" strokeLinecap="round" />
          <rect x="186" y="61" width="28" height="10" rx="4" fill="#d9b98a" stroke="#a98a5c" />
          <rect x="190" y="61.5" width="2.5" height="9" fill="#c0392b" />
          <rect x="196" y="61.5" width="2.5" height="9" fill="#c0392b" />
          <rect x="202" y="61.5" width="2.5" height="9" fill="#6b3e1e" />
          <rect x="209" y="61.5" width="2.5" height="9" fill="#d4af37" />
          <text x="200" y="82" textAnchor="middle" fill="#6b6454" fontSize="6" fontFamily="JetBrains Mono, monospace">R1 220Ω</text>

          {/* LED D1 */}
          <circle cx="170" cy="40" r="28" fill="url(#led-glow)" opacity={on ? 1 : 0} style={{ transition: "opacity 120ms" }} />
          <line x1="165" y1="48" x2="165" y2="56" stroke="#b9bec2" strokeWidth="1.6" />
          <line x1="175" y1="48" x2="175" y2="56" stroke="#b9bec2" strokeWidth="1.6" />
          <path d="M161 46 V37 a9 9 0 0 1 18 0 V46 Z" fill={on ? "#ff4d3d" : "#7a1d1d"} fillOpacity={on ? 1 : 0.85} stroke="#4a0f0f" strokeWidth="0.8" style={{ transition: fade }} />
          <rect x="159" y="45" width="22" height="3" rx="1" fill={on ? "#ff4d3d" : "#7a1d1d"} stroke="#4a0f0f" strokeWidth="0.8" style={{ transition: fade }} />
          <ellipse cx="166.5" cy="36" rx="2" ry="4" fill="#fff" opacity={on ? 0.55 : 0.18} style={{ transition: "opacity 120ms" }} />
          <text x="170" y="22.5" textAnchor="middle" fill="#6b6454" fontSize="6" fontFamily="JetBrains Mono, monospace">D1</text>

          {/* Jumper wires */}
          <path d={WIRE_GND} fill="none" stroke="#0b0d0f" strokeOpacity="0.5" strokeWidth="6" strokeLinecap="round" />
          <path d={WIRE_GND} fill="none" stroke="#3a3f45" strokeWidth="3.5" strokeLinecap="round" />
          <path d={WIRE_13} fill="none" stroke="#0b0d0f" strokeOpacity="0.5" strokeWidth="6" strokeLinecap="round" />
          <path d={WIRE_13} fill="none" stroke={on ? "#ffb347" : "#e07a12"} strokeWidth="3.5" strokeLinecap="round" style={{ transition: "stroke 120ms" }} />
          <circle cx={PIN13.x} cy={PIN13.y} r="2.8" fill={on ? "#ffb347" : "#e07a12"} stroke="#0b0d0f" strokeOpacity="0.5" />
          <circle cx={PIN_GND.x} cy={PIN_GND.y} r="2.8" fill="#3a3f45" stroke="#0b0d0f" strokeOpacity="0.5" />
          <circle cx="225" cy="56" r="2.8" fill={on ? "#ffb347" : "#e07a12"} stroke="#0b0d0f" strokeOpacity="0.5" />
          <circle cx="165" cy="66" r="2.8" fill="#3a3f45" stroke="#0b0d0f" strokeOpacity="0.5" />

          {/* Logic analyzer */}
          <rect x="246" y="140" width="190" height="150" rx="8" fill="#10151a" stroke="hsl(var(--code-border))" strokeWidth="1.5" />
          <text x="258" y="158" fill={muted} fontSize="8" fontWeight="700" letterSpacing="1.2" fontFamily="Nunito, system-ui, sans-serif">LOGIC ANALYZER</text>
          <text x="258" y="194" fill={gold} fontSize="8" fontWeight="700" fontFamily="JetBrains Mono, monospace">D13</text>
          {[1, 2, 3].map((s) => (
            <g key={s}>
              <line x1={SCOPE.x + (s * SCOPE.w) / SCOPE.seconds} y1="176" x2={SCOPE.x + (s * SCOPE.w) / SCOPE.seconds} y2="246" stroke="hsl(210 14% 22%)" strokeDasharray="2 3" />
              <text x={SCOPE.x + (s * SCOPE.w) / SCOPE.seconds} y="258" textAnchor="middle" fill={muted} fontSize="6.5" fontFamily="JetBrains Mono, monospace">{s}s</text>
            </g>
          ))}
          <line x1={SCOPE.x} y1={SCOPE.lo} x2={SCOPE.x + SCOPE.w} y2={SCOPE.lo} stroke="hsl(210 14% 22%)" />
          <path d={SCOPE_WAVE} fill="none" stroke="hsl(210 14% 32%)" strokeWidth="2" strokeLinejoin="round" />
          <path d={SCOPE_WAVE} fill="none" stroke={gold} strokeWidth="2.25" strokeLinejoin="round" clipPath="url(#scope-reveal)" />
          <line x1={SCOPE.x} y1="172" x2={SCOPE.x} y2="248" stroke={silk} strokeWidth="1" opacity="0.8" style={{ transform: `translateX(${sweep}px)`, transition: sweepTransition }} />
          <text x="258" y="278" fill={muted} fontSize="7" fontFamily="JetBrains Mono, monospace">T = 2000 ms · 0.5 Hz</text>
        </svg>
      </div>

      <div className="bg-[hsl(var(--code-bg))] border-t-2 border-[hsl(var(--code-border))] py-3">
        <div className="flex items-center justify-between px-4 pb-2">
          <span className="silk" style={{ color: "hsl(210 12% 62%)" }}>blink.ino</span>
          <span className="silk" style={{ color: "hsl(210 12% 62%)" }}>Arduino Uno</span>
        </div>
        <pre className="font-mono text-[13px] leading-[1.75] overflow-x-auto" aria-label="Blink sketch source">
          {SKETCH.map((l, i) => {
            const active = (l.line === "on" && on) || (l.line === "off" && !on);
            return (
              <div
                key={i}
                className="px-4 whitespace-pre"
                style={{
                  color: active ? "#fff" : "hsl(210 18% 76%)",
                  background: active ? "hsl(47 100% 50% / 0.18)" : "transparent",
                  boxShadow: active ? "inset 3px 0 0 hsl(var(--gold-bright))" : "none",
                  transition: "background-color 160ms",
                }}
              >
                {l.text || " "}
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}

/* ── Illustrations for the other feature blocks ──────────── */

function PathPreview() {
  return (
    <div className="clay-card p-8 flex flex-col items-center gap-2 max-w-sm mx-auto w-full">
      <div className="flex items-center gap-2 self-stretch rounded-2xl px-4 py-3 mb-4 text-white" style={{ background: "hsl(var(--primary))", boxShadow: "0 4px 0 0 hsl(var(--primary-dark))" }}>
        <span className="font-extrabold uppercase tracking-wider text-xs">Path 1 · LED basics</span>
      </div>
      <button type="button" tabIndex={-1} aria-hidden="true" className="lesson-node lesson-node-completed ml-0"><Check size={30} strokeWidth={4} /></button>
      <button type="button" tabIndex={-1} aria-hidden="true" className="lesson-node lesson-node-completed" style={{ marginLeft: 56 }}><Check size={30} strokeWidth={4} /></button>
      <div className="relative mt-8" style={{ marginLeft: 0 }}>
        <span className="node-start-bubble">START</span>
        <button type="button" tabIndex={-1} aria-hidden="true" className="lesson-node lesson-node-available"><Star size={28} fill="currentColor" /></button>
      </div>
      <button type="button" tabIndex={-1} aria-hidden="true" className="lesson-node lesson-node-locked" style={{ marginLeft: -56 }}><Lock size={26} strokeWidth={3} /></button>
    </div>
  );
}

function ErrorPreview() {
  return (
    <div className="max-w-md mx-auto w-full space-y-4">
      <div className="rounded-2xl overflow-hidden border-2 border-b-4 border-[hsl(var(--code-border))] bg-[hsl(var(--code-bg))] p-4">
        <p className="silk mb-2" style={{ color: "hsl(210 12% 62%)" }}>Compiler says</p>
        <p className="font-mono text-[13px] leading-relaxed" style={{ color: "hsl(0 100% 78%)" }}>
          blink.ino:6:16: error: 'ledPin' was not declared in this scope
        </p>
      </div>
      <div className="flex items-start gap-3">
        <Mascot size={64} className="flex-shrink-0 -mt-1" />
        <div className="clay-card p-4 relative">
          <p className="font-extrabold text-foreground mb-1">You used ledPin before creating it.</p>
          <p className="text-[15px] text-muted-foreground">
            Add <code className="px-1.5 py-0.5 rounded-md bg-[hsl(var(--background-hover))] font-mono text-[13px] text-foreground">int ledPin = 13;</code> above <code className="px-1.5 py-0.5 rounded-md bg-[hsl(var(--background-hover))] font-mono text-[13px] text-foreground">setup()</code>.
          </p>
        </div>
      </div>
      <p className="silk text-center">Example</p>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */

export default function Index() {
  const { user } = useAuth();
  return (
    <Layout>
      <div className="min-h-full">
        {/* Hero */}
        <section className="relative overflow-hidden px-5 sm:px-8 pt-10 sm:pt-16 pb-16 sm:pb-24" style={{ background: "hsl(var(--secondary-light))" }}>
          <span aria-hidden="true" className="absolute -top-10 -left-10 w-44 h-44 rounded-full" style={{ background: "hsl(var(--gold-bright) / 0.35)" }} />
          <span aria-hidden="true" className="absolute top-24 right-8 w-16 h-16 rounded-2xl rotate-12" style={{ background: "hsl(var(--green-bright) / 0.35)" }} />
          <span aria-hidden="true" className="absolute -bottom-12 right-1/3 w-40 h-40 rounded-full" style={{ background: "hsl(var(--blue-bright) / 0.25)" }} />
          <div className="relative max-w-5xl mx-auto grid md:grid-cols-2 gap-8 md:gap-14 items-center">
            <FadeInView className="order-2 md:order-1 flex justify-center">
              <div className="relative">
                <div className="absolute -top-12 left-1/2 ml-8 z-10 clay-card px-4 py-3 w-[170px]">
                  <p className="font-extrabold text-foreground text-[15px] leading-snug">Let's make an LED blink!</p>
                </div>
                <Mascot size={260} mood="cheer" bob />
              </div>
            </FadeInView>
            <FadeInView delay={0.1} className="order-1 md:order-2 text-center md:text-left">
              <h1 className="font-black text-foreground leading-[1.1] text-[clamp(2rem,4.6vw,3rem)]">
                The fun way to learn Arduino and electronics.
              </h1>
              <p className="mt-4 text-[17px] text-muted-foreground max-w-[40ch] mx-auto md:mx-0">
                Bite-size lessons, a real compiler and a simulator. Earn XP, keep a streak, ship a working build.
              </p>
              <div className="mt-8 flex flex-col gap-3 max-w-[320px] mx-auto md:mx-0">
                <Link to="/learn" className="clay-btn clay-btn-primary clay-btn-lg w-full">
                  Get started
                </Link>
                {user ? (
                  <Link to="/catalog" className="clay-btn clay-btn-ghost clay-btn-lg w-full">Browse projects</Link>
                ) : (
                  <Link to="/auth" className="clay-btn clay-btn-ghost clay-btn-lg w-full">I already have an account</Link>
                )}
              </div>
            </FadeInView>
          </div>
        </section>

        {/* Feature: learn by doing */}
        <section className="px-5 sm:px-8 py-16 sm:py-20" style={{ background: "hsl(var(--card))" }}>
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h2 className="font-black text-3xl sm:text-4xl leading-[1.15]" style={{ color: "hsl(var(--primary))" }}>
                Learn by wiring and coding.
              </h2>
              <p className="mt-4 text-[18px] leading-relaxed text-muted-foreground max-w-[42ch]">
                Every lesson ends with something that runs. Write the sketch, compile it on a real toolchain, then flash a connected board over USB, or run it on the simulator first.
              </p>
            </div>
            <BlinkBench />
          </div>
        </section>

        {/* Feature: motivation */}
        <section className="px-5 sm:px-8 py-16 sm:py-20" style={{ background: "hsl(var(--gold-light))" }}>
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="order-2 md:order-1"><PathPreview /></div>
            <div className="order-1 md:order-2">
              <h2 className="font-black text-3xl sm:text-4xl leading-[1.15]" style={{ color: "hsl(var(--secondary))" }}>
                Stay motivated.
              </h2>
              <p className="mt-4 text-[18px] leading-relaxed text-muted-foreground max-w-[42ch]">
                Follow a path one lesson at a time. Earn XP, keep your daily streak alive and unlock achievements as your builds get harder.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 font-extrabold text-lg text-orange"><Flame size={24} fill="currentColor" className="text-orange-bright" aria-hidden="true" /> Streak</span>
                <span className="inline-flex items-center gap-1.5 font-extrabold text-lg text-gold"><Zap size={24} fill="currentColor" className="text-gold-bright" aria-hidden="true" /> XP</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature: debugging */}
        <section className="px-5 sm:px-8 py-16 sm:py-20" style={{ background: "hsl(var(--success-light))" }}>
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h2 className="font-black text-3xl sm:text-4xl leading-[1.15]" style={{ color: "hsl(var(--gold))" }}>
                Get unstuck fast.
              </h2>
              <p className="mt-4 text-[18px] leading-relaxed text-muted-foreground max-w-[42ch]">
                Compiler errors are cryptic. Paste one into the error database or ask the AI mentor and get a plain-words explanation with the fix.
              </p>
            </div>
            <ErrorPreview />
          </div>
        </section>

        {/* Starter projects */}
        <section className="px-5 sm:px-8 py-16 sm:py-20" style={{ background: "hsl(var(--purple-light))" }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="font-black text-3xl sm:text-4xl text-center text-foreground">Start with a small build.</h2>
            <div className="mt-10 grid sm:grid-cols-2 gap-4">
              {starters.map((p) => (
                <Link key={p.id} to={`/project/${p.id}`} className="clay-card p-5 block">
                  <div className="flex items-center justify-between mb-3">
                    <span className="clay-badge clay-badge-primary">{p.level}</span>
                    <span className="inline-flex items-center gap-1 font-extrabold text-gold"><Zap size={16} fill="currentColor" className="text-gold-bright" aria-hidden="true" />+{p.xp} XP</span>
                  </div>
                  <h3 className="font-black text-xl text-foreground">{p.title}</h3>
                  <p className="mt-1 text-[15px] text-muted-foreground">{p.desc}</p>
                  <p className="silk mt-3">{p.time}</p>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link to="/catalog" className="clay-btn clay-btn-ghost">See all projects <ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>

        {/* Close */}
        <section className="px-5 sm:px-8 py-14 sm:py-20" style={{ background: "hsl(var(--primary))" }}>
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            <Mascot size={110} mood="cheer" bob />
            <h2 className="mt-4 font-black text-3xl sm:text-4xl text-white leading-[1.15]">
              Ready to blink your first LED?
            </h2>
            <Link
              to="/learn"
              className="clay-btn clay-btn-lg mt-8 bg-white !border-[hsl(0_0%_82%)] hover:bg-[hsl(0_0%_97%)]"
              style={{ color: "hsl(var(--primary))" }}
            >
              Start the first lesson
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
