const mongoose = require('mongoose');

async function connectDB() {
    
    await mongoose.connect("mongodb+srv://Backend:Alpha_Venom@backend1.yctnny1.mongodb.net/Harsh")

    console.log("connected successfully ")
}

module.exports = connectDB