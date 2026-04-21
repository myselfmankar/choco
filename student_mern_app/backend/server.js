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

// Helper: turn mongoose/Mongo errors into clean, user-facing messages
const formatError = (err) => {
  // Duplicate key (unique index) – e.g. duplicate roll number
  if (err && err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const value = err.keyValue ? err.keyValue[field] : "";
    const pretty = field === "roll" ? "Roll number" : field.charAt(0).toUpperCase() + field.slice(1);
    return { status: 409, body: { message: `${pretty} "${value}" already exists. Please use a different ${field}.`, field } };
  }
  // Mongoose validation – return first (or all) field messages
  if (err && err.name === "ValidationError") {
    const errors = {};
    for (const key of Object.keys(err.errors)) {
      errors[key] = err.errors[key].message;
    }
    const first = Object.values(errors)[0] || "Validation failed";
    return { status: 400, body: { message: first, errors } };
  }
  // CastError – bad ObjectId
  if (err && err.name === "CastError") {
    return { status: 400, body: { message: "Invalid ID format" } };
  }
  return { status: 500, body: { message: err.message || "Server error" } };
};

// Get all students
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    const { status, body } = formatError(err);
    res.status(status).json(body);
  }
});

// Add a student
app.post("/api/students", async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const roll = (req.body.roll || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const marks = req.body.marks;

    const student = new Student({ name, roll, email, marks });
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (err) {
    const { status, body } = formatError(err);
    res.status(status).json(body);
  }
});

// Update a student
app.patch("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (req.body.name !== undefined) student.name = String(req.body.name).trim();
    if (req.body.roll !== undefined) student.roll = String(req.body.roll).trim();
    if (req.body.email !== undefined) student.email = String(req.body.email).trim().toLowerCase();
    if (req.body.marks !== undefined && req.body.marks !== "") student.marks = req.body.marks;

    const updatedStudent = await student.save();
    res.json(updatedStudent);
  } catch (err) {
    const { status, body } = formatError(err);
    res.status(status).json(body);
  }
});

// Delete a student
app.delete("/api/students/:id", async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student deleted" });
  } catch (err) {
    const { status, body } = formatError(err);
    res.status(status).json(body);
  }
});


// Unity Architecture: Serve Frontend
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*path", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Student Server started on port ${PORT}`));
