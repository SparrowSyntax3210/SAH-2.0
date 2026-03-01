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

// Node-safe legacy build
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
/* ======================= HTML ROUTES ======================= */
app.get("/", (req, res) =>
    res.sendFile(path.join(__dirname, "..", "index.html"))
);

app.get("/login", (req, res) =>
    res.sendFile(path.join(__dirname, "..", "login.html"))
);

app.get("/register", (req, res) =>
    res.sendFile(path.join(__dirname, "..", "register.html"))
);

app.get("/result", isLoggedIn, (req, res) =>
    res.sendFile(path.join(__dirname, "..", "result.html"))
);

app.get("/logout", (req, res) =>
    res.sendFile(path.join(__dirname, "..", "index.html"))
);

app.use("/auth", authRoutes);

/* ======================= MIDDLEWARE ======================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..")));

/* ======================= AUTH ======================= */
function isLoggedIn(req, res, next) {
    if (req.session.user) return next();
    return res.redirect("/login");
}

app.get("/auth-status", (req, res) => {
    res.json({
        loggedIn: !!req.session.user
    });
});

app.post("/login", require("../routes/auth"));

/* ======================= FOLDERS ======================= */
const uploadDir = path.join(process.cwd(), "upload");
const reportDir = path.join(uploadDir, "report");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
}

/* ======================= MULTER ======================= */

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });


/* ======================= PDF TEXT EXTRACTION ======================= */
async function extractText(filePath, originalFileName) {
    console.log("📄 Reading PDF:", filePath);

    const data = new Uint8Array(fs.readFileSync(filePath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(" ") + " ";
    }

    text = text.trim();

    if (!text) {
        throw new Error("Unreadable or scanned PDF (no text)");
    }

    // ✅ SAFE filename
    const safeName = (originalFileName || "resume")
        .replace(/[^a-z0-9]/gi, "_");

    // ✅ REPORT PATH
    const reportPath = path.join(
        reportDir,
        `${Date.now()}_${safeName}.txt`
    );

    // ✅ WRITE FILE
    fs.writeFileSync(reportPath, text, "utf8");

    console.log("✅ Extracted chars:", text.length);
    console.log("📝 Saved report:", reportPath);

    return {
        text,
        reportPath,
        charCount: text.length
    };
}

/* ======================= SCORING ======================= */
const WEIGHTS = {
    partial: 0.2,
    relative: 0.25,
    penalty: 0.15,
    consistency: 0.2,
    duplicate: 0.2
};

function partialCreditScore(text) {
    const vague = ["basic", "familiar", "learning", "exposure"];
    const strong = ["expert", "advanced", "certified", "professional", "experienced"];
    let score = 0;
    const t = text.toLowerCase();
    vague.forEach(w => t.includes(w) && (score += 0.3));
    strong.forEach(w => t.includes(w) && (score += 1));
    return score;
}

function keywordPenalty(text) {
    const words = text.toLowerCase().split(/\s+/);
    const freq = {};
    words.forEach(w => (freq[w] = (freq[w] || 0) + 1));
    return -0.05 * Math.max(...Object.values(freq));
}

function skillProjectConsistency(text) {
    const rules = [
        ["python", "project"],
        ["java", "application"],
        ["machine learning", "model"],
        ["data science", "analysis"],
        ["web", "website"]
    ];
    const t = text.toLowerCase();
    return rules.reduce(
        (s, [a, b]) => s + (t.includes(a) && t.includes(b) ? 1 : 0),
        0
    );
}

function computeTFIDF(texts) {
    const tfidf = new natural.TfIdf();

    texts.forEach((t, index) => {
        if (typeof t !== "string") {
            console.error(`❌ TFIDF skipped non-string at index ${index}:`, t);
            return;
        }

        tfidf.addDocument(
            sw.removeStopwords(
                t.toLowerCase().split(/\s+/)
            ).join(" ")
        );
    });

    return tfidf;
}

function cosineSimilarity(a, b) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    let dot = 0, magA = 0, magB = 0;
    keys.forEach(k => {
        const x = a[k] || 0, y = b[k] || 0;
        dot += x * y;
        magA += x * x;
        magB += y * y;
    });
    return magA && magB ? dot / Math.sqrt(magA * magB) : 0;
}

