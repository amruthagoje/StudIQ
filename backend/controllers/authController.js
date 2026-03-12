const User = require("../models/User");
const { generateToken } = require("../middleware/auth");

// @desc  Register new user
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      streak: 1,
      lastStudiedAt: new Date(),
      badges: [{ id: "beginner", label: "Beginner Learner", icon: "🌱" }],
    });

    res.status(201).json({
      success: true,
      message: "Account created!",
      token: generateToken(user._id),
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Registration failed", error: err.message });
  }
};

// @desc  Login user
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Update streak
    user.updateStreak();
    await user.save();

    res.json({
      success: true,
      token: generateToken(user._id),
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// @desc  Get current user
// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) });
};

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  level: user.level,
  totalXp: user.totalXp,
  points: user.points,
  badges: user.badges,
  streak: user.streak,
  longestStreak: user.longestStreak,
  currentDifficulty: user.currentDifficulty,
  solvedChallenges: user.solvedChallenges,
  studiedTopics: user.studiedTopics,
  createdAt: user.createdAt,
});

module.exports = { register, login, getMe };
