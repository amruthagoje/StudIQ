import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

function calcXPInLevel(totalXp, level) {
  let acc = 0;
  for (let i = 1; i < level; i++) acc += Math.floor(100 * Math.pow(1.4, i - 1));
  const inLevel = totalXp - acc;
  const needed = Math.floor(100 * Math.pow(1.4, level - 1));
  return { inLevel: Math.max(0, inLevel), needed };
}

export default function FloatingXP() {
  const { user } = useAuth();
  if (!user) return null;

  const { inLevel, needed } = calcXPInLevel(user.totalXp || 0, user.level || 1);
  const pct = Math.min((inLevel / needed) * 100, 100);

  return (
    <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 3 }}
      className="fixed bottom-5 left-5 z-50 bg-surface border-2 border-accent px-3 py-2 flex items-center gap-3"
      style={{ boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}>
      <span className="font-pixel text-[8px] text-accent">LV.{user.level}</span>
      <div className="w-16 h-1.5 bg-white/10 overflow-hidden">
        <motion.div animate={{ width: pct + "%" }} transition={{ duration: 1 }}
          className="h-full xp-shimmer" />
      </div>
      <span className="font-mono text-[11px] text-amber-400 font-bold">{user.totalXp}⭐</span>
    </motion.div>
  );
}
