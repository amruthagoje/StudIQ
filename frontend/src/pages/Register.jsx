import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success("Account created! Welcome to StudIQ 🧠");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
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
          <div className="font-pixel text-[9px] text-[#6b6b9a]">CREATE YOUR CHARACTER</div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="font-pixel text-[8px] text-[#6b6b9a] block mb-2">DISPLAY NAME</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              type="text" placeholder="CuriousLearner99" required className="input-base" />
          </div>
          <div>
            <label className="font-pixel text-[8px] text-[#6b6b9a] block mb-2">EMAIL</label>
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              type="email" placeholder="hero@studiq.ai" required className="input-base" />
          </div>
          <div>
            <label className="font-pixel text-[8px] text-[#6b6b9a] block mb-2">PASSWORD</label>
            <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              type="password" placeholder="Min. 6 characters" required className="input-base" />
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
            className="btn-pixel py-4 text-sm mt-2 w-full disabled:opacity-60">
            {loading ? "CREATING..." : "▶ START ADVENTURE"}
          </motion.button>
        </form>

        <p className="text-center mt-6 text-sm text-[#6b6b9a]">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:text-purple-300 font-semibold">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}
