require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/pcs_db")
  .then(() => console.log("MongoDB Connected to pcs_db"))
  .catch((err) => console.log(err));

// File Model
const FileSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  size: Number,
  mimeType: String,
  uploadedAt: { type: Date, default: Date.now }
});
const File = mongoose.model("File", FileSchema, "files");

// Multer Storage Config
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Routes

// Get all files
app.get("/api/files", async (req, res) => {
  try {
    const files = await File.find().sort({ uploadedAt: -1 });
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload multiple files
app.post("/api/upload", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).send("No files uploaded.");
  
  try {
    const savedFiles = [];
    for (const file of req.files) {
      const newFile = new File({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype
      });
      await newFile.save();
      savedFiles.push(newFile);
    }
    res.status(201).json(savedFiles);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Download a file
app.get("/api/files/:id/download", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).send("File not found.");
    
    const filePath = path.join(uploadDir, file.filename);
    res.download(filePath, file.originalName);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete a file
app.delete("/api/files/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).send("File not found.");
    
    const filePath = path.join(uploadDir, file.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    
    await File.findByIdAndDelete(req.params.id);
    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});


// --- Unity Architecture: Serve Frontend ---
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// API Routes
// (Existing /api routes are above)

// The Catch-all: If it's not an API call, serve index.html
app.get("*path", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

const PORT = 5005;
app.listen(PORT, () => console.log(`AURA Cloud Server started on port ${PORT}`));
