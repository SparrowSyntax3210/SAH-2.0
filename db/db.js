const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.Mongo_Url);

        console.log("DB Connected");
    } catch (error) {
        console.error("Connection error:", error.message);
    }
};

module.exports = connectDB;