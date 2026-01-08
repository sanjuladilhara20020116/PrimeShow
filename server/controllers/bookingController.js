import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// CHECK SEAT AVAILABILITY
const checkSeatAvailability = async (showId, selectedSeats) => {
  const show = await Show.findById(showId);
  if (!show) return false;
  return !selectedSeats.some(seat => show.occupiedSeats[seat]);
};

// CREATE BOOKING
export const createBooking = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { showId, selectedSeats } = req.body;
    const { origin } = req.headers;

    if (!userId || !showId || !selectedSeats?.length) {
      return res.json({ success: false, message: "Invalid booking data" });
    }

    const available = await checkSeatAvailability(showId, selectedSeats);
    if (!available) {
      return res.json({ success: false, message: "Seats not available" });
    }

    const show = await Show.findById(showId).populate("movie");

    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: show.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
      isPaid: false
    });

    // lock seats
    selectedSeats.forEach(seat => {
      show.occupiedSeats[seat] = { user: userId, isPaid: false };
    });

    show.markModified("occupiedSeats");
    await show.save();

    // STRIPE CHECKOUT
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/my-bookings`,
      cancel_url: `${origin}/my-bookings`,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: show.movie.title },
            unit_amount: booking.amount * 100
          },
          quantity: 1
        }
      ],
      metadata: { bookingId: booking._id.toString() },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60
    });

    booking.paymentLink = session.url;
    await booking.save();

    res.json({ success: true, url: session.url });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// GET OCCUPIED SEATS
export const getOccupiedSeats = async (req, res) => {
  const show = await Show.findById(req.params.showId);
  res.json({ success: true, occupiedSeats: Object.keys(show.occupiedSeats) });
};

// USER BOOKINGS
export const userBookings = async (req, res) => {
  const userId = req.headers["x-user-id"];
  const bookings = await Booking.find({ user: userId })
    .populate({ path: "show", populate: { path: "movie" } });

  res.json({ success: true, bookings });
};
