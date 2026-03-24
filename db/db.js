const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://Harsh_Goel:Codeitup3210@ac-vntoigj-shard-00-00.fkgav3q.mongodb.net:27017,ac-vntoigj-shard-00-01.fkgav3q.mongodb.net:27017,ac-vntoigj-shard-00-02.fkgav3q.mongodb.net:27017/?ssl=true&replicaSet=atlas-hkby0s-shard-0&authSource=admin&appName=LexivaRank");

        console.log("DB Connected");
    } catch (error) {
        console.error("Connection error:", error.message);
    }
};

module.exports = connectDB;