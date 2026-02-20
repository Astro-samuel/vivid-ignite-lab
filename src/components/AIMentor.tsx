import { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, X, Send, Bot, Sparkles, ChevronDown, Maximize2, Minimize2, GripVertical } from "lucide-react";

interface Message {
  role: "user" | "ai";
  text: string;
}

const greetings = [
  "Hi! I'm your AI Mentor 🤖 Ask me anything about Arduino, electronics, or your projects!",
];

const responses: Record<string, string> = {
  default: "That's a great question! Can you tell me a bit more about what you're trying to build? Knowing your specific components and goal will help me give you better guidance. 🤔",
  led: "LEDs are a great starting point! 💡 Here's a question for you: do you know why we need a resistor with an LED? Think about what happens to current without one. The longer leg is the anode (+) and goes through a 220Ω resistor to your Arduino pin.",
  servo: "Servos are fun! 🤖 Quick question: do you know the difference between a servo and a DC motor? A servo has 3 wires — can you figure out which one carries the signal? Hint: it's usually the orange/yellow one. Try using `myServo.write(angle)` with the Servo library.",
  sensor: "Sensors are the 'eyes and ears' of your project! 🌡️ What sensor are you working with? Each one communicates differently. Before I help further — have you checked the datasheet? It'll tell you whether it's analog or digital output.",
  error: "Errors are actually great teachers! 🎓 Let's debug together. Can you tell me: 1) What's the exact error message? 2) What line does it point to? 3) Did it work before you made changes? Let's narrow it down step by step.",
  beginner: "Welcome to the Arduino world! 🌟 I'd recommend starting with LED blink — it teaches digital output. Then try a button input. Each project builds on the last. What components do you have available?",
  wifi: "WiFi opens up so many possibilities! 🌐 Are you using ESP32 or ESP8266? The basic flow is: include WiFi.h → call WiFi.begin(ssid, password) → check WiFi.status(). What are you trying to connect to?",
  motor: "Motors need some extra care — never connect them directly to Arduino! ⚡ You'll need a motor driver like L298N. Think of it as a translator between Arduino's small signals and the motor's big power needs. What type of motor are you using?",
  wiring: "Good thinking to ask about wiring! 🔧 Always double-check: is power going to the right rails? Are your grounds connected? A common mistake is forgetting the common ground between components. Can you describe your current setup?",
  code: "Let's look at your code together! 📝 Before I help, try these checks: 1) Does every line end with a semicolon? 2) Are your pin numbers matching the wiring? 3) Did you call pinMode() in setup()? Which part is giving you trouble?",
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("led") || lower.includes("light") || lower.includes("blink")) return responses.led;
  if (lower.includes("servo")) return responses.servo;
  if (lower.includes("motor") || lower.includes("drive")) return responses.motor;
  if (lower.includes("sensor") || lower.includes("temperature") || lower.includes("dht") || lower.includes("ultrasonic")) return responses.sensor;
  if (lower.includes("error") || lower.includes("not working") || lower.includes("help") || lower.includes("bug") || lower.includes("fix")) return responses.error;
  if (lower.includes("beginner") || lower.includes("start") || lower.includes("new") || lower.includes("learn")) return responses.beginner;
  if (lower.includes("wifi") || lower.includes("esp") || lower.includes("internet") || lower.includes("iot")) return responses.wifi;
  if (lower.includes("wir") || lower.includes("connect") || lower.includes("circuit") || lower.includes("breadboard")) return responses.wiring;
  if (lower.includes("code") || lower.includes("program") || lower.includes("script") || lower.includes("sketch")) return responses.code;
  return responses.default;
}

