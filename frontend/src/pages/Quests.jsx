import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";

const CHALLENGES = [
  { id: 1, title: "Sum of Two Numbers", topic: "Math", difficulty: "easy", xp: 20, tags: ["arithmetic","basics"] },
  { id: 2, title: "FizzBuzz", topic: "Programming", difficulty: "easy", xp: 20, tags: ["loops","conditions"] },
  { id: 3, title: "Fibonacci Sequence", topic: "Math", difficulty: "medium", xp: 40, tags: ["sequences","recursion"] },
  { id: 4, title: "Binary Search", topic: "Algorithms", difficulty: "medium", xp: 40, tags: ["search","arrays"] },
  { id: 5, title: "Sorting Algorithms", topic: "Algorithms", difficulty: "medium", xp: 40, tags: ["sort","arrays"] },
  { id: 6, title: "Big O Notation", topic: "CS Theory", difficulty: "hard", xp: 80, tags: ["complexity","theory"] },
  { id: 7, title: "Newton's Laws", topic: "Physics", difficulty: "easy", xp: 20, tags: ["mechanics","forces"] },
  { id: 8, title: "DNA & RNA Basics", topic: "Biology", difficulty: "medium", xp: 40, tags: ["genetics","biology"] },
  { id: 9, title: "French Revolution Causes", topic: "History", difficulty: "medium", xp: 40, tags: ["revolution","europe"] },
  { id: 10, title: "Photosynthesis Process", topic: "Biology", difficulty: "easy", xp: 20, tags: ["plants","chemistry"] },
  { id: 11, title: "Ohm's Law", topic: "Physics", difficulty: "medium", xp: 40, tags: ["electricity","circuits"] },
  { id: 12, title: "Recursion Fundamentals", topic: "Programming", difficulty: "hard", xp: 80, tags: ["recursion","functions"] },
];

const DIFF_COLOR = { easy: "#10b981", medium: "#f59e0b", hard: "#ef4444" };

