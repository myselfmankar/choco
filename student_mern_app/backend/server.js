require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Student = require("./Student");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/student_db")
  .then(() => console.log("MongoDB Connected to student_db"))
  .catch((err) => console.log(err));

// Routes

// Get all students
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a student
app.post("/api/students", async (req, res) => {
  const student = new Student({
    name: req.body.name,
    roll: req.body.roll,
    email: req.body.email,
    marks: req.body.marks,
  });

  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a student
app.patch("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (req.body.name) student.name = req.body.name;
    if (req.body.roll) student.roll = req.body.roll;
    if (req.body.email) student.email = req.body.email;
    if (req.body.marks !== undefined) student.marks = req.body.marks;
    
    const updatedStudent = await student.save();
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a student
app.delete("/api/students/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Unity Architecture: Serve Frontend
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*path", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Student Server started on port ${PORT}`));
