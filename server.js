const app = require('./src/app1');
const connectDB = require("./db/db");

app.listen(4000, () => {
    console.log("Server is running at 4000")
});

connectDB();