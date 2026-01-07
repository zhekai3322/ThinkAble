require("dotenv").config();

console.log("PORT =", process.env.PORT);
console.log("MONGO_URI =", process.env.MONGO_URI);

require("dotenv").config();
const express = require("express");
const connectDB = require("./db");

const progressRoutes = require("./routes/progressRoutes");
app.use("/api/progress", progressRoutes);

const app = express();
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("ThinkAble API running");
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