function relativeScore(tfidf) {
    return tfidf.documents.map((doc, i) => {
        let sum = 0, count = 0;
        tfidf.documents.forEach((other, j) => {
            if (i !== j) {
                sum += cosineSimilarity(doc, other);
                count++;
            }
        });
        return count ? sum / count : 0;
    });
}

function duplicateScore(tfidf) {
    return tfidf.documents.map((doc, i) => {
        let max = 0;
        tfidf.documents.forEach((other, j) => {
            if (i !== j) max = Math.max(max, cosineSimilarity(doc, other));
        });
        return max > 0.9 ? 0 : 1;
    });
}

async function computeScores(filePaths) {
    const texts = [];
    const names = [];

    for (const filePath of filePaths) {
        try {
            // 🔥 ONLY extract text string
            const result = await extractText(filePath);

            if (typeof result.text !== "string") {
                console.error("❌ Invalid extractText result:", result);
                continue;
            }

            texts.push(result.text);
            names.push(path.basename(filePath));

        } catch (err) {
            console.error("❌ Skipping:", err.message);
        }
    }

    if (!texts.length) {
        throw new Error("No readable PDFs found");
    }

    const tfidf = computeTFIDF(texts);
    const rel = relativeScore(tfidf);
    const dup = duplicateScore(tfidf);

    const results = texts.map((t, i) => [
        names[i],
        WEIGHTS.partial * partialCreditScore(t) +
        WEIGHTS.relative * rel[i] +
        WEIGHTS.penalty * keywordPenalty(t) +
        WEIGHTS.consistency * skillProjectConsistency(t) +
        WEIGHTS.duplicate * dup[i]
    ]);

    console.log("🏆 FINAL SCORES:", results);
    const sorted = results.sort((a, b) => b[1] - a[1]);

    return normalizeScores(sorted, 20, 100);
}

function normalizeScores(results, min = 0, max = 100) {
    const rawScores = results.map(r => r[1]);

    const minRaw = Math.min(...rawScores);
    const maxRaw = Math.max(...rawScores);

    // Avoid divide-by-zero
    if (minRaw === maxRaw) {
        return results.map(([name]) => [name, 50]);
    }

    return results.map(([name, score]) => [
        name,
        Math.round(
            min + ((score - minRaw) / (maxRaw - minRaw)) * (max - min)
        )
    ]);
}

/* ======================= UPLOAD ======================= */
app.post("/upload", isLoggedIn, upload.array("resume"), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            throw new Error("No files uploaded");
        }

        console.log("📥 Upload received:", req.files.length, "files");

        const extractedReports = [];

        // 1️⃣ Extract text + save report for each resume
        for (const file of req.files) {
            const originalName = path.parse(file.originalname).name;

            const { reportPath, charCount } = await extractText(
                file.path,
                originalName
            );

            extractedReports.push({
                filename: file.filename,
                filepath: file.path,
                reportPath,
                charCount
            });
        }

        // 2️⃣ Compute scores (use original PDF paths or report paths)
        const results = await computeScores(
            extractedReports.map(r => r.filepath)
        );

        // 3️⃣ Clear old results
        await Resume.deleteMany({ userId: req.session.user.id });

        // 4️⃣ Save new results
        for (const [filename, score] of results) {
            const report = extractedReports.find(r =>
                r.filename.includes(filename)
            );

            await new Resume({
                userId: req.session.user.id,
                filename,
                filepath: `upload/${filename}`,
                reportPath: report?.reportPath,
                score
            }).save();
        }

        res.redirect("/result");

    } catch (err) {
        console.error("❌ ERROR:", err);
        res.status(400).json({ error: err.message });
    }
});


/* ======================= RESULTS ======================= */
app.get("/results", isLoggedIn, async (req, res) => {
    const resumes = await Resume.find({ userId: req.session.user.id })
        .sort({ score: -1 });
    res.json({ resumes });
});

/* ======================= LOGOUT ======================= */
app.get("/logout", (req, res) =>
    req.session.destroy(() => res.redirect("/login"))
);

module.exports = app;