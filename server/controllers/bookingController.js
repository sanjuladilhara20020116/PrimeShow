import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import stripe from "stripe";

/* =============================
   Check Seat Availability
============================= */
const checkSeatAvailability = async (showId, selectedSeats) => {
  try {
    const showData = await Show.findById(showId);
    if (!showData) return false;

    const occupiedSeats = showData.occupiedSeats;
    const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);

    return !isAnySeatTaken;
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

/* =============================
   Create Booking
============================= */
export const createBooking = async (req, res) => {
  try {
    const { userId } = req;
    const { showId, selectedSeats } = req.body;
    const { origin } = req.headers;

    const isAvailable = await checkSeatAvailability(showId, selectedSeats);
    if (!isAvailable) {
      return res.json({ success: false, message: "Selected seats are not available." });
    }

    const showData = await Show.findById(showId).populate("movie");

    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
      
      isPaid: false
    });

    // Lock seats
    selectedSeats.forEach(seat => {
      showData.occupiedSeats[seat] = userId;
    });
    showData.markModified("occupiedSeats");
    await showData.save();

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-bookings`,
      cancel_url: `${origin}/my-bookings`,
      mode: "payment",
      expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: showData.movie.title },
          unit_amount: Math.floor(booking.amount) * 100
        },
        quantity: 1
      }],
      metadata: {
        bookingId: booking._id.toString()
      }
    });

    booking.paymentLink = session.url;
    await booking.save();

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

/* =============================
   Get Occupied Seats
============================= */
export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const showData = await Show.findById(showId);

    const occupiedSeats = Object.keys(showData.occupiedSeats);
    res.json({ success: true, occupiedSeats });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =============================
   User Bookings
============================= */
export const userBookings = async (req, res) => {
  try {
    const { userId } = req;
    const bookings = await Booking.find({ user: userId })
      .populate({ path: "show", populate: { path: "movie" } });
    res.json({ success: true, bookings });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =============================
   RELEASE EXPIRED SEATS
============================= */
export const releaseExpiredSeats = async () => {
  try {
    // ONLY unpaid bookings with expiresAt in the past
    const expiredBookings = await Booking.find({
      isPaid: false,          // Only unpaid bookings
      expiresAt: { $lt: new Date() } // Expired
    });

    if (expiredBookings.length > 0) {
      console.log(`❌ Releasing ${expiredBookings.length} expired unpaid bookings...`);

      for (const booking of expiredBookings) {
        const show = await Show.findById(booking.show);
        if (show) {
          booking.bookedSeats.forEach(seat => {
            delete show.occupiedSeats[seat]; // free the seat
          });
          show.markModified("occupiedSeats");
          await show.save();
        }
        await Booking.findByIdAndDelete(booking._id);
      }
    }
  } catch (error) {
    console.log("Seat release error:", error.message);
  }
};

