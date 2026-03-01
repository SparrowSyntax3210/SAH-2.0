const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
    filename: String,
    score: Number,

    breakdown: {
        partial: Number,
        relative: Number,
        penalty: Number,
        consistency: Number,
        duplicate: Number
    },

    weighted: {
        partial: Number,
        relative: Number,
        penalty: Number,
        consistency: Number,
        duplicate: Number
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Resume", ResumeSchema);