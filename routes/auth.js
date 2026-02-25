const express = require("express");
const router = express.Router();
const User = require("../models/users");

// ================= SHOW PAGES =================

router.get("/login", (req, res) => res.render("login"));
router.get("/register", (req, res) => res.render("register"));

// ================= REGISTER =================
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.redirect("/login");
    } catch (err) {
        console.error(err);
        res.send("Error saving user");
    }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });

        if (!user) return res.send("Invalid email or password ❌");

        res.redirect("/?login=success");
    } catch (err) {
        console.error(err);
        res.send("Login error");
    }
});

// ================= HOME =================
router.get("/home", (req, res) => {
    res.redirect("/index.html");
});

module.exports = router;