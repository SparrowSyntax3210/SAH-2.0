const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://Harsh_Goel:Codeitup3210@lexivarank.xb41cau.mongodb.net/myAppDB"
        );

        console.log("DB Connected");
    } catch (error) {
        console.error("Connection error:", error.message);
    }
};

module.exports = connectDB;