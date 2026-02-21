const express = require('express');

const app = express();

module.exports = app;

app.get("/login" , (req,res) => {
    res.render("login.ejs");
});