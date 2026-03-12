import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/dashboard", icon: "📊", label: "DASH" },
  { to: "/worlds",    icon: "🗺️", label: "WORLDS" },
  { to: "/chat",      icon: "💬", label: "TUTOR" },
  { to: "/quests",    icon: "⚔️", label: "QUESTS" },
  { to: "/quiz",      icon: "🧪", label: "QUIZ" },
  { to: "/progress",  icon: "📈", label: "PROGRESS" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-4 gap-2
      bg-bg/95 border-b-2 border-border backdrop-blur-md">
      {/* Logo */}
      <div onClick={() => navigate("/dashboard")}
        className="font-pixel text-sm text-accent cursor-pointer tracking-widest mr-3 shrink-0"
        style={{ textShadow: "0 0 10px #7c3aed" }}>
        STUD<span className="text-accent2">IQ</span>
      </div>

      {/* Nav links */}
      <div className="flex gap-1 flex-1 overflow-x-auto">
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className={`px-2 py-1.5 font-pixel text-[8px] tracking-wide border cursor-pointer whitespace-nowrap transition-all
                  ${isActive
                    ? "bg-accent/25 border-accent text-purple-300"
                    : "bg-transparent border-transparent text-[#6b6b9a] hover:border-border hover:text-[#9090c0]"
                  }`}>
                {icon} <span className="hidden sm:inline">{label}</span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>

      {/* User + logout */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden md:flex items-center gap-2">
          <span className="text-lg">{user?.avatar || "🎓"}</span>
          <div>
            <div className="font-pixel text-[8px] text-accent">{user?.name}</div>
            <div className="font-mono text-[10px] text-amber-400">Lv.{user?.level} · {user?.totalXp}⭐</div>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={logout}
          className="font-pixel text-[8px] px-3 py-2 border border-border text-[#6b6b9a] hover:border-red-500/50 hover:text-red-400 transition-all cursor-pointer bg-transparent">
          EXIT
        </motion.button>
      </div>
    </nav>
  );
}
