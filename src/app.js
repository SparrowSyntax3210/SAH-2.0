const express = require('express');
const app = express();
const multer = require("multer");
const session = require("express-session");
const path = require("path");

const upload = multer({ dest: "uploads/" });

const authRoutes = require('../routes/auth'); 

// ===== Middleware =====
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ===== View Engine =====
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "..")));

// ===== Routes =====
app.get("/login", (req, res) => {
    res.render('login.ejs');
});

app.get("/register", (req, res) => {
    res.render('register.ejs');
});

app.post("/upload", upload.single("files"), (req, res) => {
    res.json({ success: true });
});

// ✅ use router
app.use("/", authRoutes);

module.exports = app;