import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back! 🎮");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pixel-bg min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border-2 border-border p-10">
        <div className="text-center mb-8">
          <div className="font-pixel text-xl text-accent mb-1">STUD<span className="text-accent2">IQ</span></div>
          <div className="font-pixel text-[9px] text-[#6b6b9a]">LOGIN TO YOUR ADVENTURE</div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="font-pixel text-[8px] text-[#6b6b9a] block mb-2">EMAIL</label>
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              type="email" placeholder="hero@studiq.ai" required className="input-base" />
          </div>
          <div>
            <label className="font-pixel text-[8px] text-[#6b6b9a] block mb-2">PASSWORD</label>
            <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              type="password" placeholder="••••••••" required className="input-base" />
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
            className="btn-pixel py-4 text-sm mt-2 w-full opacity-100 disabled:opacity-60">
            {loading ? "LOGGING IN..." : "▶ LOG IN"}
          </motion.button>
        </form>

        <p className="text-center mt-6 text-sm text-[#6b6b9a]">
          New here?{" "}
          <Link to="/register" className="text-accent hover:text-purple-300 font-semibold">Create account</Link>
        </p>
      </motion.div>
    </div>
  );
}
