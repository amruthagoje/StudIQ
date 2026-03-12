import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import XPBar from "../components/XPBar";
import api from "../utils/api";

const BADGE_META = {
  beginner:   { icon: "🌱", color: "#10b981", desc: "Started the journey" },
  scholar:    { icon: "📜", color: "#7c3aed", desc: "Earned 100 XP" },
  speed_demon:{ icon: "⚡", color: "#f59e0b", desc: "Fast thinker" },
  quiz_master:{ icon: "🏆", color: "#10b981", desc: "100% on a quiz" },
  streak_3:   { icon: "🔥", color: "#f59e0b", desc: "3-day streak" },
  explorer:   { icon: "🗺️", color: "#06b6d4", desc: "World explorer" },
  night_owl:  { icon: "🦉", color: "#6366f1", desc: "Night study session" },
  polymath:   { icon: "🌟", color: "#ec4899", desc: "5 different topics" },
};

function calcXP(totalXp, level) {
  let acc = 0;
  for (let i = 1; i < level; i++) acc += Math.floor(100 * Math.pow(1.4, i - 1));
  return { inLevel: Math.max(0, totalXp - acc), needed: Math.floor(100 * Math.pow(1.4, level - 1)) };
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/leaderboard?limit=6").then(r => setLeaderboard(r.data.leaderboard)).catch(() => {});
    api.get("/users/stats").then(r => setStats(r.data.stats)).catch(() => {});
  }, []);

  const { inLevel, needed } = calcXP(user?.totalXp || 0, user?.level || 1);

  return (
    <div className="min-h-screen pt-20 pb-10 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Hero profile card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-7 border-2 border-accent/50 flex items-center gap-6 flex-wrap"
          style={{ background: "linear-gradient(135deg, #13131f, #1e1040)" }}>
          <motion.div animate={{ y: [0,-4,0] }} transition={{ repeat: Infinity, duration: 2 }}
            className="w-16 h-16 flex items-center justify-center text-4xl shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}>
            {user?.avatar || "🎓"}
          </motion.div>
          <div className="flex-1 min-w-[180px]">
            <div className="font-pixel text-[9px] text-accent mb-1">LEVEL {user?.level} LEARNER</div>
            <div className="text-2xl font-bold mb-1">{user?.name}</div>
            <div className="font-pixel text-[8px] text-[#6b6b9a] mb-3">
              {user?.streak || 0} DAY STREAK 🔥 · {user?.currentDifficulty?.toUpperCase() || "INTERMEDIATE"}
            </div>
            <XPBar current={inLevel} max={needed} />
          </div>
          <div className="flex gap-8 flex-wrap">
            {[
              ["⭐", user?.totalXp || 0, "TOTAL XP"],
              ["🏅", user?.badges?.length || 0, "BADGES"],
              ["✅", user?.solvedChallenges?.length || 0, "SOLVED"],
            ].map(([icon, val, label]) => (
              <motion.div key={label} animate={{ scale: [1,1.05,1] }} transition={{ repeat: Infinity, duration: 3 }}
                className="text-center">
                <div className="text-2xl">{icon}</div>
                <div className="font-pixel text-xl text-white mt-1">{val}</div>
                <div className="font-pixel text-[8px] text-[#6b6b9a]">{label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {/* Badges */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="card p-6">
            <div className="font-pixel text-[9px] text-accent mb-5">🏅 BADGE COLLECTION</div>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(BADGE_META).map(([id, meta]) => {
                const earned = user?.badges?.some(b => b.id === id);
                return (
                  <motion.div key={id} whileHover={earned ? { scale: 1.15, y: -4 } : {}}
                    title={meta.desc}
                    className="text-center" style={{ opacity: earned ? 1 : 0.2, filter: earned ? "none" : "grayscale(1)" }}>
                    <div className="w-12 h-12 mx-auto mb-1 flex items-center justify-center text-2xl border-2"
                      style={{ borderColor: earned ? meta.color : "#2a2a45", background: earned ? `${meta.color}22` : "transparent" }}>
                      {meta.icon}
                    </div>
                    <div className="font-pixel text-[7px] leading-tight" style={{ color: earned ? meta.color : "#6b6b9a" }}>
                      {id.replace("_", " ").toUpperCase()}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Leaderboard */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="card p-6">
            <div className="font-pixel text-[9px] text-amber-400 mb-5">🏆 LEADERBOARD</div>
            {leaderboard.length === 0 && <div className="text-[#6b6b9a] text-sm">Loading...</div>}
            {leaderboard.map((u, i) => (
              <motion.div key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                <span className="font-pixel text-[9px] w-5" style={{ color: ["#f59e0b","#94a3b8","#cd7c2f"][i] || "#6b6b9a" }}>
                  #{u.rank}
                </span>
                <span className="text-lg">{u.avatar}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{u.name}
                    {u._id === user?._id && <span className="text-[10px] text-accent ml-1">(you)</span>}
                  </div>
                  <div className="text-[11px] text-[#6b6b9a]">Lv.{u.level} · {u.streak}🔥</div>
                </div>
                <span className="font-mono font-bold text-amber-400 text-sm">{u.totalXp}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="card p-6">
            <div className="font-pixel text-[9px] text-accent2 mb-5">⚡ QUICK NAVIGATE</div>
            <div className="flex flex-col gap-2">
              {[
                ["🗺️","World Map","/worlds","#10b981"],
                ["💬","AI Tutor Chat","/chat","#7c3aed"],
                ["⚔️","Quest Board","/quests","#ec4899"],
                ["🧪","Quiz Mode","/quiz","#f59e0b"],
                ["📈","My Progress","/progress","#06b6d4"],
              ].map(([icon,label,path,color]) => (
                <motion.button key={path} whileHover={{ x: 6, borderColor: color }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(path)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-left border border-border bg-transparent text-[#e8e8f5] cursor-pointer transition-all font-body">
                  <span className="text-xl">{icon}</span>{label}
                  <span className="ml-auto text-[#6b6b9a]">→</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Stats summary */}
          {stats && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="card p-6 md:col-span-2">
              <div className="font-pixel text-[9px] text-[#ec4899] mb-5">📊 LEARNING STATS</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  ["📚", stats.topicsStudied, "Topics Studied"],
                  ["🧪", stats.quizzesTaken, "Quizzes Taken"],
                  ["✅", stats.solvedCount, "Challenges Solved"],
                  ["🔥", stats.longestStreak, "Longest Streak"],
                ].map(([icon, val, label]) => (
                  <div key={label} className="text-center p-3 bg-white/[0.02] border border-border">
                    <div className="text-2xl mb-1">{icon}</div>
                    <div className="font-pixel text-lg text-white">{val}</div>
                    <div className="text-xs text-[#6b6b9a] mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
