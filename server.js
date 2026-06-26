const app = require('./src/app');
const connectDB = require("./db/db");

app.listen(5000, () => {
    console.log("Server is running at 5000")
});

connectDB();