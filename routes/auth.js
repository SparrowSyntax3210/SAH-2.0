// routes/auth.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const User = require("../models/users");

const upload = multer({ dest: "uploads/" });

// show pages
router.get("/login", (req, res) => {
    res.render("login.ejs");
});

router.get("/register", (req, res) => {
    res.render("register.ejs");
});

// register user + upload profile image
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const newUser = new User({ username, email, password });
        await newUser.save();

        // ✅ redirect to login after save
        res.redirect("/login");

    } catch (err) {
        console.error(err);
        res.send("Error saving user");
    }
});

router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email, password });
  
      if (!user) {
        return res.send("Invalid email or password ❌");
      }
  
      // redirect with login flag
      res.redirect("/?login=success");
  
    } catch (err) {
      console.error(err);
      res.send("Login error");
    }
  });

router.get("/logout", (req, res) => {
    res.redirect("/index.html");
  });

router.get("/home", (req, res) => {
    res.redirect("/index.html");
});

module.exports = router;