export default function AIMentor() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: greetings[0] },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Dragging state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = { ...position };
    e.preventDefault();
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent) => {
      setPosition({
        x: posStart.current.x + (e.clientX - dragStart.current.x),
        y: posStart.current.y + (e.clientY - dragStart.current.y),
      });
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isDragging]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { role: "ai", text: getAIResponse(userMsg) }]);
    }, 800 + Math.random() * 600);
  };

  const panelWidth = expanded ? "w-[480px]" : "w-80";
  const panelHeight = expanded ? "max-h-[680px]" : "max-h-[480px]";

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center z-50 transition-all hover:scale-110 shadow-2xl"
        style={{
          background: "linear-gradient(135deg, #B744FF, #FF1493)",
          boxShadow: open
            ? "0 0 25px rgba(183,68,255,0.7), 0 0 50px rgba(255,20,147,0.3)"
            : "0 0 15px rgba(183,68,255,0.5)",
        }}
      >
        {open ? <ChevronDown size={22} color="#fff" /> : <MessageSquare size={22} color="#fff" />}
        <span
          className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full"
          style={{ background: "#00FF88", border: "2px solid hsl(229, 48%, 8%)" }}
        />
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          className={`fixed bottom-24 right-6 ${panelWidth} rounded-2xl border z-50 flex flex-col overflow-hidden shadow-2xl animate-fade-in`}
          style={{
            background: "hsl(229, 45%, 14%)",
            borderColor: "rgba(183,68,255,0.4)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 30px rgba(183,68,255,0.2)",
            transform: `translate(${position.x}px, ${position.y}px)`,
            maxHeight: expanded ? "680px" : "480px",
            transition: isDragging ? "none" : "width 0.3s, max-height 0.3s",
          }}
        >
          {/* Header with drag handle */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(183,68,255,0.2), rgba(255,20,147,0.1))",
              borderColor: "rgba(183,68,255,0.3)",
              cursor: "default",
            }}
          >
            <div className="flex items-center gap-2.5">
              {/* Drag handle */}
              <div
                onMouseDown={handleMouseDown}
                className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-white/10 transition-colors"
                title="Drag to move"
              >
                <GripVertical size={14} style={{ color: "#A0AED9" }} />
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #B744FF, #FF1493)" }}
              >
                <Bot size={16} color="#fff" />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: "#FFFFFF" }}>AI Mentor</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00FF88" }} />
                  <p className="text-xs" style={{ color: "#00FF88" }}>Online</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1 rounded transition-all hover:bg-white/10"
                style={{ color: "#A0AED9" }}
                title={expanded ? "Minimize" : "Expand"}
              >
                {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button onClick={() => setOpen(false)} className="p-1 rounded transition-all hover:bg-white/10" style={{ color: "#A0AED9" }}>
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ minHeight: 0 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "ai" && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "linear-gradient(135deg, #B744FF, #FF1493)" }}
                  >
                    <Sparkles size={11} color="#fff" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${expanded ? "text-sm" : ""}`}
                  style={
                    m.role === "user"
                      ? {
                          background: "linear-gradient(135deg, #00F5FF, #0099FF)",
                          color: "#0A0E27",
                          borderBottomRightRadius: "4px",
                        }
                      : {
                          background: "rgba(255,255,255,0.06)",
                          color: "#E0E7FF",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderBottomLeftRadius: "4px",
                        }
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #B744FF, #FF1493)" }}>
                  <Sparkles size={11} color="#fff" />
                </div>
                <div className="px-3 py-2 rounded-2xl text-xs flex items-center gap-1" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#B744FF" }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#B744FF", animationDelay: "0.15s" }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#B744FF", animationDelay: "0.3s" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="flex items-center gap-2 px-3 py-3 border-t flex-shrink-0"
            style={{ borderColor: "rgba(183,68,255,0.2)", background: "hsl(229, 48%, 10%)" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask your mentor..."
              className={`flex-1 bg-transparent focus:outline-none ${expanded ? "text-sm" : "text-xs"}`}
              style={{ color: "#FFFFFF" }}
            />
            <button
              onClick={send}
              disabled={!input.trim()}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #B744FF, #FF1493)" }}
            >
              <Send size={12} color="#fff" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
