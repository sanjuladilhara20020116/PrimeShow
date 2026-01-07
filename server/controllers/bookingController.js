import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import Stripe from "stripe";

/* ----------------------------------
   Helper: Check seat availability
----------------------------------- */
const checkSeatAvailability = async (showId, selectedSeats) => {
  try {
    const showData = await Show.findById(showId);
    if (!showData) return false;

    const occupiedSeats = showData.occupiedSeats || {};

    const isAnySeatTaken = selectedSeats.some(
      (seat) => occupiedSeats[seat]
    );

    return !isAnySeatTaken;
  } catch (error) {
    console.log("Seat availability error:", error.message);
    return false;
  }
};

/* ----------------------------------
   Helper: Release unpaid booking
----------------------------------- */
const releaseUnpaidBooking = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return;

    // Payment already done → do nothing
    if (booking.isPaid) return;

    const show = await Show.findById(booking.show);
    if (!show) return;

    booking.bookedSeats.forEach((seat) => {
      delete show.occupiedSeats[seat];
    });

    show.markModified("occupiedSeats");
    await show.save();

    await Booking.findByIdAndDelete(bookingId);

    console.log(`Unpaid booking ${bookingId} released`);
  } catch (error) {
    console.log("Release booking error:", error.message);
  }
};

/* ----------------------------------
   Create Booking
----------------------------------- */
export const createBooking = async (req, res) => {
  try {
    const { userId } = req;
    const { showId, selectedSeats } = req.body;
    const { origin } = req.headers;

    if (!showId || !selectedSeats?.length) {
      return res.json({
        success: false,
        message: "Invalid booking data",
      });
    }

    // Check seat availability
    const isAvailable = await checkSeatAvailability(
      showId,
      selectedSeats
    );

    if (!isAvailable) {
      return res.json({
        success: false,
        message: "Selected seats are not available",
      });
    }

    // Get show details
    const showData = await Show.findById(showId).populate("movie");
    if (!showData) {
      return res.json({
        success: false,
        message: "Show not found",
      });
    }

    // Create booking
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
      isPaid: false,
    });

    // Block seats
    selectedSeats.forEach((seat) => {
      showData.occupiedSeats[seat] = userId;
    });

    showData.markModified("occupiedSeats");
    await showData.save();

    // Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      success_url: `${origin}/loading/my-bookings`,
      cancel_url: `${origin}/my-bookings`,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: showData.movie.title,
            },
            unit_amount: Math.floor(booking.amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: booking._id.toString(),
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    booking.paymentLink = session.url;
    await booking.save();

    // Auto-release after 10 minutes (SAFE MODE)
    setTimeout(() => {
      releaseUnpaidBooking(booking._id);
    }, 10 * 60 * 1000);

    res.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.log("Create booking error:", error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

/* ----------------------------------
   Get occupied seats
----------------------------------- */
export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;

    const showData = await Show.findById(showId);
    if (!showData) {
      return res.json({
        success: false,
        message: "Show not found",
      });
    }

    const occupiedSeats = Object.keys(
      showData.occupiedSeats || {}
    );

    res.json({
      success: true,
      occupiedSeats,
    });
  } catch (error) {
    console.log("Get seats error:", error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

/* ----------------------------------
   User bookings
----------------------------------- */
export const userBookings = async (req, res) => {
  try {
    const { userId } = req;

    const bookings = await Booking.find({ user: userId })
      .populate({
        path: "show",
        populate: { path: "movie" },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.log("User bookings error:", error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
