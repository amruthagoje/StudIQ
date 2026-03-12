const User = require("../models/User");

// @desc  Get global leaderboard
// @route GET /api/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const leaders = await User.find()
      .select("name avatar level totalXp points streak badges")
      .sort({ totalXp: -1 })
      .limit(limit);

    const ranked = leaders.map((u, i) => ({
      rank: i + 1,
      _id: u._id,
      name: u.name,
      avatar: u.avatar,
      level: u.level,
      totalXp: u.totalXp,
      points: u.points,
      streak: u.streak,
      badgeCount: u.badges.length,
    }));

    // Find current user's rank
    const userRank = ranked.findIndex((u) => u._id.toString() === req.user._id.toString());

    res.json({
      success: true,
      leaderboard: ranked,
      userRank: userRank >= 0 ? userRank + 1 : null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getLeaderboard };
