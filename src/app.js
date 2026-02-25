const express = require('express');
const app = express();
const multer = require("multer");
const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");

const authRoutes = require('../routes/auth');

// ===== Multer Config =====
const upload = multer({ dest: "uploads/" });

// ===== Middleware =====
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(__dirname, "..")));

// ===== View Engine =====
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ===== Routes =====
app.get("/login", (req, res) => res.render("login"));
app.get("/register", (req, res) => res.render("register"));
app.get("/upload", (req, res) => res.render("upload"));

// ===============================
// Upload → Python Ranking
// ===============================
app.post("/upload", upload.array("resumes", 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.send("No files uploaded");
        }

        const filePaths = req.files.map(file => file.path);

        exec(`python resume_ranker.py '${JSON.stringify(filePaths)}'`, (error, stdout, stderr) => {
            if (error) {
                console.error(stderr);
                return res.send("Python processing failed");
            }

            const ranking = JSON.parse(stdout);

            // Save results globally
            global.latestResults = ranking.map(([filename, score], index) => {
                const file = req.files.find(f => f.filename === filename);
                return {
                    rank: index + 1,
                    name: file.originalname,
                    score: score.toFixed(2)
                };
            });

            // delete uploaded files
            filePaths.forEach(path => fs.unlink(path, () => { }));

            // Show success + button
            res.send(`
                <h2>Upload Successful </h2>
                <a href="/results"><button>View Results</button></a>
            `);
        });

    } catch (err) {
        console.error(err);
        res.send("Server error");
    }
});

// ===== Render Results =====
app.get("/results", (req, res) => {
    if (!global.latestResults.length) {
        return res.send("No results available. Upload resumes first.");
    }

    res.render("results", { resumes: global.latestResults });
});

app.use("/", authRoutes);

module.exports = app;