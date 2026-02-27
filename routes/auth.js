const express = require("express");
const router = express.Router();
const User = require("../models/users");

// ================= REGISTER =================
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.send("All fields are required");
        }

        const existing = await User.findOne({ email });
        if (existing) return res.send("User already exists");

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

        // ✅ session stored consistently
        req.session.user = user;

        res.redirect("/index.html");
    } catch (err) {
        console.error(err);
        res.send("Login error");
    }
});

module.exports = router;