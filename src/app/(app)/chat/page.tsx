"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Paperclip, Mic, Square, X } from "lucide-react";

// --- Types ---
interface Attachment {
  name: string;
  type: string;
  url?: string;
  base64?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent?: string;
  agentName?: string;
  agentColor?: string;
  attachments?: Attachment[];
}

const AGENT_COLORS: Record<string, string> = {
  dispatch: "#3B82F6",
  compliance: "#F59E0B",
  support: "#22C55E",
};

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Ciao! Sono il tuo assistente FleetMind. Ho accesso ai dati della tua flotta in tempo reale. Posso aiutarti con la pianificazione trasporti, la normativa, o l'uso della piattaforma. Scrivi, parla, o allega un file per iniziare.",
  agent: "dispatch",
  agentName: "FleetMind Dispatch",
  agentColor: "#3B82F6",
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<{ file: File; url?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentAgent, setCurrentAgent] = useState("dispatch");
  const [currentAgentName, setCurrentAgentName] = useState("FleetMind Dispatch");
  const [currentAgentColor, setCurrentAgentColor] = useState("#3B82F6");

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // --- Send ---
  const sendMessage = async () => {
    const text = input.trim();
    if (!text && files.length === 0) return;
    if (isLoading) return;

    const attachments: Attachment[] = [];
    for (const f of files) {
      const base64 = await fileToBase64(f.file);
      attachments.push({
        name: f.file.name,
        type: f.file.type,
        url: f.url,
        base64,
      });
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setFiles([]);
    setIsLoading(true);
    if (inputRef.current) inputRef.current.style.height = "auto";

    const apiMessages = updated.map((m) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg: any = { role: m.role, content: m.content };
      if (m.agent) msg.agent = m.agent;
      if (m.attachments) msg.attachments = m.attachments.map((a) => ({ name: a.name, type: a.type, base64: a.base64 }));
      return msg;
    });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, currentAgent }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Errore" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const agentType = res.headers.get("X-Agent-Type") || currentAgent;
      const agentName = res.headers.get("X-Agent-Name") || currentAgentName;
      const agentColor = res.headers.get("X-Agent-Color") || currentAgentColor;
      setCurrentAgent(agentType);
      setCurrentAgentName(agentName);
      setCurrentAgentColor(agentColor);

      const aId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { id: aId, role: "assistant", content: "", agent: agentType, agentName: agentName, agentColor: agentColor }]);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        let acc = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          const t = acc;
          setMessages((prev) => prev.map((m) => (m.id === aId ? { ...m, content: t } : m)));
        }
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Errore sconosciuto";
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: errMsg, agent: currentAgent, agentName: currentAgentName, agentColor: currentAgentColor },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Files ---
  const addFiles = (fl: FileList) => {
    const arr = Array.from(fl).map((file) => ({
      file,
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    }));
    setFiles((prev) => [...prev, ...arr]);
  };

  // --- Voice ---
  const toggleRecording = () => {
    if (isRecording) {
      recRef.current?.stop();
      setIsRecording(false);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { alert("Browser non supporta il riconoscimento vocale"); return; }
    const rec = new SR();
    rec.lang = "it-IT";
    rec.continuous = false;
    rec.interimResults = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      setInput(t);
    };
    rec.onend = () => setIsRecording(false);
    rec.onerror = () => setIsRecording(false);
    recRef.current = rec;
    rec.start();
    setIsRecording(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] lg:h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentAgentColor }} />
          <span className="text-xs font-semibold" style={{ color: currentAgentColor }}>
            {currentAgentName}
          </span>
        </div>
        <div className="flex gap-1">
          {Object.entries(AGENT_COLORS).map(([key, color]) => (
            <div
              key={key}
              className="w-2 h-2 rounded-full transition-all"
              style={{ backgroundColor: color, opacity: currentAgent === key ? 1 : 0.25 }}
            />
          ))}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] ${msg.role === "user" ? "" : ""}`}>
                {/* Agent label */}
                {msg.role === "assistant" && msg.agentName && (
                  <div className="flex items-center gap-1.5 mb-1 ml-3">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: msg.agentColor }} />
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: msg.agentColor }}>
                      {msg.agentName}
                    </span>
                  </div>
                )}

                {/* Attachments */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className={`flex flex-wrap gap-2 mb-1.5 ${msg.role === "user" ? "justify-end" : ""}`}>
                    {msg.attachments.map((att, i) =>
                      att.url ? (
                        <img key={i} src={att.url} alt={att.name} className="max-w-[180px] max-h-[120px] rounded-xl object-cover" />
                      ) : (
                        <span key={i} className="text-[11px] px-2 py-1 rounded-lg bg-secondary text-muted-foreground">
                          📎 {att.name}
                        </span>
                      )
                    )}
                  </div>
                )}

                {/* Bubble */}
                {msg.content && (
                  <div
                    className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "rounded-2xl rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-2xl rounded-bl-md bg-secondary text-foreground"
                    }`}
                  >
                    {msg.content}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing */}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-secondary">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File previews */}
      {files.length > 0 && (
        <div className="flex gap-2 px-4 pt-2 pb-1 border-t border-border overflow-x-auto">
          {files.map((f, i) => (
            <div key={i} className="relative shrink-0 group">
              {f.url ? (
                <img src={f.url} alt={f.file.name} className="w-14 h-14 rounded-lg object-cover border border-border" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-secondary border border-border flex items-center justify-center text-xs text-muted-foreground">
                  📎
                </div>
              )}
              <button
                onClick={() => { if (f.url) URL.revokeObjectURL(f.url); setFiles((p) => p.filter((_, j) => j !== i)); }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-end gap-2 px-3 py-3 border-t border-border bg-card shrink-0">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={isLoading}
          className="flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-30 shrink-0"
        >
          <Paperclip className="w-[18px] h-[18px]" />
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx"
          className="hidden"
          onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
        />

        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Scrivi un messaggio..."
          disabled={isLoading}
          rows={1}
          className="flex-1 resize-none rounded-2xl bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-40 transition-all"
          style={{ maxHeight: "100px" }}
          onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 100) + "px"; }}
        />

        <button
          onClick={toggleRecording}
          disabled={isLoading}
          className={`flex items-center justify-center w-9 h-9 rounded-full transition-all shrink-0 ${
            isRecording ? "bg-red-500 text-white animate-pulse" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          } disabled:opacity-30`}
        >
          {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-[18px] h-[18px]" />}
        </button>

        <button
          onClick={sendMessage}
          disabled={isLoading || (!input.trim() && files.length === 0)}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-20 transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
