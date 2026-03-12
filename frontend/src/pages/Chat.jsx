import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

const TOPICS = ["Mathematics","Science","History","Programming","Physics","Chemistry","Literature","Geography"];

function TypingDots() {
  return (
    <div className="flex gap-1.5 px-4 py-3 bg-accent/10 border border-accent/20 w-fit">
      {[0,1,2].map(i => (
        <motion.div key={i} animate={{ scale:[0.5,1,0.5], opacity:[0.5,1,0.5] }}
          transition={{ repeat: Infinity, duration: 0.9, delay: i*0.2 }}
          className="w-2 h-2 bg-accent" style={{ borderRadius: 0 }} />
      ))}
    </div>
  );
}

export default function Chat() {
  const { user, addXP } = useAuth();
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Welcome, ${user?.name}! 🗺️ I'm StudIQ, your AI tutor. What would you like to learn today?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("Mathematics");
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [voiceOn, setVoiceOn] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const endRef = useRef(null);
  const recogRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  useEffect(() => {
    api.get("/ai/sessions").then(r => setSessions(r.data.sessions)).catch(() => {});
  }, []);

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(p => [...p, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const res = await api.post("/ai/chat", { message: msg, sessionId, topic, history });
      setMessages(p => [...p, { role: "assistant", content: res.data.reply }]);
      if (!sessionId) setSessionId(res.data.sessionId);
      await addXP(5, topic);
    } catch (err) {
      toast.error("AI response failed");
      setMessages(p => [...p, { role: "assistant", content: "Hmm, something went wrong. Try again!" }]);
    }
    setLoading(false);
  };

  const loadSession = async (id) => {
    try {
      const res = await api.get(`/ai/sessions/${id}`);
      setMessages(res.data.session.messages);
      setSessionId(id);
      setShowHistory(false);
    } catch { toast.error("Failed to load session"); }
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return toast.error("Voice not supported in this browser");
    if (voiceOn) { recogRef.current?.stop(); setVoiceOn(false); return; }
    const r = new SR();
    r.lang = "en-US";
    r.onresult = e => { setInput(e.results[0][0].transcript); setVoiceOn(false); };
    r.onend = () => setVoiceOn(false);
    r.start(); recogRef.current = r; setVoiceOn(true);
  };

  const newChat = () => {
    setMessages([{ role: "assistant", content: "New session started! What would you like to learn? 🧠" }]);
    setSessionId(null);
  };

  return (
    <div className="h-screen pt-16 flex">
      {/* Sidebar: Chat history */}
      <AnimatePresence>
        {showHistory && (
          <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            className="w-64 border-r border-border bg-surface flex flex-col shrink-0 overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="font-pixel text-[9px] text-accent">CHAT HISTORY</span>
              <button onClick={() => setShowHistory(false)} className="text-[#6b6b9a] bg-transparent border-0 cursor-pointer text-lg">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
              <motion.button whileHover={{ x: 4 }} onClick={newChat}
                className="text-left px-3 py-2.5 text-sm border border-accent/30 bg-accent/10 text-accent cursor-pointer font-semibold font-body">
                + New Chat
              </motion.button>
              {sessions.map(s => (
                <motion.button key={s._id} whileHover={{ x: 4 }} onClick={() => loadSession(s._id)}
                  className={`text-left px-3 py-2.5 border font-body cursor-pointer transition-colors ${s._id === sessionId ? "border-accent/50 bg-accent/10" : "border-border bg-transparent"}`}>
                  <div className="text-sm text-[#e8e8f5] truncate">{s.title}</div>
                  <div className="text-[11px] text-[#6b6b9a]">{s.topic} · {s.messageCount} msgs</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b-2 border-border bg-card shrink-0">
          <button onClick={() => setShowHistory(!showHistory)}
            className="text-[#6b6b9a] hover:text-accent bg-transparent border-0 cursor-pointer text-xl transition-colors">☰</button>
          <motion.div animate={{ rotate:[0,5,-5,0] }} transition={{ repeat: Infinity, duration: 3 }}
            className="w-9 h-9 flex items-center justify-center text-xl shrink-0"
            style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }}>🤖</motion.div>
          <div>
            <div className="font-pixel text-[9px] text-accent">STUDIQ AI TUTOR</div>
            <div className="text-xs text-emerald-400">● Online · Level {user?.level} Mode</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <select value={topic} onChange={e => setTopic(e.target.value)}
              className="bg-surface border border-border text-[#e8e8f5] px-3 py-1.5 text-xs font-mono cursor-pointer outline-none focus:border-accent">
              {TOPICS.map(t => <option key={t}>{t}</option>)}
            </select>
            <button onClick={newChat}
              className="font-pixel text-[8px] px-2 py-1.5 border border-border text-[#6b6b9a] hover:border-accent/50 hover:text-accent transition-all cursor-pointer bg-transparent">
              NEW
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-card">
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className={`max-w-[78%] ${m.role === "user" ? "self-end" : "self-start"}`}>
                {m.role === "assistant" && (
                  <div className="font-pixel text-[8px] text-accent mb-1.5">🤖 STUDIQ</div>
                )}
                <div className={`px-4 py-3 text-sm leading-7 whitespace-pre-wrap ${
                  m.role === "user"
                    ? "text-white"
                    : "bg-accent/10 border border-accent/20 text-[#e8e8f5]"
                  }`}
                  style={m.role === "user" ? { background: "linear-gradient(135deg,#7c3aed,#4f46e5)" } : {}}>
                  {m.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && <TypingDots />}
          <div ref={endRef} />
        </div>

        {/* Input bar */}
        <div className="flex gap-2 px-4 py-3 border-t-2 border-accent/50 bg-card shrink-0">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startVoice}
            className="px-3 py-2.5 cursor-pointer border text-lg transition-all"
            style={{ background: voiceOn ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)", borderColor: voiceOn ? "#ef4444" : "#2a2a45", color: voiceOn ? "#ef4444" : "#6b6b9a" }}>
            {voiceOn ? "🔴" : "🎙️"}
          </motion.button>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder={`Ask about ${topic}...`}
            className="flex-1 bg-white/[0.04] border border-border text-[#e8e8f5] placeholder:text-[#6b6b9a] px-4 py-2.5 text-sm font-body outline-none focus:border-accent transition-colors" />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={send}
            disabled={loading || !input.trim()}
            className="btn-pixel px-5 py-2.5 text-[9px] disabled:opacity-50">
            SEND ▶
          </motion.button>
        </div>
      </div>
    </div>
  );
}
