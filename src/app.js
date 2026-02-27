const express = require("express");
const path = require("path");
const multer = require("multer");
const session = require("express-session");
const fs = require("fs");
const pdf = require("pdf-parse");
const natural = require("natural");
const sw = require("stopword");

const app = express();
const Resume = require("../models/Resume");
const authRoutes = require("../routes/auth");

// ================= SESSION =================
app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false
}));

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, ".."))); // serve CSS, JS, assets

// ================= AUTH CHECK =================
function isLoggedIn(req, res, next) {
    if (req.session.user) return next();
    res.redirect("/login");
}

// ================= UPLOAD STORAGE =================
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage });

// ================= HTML ROUTES =================
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "..", "index.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "..", "login.html")));
app.get("/register", (req, res) => res.sendFile(path.join(__dirname, "..", "register.html")));

app.post("/upload", upload.array("resume"), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send("No files uploaded");
    }

    // Send back saved file paths
    const filePaths = req.files.map(f => f.path);
    res.json({ message: "Files uploaded successfully", files: filePaths });
});

// ================= PDF SCORING LOGIC =================
const WEIGHTS = { partial: 0.2, relative: 0.25, penalty: 0.15, consistency: 0.2, duplicate: 0.2 };

async function extractText(filePath) {
    const data = fs.readFileSync(filePath);
    const pdfData = await pdf(data);
    return pdfData.text || "";
}

function partialCreditScore(text) {
    const vague = ["basic", "familiar", "learning", "exposure"];
    const strong = ["expert", "advanced", "certified", "professional", "experienced"];
    let score = 0;
    const t = text.toLowerCase();
    vague.forEach(w => { if (t.includes(w)) score += 0.3; });
    strong.forEach(w => { if (t.includes(w)) score += 1; });
    return score;
}

function keywordPenalty(text) {
    const words = text.toLowerCase().split(/\s+/);
    const freqMap = {};
    words.forEach(w => freqMap[w] = (freqMap[w] || 0) + 1);
    const maxFreq = Math.max(...Object.values(freqMap), 0);
    return -0.05 * maxFreq;
}

function skillProjectConsistency(text) {
    const pairs = [["python", "project"], ["java", "application"], ["machine learning", "model"], ["data science", "analysis"], ["web", "website"]];
    const t = text.toLowerCase();
    return pairs.reduce((acc, [s, p]) => acc + ((t.includes(s) && t.includes(p)) ? 1 : 0), 0);
}

function computeTFIDFMatrix(texts) {
    const corpus = texts.map(t => sw.removeStopwords(t.toLowerCase().split(/\s+/)).join(" "));
    const tfidf = new natural.TfIdf();
    corpus.forEach(doc => tfidf.addDocument(doc));
    return tfidf;
}

function cosineSimilarity(a, b) {
    const words = new Set([...Object.keys(a), ...Object.keys(b)]);
    let dot = 0, magA = 0, magB = 0;
    words.forEach(w => {
        const x = a[w] || 0, y = b[w] || 0;
        dot += x * y; magA += x * x; magB += y * y;
    });
    return magA && magB ? dot / Math.sqrt(magA * magB) : 0;
}

function relativeScore(tfidf) {
    const n = tfidf.documents.length;
    const scores = [];
    for (let i = 0; i < n; i++) {
        let sumSim = 0, count = 0;
        for (let j = 0; j < n; j++) {
            if (i === j) continue;
            const sim = cosineSimilarity(tfidf.documents[i], tfidf.documents[j]);
            sumSim += sim; count++;
        }
        scores.push(count ? sumSim / count : 0);
    }
    return scores;
}

function duplicateScore(tfidf) {
    const n = tfidf.documents.length;
    const scores = [];
    for (let i = 0; i < n; i++) {
        let maxSim = 0;
        for (let j = 0; j < n; j++) {
            if (i === j) continue;
            const sim = cosineSimilarity(tfidf.documents[i], tfidf.documents[j]);
            if (sim > maxSim) maxSim = sim;
        }
        scores.push(maxSim > 0.9 ? 0 : 1);
    }
    return scores;
}

async function computeScores(filePaths) {
    const resumes = [], names = [];
    for (const path of filePaths) {
        const text = await extractText(path);
        if (text.trim()) {
            resumes.push(text);
            names.push(path.split(/[\\/]/).pop());
        }
    }

    const tfidf = computeTFIDFMatrix(resumes);
    const partial = resumes.map(partialCreditScore);
    const penalty = resumes.map(keywordPenalty);
    const consistency = resumes.map(skillProjectConsistency);
    const relative = relativeScore(tfidf);
    const duplicate = duplicateScore(tfidf);

    const finalScores = resumes.map((_, i) =>
        WEIGHTS.partial * partial[i] +
        WEIGHTS.relative * relative[i] +
        WEIGHTS.penalty * penalty[i] +
        WEIGHTS.consistency * consistency[i] +
        WEIGHTS.duplicate * duplicate[i]
    );

    return names.map((n, i) => [n, finalScores[i]]).sort((a, b) => b[1] - a[1]);
}

// ================= UPLOAD ENDPOINT =================
app.post("/upload", isLoggedIn, upload.array("resume"), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0)
            return res.status(400).json({ message: "No files uploaded" });

        const filePaths = req.files.map(f => f.path);
        const results = await computeScores(filePaths);

        const savedResumes = [];
        for (const [filename, score] of results) {
            const resume = new Resume({
                userId: req.session.user.id,
                filename,
                filepath: "uploads/" + filename,
                score
            });
            await resume.save();
            savedResumes.push(resume);
        }

        res.json({ success: true, results: savedResumes });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Upload failed" });
    }
});

// ================= RESULTS ENDPOINT =================
app.get("/results", isLoggedIn, async (req, res) => {
    const resumes = await Resume.find({ userId: req.session.user.id });
    res.json({ resumes });
});

// ================= LOGOUT =================
app.get("/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/login"));
});

// ================= AUTH ROUTES =================
app.use("/", authRoutes);

module.exports = app;