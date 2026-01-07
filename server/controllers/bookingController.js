import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import stripe from "stripe";

// Map to track temporarily locked seats: { showId: { seatId: { userId, expiresAt } } }
const lockedSeats = {};

// Check seat availability (paid + locked)
const checkSeatAvailability = async (showId, selectedSeats, userId) => {
  try {
    const showData = await Show.findById(showId);
    if (!showData) return false;

    const occupiedSeats = showData.occupiedSeats || {};

    // Check if any seat is already paid/booked
    const isOccupied = selectedSeats.some(seat => occupiedSeats[seat]);
    if (isOccupied) return false;

    // Check locked seats
    if (lockedSeats[showId]) {
      const now = Date.now();
      const isLocked = selectedSeats.some(seat => {
        const lock = lockedSeats[showId][seat];
        return lock && lock.expiresAt > now && lock.userId !== userId;
      });
      if (isLocked) return false;
    }

    return true;
  } catch (error) {
    console.error(error.message);
    return false;
  }
};

// Lock selected seats for 1 min
const lockSeats = (showId, seats, userId) => {
  if (!lockedSeats[showId]) lockedSeats[showId] = {};
  const expiresAt = Date.now() + 60 * 1000; // 1 min
  seats.forEach(seat => {
    lockedSeats[showId][seat] = { userId, expiresAt };
    console.log(`[Toast] Seat ${seat} locked for user ${userId}`);
  });

  // Auto-release seats after 1 min if not paid
  setTimeout(() => {
    seats.forEach(seat => {
      if (
        lockedSeats[showId]?.[seat] &&
        lockedSeats[showId][seat].userId === userId
      ) {
        delete lockedSeats[showId][seat];
        console.log(`[Toast] Seat ${seat} auto-released (unpaid)`);
      }
    });
  }, 60 * 1000);
};

// Create Booking
export const createBooking = async (req, res) => {
  try {
    const { userId } = req; // from auth middleware
    const { showId, selectedSeats } = req.body;
    const { origin } = req.headers;

    const isAvailable = await checkSeatAvailability(showId, selectedSeats, userId);
    if (!isAvailable) {
      return res.json({ success: false, message: "Selected seats are not available" });
    }

    // Lock seats
    lockSeats(showId, selectedSeats, userId);

    const showData = await Show.findById(showId).populate("movie");

    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats
    });

    // Stripe checkout
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-bookings`,
      cancel_url: `${origin}/my-bookings`,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: showData.movie.title },
            unit_amount: Math.floor(booking.amount) * 100
          },
          quantity: 1
        }
      ],
      mode: "payment",
      metadata: { bookingId: booking._id.toString() },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60
    });

    booking.paymentLink = session.url;
    await booking.save();

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get Occupied Seats (paid + locked)
export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const showData = await Show.findById(showId);

    // Paid/occupied seats
    const occupiedSeats = Object.keys(showData.occupiedSeats || {});

    // Add temporarily locked seats
    const now = Date.now();
    const locked = lockedSeats[showId]
      ? Object.entries(lockedSeats[showId])
          .filter(([_, lock]) => lock.expiresAt > now)
          .map(([seat]) => seat)
      : [];

    res.json({ success: true, occupiedSeats: [...occupiedSeats, ...locked] });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// User Bookings
export const userBookings = async (req, res) => {
  try {
    const { userId } = req;
    const bookings = await Booking.find({ user: userId })
      .populate({ path: "show", populate: { path: "movie" } });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};
