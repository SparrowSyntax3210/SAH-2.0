const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
    filename: String,
    originalName: String,
    text: String,
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Document", documentSchema);