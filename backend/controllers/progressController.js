const Progress = require("../models/Progress");

// @desc  Get all progress for current user
// @route GET /api/progress
const getProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user._id }).sort({ lastStudied: -1 });
    res.json({ success: true, progress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get progress for a specific topic
// @route GET /api/progress/:topic
const getTopicProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      userId: req.user._id,
      topic: decodeURIComponent(req.params.topic),
    });
    res.json({ success: true, progress: progress || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update progress for a topic
// @route POST /api/progress/update
const updateProgress = async (req, res) => {
  try {
    const { topic, xp = 0 } = req.body;
    const progress = await Progress.findOneAndUpdate(
      { userId: req.user._id, topic },
      {
        $inc: { totalXpInTopic: xp, sessionsCount: 1 },
        $set: { lastStudied: new Date() },
      },
      { upsert: true, new: true }
    );
    res.json({ success: true, progress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProgress, getTopicProgress, updateProgress };
