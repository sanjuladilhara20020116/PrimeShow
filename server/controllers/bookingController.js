import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import stripe from "stripe";

// FIXED availability check
const checkSeatAvailability = async (showId, selectedSeats) => {
  const show = await Show.findById(showId);
  if (!show) return false;

  return !selectedSeats.some(seat => show.occupiedSeats[seat] !== undefined);
};

export const createBooking = async (req, res) => {
  try {
    const { userId } = req;
    const { showId, selectedSeats } = req.body;
    const { origin } = req.headers;

    const available = await checkSeatAvailability(showId, selectedSeats);
    if (!available)
      return res.json({ success: false, message: "Seats not available" });

    const showData = await Show.findById(showId).populate("movie");

    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000),
      status: "pending"
    });

    // ✅ STORE bookingId in seats
    selectedSeats.forEach(seat => {
      showData.occupiedSeats[seat] = booking._id.toString();
    });

    showData.markModified("occupiedSeats");
    await showData.save();

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-bookings`,
      cancel_url: `${origin}/my-bookings`,
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: showData.movie.title },
          unit_amount: Math.floor(booking.amount) * 100
        },
        quantity: 1
      }],
      metadata: { bookingId: booking._id.toString() }
    });

    booking.paymentLink = session.url;
    await booking.save();

    res.json({ success: true, url: session.url });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

export const getOccupiedSeats = async (req, res) => {
  const show = await Show.findById(req.params.showId);
  res.json({ success: true, occupiedSeats: Object.keys(show.occupiedSeats) });
};

export const userBookings = async (req, res) => {
  const { userId } = req;
  const bookings = await Booking.find({ user: userId })
    .populate({ path: "show", populate: { path: "movie" } });

  res.json({ success: true, bookings });
};
