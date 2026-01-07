import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import connectDB from './configs/db.js';
import User from './models/User.js';
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRouter.js';
import userRouter from './routes/userRoutes.js';
import stripe from 'stripe';
import Booking from './models/Booking.js';

const app = express();
const port = 3000;

await connectDB();

// -----------------------------
// Global Seat Lock Map
// -----------------------------
export const lockedSeats = {}; // { showId: { seatId: { userId, expiresAt } } }

// -----------------------------
// Stripe Webhook
// -----------------------------
const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

const stripeWebhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Stripe webhook error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;

        // Find the checkout session linked to this payment
        const sessions = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id
        });
        const session = sessions.data[0];
        const { bookingId } = session.metadata;

        // Update booking to paid
        const booking = await Booking.findByIdAndUpdate(
          bookingId,
          { isPaid: true },
          { new: true }
        );

        // Remove locked seats for this booking since it's paid
        if (booking) {
          const showId = booking.show.toString();
          if (lockedSeats[showId]) {
            booking.bookedSeats.forEach(seat => {
              delete lockedSeats[showId][seat];
              console.log(`[Toast] Seat ${seat} permanently booked by user ${booking.user}`);
            });
          }
        }

        console.log(`[Toast] Booking ${bookingId} payment succeeded`);
        break;

      default:
        console.log("Unhandled event type:", event.type);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.status(500).send("Internal Server Error");
  }
};

// Stripe raw body middleware for webhooks
app.use('/api/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// -----------------------------
// Middleware
// -----------------------------
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(cors());

// -----------------------------
// API Routes
// -----------------------------
app.get('/', (req, res) => res.send('Server is Live!'));
app.use('/api/show', showRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);

// -----------------------------
// AUTH ROUTES
// -----------------------------

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
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
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });

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
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// Update Profile
app.post('/api/user/update', async (req, res) => {
  try {
    const { userId, name, email, image, password } = req.body;
    const updateData = { name, email, image };
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");
    if (!updatedUser) return res.json({ success: false, message: "User not found" });

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// Delete Account
app.delete('/api/user/delete/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.json({ success: false, message: "User not found" });

    res.json({ success: true, message: "Account deleted" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// -----------------------------
// Start Server
// -----------------------------
app.listen(port, () => console.log(`Server listening at http://localhost:${port}`));
