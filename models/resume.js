const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
    userId: String,
    filename: String,
    filepath: String,
    extractedText: String,   // ✅ NEW FIELD
    score: Number,
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Resume", resumeSchema);