const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// ─── MongoDB ────────────────────────────────────────────────────────────────
mongoose.connect('mongodb://localhost:27017/cloud_storage')
    .then(() => console.log('✅  MongoDB connected'))
    .catch(err => { console.error('❌  MongoDB connection failed:', err.message); process.exit(1); });

const FileSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
});

const FileModel = mongoose.model('File', FileSchema);

// ─── Multer ──────────────────────────────────────────────────────────────────
const UPLOAD_DIR = './uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
    storage,
    limits: { fileSize: 500 * 1024 * 1024 } // 500 MB cap
});

// ─── Error wrapper ───────────────────────────────────────────────────────────
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/', (_req, res) =>
    res.sendFile(path.join(__dirname, 'index.html'))
);

// List all files
app.get('/api/files', asyncHandler(async (_req, res) => {
    const files = await FileModel.find().sort({ uploadedAt: -1 });
    res.json(files);
}));

// Upload
app.post('/api/upload', (req, res, next) => {
    upload.single('file')(req, res, err => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(500).json({ error: 'Unknown upload error' });
        }
        next();
    });
}, asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const newFile = await FileModel.create({
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
    });

    res.status(201).json(newFile);
}));

// Download
app.get('/api/files/:id/download', asyncHandler(async (req, res) => {
    const file = await FileModel.findById(req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });

    const filePath = path.join(__dirname, 'uploads', file.filename);
    if (!fs.existsSync(filePath))
        return res.status(404).json({ error: 'File missing from disk' });

    res.download(filePath, file.originalName);
}));

// Rename
app.patch('/api/files/:id', asyncHandler(async (req, res) => {
    const { newName } = req.body;
    if (!newName || !newName.trim())
        return res.status(400).json({ error: 'New name is required' });

    const file = await FileModel.findByIdAndUpdate(
        req.params.id,
        { originalName: newName.trim() },
        { new: true }
    );
    if (!file) return res.status(404).json({ error: 'File not found' });
    res.json(file);
}));

// Delete
app.delete('/api/files/:id', asyncHandler(async (req, res) => {
    const file = await FileModel.findById(req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });

    const filePath = path.join(__dirname, 'uploads', file.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await FileModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'File deleted' });
}));

// ─── Global error handler ────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`🚀  Server running → http://localhost:${PORT}`)
);