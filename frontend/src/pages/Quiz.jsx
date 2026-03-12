import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Confetti from "../components/Confetti";
import api from "../utils/api";
import toast from "react-hot-toast";

const TOPICS = ["Mathematics","Science","Programming","History","Physics","Chemistry","Literature","Algorithms"];

export default function Quiz() {
  const { user, addXP, updateUser } = useAuth();
  const [phase, setPhase] = useState("setup");
  const [topic, setTopic] = useState("Mathematics");
  const [difficulty, setDifficulty] = useState(user?.currentDifficulty || "intermediate");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [finalData, setFinalData] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState([]);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const res = await api.post("/ai/generate-quiz", { topic, difficulty, count: 5 });
      setQuestions(res.data.questions);
      setPhase("active");
      setCurrentQ(0);
      setScore(0);
      setAnswered(null);
      setQuizAnswers([]);
    } catch (err) {
      toast.error("Quiz generation failed. Check your API key on the server.");
    }
    setLoading(false);
  };

  const answer = (idx) => {
    if (answered !== null) return;
    const q = questions[currentQ];
    const correct = idx === q.answer;
    if (correct) setScore(s => s + 1);
    setAnswered(idx);
    setQuizAnswers(p => [...p, { question: q.question, options: q.options, correctAnswer: q.answer, userAnswer: idx, isCorrect: correct }]);
  };

  const next = async () => {
    if (currentQ + 1 >= questions.length) {
      // Save result to DB
      const finalScore = score;
      const pct = Math.round((finalScore / questions.length) * 100);
      try {
        const res = await api.post("/quiz/result", {
          topic, difficulty, score: finalScore,
          totalQuestions: questions.length,
          questions: quizAnswers,
        });
        setFinalData({ pct, xpEarned: res.data.xpEarned, nextDifficulty: res.data.nextDifficulty, leveledUp: res.data.leveledUp });
        updateUser({ currentDifficulty: res.data.nextDifficulty, totalXp: res.data.totalXp, level: res.data.newLevel });
      } catch {
        setFinalData({ pct, xpEarned: finalScore * 10 + 20, nextDifficulty: difficulty });
        await addXP(finalScore * 10 + 20, topic);
      }
      if (pct >= 80) { setConfetti(true); setTimeout(() => setConfetti(false), 4000); }
      setPhase("results");
    } else {
      setCurrentQ(c => c + 1);
      setAnswered(null);
    }
  };

  const q = questions[currentQ];
  const pct = questions.length ? Math.round((currentQ / questions.length) * 100) : 0;

  return (
    <div className="min-h-screen pt-20 px-6 pb-10">
      <Confetti active={confetti} />
      <div className="max-w-3xl mx-auto">
        <div className="font-pixel text-[10px] text-accent2 mb-2">QUIZ MODE</div>
        <h2 className="text-2xl font-bold mb-6">Test Your Knowledge</h2>

        {/* SETUP */}
        {phase === "setup" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border-2 border-border p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="font-pixel text-[8px] text-[#6b6b9a] block mb-3">SELECT TOPIC</label>
                <select value={topic} onChange={e => setTopic(e.target.value)}
                  className="w-full bg-surface border border-border text-[#e8e8f5] px-3 py-3 text-sm font-body cursor-pointer outline-none focus:border-accent">
                  {TOPICS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="font-pixel text-[8px] text-[#6b6b9a] block mb-3">DIFFICULTY</label>
                <div className="flex gap-2">
                  {["easy","medium","hard"].map(d => {
                    const color = d==="easy"?"#10b981":d==="medium"?"#f59e0b":"#ef4444";
                    return (
                      <button key={d} onClick={() => setDifficulty(d)}
                        className="flex-1 py-3 cursor-pointer font-pixel text-[8px] transition-all"
                        style={{
                          border: `2px solid ${difficulty === d ? color : "#2a2a45"}`,
                          background: difficulty === d ? `${color}22` : "transparent",
                          color,
                        }}>
                        {d.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={startQuiz} disabled={loading}
              className="w-full py-5 font-pixel text-sm tracking-widest text-white border-0 cursor-pointer disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#06b6d4,#0284c7)" }}>
              {loading ? "⏳ GENERATING QUIZ..." : "▶ START QUIZ"}
            </motion.button>
          </motion.div>
        )}

        {/* ACTIVE */}
        {phase === "active" && q && (
          <AnimatePresence mode="wait">
            <motion.div key={currentQ} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="bg-card border-2 border-border p-8">
              <div className="flex justify-between items-center mb-3">
                <span className="font-pixel text-[9px] text-[#6b6b9a]">Q{currentQ+1} / {questions.length}</span>
                <span className="font-mono font-bold text-amber-400">⭐ {score * 10} pts</span>
              </div>
              <div className="h-1.5 bg-white/5 mb-6 overflow-hidden">
                <motion.div animate={{ width: pct + "%" }} className="h-full"
                  style={{ background: "linear-gradient(90deg,#06b6d4,#7c3aed)" }} />
              </div>
              <p className="text-lg font-bold leading-relaxed mb-6">{q.question}</p>
              <div className="flex flex-col gap-3 mb-5">
                {q.options.map((opt, i) => {
                  let border = "#2a2a45", bg = "transparent", color = "#e8e8f5";
                  if (answered !== null) {
                    if (i === q.answer) { border = "#10b981"; bg = "rgba(16,185,129,0.1)"; color = "#10b981"; }
                    else if (i === answered) { border = "#ef4444"; bg = "rgba(239,68,68,0.1)"; color = "#ef4444"; }
                  }
                  return (
                    <motion.button key={i} whileHover={answered===null ? { x: 6 } : {}} whileTap={answered===null ? { scale: 0.98 } : {}}
                      onClick={() => answer(i)}
                      className="text-left px-5 py-4 text-sm border-2 transition-all font-body cursor-pointer"
                      style={{ border: `2px solid ${border}`, background: bg, color }}>
                      <span className="font-mono font-bold mr-3 opacity-60">{["A","B","C","D"][i]}.</span>
                      {opt}
                      {answered !== null && i === q.answer && " ✓"}
                      {answered !== null && i === answered && i !== q.answer && " ✗"}
                    </motion.button>
                  );
                })}
              </div>
              {answered !== null && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="p-4 text-sm leading-7 mb-4"
                    style={{ background: answered===q.answer?"rgba(16,185,129,0.07)":"rgba(239,68,68,0.07)", border: `1px solid ${answered===q.answer?"#10b98133":"#ef444433"}` }}>
                    {answered===q.answer?"✅ ":"❌ "}{q.explanation}
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} onClick={next}
                    className="w-full py-4 btn-pixel text-[10px] tracking-widest">
                    {currentQ+1 >= questions.length ? "🏁 FINISH QUIZ" : "NEXT QUESTION ▶"}
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* RESULTS */}
        {phase === "results" && finalData && (
          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="bg-card p-10 text-center border-2"
            style={{ borderColor: finalData.pct>=80?"#10b981":finalData.pct>=50?"#f59e0b":"#ef4444" }}>
            <motion.div animate={{ y:[0,-8,0] }} transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-6xl mb-4">
              {finalData.pct>=80?"🏆":finalData.pct>=50?"😊":"📚"}
            </motion.div>
            <div className="font-pixel text-sm mb-2"
              style={{ color: finalData.pct>=80?"#10b981":finalData.pct>=50?"#f59e0b":"#ef4444" }}>
              QUIZ COMPLETE
            </div>
            <div className="font-pixel text-5xl text-white mb-2">{finalData.pct}%</div>
            <div className="text-[#6b6b9a] mb-2">+{finalData.xpEarned} XP earned</div>
            <div className="font-pixel text-[9px] text-accent2 mb-8">
              NEXT DIFFICULTY: {finalData.nextDifficulty?.toUpperCase()}
            </div>
            {finalData.leveledUp && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                className="mb-6 p-4 bg-accent/15 border border-accent font-pixel text-[10px] text-accent">
                🎉 LEVEL UP! 🎉
              </motion.div>
            )}
            <div className="flex gap-3 justify-center flex-wrap">
              <motion.button whileHover={{ scale: 1.04 }}
                onClick={() => { setPhase("setup"); setFinalData(null); }}
                className="btn-pixel px-7 py-3 text-[9px]">TRY AGAIN</motion.button>
              <motion.button whileHover={{ scale: 1.04 }}
                onClick={() => setPhase("setup")}
                className="btn-outline px-7 py-3 text-[9px]">NEW TOPIC</motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
