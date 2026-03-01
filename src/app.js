const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const session = require("express-session");
const natural = require("natural");
const sw = require("stopword");
const { DOMMatrix } = require("canvas");
const Resume = require("../models/Resume");
const authRoutes = require("../routes/auth");

/* ======================= PDFJS FIX ======================= */
global.DOMMatrix = DOMMatrix;
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

/* ======================= APP ======================= */
const app = express();

/* ======================= SESSION ======================= */
app.use(
    session({
        secret: "secret-key",
        resave: false,
        saveUninitialized: false
    })
);

/* ======================= MIDDLEWARE ======================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..")));

/* ======================= AUTH ======================= */
function isLoggedIn(req, res, next) {
    if (req.session.user) return next();
    return res.redirect("/login");
}

app.get("/auth-status", (req, res) => res.json({ loggedIn: !!req.session.user }));
app.post("/login", require("../routes/auth"));

/* ======================= HTML ROUTES ======================= */
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "..", "index.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "..", "login.html")));
app.get("/register", (req, res) => res.sendFile(path.join(__dirname, "..", "register.html")));
app.get("/result", isLoggedIn, (req, res) => res.sendFile(path.join(__dirname, "..", "result.html")));
app.use("/auth", authRoutes);

/* ======================= FOLDERS ======================= */
const uploadDir = path.join(process.cwd(), "upload");
const reportDir = path.join(uploadDir, "report");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

/* ======================= MULTER ======================= */
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

/* ======================= PDF TEXT EXTRACTION ======================= */
async function extractText(filePath, originalFileName) {
    const data = new Uint8Array(fs.readFileSync(filePath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(" ") + " ";
    }

    text = text.trim();
    if (!text) throw new Error("Unreadable or scanned PDF (no text)");

    const safeName = (originalFileName || "resume").replace(/[^a-z0-9]/gi, "_");
    const reportPath = path.join(reportDir, `${Date.now()}_${safeName}.txt`);
    fs.writeFileSync(reportPath, text, "utf8");

    return { text, reportPath, charCount: text.length };
}

/* ======================= SCORING ======================= */
const DEFAULT_WEIGHTS = { partial: 0.2, relative: 0.25, penalty: 0.15, consistency: 0.2, duplicate: 0.2 };

function extractWeights(body) {
    const weights = {};
    let sum = 0;
    for (const key of Object.keys(DEFAULT_WEIGHTS)) {
        const val = parseFloat(body[key]);
        weights[key] = Number.isFinite(val) ? val : DEFAULT_WEIGHTS[key];
        sum += weights[key];
    }
    if (sum > 0) {
        for (const key in weights) weights[key] = +(weights[key] / sum).toFixed(3);
    }
    return weights;
}

function partialCreditScore(text) {
    const t = text.toLowerCase();
    const weak = ["basic", "beginner", "learning", "familiar", "exposure"];
    const medium = ["intermediate", "hands-on", "worked on", "experience with", "implemented", "developed"];
    const strong = ["expert", "advanced", "proficient", "professional", "certified", "years of experience"];
    let score = 0;
    weak.forEach(w => t.includes(w) && (score += 0.2));
    medium.forEach(w => t.includes(w) && (score += 0.6));
    strong.forEach(w => t.includes(w) && (score += 1));
    return Math.min(score, 5);
}

function keywordPenalty(text) {
    const words = text.toLowerCase().split(/\s+/);
    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    return -0.05 * Math.max(...Object.values(freq));
}

function skillProjectConsistency(text) {
    const t = text.toLowerCase();
    const rules = [
        ["python", ["project", "script", "automation"]],
        ["java", ["application", "backend", "spring"]],
        ["machine learning", ["model", "prediction", "classification"]],
        ["data science", ["analysis", "dataset", "visualization"]],
        ["web", ["website", "frontend", "backend"]]
    ];
    let score = 0;
    rules.forEach(([skill, contexts]) => {
        if (t.includes(skill)) contexts.forEach(c => t.includes(c) && score++);
    });
    return score;
}

function computeTFIDF(texts) {
    const tfidf = new natural.TfIdf();
    texts.forEach(t => {
        if (typeof t === "string") tfidf.addDocument(sw.removeStopwords(t.toLowerCase().split(/\s+/)).join(" "));
    });
    return tfidf;
}

function cosineSimilarity(a, b) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    let dot = 0, magA = 0, magB = 0;
    keys.forEach(k => {
        const x = a[k] || 0, y = b[k] || 0;
        dot += x * y; magA += x * x; magB += y * y;
    });
    return magA && magB ? dot / Math.sqrt(magA * magB) : 0;
}

