const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve index.html from root

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/cloud_storage', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const FileSchema = new mongoose.Schema({
    filename: String,
    originalName: String,
    size: Number,
    mimeType: String,
    uploadedAt: { type: Date, default: Date.now }
});

const FileModel = mongoose.model('File', FileSchema);

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// API Endpoints
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/files', async (req, res) => {
    const files = await FileModel.find().sort({ uploadedAt: -1 });
    res.json(files);
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');
    
    const newFile = new FileModel({
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
    });

    await newFile.save();
    res.status(201).json(newFile);
});

app.delete('/api/files/:id', async (req, res) => {
    const file = await FileModel.findById(req.params.id);
    if (!file) return res.status(404).send('File not found.');

    const filePath = path.join(__dirname, 'uploads', file.filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    await FileModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'File deleted' });
});

app.patch('/api/files/:id', async (req, res) => {
    const { newName } = req.body;
    const file = await FileModel.findByIdAndUpdate(req.params.id, { originalName: newName }, { new: true });
    if (!file) return res.status(404).send('File not found.');
    res.json(file);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Cloud Storage server running on http://localhost:${PORT}`);
});
