const express = require("express");
const router = express.Router();
const { submitAnswer, getProgress } = require("../controllers/progressController");

router.post("/submit-answer", submitAnswer);
router.get("/:studentId/:worksheetId", getProgress);

module.exports = router;
