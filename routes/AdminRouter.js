const express = require("express");
const User = require("../db/userModel");
const router = express.Router();

/**
 * POST /admin/login
 */
router.post("/login", async (req, res) => {
  const { login_name } = req.body;

  if (!login_name) {
    return res.status(400).json({ error: "login_name is required" });
  }

  try {
    const user = await User.findOne({ login_name }).exec();
    if (!user) {
      return res.status(400).json({ error: "Invalid login_name" });
    }

    req.session.user = {
      _id: user._id.toString(), 
      first_name: user.first_name,
      last_name: user.last_name,
    };

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ error: "Session error" });
      }
      return res.status(200).json(req.session.user);
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /admin/logout
 */
router.post("/logout", (req, res) => {
  if (!req.session.user) {
    return res.status(400).json({ error: "Not logged in" });
  }

  req.session.destroy(() => {
    res.status(200).json({ message: "Logged out" });
  });
});

module.exports = router;


