const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
    maxlength: [60, "Name cannot exceed 60 characters"],
  },
  roll: {
    type: String,
    required: [true, "Roll number is required"],
    unique: true,
    trim: true,
    minlength: [1, "Roll number cannot be empty"],
    maxlength: [20, "Roll number cannot exceed 20 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Please enter a valid email address"],
  },
  marks: {
    type: Number,
    required: [true, "Marks are required"],
    min: [0, "Marks cannot be less than 0"],
    max: [100, "Marks cannot exceed 100"],
    validate: {
      validator: (v) => typeof v === "number" && !Number.isNaN(v),
      message: "Marks must be a valid number",
    },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Student", StudentSchema, "students");
