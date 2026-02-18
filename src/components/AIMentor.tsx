import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Sparkles, ChevronDown } from "lucide-react";

interface Message {
  role: "user" | "ai";
  text: string;
}

const greetings = [
  "Hi! I'm your AI Mentor 🤖 Ask me anything about Arduino, electronics, or your projects!",
];

const responses: Record<string, string> = {
  default: "Great question! For Arduino projects, start by understanding what each component does. Break the problem into smaller steps — what are you trying to build?",
  led: "LEDs need a current-limiting resistor (usually 220Ω). Connect the longer leg (anode) through the resistor to the Arduino pin, and the shorter leg (cathode) to GND.",
  servo: "Servos have 3 wires: power (red), ground (brown/black), and signal (orange/yellow). Connect signal to a PWM pin and use the Servo library with `myServo.write(angle)`.",
  sensor: "Sensors usually output analog or digital signals. Check the datasheet for your specific sensor. Most temperature sensors like DHT22 need the DHT library.",
  error: "Don't worry about errors — they're part of learning! Check: 1) Is the library installed? 2) Are pin numbers correct? 3) Is the baud rate set right in Serial Monitor?",
  beginner: "Start with the basics: LED blink, then button input, then sensors. Each project builds on the last. You've got this! 💪",
  wifi: "For WiFi with ESP32/ESP8266, use the WiFi.h library. Connect to your network with `WiFi.begin(ssid, password)` and check `WiFi.status() == WL_CONNECTED`.",
  motor: "For DC motors, use an L298N motor driver — never connect motors directly to Arduino. For servo motors, use the built-in Servo library with PWM pins.",
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("led") || lower.includes("light")) return responses.led;
  if (lower.includes("servo") || lower.includes("motor")) return responses.motor;
  if (lower.includes("sensor") || lower.includes("temperature") || lower.includes("dht")) return responses.sensor;
  if (lower.includes("error") || lower.includes("not working") || lower.includes("help")) return responses.error;
  if (lower.includes("beginner") || lower.includes("start") || lower.includes("new")) return responses.beginner;
  if (lower.includes("wifi") || lower.includes("esp") || lower.includes("internet")) return responses.wifi;
  return responses.default;
}

export default function AIMentor() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: greetings[0] },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { role: "ai", text: getAIResponse(userMsg) }]);
    }, 1000 + Math.random() * 800);
  };

  return (
    <>
      {/* Floating button — bottom RIGHT like original */}
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
        {/* Green dot */}
        <span
          className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full"
          style={{ background: "#00FF88", border: "2px solid hsl(229, 48%, 8%)" }}
        />
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 w-80 rounded-2xl border z-50 flex flex-col overflow-hidden shadow-2xl animate-fade-in-up"
          style={{
            background: "hsl(229, 45%, 14%)",
            borderColor: "rgba(183,68,255,0.4)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 30px rgba(183,68,255,0.2)",
            maxHeight: "480px",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(183,68,255,0.2), rgba(255,20,147,0.1))",
              borderColor: "rgba(183,68,255,0.3)",
            }}
          >
            <div className="flex items-center gap-2.5">
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
            <button onClick={() => setOpen(false)} className="transition-all hover:scale-110" style={{ color: "#A0AED9" }}>
              <X size={16} />
            </button>
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
                  className="max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed"
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
              className="flex-1 bg-transparent text-xs focus:outline-none"
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
