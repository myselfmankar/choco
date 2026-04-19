require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Registration = require("./Registration");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/event_db")
  .then(() => console.log("MongoDB Connected to event_db"))
  .catch((err) => console.log(err));

// Routes

// Get all registrations
app.get("/api/registrations", async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a registration
app.post("/api/registrations", async (req, res) => {
  const reg = new Registration({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    college: req.body.college,
    teamSize: req.body.teamSize || 1
  });

  try {
    const newReg = await reg.save();
    res.status(201).json(newReg);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a registration (Admin only action)
app.delete("/api/registrations/:id", async (req, res) => {
  try {
    await Registration.findByIdAndDelete(req.params.id);
    res.json({ message: "Registration cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Unity Architecture: Serve Frontend
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*path", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => console.log(`Event Server started on port ${PORT}`));
