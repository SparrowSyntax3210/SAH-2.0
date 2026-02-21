const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => res.send("Server running"));

app.post("/upload", upload.array("files"), (req, res) => {
    setTimeout(() => {
        res.json({ success: true });
    }, 1500);
});

module.exports = app;

app.listen(4000, () => console.log("Server running on http://localhost:4000"));