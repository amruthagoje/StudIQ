import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("studiq_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem("studiq_token");
    if (token) {
      api.get("/auth/me")
        .then((res) => { setUser(res.data.user); localStorage.setItem("studiq_user", JSON.stringify(res.data.user)); })
        .catch(() => { localStorage.removeItem("studiq_token"); localStorage.removeItem("studiq_user"); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("studiq_token", res.data.token);
    localStorage.setItem("studiq_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("studiq_token", res.data.token);
    localStorage.setItem("studiq_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("studiq_token");
    localStorage.removeItem("studiq_user");
    setUser(null);
    toast.success("Logged out!");
  };

  const addXP = useCallback(async (amount, topic) => {
    try {
      const res = await api.post("/users/xp", { amount, topic });
      setUser((prev) => {
        const updated = { ...prev, totalXp: res.data.totalXp, level: res.data.level };
        localStorage.setItem("studiq_user", JSON.stringify(updated));
        return updated;
      });
      if (res.data.leveledUp) toast.success(`🎉 Level Up! You're now Level ${res.data.level}!`);
      return res.data;
    } catch (err) { console.error("addXP error:", err); }
  }, []);

  const unlockBadge = useCallback(async (badge) => {
    try {
      const res = await api.post("/users/badge", badge);
      if (!res.data.alreadyHad) {
        setUser((prev) => {
          const updated = { ...prev, badges: [...(prev.badges || []), badge] };
          localStorage.setItem("studiq_user", JSON.stringify(updated));
          return updated;
        });
      }
      return res.data;
    } catch (err) { console.error("unlockBadge error:", err); }
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem("studiq_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, addXP, unlockBadge, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
