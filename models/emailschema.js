const mongoose = require("mongoose");

const EmailSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});
module.exports = mongoose.model("Email", EmailSchema);