function relativeScore(tfidf) {
    if (tfidf.documents.length === 1) return [0.5];
    return tfidf.documents.map((doc, i) => {
        let sum = 0, count = 0;
        tfidf.documents.forEach((other, j) => { if (i !== j) { sum += cosineSimilarity(doc, other); count++; } });
        return count ? sum / count : 0;
    });
}

function duplicateScore(tfidf) {
    return tfidf.documents.map((doc, i) => {
        let max = 0;
        tfidf.documents.forEach((other, j) => { if (i !== j) max = Math.max(max, cosineSimilarity(doc, other)); });
        return max > 0.9 ? 0 : 1;
    });
}

/* ======================= COMPUTE SCORES ======================= */
async function computeScores(filePaths, WEIGHTS) {
    const texts = [];
    const names = [];

    for (const fp of filePaths) {
        const { text } = await extractText(fp);
        texts.push(text);
        names.push(path.basename(fp));
    }

    const tfidf = computeTFIDF(texts);
    const rel = relativeScore(tfidf);
    const dup = duplicateScore(tfidf);

    const results = texts.map((text, i) => {
        const partial = partialCreditScore(text);
        const relative = rel[i] || 0;
        const penalty = keywordPenalty(text);
        const consistency = skillProjectConsistency(text);
        const duplicate = dup[i] || 1;

        const rawScore =
            WEIGHTS.partial * partial +
            WEIGHTS.relative * relative +
            WEIGHTS.penalty * penalty +
            WEIGHTS.consistency * consistency +
            WEIGHTS.duplicate * duplicate;

        return {
            filename: names[i],
            breakdown: { partial, relative, penalty, consistency, duplicate },
            weighted: {
                partial: WEIGHTS.partial * partial,
                relative: WEIGHTS.relative * relative,
                penalty: WEIGHTS.penalty * penalty,
                consistency: WEIGHTS.consistency * consistency,
                duplicate: WEIGHTS.duplicate * duplicate
            },
            rawScore
        };
    });

    // ✅ Normalize robustly
    const rawScores = results.map(r => r.rawScore);
    const minRaw = Math.min(...rawScores);
    const maxRaw = Math.max(...rawScores);
    const EPSILON = 0.0001; // tiny differences

    return results.map(r => ({
        ...r,
        finalScore: Math.abs(maxRaw - minRaw) < EPSILON
            ? Math.round(r.rawScore * 20 + 20) // scale for small differences
            : Math.round(20 + ((r.rawScore - minRaw) / (maxRaw - minRaw)) * 80)
    }));
}

/* ======================= UPLOAD ROUTE ======================= */
app.post("/upload", upload.array("resume"), async (req, res) => {
    try {
        if (!req.files?.length) return res.status(400).send("No files uploaded");

        const WEIGHTS = extractWeights(req.body);
        console.log("⚖️ Active Weights:", WEIGHTS);

        const results = await computeScores(req.files.map(f => f.path), WEIGHTS);

        await Resume.deleteMany({});
        for (const r of results) {
            await new Resume({
                filename: r.filename,
                score: r.finalScore,
                breakdown: r.breakdown,
                weighted: r.weighted,
                weights: WEIGHTS
            }).save();
        }

        res.redirect("/result");
    } catch (err) {
        console.error("❌ Upload Error:", err);
        res.status(500).send("Upload failed");
    }
});

/* ======================= RESULTS ======================= */
app.get("/results", isLoggedIn, async (req, res) => {
    const resumes = await Resume.find().sort({ score: -1 });
    res.json({ resumes });
});

app.get("/api/report/:id", isLoggedIn, async (req, res) => {
    const resume = await Resume.findById(req.params.id).lean();
    if (!resume) return res.status(404).json({ error: "Report not found" });
    res.json(resume);
});

/* ======================= LOGOUT ======================= */
app.get("/logout", (req, res) => req.session.destroy(() => res.redirect("/login")));

module.exports = app;