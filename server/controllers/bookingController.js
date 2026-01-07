import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Check seat availability
const checkSeatAvailability = async (showId, selectedSeats) => {
  try {
    const showData = await Show.findById(showId);
    if (!showData) return false;

    // If any selected seat is occupied, cannot book
    return !selectedSeats.some(seat => showData.occupiedSeats[seat]);
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

// CREATE BOOKING
export const createBooking = async (req, res) => {
  try {
    const userId = req.headers['x-user-id']; // get userId from frontend
    const { showId, selectedSeats } = req.body;
    const { origin } = req.headers;

    if (!userId || !showId || !selectedSeats || selectedSeats.length === 0) {
      return res.json({
        success: false,
        message: "Invalid booking data. Please provide userId, showId and selectedSeats."
      });
    }

    const isAvailable = await checkSeatAvailability(showId, selectedSeats);
    if (!isAvailable) {
      return res.json({ success: false, message: "Selected seats are not available." });
    }

    const showData = await Show.findById(showId).populate("movie");

    // Create booking
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
      isPaid: false
    });

    // Lock seats temporarily (isPaid=false)
    selectedSeats.forEach(seat => {
      showData.occupiedSeats[seat] = { user: userId, isPaid: false };
    });
    showData.markModified("occupiedSeats");
    await showData.save();

    // Stripe Checkout
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
      metadata: { bookingId: booking._id.toString() },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60
    });

    booking.paymentLink = session.url;
    await booking.save();

    res.json({ success: true, url: session.url });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// GET OCCUPIED SEATS
export const getOccupiedSeats = async (req, res) => {
  try {
    const showData = await Show.findById(req.params.showId);
    res.json({ success: true, occupiedSeats: Object.keys(showData.occupiedSeats) });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// USER BOOKINGS
export const userBookings = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.json({ success: false, message: "User ID is required." });

    const bookings = await Booking.find({ user: userId })
      .populate({ path: "show", populate: { path: "movie" } });

    res.json({ success: true, bookings });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
