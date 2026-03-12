import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

export default function BadgeUnlock({ badge, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  if (!badge) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="fixed bottom-20 right-6 z-[1000] flex items-center gap-4 px-5 py-4 max-w-xs"
        style={{
          background: "#13131f",
          border: `3px solid ${badge.color}`,
          boxShadow: `0 0 30px ${badge.color}55`,
        }}>
        <motion.div animate={{ rotate: [0, -15, 15, -10, 10, 0] }} transition={{ duration: 0.6 }}
          className="text-4xl shrink-0">{badge.icon}</motion.div>
        <div>
          <div className="font-pixel text-[9px] mb-1" style={{ color: badge.color }}>BADGE UNLOCKED!</div>
          <div className="font-pixel text-[11px] text-white mb-0.5">{badge.label}</div>
          <div className="text-xs text-[#6b6b9a]">{badge.desc}</div>
        </div>
        <button onClick={onClose}
          className="absolute top-1.5 right-2 text-[#6b6b9a] hover:text-white text-sm bg-transparent border-0 cursor-pointer">✕</button>
      </motion.div>
    </AnimatePresence>
  );
}
