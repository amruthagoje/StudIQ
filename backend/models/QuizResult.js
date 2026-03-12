const mongoose = require("mongoose");

const QuizResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topic: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["beginner", "easy", "medium", "intermediate", "hard", "advanced"],
      required: true,
    },
    score: { type: Number, required: true },       // correct answers count
    totalQuestions: { type: Number, required: true },
    percentage: { type: Number, required: true },  // 0–100
    xpEarned: { type: Number, default: 0 },
    timeTakenSeconds: { type: Number },
    questions: [
      {
        question: String,
        options: [String],
        correctAnswer: Number,
        userAnswer: Number,
        isCorrect: Boolean,
      },
    ],
    adaptiveDifficultyNext: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
    },
  },
  { timestamps: true }
);

// Auto-compute adaptive next difficulty
QuizResultSchema.pre("save", function (next) {
  if (this.percentage >= 80) this.adaptiveDifficultyNext = "advanced";
  else if (this.percentage >= 50) this.adaptiveDifficultyNext = "intermediate";
  else this.adaptiveDifficultyNext = "beginner";
  next();
});

module.exports = mongoose.model("QuizResult", QuizResultSchema);
