import express from "express";
import cors from "cors";
import "dotenv/config";
import bcrypt from "bcryptjs";

import connectDB from "./configs/db.js";
import User from "./models/User.js";

import showRouter from "./routes/showRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRouter.js";
import userRouter from "./routes/userRoutes.js";



// ✅ IMPORT CRON (AUTO RELEASE UNPAID BOOKINGS)
import { releaseUnpaidBookings } from './cron/releaseUnpaidBookings.js';

const app = express();
const port = process.env.PORT || 3000;

// --------------------
// DATABASE CONNECTION
// --------------------
await connectDB();


// GLOBAL MIDDLEWARES
// --------------------
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// --------------------
// BASIC HEALTH CHECK
// --------------------
app.get("/", (req, res) => {
  res.send("Server is Live!");
});

// --------------------
// API ROUTES
// --------------------
app.use("/api/show", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

// --------------------
// AUTH ROUTES
// --------------------

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      image: `https://avatar.iran.liara.run/username?username=${name}`
    });

    res.json({
      success: true,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        image: newUser.image,
        role: newUser.role
      }
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role
      }
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// UPDATE PROFILE
app.post("/api/user/update", async (req, res) => {
  try {
    const { userId, name, email, image, password } = req.body;

    const updateData = { name, email, image };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// DELETE ACCOUNT
app.delete("/api/user/delete/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Account deleted" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// --------------------
// START SERVER
// --------------------
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});


// Run every 60 seconds
setInterval(() => {
  releaseUnpaidBookings();
}, 10 * 1000);