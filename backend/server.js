require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

// ── Route imports ──────────────────────────────────────────────
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const aiRoutes = require("./routes/ai");
const quizRoutes = require("./routes/quiz");
const progressRoutes = require("./routes/progress");
const leaderboardRoutes = require("./routes/leaderboard");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Connect to MongoDB ─────────────────────────────────────────
connectDB();

// ── Global Middleware ──────────────────────────────────────────
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ── Rate Limiting ──────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: "Too many requests. Please try again later." },
});
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { success: false, message: "AI rate limit reached. Wait a moment." },
});

app.use("/api", apiLimiter);
app.use("/api/ai", aiLimiter);

// ── Routes ─────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// ── Health check ───────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "StudIQ API is running 🧠", env: process.env.NODE_ENV });
});

// ── 404 handler ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

// ── Global error handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`\n🧠 StudIQ API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log(`   MongoDB: connecting...`);
});
