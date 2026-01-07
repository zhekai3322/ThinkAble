const mongoose = require("mongoose");

const progressAnswerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    selectedAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    answeredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const progressSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    worksheetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },

    answered: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },

    answers: { type: [progressAnswerSchema], default: [] },
  },
  { timestamps: true }
);

// Prevent duplicate progress docs for same student+worksheet
progressSchema.index({ studentId: 1, worksheetId: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);
