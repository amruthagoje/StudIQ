import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../utils/api";
import XPBar from "../components/XPBar";

export default function Progress() {
  const [progress, setProgress] = useState([]);
  const [quizStats, setQuizStats] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/progress"),
      api.get("/quiz/stats"),
      api.get("/quiz/history"),
    ]).then(([p, qs, h]) => {
      setProgress(p.data.progress || []);
      setQuizStats(qs.data.stats || []);
      setHistory(h.data.results || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="font-pixel text-accent text-xs animate-pulse">LOADING STATS...</div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 px-6 pb-10">
      <div className="max-w-5xl mx-auto">
        <div className="font-pixel text-sm text-accent mb-2">📈 PROGRESS TRACKER</div>
        <h2 className="text-2xl font-bold mb-6">Your Learning Journey</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Topic Progress */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border p-6">
            <div className="font-pixel text-[9px] text-accent mb-5">TOPIC PROGRESS</div>
            {progress.length === 0 && (
              <div className="text-[#6b6b9a] text-sm">No topics studied yet. Start chatting with the AI tutor!</div>
            )}
            {progress.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}
                className="mb-5 last:mb-0">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-sm">{p.topic}</span>
                  <span className="font-mono text-xs text-[#6b6b9a]">{p.sessionsCount} sessions</span>
                </div>
                <XPBar current={p.progressPercentage} max={100} showLabel={false} height={8} />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-[#6b6b9a]">{p.totalXpInTopic} XP earned</span>
                  <span className="text-xs font-mono text-accent">{p.progressPercentage}%</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quiz stats */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border p-6">
            <div className="font-pixel text-[9px] text-amber-400 mb-5">QUIZ PERFORMANCE</div>
            {quizStats.length === 0 && (
              <div className="text-[#6b6b9a] text-sm">No quizzes taken yet. Hit the Quiz page!</div>
            )}
            {quizStats.map((s, i) => (
              <motion.div key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}
                className="flex items-center gap-4 py-3 border-b border-border last:border-0">
                <div className="flex-1">
                  <div className="font-semibold text-sm">{s._id}</div>
                  <div className="text-xs text-[#6b6b9a]">{s.totalQuizzes} quizzes · Avg {Math.round(s.avgScore)}%</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-sm"
                    style={{ color: s.avgScore >= 80 ? "#10b981" : s.avgScore >= 50 ? "#f59e0b" : "#ef4444" }}>
                    {Math.round(s.avgScore)}%
                  </div>
                  <div className="text-xs text-amber-400 font-mono">+{s.totalXp} XP</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quiz history */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card border border-border p-6 md:col-span-2">
            <div className="font-pixel text-[9px] text-[#ec4899] mb-5">RECENT QUIZ HISTORY</div>
            {history.length === 0 && (
              <div className="text-[#6b6b9a] text-sm">No quiz history yet.</div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="font-pixel text-[8px] text-[#6b6b9a] border-b border-border">
                    {["TOPIC","DIFFICULTY","SCORE","XP","DATE"].map(h => (
                      <th key={h} className="text-left pb-3 pr-4 font-normal tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((r, i) => (
                    <motion.tr key={r._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="border-b border-border/50 last:border-0">
                      <td className="py-3 pr-4 font-semibold">{r.topic}</td>
                      <td className="py-3 pr-4">
                        <span className={`tag-${r.difficulty==="intermediate"?"medium":r.difficulty}`}>{r.difficulty.toUpperCase()}</span>
                      </td>
                      <td className="py-3 pr-4 font-mono font-bold"
                        style={{ color: r.percentage>=80?"#10b981":r.percentage>=50?"#f59e0b":"#ef4444" }}>
                        {r.percentage}%
                      </td>
                      <td className="py-3 pr-4 font-mono text-amber-400">+{r.xpEarned}</td>
                      <td className="py-3 text-[#6b6b9a] text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
