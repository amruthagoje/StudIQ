import { motion } from "framer-motion";

export default function XPBar({ current, max, showLabel = true, height = 10 }) {
  const pct = Math.min((current / Math.max(max, 1)) * 100, 100);
  return (
    <div>
      <div className="overflow-hidden border border-white/10 bg-white/5" style={{ height }}>
        <motion.div initial={{ width: 0 }} animate={{ width: pct + "%" }} transition={{ duration: 1.2, ease: "easeOut" }}
          className="h-full xp-shimmer" />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1">
          <span className="font-mono text-[10px] text-[#6b6b9a]">{current} XP</span>
          <span className="font-mono text-[10px] text-[#6b6b9a]">{max} XP</span>
        </div>
      )}
    </div>
  );
}
