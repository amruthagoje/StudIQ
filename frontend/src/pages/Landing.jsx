import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const FEATURES = [
  { icon: "🗺️", title: "WORLD MAP", desc: "Journey through fantasy learning worlds", color: "#10b981" },
  { icon: "⚔️", title: "CHALLENGES", desc: "LeetCode-style problem solving quests", color: "#7c3aed" },
  { icon: "🤖", title: "AI TUTOR", desc: "Instant explanations from your AI mentor", color: "#06b6d4" },
  { icon: "🏆", title: "LEADERBOARD", desc: "Compete with learners worldwide", color: "#f59e0b" },
  { icon: "🎯", title: "QUIZ MODE", desc: "Adaptive quizzes that match your level", color: "#ec4899" },
  { icon: "🔥", title: "STREAKS", desc: "Daily learning habits and rewards", color: "#ef4444" },
];

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="pixel-bg min-h-screen relative overflow-hidden">
      {/* Stars */}
      {Array.from({ length: 35 }, (_, i) => (
        <div key={i} className="absolute w-[3px] h-[3px] bg-white animate-twinkle"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`, animationDuration: `${1.5 + Math.random() * 2}s` }} />
      ))}

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}
            className="text-7xl mb-6 inline-block">🧠</motion.div>

          <h1 className="font-pixel text-[clamp(1.4rem,3vw,2.4rem)] mb-4 leading-loose">
            <span className="text-accent">STUD</span><span className="text-accent2">IQ</span>
          </h1>

          <p className="font-pixel text-[clamp(0.5rem,1.2vw,0.7rem)] text-[#6b6b9a] mb-3 tracking-widest">
            YOUR PERSONALIZED STUDY ADVENTURE
          </p>
          <p className="text-[#9090c0] max-w-lg mx-auto mb-10 text-base leading-relaxed">
            AI-powered adaptive learning inspired by Codédex's pixel worlds and LeetCode's challenge system. Earn XP, unlock badges, and level up your knowledge.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/register")}
              className="btn-pixel px-8 py-4 text-sm"
              style={{ boxShadow: "0 8px 32px rgba(124,58,237,0.4)" }}>
              ▶ START ADVENTURE
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="btn-outline px-8 py-4 text-sm">
              LOG IN
            </motion.button>
          </div>
        </motion.div>

        {/* Feature grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-0.5 mt-20">
          {FEATURES.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.08 }}
              whileHover={{ y: -4, borderColor: f.color }}
              className="p-6 bg-white/[0.02] border-2 border-border text-left transition-all cursor-default">
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="font-pixel text-[9px] mb-2 leading-loose" style={{ color: f.color }}>{f.title}</div>
              <div className="text-sm text-[#6b6b9a] leading-relaxed">{f.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
