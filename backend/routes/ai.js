const express = require("express");
const router = express.Router();
const { chat, generateQuiz, explainTopic, getSessions, getSession } = require("../controllers/aiController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.post("/chat", chat);
router.post("/generate-quiz", generateQuiz);
router.post("/explain", explainTopic);
router.get("/sessions", getSessions);
router.get("/sessions/:id", getSession);

module.exports = router;
