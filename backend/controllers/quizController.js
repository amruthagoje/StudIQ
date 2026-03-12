const QuizResult = require("../models/QuizResult");
const User = require("../models/User");
const Progress = require("../models/Progress");

// @desc  Save quiz result
// @route POST /api/quiz/result
const saveResult = async (req, res) => {
  try {
    const { topic, difficulty, score, totalQuestions, questions, timeTakenSeconds } = req.body;

    const percentage = Math.round((score / totalQuestions) * 100);
    const xpEarned = score * 10 + 20; // +10 per correct, +20 for completion

    // Save quiz result
    const result = await QuizResult.create({
      userId: req.user._id,
      topic,
      difficulty,
      score,
      totalQuestions,
      percentage,
      xpEarned,
      timeTakenSeconds,
      questions,
    });

    // Adaptive difficulty
    const nextDifficulty = result.adaptiveDifficultyNext;

    // Update user XP + difficulty preference
    const user = await User.findById(req.user._id);
    user.totalXp += xpEarned;
    user.points += xpEarned;
    user.currentDifficulty = nextDifficulty;
    user.updateStreak();
    if (!user.studiedTopics.includes(topic)) user.studiedTopics.push(topic);

    // Level recalc
    let acc = 0, lvl = 1;
    while (true) {
      const needed = Math.floor(100 * Math.pow(1.4, lvl - 1));
      if (acc + needed > user.totalXp) break;
      acc += needed; lvl++;
    }
    const prevLevel = user.level;
    user.level = lvl;
    await user.save();

    // Upsert topic progress
    const existingProgress = await Progress.findOne({ userId: user._id, topic });
    const newAvg = existingProgress
      ? Math.round((existingProgress.averageScore * existingProgress.quizzesTaken + percentage) / (existingProgress.quizzesTaken + 1))
      : percentage;

    await Progress.findOneAndUpdate(
      { userId: user._id, topic },
      {
        $inc: { quizzesTaken: 1, totalXpInTopic: xpEarned },
        $set: {
          averageScore: newAvg,
          progressPercentage: Math.min(newAvg, 100),
          currentDifficulty: nextDifficulty,
          lastStudied: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      result,
      xpEarned,
      nextDifficulty,
      leveledUp: user.level > prevLevel,
      newLevel: user.level,
      totalXp: user.totalXp,
    });
  } catch (err) {
    console.error("Quiz save error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get user quiz history
// @route GET /api/quiz/history
const getHistory = async (req, res) => {
  try {
    const results = await QuizResult.find({ userId: req.user._id })
      .select("topic difficulty score totalQuestions percentage xpEarned createdAt")
      .sort({ createdAt: -1 })
      .limit(30);
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get quiz stats by topic
// @route GET /api/quiz/stats
const getQuizStats = async (req, res) => {
  try {
    const stats = await QuizResult.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: "$topic",
          avgScore: { $avg: "$percentage" },
          totalQuizzes: { $sum: 1 },
          totalXp: { $sum: "$xpEarned" },
          bestScore: { $max: "$percentage" },
        },
      },
      { $sort: { totalQuizzes: -1 } },
    ]);
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { saveResult, getHistory, getQuizStats };
