import express from "express";
import User from "../models/User.js";

const router = express.Router();

/* ---------- SIGN IN ---------- */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: "All fields required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // simple password check (replace with hashed passwords later)
    if (user.password !== password)
      return res.status(401).json({ message: "Invalid password" });

    // set cookie
    res.cookie("userId", user._id, { httpOnly: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
