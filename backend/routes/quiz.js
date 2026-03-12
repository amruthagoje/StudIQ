const express = require("express");
const router = express.Router();
const { saveResult, getHistory, getQuizStats } = require("../controllers/quizController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.post("/result", saveResult);
router.get("/history", getHistory);
router.get("/stats", getQuizStats);

module.exports = router;
