import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const WORLDS = [
  { id: "python", name: "Python Peaks", icon: "🐍", color: "#10b981", xpReq: 0, lessons: 12, desc: "Master Python basics and beyond" },
  { id: "math", name: "Math Mountains", icon: "📐", color: "#7c3aed", xpReq: 0, lessons: 10, desc: "Numbers, algebra, and calculus" },
  { id: "web", name: "Web Wilds", icon: "🌐", color: "#06b6d4", xpReq: 100, lessons: 15, desc: "HTML, CSS, JS, and React" },
  { id: "data", name: "Data Desert", icon: "📊", color: "#f59e0b", xpReq: 300, lessons: 8, desc: "Data science and statistics" },
  { id: "ai", name: "AI Abyss", icon: "🤖", color: "#ec4899", xpReq: 600, lessons: 10, desc: "Machine learning concepts" },
];

export default function Worlds() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="pixel-bg min-h-screen pt-20 px-6 pb-10">
      <div className="max-w-3xl mx-auto">
        <div className="font-pixel text-sm text-accent mb-2">WORLD MAP</div>
        <h2 className="text-2xl font-bold mb-2">Choose Your Adventure</h2>
        <p className="text-[#6b6b9a] mb-8">
          Unlock worlds by earning XP. You have{" "}
          <span className="font-mono font-bold text-amber-400">{user?.totalXp || 0} XP</span>
        </p>

        <div className="flex flex-col gap-3">
          {WORLDS.map((w, i) => {
            const unlocked = (user?.totalXp || 0) >= w.xpReq;
            return (
              <motion.div key={w.id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                whileHover={unlocked ? { x: 8, borderColor: w.color } : {}}
                onClick={() => unlocked && navigate("/chat")}
                className="flex items-center gap-5 px-7 py-5 border-2 transition-all relative overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  borderColor: unlocked ? `${w.color}55` : "#2a2a45",
                  opacity: unlocked ? 1 : 0.5,
                  cursor: unlocked ? "pointer" : "not-allowed",
                }}>
                {unlocked && <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: w.color }} />}
                <div className="text-4xl">{w.icon}</div>
                <div className="flex-1">
                  <div className="font-pixel text-[11px] mb-1" style={{ color: unlocked ? w.color : "#6b6b9a" }}>{w.name}</div>
                  <div className="text-sm text-[#6b6b9a]">{w.desc}</div>
                  <div className="text-xs text-[#6b6b9a] mt-1">{w.lessons} lessons · {unlocked ? "Unlocked" : `Requires ${w.xpReq} XP`}</div>
                </div>
                {unlocked ? (
                  <span className="font-pixel text-[9px] px-3 py-1.5 border" style={{ color: w.color, borderColor: w.color, background: `${w.color}22` }}>
                    ENTER ▶
                  </span>
                ) : (
                  <span className="text-xl">🔒</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
