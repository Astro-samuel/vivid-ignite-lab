import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Sparkles, Maximize2, Minimize2, GripVertical, Settings } from "lucide-react";
import Mascot from "@/components/Mascot";
import { motion, AnimatePresence } from "framer-motion";
import { useAIPreferences } from "@/hooks/useAIPreferences";
import { useAIContext } from "@/hooks/useAIContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MENTOR_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-mentor`;

async function streamMentor({
  messages,
  preferences,
  contextMeta,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  preferences?: { tone: string; hintDepth: string; formality: string };
  contextMeta?: { errors_explained: string[]; questions_asked: string[] };
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) { onError("Please log in to use the AI mentor."); return; }
    const resp = await fetch(MENTOR_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ messages, preferences, contextMeta }),
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

    if (buffer.trim()) {
      for (const raw of buffer.split("\n")) {
        if (!raw || raw.startsWith(":") || !raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const c = parsed.choices?.[0]?.delta?.content;
          if (c) onDelta(c);
        } catch { /* partial JSON line: wait for the next chunk */ }
      }
    }

    onDone();
  } catch (err) {
    onError("Connection failed — check your internet?");
  }
}

interface AIMentorProps {
  projectId?: number;
}

export default function AIMentor({ projectId }: AIMentorProps) {
  const navigate = useNavigate();
  const preferences = useAIPreferences();
  const { context, saveContext, trackQuestion } = useAIContext(projectId || null);

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hey! 👋 I'm your Arduino mentor. Whether you're wiring your first LED or debugging a sensor project, I'm here to help you figure it out. What are you working on?" },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [contextLoaded, setContextLoaded] = useState(false);

  // Load cached messages when project context loads
  useEffect(() => {
    if (contextLoaded || !projectId) return;
    if (context.messages.length > 0) {
      setMessages([
        { role: "assistant", content: "Hey! 👋 I'm your Arduino mentor. I remember our last conversation on this project — let's keep going! What do you need help with?" },
        ...context.messages,
      ]);
    }
    setContextLoaded(true);
  }, [context.messages, projectId, contextLoaded]);

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

    trackQuestion(userMsg);

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
      preferences,
      contextMeta: {
        errors_explained: context.errors_explained,
        questions_asked: context.questions_asked,
      },
      onDelta: updateAssistant,
      onDone: () => {
        setStreaming(false);
        // Cache conversation
        if (projectId) {
          const allMsgs = [...newMessages.slice(1), { role: "assistant" as const, content: assistantText }];
          saveContext({ messages: allMsgs });
        }
      },
      onError: (msg) => {
        setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
        setStreaming(false);
      },
    });
  };

  const panelWidth = expanded ? "w-[min(480px,calc(100vw-2.5rem))]" : "w-[min(340px,calc(100vw-2.5rem))]";

  return (
    <>
      {/* Launcher: the same Volt mascot as the homepage */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close AI mentor" : "Open AI mentor"}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-50 rounded-2xl transition-transform hover:scale-105 active:scale-95"
      >
        <span className="relative block">
          <Mascot size={76} mood={open ? "cheer" : "happy"} bob={!open} />
          <span
            aria-hidden="true"
            className="absolute top-3 right-1 w-3.5 h-3.5 rounded-full border-2 border-white"
            style={{ background: "hsl(var(--green-bright))" }}
          />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            role="dialog"
            aria-label="AI mentor"
            className={`fixed bottom-28 right-5 ${panelWidth} rounded-2xl border-2 border-b-4 z-50 flex flex-col overflow-hidden bg-card`}
            style={{
              borderColor: "hsl(var(--border))",
              transform: `translate(${position.x}px, ${position.y}px)`,
              maxHeight: expanded ? "min(680px, calc(100vh - 9rem))" : "min(480px, calc(100vh - 9rem))",
              transition: isDragging ? "none" : "width 0.3s, max-height 0.3s",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-3 py-2.5 border-b-2 flex-shrink-0"
              style={{ background: "hsl(var(--success-light))", borderColor: "hsl(var(--border))" }}
            >
              <div className="flex items-center gap-2">
                <div
                  onMouseDown={handleMouseDown}
                  className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-black/5 transition-colors"
                  title="Drag to move"
                >
                  <GripVertical size={14} className="text-muted-foreground" />
                </div>
                <Mascot size={40} mood="happy" />
                <div>
                  <p className="font-black text-sm leading-tight text-foreground">AI Mentor</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--green-bright))" }} />
                    <p className="text-xs font-bold" style={{ color: "hsl(var(--primary))" }}>Online</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => navigate("/ai-settings")}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-black/5 transition-colors"
                  title="AI Settings"
                  aria-label="AI settings"
                >
                  <Settings size={15} />
                </button>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-black/5 transition-colors"
                  aria-label={expanded ? "Shrink chat" : "Expand chat"}
                >
                  {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-black/5 transition-colors"
                  aria-label="Close chat"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3" style={{ minHeight: 0, background: "hsl(var(--background))" }}>
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && <Mascot size={32} className="flex-shrink-0 -mt-1" />}
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl leading-relaxed whitespace-pre-wrap font-semibold ${expanded ? "text-[15px]" : "text-sm"}`}
                    style={
                      m.role === "user"
                        ? { background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", borderBottomRightRadius: "4px" }
                        : { background: "hsl(var(--card))", color: "hsl(var(--foreground))", border: "2px solid hsl(var(--border))", borderBottomLeftRadius: "4px" }
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {streaming && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-2 justify-start">
                  <Mascot size={32} className="flex-shrink-0 -mt-1" />
                  <div className="px-3.5 py-3 rounded-2xl flex items-center gap-1" style={{ background: "hsl(var(--card))", border: "2px solid hsl(var(--border))", borderBottomLeftRadius: "4px" }} aria-label="Mentor is typing">
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "hsl(var(--green-bright))" }} />
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "hsl(var(--green-bright))", animationDelay: "0.15s" }} />
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "hsl(var(--green-bright))", animationDelay: "0.3s" }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Context indicator */}
            {projectId && context.questions_asked.length > 0 && (
              <div className="px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 border-t-2 bg-card" style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground-muted))" }}>
                <Sparkles size={11} /> {context.questions_asked.length} previous questions remembered
              </div>
            )}

            {/* Input */}
            <div className="flex items-center gap-2 px-3 py-3 border-t-2 flex-shrink-0 bg-card" style={{ borderColor: "hsl(var(--border))" }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask your mentor..."
                aria-label="Message the AI mentor"
                disabled={streaming}
                className={`flex-1 min-w-0 rounded-2xl px-4 py-2.5 border-2 border-border bg-[hsl(var(--background-hover))] font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[hsl(var(--blue-bright))] focus:bg-card disabled:opacity-50 ${expanded ? "text-[15px]" : "text-sm"}`}
              />
              <button
                onClick={send}
                disabled={!input.trim() || streaming}
                aria-label="Send message"
                className="clay-btn clay-btn-primary !p-2.5 !rounded-xl"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}