const express = require("express");
const User = require("../db/userModel");
const bcrypt = require("bcrypt");
const router = express.Router();

/**
 * POST /admin/login
 */
router.post("/login", async (req, res) => {
  const { login_name, password } = req.body;

  if (!login_name||!password) {
    return res.status(400).json({ error: "login_name and password is required" });
  }

  try {
    const user = await User.findOne({ login_name }).exec();
    if (!user) {
      return res.status(400).json({ error: "Invalid login_name" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
      return res.status(400).json({error: "Invalid password"});
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

/**
 * POST /admin/register
 * Register new user
 */
router.post("/register", async (req,res)=>{
  const {login_name, password, first_name, last_name, location, description, occupation} = req.body;
  if (!login_name || !password || !first_name || !last_name) {
    return res.status(400).json({ 
      error: "login_name, password, first_name, and last_name are required" 
    });
  }
  if (password.length < 6) {
    return res.status(400).json({ 
      error: "Password must be at least 6 characters long" 
    });
  }
   try{
    const existingUser = await User.findOne({login_name}).exec();
    if(existingUser){
      return res.status(400).json({error: "Login name already exists"});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      login_name,
      password: hashedPassword,
      first_name,
      last_name,
      location: location||"",
      description: description||"",
      occupation: occupation||"",
    });
    await newUser.save();
    req.session.user={
      _id: newUser._id.toString(),
      first_name: newUser.first_name,
      last_name: newUser.last_name,
    };
    req.session.save((err)=>{
      if(err){
        console.error("Session save error:", err);
        return res.status(500).json({error: "Registration successful but login failed"})
      }
      return res.status(200).json({
        login_name:newUser.login_name,
        _id: newUser._id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
      })
    })
   }
   catch(err){
    console.error("Registration error:", err);
    return res.status(500).json({error:"Internal server error"});
   }
})
module.exports = router;


