import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import Stripe from "stripe";
import nodemailer from "nodemailer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// --- EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendSuccessEmail = async (userEmail, booking) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Booking Confirmed - PrimeShow',
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Booking Successful!</h2>
        <p>Your seats are confirmed for <b>${booking.show.movie.title}</b>.</p>
        <ul>
          <li><strong>Seats:</strong> ${booking.bookedSeats.join(', ')}</li>
          <li><strong>Total Paid:</strong> $${booking.amount}</li>
        </ul>
        <p>Enjoy your movie!</p>
      </div>
    `
  };
  return transporter.sendMail(mailOptions);
};

// --- HELPERS ---
const checkSeatAvailability = async (showId, selectedSeats) => {
  const showData = await Show.findById(showId);
  if (!showData) return false;
  return !selectedSeats.some(seat => showData.occupiedSeats[seat]);
};

// --- EXPORTED CONTROLLERS ---

export const createBooking = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { showId, selectedSeats, userEmail } = req.body;
    const { origin } = req.headers;

    if (!userId || !showId || !selectedSeats?.length) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    const isAvailable = await checkSeatAvailability(showId, selectedSeats);
    if (!isAvailable) return res.json({ success: false, message: "Seats already taken" });

    const showData = await Show.findById(showId).populate("movie");

    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
      isPaid: false
    });

    // Temporary seat lock
    selectedSeats.forEach(seat => {
      showData.occupiedSeats[seat] = { user: userId, isPaid: false };
    });
    showData.markModified("occupiedSeats");
    await showData.save();

    // Create Payment Intent (Seamless checkout)
    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/my-bookings`,
      cancel_url: `${origin}/my-bookings`,
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: showData.movie.title },
          unit_amount: booking.amount * 100
        },
        quantity: 1
      }],
      metadata: { bookingId: booking._id.toString(), userEmail },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60
    });

    booking.paymentLink = session.url;
    await booking.save();

    res.json({ success: true, url: session.url });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getOccupiedSeats = async (req, res) => {
  try {
    const showData = await Show.findById(req.params.showId);
    res.json({ success: true, occupiedSeats: Object.keys(showData.occupiedSeats || {}) });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const userBookings = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const bookings = await Booking.find({ user: userId })
      .populate({ path: "show", populate: { path: "movie" } });
    res.json({ success: true, bookings });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};