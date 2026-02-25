const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
    filename: String,
    originalName: String,
    extractedText: String,
    score: Number,
    rank: Number,
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Resume", ResumeSchema);