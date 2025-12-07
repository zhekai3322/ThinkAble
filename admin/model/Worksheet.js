const mongoose = require("mongoose");

const WorksheetSchema = new mongoose.Schema({
  title: String,
  topic: String,
  level: String,    // Elementary, Intermediate, Expert
  description: String,
  totalQuestions: Number
}, { timestamps: true });

module.exports = mongoose.model("Worksheet", WorksheetSchema);
