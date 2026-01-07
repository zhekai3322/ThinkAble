const mongoose = require("mongoose");
const Progress = require("../models/Progress");
const Question = require("../models/Question");
const Worksheet = require("../models/Worksheet");

/**
 * POST /api/progress/submit-answer
 * body: { studentId, worksheetId, questionId, selectedAnswer }
 */
exports.submitAnswer = async (req, res) => {
  try {
    const { studentId, worksheetId, questionId, selectedAnswer } = req.body;

    // Basic validation
    if (!studentId || !worksheetId || !questionId || typeof selectedAnswer !== "string") {
      return res.status(400).json({ message: "Missing/invalid fields." });
    }

    // Validate ObjectId format
    for (const id of [studentId, worksheetId, questionId]) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ObjectId provided." });
      }
    }

    // Fetch worksheet + question (and confirm question belongs to worksheet)
    const worksheet = await Worksheet.findById(worksheetId).lean();
    if (!worksheet) return res.status(404).json({ message: "Worksheet not found." });

    const question = await Question.findById(questionId).lean();
    if (!question) return res.status(404).json({ message: "Question not found." });

    if (String(question.worksheetId) !== String(worksheetId)) {
      return res.status(400).json({ message: "Question does not belong to this worksheet." });
    }

    // Ensure selectedAnswer is one of the options (optional but recommended)
    if (Array.isArray(question.options) && question.options.length > 0) {
      const isValidOption = question.options.includes(selectedAnswer);
      if (!isValidOption) {
        return res.status(400).json({ message: "Selected answer is not a valid option." });
      }
    }

    // Get or create progress doc
    let progress = await Progress.findOne({ studentId, worksheetId });
    if (!progress) {
      progress = await Progress.create({ studentId, worksheetId });
    }

    // Prevent double answering the same question
    const alreadyAnswered = progress.answers.some(
      (a) => String(a.questionId) === String(questionId)
    );
    if (alreadyAnswered) {
      return res.status(409).json({
        message: "Question already answered for this worksheet.",
        progress: {
          answered: progress.answered,
          score: progress.score,
          completed: progress.completed,
          totalQuestions: worksheet.totalQuestions ?? 20,
        },
      });
    }

    // Mark correct?
    const isCorrect = selectedAnswer === question.correctAnswer;

    // Update progress
    progress.answers.push({ questionId, selectedAnswer, isCorrect });
    progress.answered = progress.answers.length;
    if (isCorrect) progress.score += 1;

    const totalQuestions = worksheet.totalQuestions ?? 20;
    progress.completed = progress.answered >= totalQuestions;

    await progress.save();

    // Return what frontend needs (progress bar + show correct answer)
    return res.json({
      message: "Answer submitted.",
      result: {
        isCorrect,
        correctAnswer: question.correctAnswer, // <-- needed for "show the correct answer"
      },
      progress: {
        answered: progress.answered,
        score: progress.score,
        completed: progress.completed,
        totalQuestions,
        percent: Math.round((progress.answered / totalQuestions) * 100),
      },
    });
  } catch (err) {
    console.error("submitAnswer error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

/**
 * GET /api/progress/:studentId/:worksheetId
 * returns current progress (for progress bar + resume)
 */
exports.getProgress = async (req, res) => {
  try {
    const { studentId, worksheetId } = req.params;

    const progress = await Progress.findOne({ studentId, worksheetId }).lean();
    const worksheet = await Worksheet.findById(worksheetId).lean();

    if (!worksheet) return res.status(404).json({ message: "Worksheet not found." });

    const totalQuestions = worksheet.totalQuestions ?? 20;

    return res.json({
      progress: progress
        ? {
            answered: progress.answered,
            score: progress.score,
            completed: progress.completed,
            totalQuestions,
            percent: Math.round((progress.answered / totalQuestions) * 100),
            answersCount: progress.answers?.length ?? 0,
          }
        : {
            answered: 0,
            score: 0,
            completed: false,
            totalQuestions,
            percent: 0,
            answersCount: 0,
          },
    });
  } catch (err) {
    console.error("getProgress error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};
