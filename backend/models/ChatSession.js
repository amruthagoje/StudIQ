const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ChatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topic: { type: String, default: "General" },
    title: { type: String, default: "New Chat" },
    messages: [MessageSchema],
    xpEarned: { type: Number, default: 0 },
    messageCount: { type: Number, default: 0 },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatSession", ChatSessionSchema);
