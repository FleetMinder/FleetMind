"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Paperclip, Mic, Square, X, Download, Truck, FileText, Shield, HelpCircle } from "lucide-react";

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

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Ciao! Sono il tuo assistente FleetMind.\n\nChiedimi quello che vuoi sulla tua flotta, oppure tocca uno dei bottoni qui sotto per iniziare. Puoi anche parlarmi premendo il microfono.",
  agent: "dispatch",
  agentName: "FleetMind",
  agentColor: "#3B82F6",
};

const QUICK_ACTIONS = [
  { label: "Ordini di oggi", icon: Truck, message: "Quali ordini ho in attesa oggi?" },
  { label: "Scadenze documenti", icon: Shield, message: "Ci sono documenti in scadenza?" },
  { label: "Scarica report autisti", icon: Download, message: "Mandami il report degli autisti" },
  { label: "Scarica report flotta", icon: FileText, message: "Mandami il report della flotta" },
  { label: "Come funziona?", icon: HelpCircle, message: "Come funziona FleetMind? Spiegamelo in modo semplice" },
];

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
  const [currentAgentName, setCurrentAgentName] = useState("FleetMind");
  const [currentAgentColor, setCurrentAgentColor] = useState("#3B82F6");
  const [showQuickActions, setShowQuickActions] = useState(true);

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
  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content && files.length === 0) return;
    if (isLoading) return;

    setShowQuickActions(false);

    const attachments: Attachment[] = [];
    for (const f of files) {
      const base64 = await fileToBase64(f.file);
      attachments.push({ name: f.file.name, type: f.file.type, url: f.url, base64 });
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setFiles([]);
    setIsLoading(true);
    if (inputRef.current) inputRef.current.style.height = "auto";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        throw new Error(err.error || `Errore ${res.status}`);
      }

      const agentType = res.headers.get("X-Agent-Type") || currentAgent;
      const agentName = res.headers.get("X-Agent-Name") || currentAgentName;
      const agentColor = res.headers.get("X-Agent-Color") || currentAgentColor;
      setCurrentAgent(agentType);
      setCurrentAgentName(agentName);
      setCurrentAgentColor(agentColor);

      const aId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { id: aId, role: "assistant", content: "", agent: agentType, agentName, agentColor }]);

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
      const errMsg = e instanceof Error ? e.message : "Si e verificato un errore. Riprova.";
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
    if (!SR) { alert("Il tuo browser non supporta la voce. Usa Chrome o Safari."); return; }
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

  // --- Detect report links in assistant messages ---
  const renderContent = (content: string) => {
    const reportRegex = /\/api\/reports\?type=(compliance|drivers|fleet|orders)/g;
    const parts = content.split(reportRegex);
    if (parts.length === 1) return content;

    const elements: React.ReactNode[] = [];
    let i = 0;
    let match;
    let lastIndex = 0;
    const regex = /\/api\/reports\?type=(compliance|drivers|fleet|orders)/g;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        elements.push(<span key={i++}>{content.slice(lastIndex, match.index)}</span>);
      }
      const type = match[1];
      const labels: Record<string, string> = {
        compliance: "Scarica Report Compliance",
        drivers: "Scarica Report Autisti",
        fleet: "Scarica Report Flotta",
        orders: "Scarica Report Ordini",
      };
      elements.push(
        <a
          key={i++}
          href={match[0]}
          download
          className="inline-flex items-center gap-2 mt-2 mb-1 px-4 py-3 rounded-xl bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-colors no-underline"
        >
          <Download className="w-5 h-5" />
          {labels[type] || "Scarica Report"}
        </a>
      );
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < content.length) {
      elements.push(<span key={i++}>{content.slice(lastIndex)}</span>);
    }
    return <>{elements}</>;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] lg:h-screen bg-background">
      {/* Header — semplicissimo */}
      <div className="flex items-center justify-center px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full transition-colors duration-500" style={{ backgroundColor: currentAgentColor }} />
          <span className="text-sm font-semibold text-foreground">Assistente FleetMind</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 md:px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[90%] md:max-w-[80%]`}>
                {/* Attachments */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className={`flex flex-wrap gap-2 mb-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                    {msg.attachments.map((att, i) =>
                      att.url ? (
                        <img key={i} src={att.url} alt={att.name} className="max-w-[200px] max-h-[140px] rounded-2xl object-cover" />
                      ) : (
                        <span key={i} className="text-sm px-3 py-2 rounded-xl bg-secondary text-muted-foreground inline-flex items-center gap-2">
                          <Paperclip className="w-4 h-4" /> {att.name}
                        </span>
                      )
                    )}
                  </div>
                )}

                {/* Bubble */}
                {msg.content && (
                  <div
                    className={`px-5 py-3.5 text-[16px] leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "rounded-3xl rounded-br-lg bg-primary text-primary-foreground"
                        : "rounded-3xl rounded-bl-lg bg-secondary text-foreground"
                    }`}
                  >
                    {msg.role === "assistant" ? renderContent(msg.content) : msg.content}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing */}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="px-5 py-4 rounded-3xl rounded-bl-lg bg-secondary">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground animate-pulse" />
                  <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:0.2s]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions — grandi e chiari */}
          {showQuickActions && !isLoading && (
            <div className="pt-2 space-y-2">
              <p className="text-sm text-muted-foreground text-center mb-3">Cosa vuoi fare?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => sendMessage(action.message)}
                    className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-card border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-left active:scale-[0.98]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <action.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-[15px] font-medium text-foreground">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File previews */}
      {files.length > 0 && (
        <div className="flex gap-2 px-4 pt-3 pb-1 border-t border-border overflow-x-auto bg-card">
          {files.map((f, i) => (
            <div key={i} className="relative shrink-0 group">
              {f.url ? (
                <img src={f.url} alt={f.file.name} className="w-16 h-16 rounded-xl object-cover border border-border" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-secondary border border-border flex items-center justify-center">
                  <Paperclip className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <button
                onClick={() => { if (f.url) URL.revokeObjectURL(f.url); setFiles((p) => p.filter((_, j) => j !== i)); }}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input bar — GRANDE e chiaro */}
      <div className="flex items-end gap-2 px-3 py-3 border-t border-border bg-card shrink-0 safe-area-bottom">
        {/* Allega */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={isLoading}
          className="flex items-center justify-center w-12 h-12 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-30 shrink-0 active:scale-95"
          aria-label="Allega file"
        >
          <Paperclip className="w-6 h-6" />
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,.pdf,.txt,.csv,.doc,.docx"
          className="hidden"
          onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
        />

        {/* Campo testo */}
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Scrivi o parla..."
          disabled={isLoading}
          rows={1}
          className="flex-1 resize-none rounded-2xl bg-secondary px-4 py-3 text-[16px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-40 transition-all"
          style={{ maxHeight: "100px", minHeight: "48px" }}
          onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 100) + "px"; }}
        />

        {/* Microfono — GRANDE e visibile */}
        <button
          onClick={toggleRecording}
          disabled={isLoading}
          className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all shrink-0 active:scale-95 ${
            isRecording
              ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          } disabled:opacity-30`}
          aria-label={isRecording ? "Ferma registrazione" : "Parla"}
        >
          {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* Invia */}
        <button
          onClick={() => sendMessage()}
          disabled={isLoading || (!input.trim() && files.length === 0)}
          className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-20 transition-all shrink-0 active:scale-95"
          aria-label="Invia"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
