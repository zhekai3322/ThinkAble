const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Student = require("./models/Student");

const app = express();
app.use(cors());
app.use(express.json());

// -----------------------------
// Connect to MongoDB
// -----------------------------
mongoose.connect("mongodb://localhost:27017/thinkable", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// -----------------------------
// API ROUTES (Students)
// -----------------------------

// Get all students
app.get("/students", async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

// Create student
app.post("/students", async (req, res) => {
  const student = await Student.create(req.body);
  res.json(student);
});

// Update student
app.put("/students/:id", async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(student);
});

// Delete student
app.delete("/students/:id", async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: "Student deleted" });
});

const Worksheet = require("./model/Worksheet");

// -----------------------------
// API ROUTES (Worksheets)
// -----------------------------

// Get all worksheets
app.get("/worksheets", async (req, res) => {
  const ws = await Worksheet.find();
  res.json(ws);
});

// Create worksheet
app.post("/worksheets", async (req, res) => {
  const ws = await Worksheet.create(req.body);
  res.json(ws);
});

// Update worksheet
app.put("/worksheets/:id", async (req, res) => {
  const ws = await Worksheet.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(ws);
});

// Delete worksheet
app.delete("/worksheets/:id", async (req, res) => {
  await Worksheet.findByIdAndDelete(req.params.id);
  res.json({ message: "Worksheet deleted" });
});


// -----------------------------
// Start Server
// -----------------------------
app.listen(5000, () => console.log("Server running on port 5000"));
