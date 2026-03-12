const User = require("../models/User");
const Progress = require("../models/Progress");

// @desc  Update user profile
// @route PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { name, avatar, preferredTopics } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (avatar) updates.avatar = avatar;
    if (preferredTopics) updates.preferredTopics = preferredTopics;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Add XP to user
// @route POST /api/users/xp
const addXP = async (req, res) => {
  try {
    const { amount, topic, reason } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: "Invalid XP amount" });

    const user = await User.findById(req.user._id);
    const prevLevel = user.level;
    user.totalXp += amount;
    user.points += amount;

    // Recalculate level
    let acc = 0, lvl = 1;
    while (true) {
      const needed = Math.floor(100 * Math.pow(1.4, lvl - 1));
      if (acc + needed > user.totalXp) break;
      acc += needed; lvl++;
    }
    user.level = lvl;

    // Update streak
    user.updateStreak();

    // Track studied topic
    if (topic && !user.studiedTopics.includes(topic)) {
      user.studiedTopics.push(topic);
    }

    await user.save();

    // Update progress for topic
    if (topic) {
      await Progress.findOneAndUpdate(
        { userId: user._id, topic },
        {
          $inc: { totalXpInTopic: amount, sessionsCount: 1 },
          $set: { lastStudied: new Date() },
        },
        { upsert: true, new: true }
      );
    }

    res.json({
      success: true,
      xpAdded: amount,
      totalXp: user.totalXp,
      level: user.level,
      leveledUp: user.level > prevLevel,
      streak: user.streak,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Unlock a badge
// @route POST /api/users/badge
const unlockBadge = async (req, res) => {
  try {
    const { id, label, icon } = req.body;
    const user = await User.findById(req.user._id);

    if (user.badges.some((b) => b.id === id)) {
      return res.json({ success: true, message: "Already unlocked", alreadyHad: true });
    }

    user.badges.push({ id, label, icon });
    await user.save();
    res.json({ success: true, badge: { id, label, icon }, message: "Badge unlocked!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Mark challenge as solved
// @route POST /api/users/solve
const solveChallenge = async (req, res) => {
  try {
    const { challengeId, xp } = req.body;
    const user = await User.findById(req.user._id);

    if (user.solvedChallenges.includes(challengeId)) {
      return res.json({ success: true, message: "Already solved" });
    }

    user.solvedChallenges.push(challengeId);
    user.totalXp += xp || 0;
    user.points += xp || 0;
    await user.save();

    res.json({ success: true, solvedChallenges: user.solvedChallenges, totalXp: user.totalXp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get user stats summary
// @route GET /api/users/stats
const getStats = async (req, res) => {
  try {
    const Progress = require("../models/Progress");
    const QuizResult = require("../models/QuizResult");

    const [progressDocs, quizCount, user] = await Promise.all([
      Progress.find({ userId: req.user._id }),
      require("../models/QuizResult").countDocuments({ userId: req.user._id }),
      User.findById(req.user._id),
    ]);

    res.json({
      success: true,
      stats: {
        level: user.level,
        totalXp: user.totalXp,
        points: user.points,
        streak: user.streak,
        longestStreak: user.longestStreak,
        badgeCount: user.badges.length,
        solvedCount: user.solvedChallenges.length,
        quizzesTaken: quizCount,
        topicsStudied: progressDocs.length,
        topicProgress: progressDocs,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { updateProfile, addXP, unlockBadge, solveChallenge, getStats };
