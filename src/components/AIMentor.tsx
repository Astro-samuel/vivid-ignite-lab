import { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, X, Send, Bot, Sparkles, ChevronDown, Maximize2, Minimize2, GripVertical } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MENTOR_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-mentor`;

async function streamMentor({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  try {
    const resp = await fetch(MENTOR_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages }),
    });

    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      onError(data.error || "Something went wrong — try again?");
      return;
    }

    if (!resp.body) {
      onError("No response received");
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIdx: number;
      while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIdx);
        buffer = buffer.slice(newlineIdx + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }

    // Flush remaining
    if (buffer.trim()) {
      for (let raw of buffer.split("\n")) {
        if (!raw || raw.startsWith(":") || !raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const c = parsed.choices?.[0]?.delta?.content;
          if (c) onDelta(c);
        } catch {}
      }
    }

    onDone();
  } catch (err) {
    onError("Connection failed — check your internet?");
  }
}

export default function AIMentor() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hey! 👋 I'm your Arduino mentor. Whether you're wiring your first LED or debugging a sensor project, I'm here to help you figure it out. What are you working on?" },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
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

  const send = async () => {
    if (!input.trim() || streaming) return;
    const userMsg = input.trim();
    setInput("");

    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setStreaming(true);

    let assistantText = "";

    const updateAssistant = (chunk: string) => {
      assistantText += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > newMessages.length) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantText } : m));
        }
        return [...prev, { role: "assistant", content: assistantText }];
      });
    };

    await streamMentor({
      messages: newMessages,
      onDelta: updateAssistant,
      onDone: () => setStreaming(false),
      onError: (msg) => {
        setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
        setStreaming(false);
      },
    });
  };

  const panelWidth = expanded ? "w-[480px]" : "w-80";

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
                {m.role === "assistant" && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "linear-gradient(135deg, #B744FF, #FF1493)" }}
                  >
                    <Sparkles size={11} color="#fff" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${expanded ? "text-sm" : ""}`}
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
                  {m.content}
                </div>
              </div>
            ))}
            {streaming && messages[messages.length - 1]?.role !== "assistant" && (
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
              disabled={streaming}
              className={`flex-1 bg-transparent focus:outline-none disabled:opacity-50 ${expanded ? "text-sm" : "text-xs"}`}
              style={{ color: "#FFFFFF" }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || streaming}
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
