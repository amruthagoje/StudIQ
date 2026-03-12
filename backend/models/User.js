const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // exclude from queries by default
    },
    avatar: {
      type: String,
      default: "🎓",
    },

    // ── Gamification ─────────────────────────────────────────
    level: { type: Number, default: 1 },
    totalXp: { type: Number, default: 0 },
    points: { type: Number, default: 0 },

    badges: [
      {
        id: String,
        label: String,
        icon: String,
        unlockedAt: { type: Date, default: Date.now },
      },
    ],

    streak: { type: Number, default: 0 },
    lastStudiedAt: { type: Date },
    longestStreak: { type: Number, default: 0 },

    // ── Learning ──────────────────────────────────────────────
    preferredTopics: [String],
    currentDifficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
    solvedChallenges: [{ type: Number }],
    studiedTopics: [String],

    // ── Chat history ──────────────────────────────────────────
    chatSessions: [
      {
        topic: String,
        messages: [
          {
            role: { type: String, enum: ["user", "assistant"] },
            content: String,
            timestamp: { type: Date, default: Date.now },
          },
        ],
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtual: XP for current level ─────────────────────────────
UserSchema.virtual("xpForNextLevel").get(function () {
  return Math.floor(100 * Math.pow(1.4, this.level - 1));
});

// ── Hash password before save ──────────────────────────────────
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Streak update logic ────────────────────────────────────────
UserSchema.methods.updateStreak = function () {
  const now = new Date();
  const last = this.lastStudiedAt;
  if (!last) {
    this.streak = 1;
  } else {
    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      this.streak += 1;
    } else if (diffDays > 1) {
      this.streak = 1;
    }
    // diffDays === 0 means same day — no change
  }
  if (this.streak > this.longestStreak) this.longestStreak = this.streak;
  this.lastStudiedAt = now;
};

// ── Compare password ───────────────────────────────────────────
UserSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

// ── Level up logic ─────────────────────────────────────────────
UserSchema.methods.addXP = function (amount) {
  this.totalXp += amount;
  this.points += amount;
  const xpNeeded = Math.floor(100 * Math.pow(1.4, this.level - 1));
  const xpInLevel = this.totalXp - this._xpAccumulated();
  if (xpInLevel >= xpNeeded) this.level += 1;
};

UserSchema.methods._xpAccumulated = function () {
  let acc = 0;
  for (let i = 1; i < this.level; i++) acc += Math.floor(100 * Math.pow(1.4, i - 1));
  return acc;
};

module.exports = mongoose.model("User", UserSchema);
