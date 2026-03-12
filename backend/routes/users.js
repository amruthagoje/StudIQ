const express = require("express");
const router = express.Router();
const { updateProfile, addXP, unlockBadge, solveChallenge, getStats } = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.put("/profile", updateProfile);
router.post("/xp", addXP);
router.post("/badge", unlockBadge);
router.post("/solve", solveChallenge);
router.get("/stats", getStats);

module.exports = router;
