const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topic: { type: String, required: true },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    sessionsCount: { type: Number, default: 0 },
    totalXpInTopic: { type: Number, default: 0 },
    lastStudied: { type: Date, default: Date.now },
    quizzesTaken: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    currentDifficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    milestones: [
      {
        label: String,
        achievedAt: { type: Date, default: Date.now },
        xpRequired: Number,
      },
    ],
  },
  { timestamps: true }
);

// Compound index: one progress doc per user+topic
ProgressSchema.index({ userId: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model("Progress", ProgressSchema);
