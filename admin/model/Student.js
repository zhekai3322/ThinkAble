const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name: String,
  age: Number,
  school: String,
  verbal: String,
}, { timestamps: true });

module.exports = mongoose.model("Student", StudentSchema);
