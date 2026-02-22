const mongoose = require('mongoose');

async function connectDB() {

    await mongoose.connect("mongodb+srv://Harsh_Goel:Codeitup3210@lexivarank.xb41cau.mongodb.net/?appName=LexivaRank")

    console.log("connected successfully ")
}

module.exports = connectDB