const express = require("express");
const router = express.Router();
const { getProgress, getTopicProgress, updateProgress } = require("../controllers/progressController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", getProgress);
router.get("/:topic", getTopicProgress);
router.post("/update", updateProgress);

module.exports = router;
