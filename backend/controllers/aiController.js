const Anthropic = require("@anthropic-ai/sdk");
const ChatSession = require("../models/ChatSession");
const User = require("../models/User");

const getClient = () => {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
};

const SYSTEM_PROMPT = (level, difficulty) => `You are StudIQ — a brilliant, concise AI tutor. Student level: ${level}, difficulty: ${difficulty}.

Rules:
- Keep explanations under 150 words unless asked for more
- Use 1-2 concrete real-world examples
- Short paragraphs — no walls of text
- Be encouraging, never condescending
- End with a follow-up question or fun fact to spark curiosity
- Adapt complexity to the student's level`;

const QUIZ_SYSTEM = `You are a quiz generator. Output ONLY a valid JSON array. Zero preamble, zero explanation, zero markdown fences.
Format: [{"question":"...","options":["A","B","C","D"],"answer":0,"explanation":"1 sentence"}]
The "answer" field is the 0-based index of the correct option.`;

// @desc  Send a chat message and get AI reply
// @route POST /api/ai/chat
const chat = async (req, res) => {
  try {
    const { message, sessionId, topic = "General", history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: "Message required" });

    const client = getClient();
    const user = req.user;

    // Build message history (last 10 turns)
    const msgs = [...history.slice(-10), { role: "user", content: message }];

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      system: SYSTEM_PROMPT(user.level, user.currentDifficulty),
      messages: msgs,
    });

    const reply = response.content[0]?.text || "Sorry, I couldn't respond right now.";

    // Save/update chat session in DB
    let session;
    if (sessionId) {
      session = await ChatSession.findOneAndUpdate(
        { _id: sessionId, userId: user._id },
        {
          $push: {
            messages: [
              { role: "user", content: message },
              { role: "assistant", content: reply },
            ],
          },
          $inc: { messageCount: 2, xpEarned: 5 },
        },
        { new: true }
      );
    } else {
      session = await ChatSession.create({
        userId: user._id,
        topic,
        title: message.slice(0, 40) + (message.length > 40 ? "..." : ""),
        messages: [
          { role: "user", content: message },
          { role: "assistant", content: reply },
        ],
        messageCount: 2,
        xpEarned: 5,
      });
    }

    // Award XP
    await User.findByIdAndUpdate(user._id, { $inc: { totalXp: 5, points: 5 } });

    res.json({
      success: true,
      reply,
      sessionId: session._id,
      xpEarned: 5,
    });
  } catch (err) {
    console.error("AI chat error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Generate a quiz via AI
// @route POST /api/ai/generate-quiz
const generateQuiz = async (req, res) => {
  try {
    const { topic, difficulty = "medium", count = 5 } = req.body;
    if (!topic) return res.status(400).json({ success: false, message: "Topic is required" });

    const client = getClient();

    const prompt = `Generate a ${difficulty} difficulty quiz on "${topic}" with exactly ${count} multiple choice questions.
Return ONLY the JSON array, no other text.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: QUIZ_SYSTEM,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.content[0]?.text || "[]";
    const clean = raw.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(clean);

    res.json({ success: true, questions, topic, difficulty });
  } catch (err) {
    console.error("Quiz gen error:", err);
    res.status(500).json({ success: false, message: "Quiz generation failed: " + err.message });
  }
};

// @desc  Generate an explanation for a challenge
// @route POST /api/ai/explain
const explainTopic = async (req, res) => {
  try {
    const { title, topic, difficulty } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Title is required" });

    const client = getClient();
    const user = req.user;

    const prompt = `Explain the concept of "${title}" (${topic}) at a ${difficulty} level. Keep it under 120 words. End with a concrete example.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      system: SYSTEM_PROMPT(user.level, difficulty),
      messages: [{ role: "user", content: prompt }],
    });

    const explanation = response.content[0]?.text;
    res.json({ success: true, explanation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get chat history sessions
// @route GET /api/ai/sessions
const getSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.user._id, isArchived: false })
      .select("title topic messageCount xpEarned createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .limit(20);
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get a single chat session with messages
// @route GET /api/ai/sessions/:id
const getSession = async (req, res) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { chat, generateQuiz, explainTopic, getSessions, getSession };
