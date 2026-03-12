import { motion } from "framer-motion";

const COLORS = ["#7c3aed","#06b6d4","#10b981","#f59e0b","#ec4899","#ef4444","#a78bfa","#34d399"];

export default function Confetti({ active }) {
  if (!active) return null;
  return (
    <>
      {Array.from({ length: 80 }, (_, i) => (
        <motion.div key={i}
          initial={{ y: -10, x: Math.random() * window.innerWidth, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ y: window.innerHeight + 40, x: (Math.random() - 0.5) * 400 + Math.random() * window.innerWidth, opacity: 0, rotate: Math.random() * 540 }}
          transition={{ duration: 2 + Math.random() * 1.5, delay: Math.random() * 0.6, ease: "easeIn" }}
          style={{
            position: "fixed", top: 0, zIndex: 9990, pointerEvents: "none",
            width: Math.random() > 0.5 ? 10 : 6,
            height: Math.random() > 0.5 ? 10 : 14,
            background: COLORS[i % COLORS.length],
            borderRadius: Math.random() > 0.5 ? "50%" : 0,
          }}
        />
      ))}
    </>
  );
}