export default function Quests() {
  const { user, addXP } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(false);
  const [topicFilter, setTopicFilter] = useState("All");
  const [diffFilter, setDiffFilter] = useState("All");
  const [solvedLocal, setSolvedLocal] = useState(new Set(user?.solvedChallenges || []));

  const topics = ["All", ...new Set(CHALLENGES.map(c => c.topic))];
  const filtered = CHALLENGES.filter(c =>
    (topicFilter === "All" || c.topic === topicFilter) &&
    (diffFilter === "All" || c.difficulty === diffFilter)
  );

  const openChallenge = async (ch) => {
    if (active?.id === ch.id) { setActive(null); return; }
    if (solvedLocal.has(ch.id)) {
      setActive({ ...ch, phase: "already", explanation: "You've already conquered this challenge! Try a harder one." });
      return;
    }
    setActive({ ...ch, phase: "loading" });
    setLoading(true);
    try {
      const res = await api.post("/ai/explain", { title: ch.title, topic: ch.topic, difficulty: ch.difficulty });
      setActive({ ...ch, phase: "done", explanation: res.data.explanation });
      // Mark solved
      await api.post("/users/solve", { challengeId: ch.id, xp: ch.xp });
      setSolvedLocal(p => new Set([...p, ch.id]));
      await addXP(ch.xp, ch.topic);
      toast.success(`+${ch.xp} XP earned! 🎯`);
    } catch {
      setActive({ ...ch, phase: "done", explanation: "AI explanation unavailable. Try the AI Tutor page for detailed help!" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-20 px-6 pb-10">
      <div className="max-w-6xl mx-auto">
        <div className={`grid gap-5 transition-all ${active ? "grid-cols-1 xl:grid-cols-[1fr_400px]" : "grid-cols-1"}`}>

          {/* Left: Table */}
          <div>
            <div className="flex items-end gap-4 mb-5 flex-wrap">
              <div>
                <div className="font-pixel text-[10px] text-[#ec4899] mb-1">QUEST BOARD</div>
                <h2 className="text-2xl font-bold">Learning Challenges</h2>
              </div>
              <div className="ml-auto flex gap-2 flex-wrap">
                <select value={topicFilter} onChange={e => setTopicFilter(e.target.value)}
                  className="bg-card border border-border text-[#e8e8f5] px-3 py-2 text-xs font-mono cursor-pointer outline-none focus:border-accent">
                  {topics.map(t => <option key={t}>{t}</option>)}
                </select>
                <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)}
                  className="bg-card border border-border text-[#e8e8f5] px-3 py-2 text-xs font-mono cursor-pointer outline-none focus:border-accent">
                  {["All","easy","medium","hard"].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Stats bar */}
            <div className="flex gap-5 mb-4 p-3 bg-card border border-border flex-wrap text-sm">
              {[
                ["Easy", CHALLENGES.filter(c=>c.difficulty==="easy").length, "#10b981"],
                ["Medium", CHALLENGES.filter(c=>c.difficulty==="medium").length, "#f59e0b"],
                ["Hard", CHALLENGES.filter(c=>c.difficulty==="hard").length, "#ef4444"],
                ["Solved", `${solvedLocal.size}/${CHALLENGES.length}`, "#7c3aed"],
              ].map(([l,v,c]) => (
                <div key={l} className="flex items-center gap-2">
                  <span className="text-[#6b6b9a] text-xs">{l}:</span>
                  <span className="font-mono font-bold text-sm" style={{ color: c }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Table header */}
            <div className="border border-border overflow-hidden">
              <div className="grid text-[8px] font-pixel text-[#6b6b9a] tracking-wider px-4 py-2.5 bg-white/[0.02] border-b border-border"
                style={{ gridTemplateColumns: "40px 1fr 110px 90px 60px 90px" }}>
                <span>#</span><span>TITLE</span><span>TOPIC</span><span>DIFFICULTY</span><span>XP</span><span>STATUS</span>
              </div>
              {filtered.map((ch) => {
                const solved = solvedLocal.has(ch.id);
                const isActive = active?.id === ch.id;
                return (
                  <motion.div key={ch.id} whileHover={{ background: "rgba(124,58,237,0.08)" }}
                    onClick={() => openChallenge(ch)}
                    className="grid items-center px-4 py-3.5 border-b border-border cursor-pointer transition-colors"
                    style={{ gridTemplateColumns: "40px 1fr 110px 90px 60px 90px", background: isActive ? "rgba(124,58,237,0.12)" : "transparent" }}>
                    <span className="font-mono text-[#6b6b9a] text-xs">{ch.id}</span>
                    <span className="font-semibold text-sm" style={{ color: solved ? "#10b981" : "#e8e8f5" }}>{ch.title}</span>
                    <span className="text-xs text-[#6b6b9a]">{ch.topic}</span>
                    <span>
                      <span className={`tag-${ch.difficulty}`}>{ch.difficulty.toUpperCase()}</span>
                    </span>
                    <span className="font-mono text-amber-400 text-xs font-bold">+{ch.xp}</span>
                    <span className="font-pixel text-[8px]" style={{ color: solved ? "#10b981" : "#6b6b9a" }}>
                      {solved ? "✅ DONE" : "○ TODO"}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right: Challenge Panel */}
          <AnimatePresence>
            {active && (
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}
                className="bg-card border border-border h-fit sticky top-20">
                <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-[#ec4899]">
                  <span className="font-pixel text-[9px] text-[#ec4899]">CHALLENGE #{active.id}</span>
                  <button onClick={() => setActive(null)} className="text-[#6b6b9a] hover:text-white bg-transparent border-0 cursor-pointer text-lg">✕</button>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold mb-3">{active.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`tag-${active.difficulty}`}>{active.difficulty.toUpperCase()}</span>
                    <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">+{active.xp} XP</span>
                    {active.tags?.map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 bg-white/5 text-[#6b6b9a] border border-border">{t}</span>
                    ))}
                  </div>

                  {active.phase === "loading" && (
                    <div className="flex flex-col items-center gap-4 py-10">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-8 h-8 border-2 border-border" style={{ borderTopColor: "#7c3aed" }} />
                      <span className="font-pixel text-[9px] text-accent">AI GENERATING...</span>
                    </div>
                  )}

                  {(active.phase === "done" || active.phase === "already") && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="font-pixel text-[8px] text-emerald-400 mb-3">🤖 AI EXPLANATION</div>
                      <div className="text-sm leading-7 text-[#e8e8f5] bg-emerald-500/5 border border-emerald-500/20 p-4 mb-4 whitespace-pre-wrap">
                        {active.explanation}
                      </div>
                      <div className="flex gap-2">
                        <motion.button whileHover={{ scale: 1.03 }}
                          onClick={() => navigate(`/chat?topic=${active.topic}`)}
                          className="btn-pixel flex-1 py-3 text-[9px]">ASK MORE ▶</motion.button>
                        <button onClick={() => setActive(null)}
                          className="px-4 py-3 border border-border text-[#6b6b9a] bg-transparent cursor-pointer hover:border-accent/50 transition-colors">✕</button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
