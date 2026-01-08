import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import { sendBookingEmail } from "../utils/emailService.js";

// Helper: Check seat availability
const checkSeatAvailability = async (showId, selectedSeats) => {
  const show = await Show.findById(showId);
  if (!show) return false;
  return !selectedSeats.some(seat => show.occupiedSeats[seat]);
};

// CREATE BOOKING (Returns bookingId for frontend redirection)
export const createBooking = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { showId, selectedSeats } = req.body;

    if (!userId || !showId || !selectedSeats?.length) {
      return res.json({ success: false, message: "Invalid booking data" });
    }

    const available = await checkSeatAvailability(showId, selectedSeats);
    if (!available) {
      return res.json({ success: false, message: "Seats no longer available" });
    }

    const show = await Show.findById(showId).populate("movie");

    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: show.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
      isPaid: false
    });

    // Lock seats temporarily (unpaid)
    selectedSeats.forEach(seat => {
      show.occupiedSeats[seat] = { user: userId, isPaid: false };
    });

    show.markModified("occupiedSeats");
    await show.save();

    res.json({ success: true, bookingId: booking._id });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// GET SINGLE BOOKING DETAILS (For Summary/Invoice Page)
export const getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate({
      path: "show",
      populate: { path: "movie" },
    });
    if (!booking) return res.json({ success: false, message: "Booking not found" });
    res.json({ success: true, booking });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// CONFIRM PAYMENT & SEND EMAIL
export const confirmPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // 1. Find and populate booking details (IMPORTANT: populate 'user' for email)
    const booking = await Booking.findById(bookingId)
      .populate({ path: 'show', populate: { path: 'movie' } })
      .populate('user'); 

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    // 2. Update Payment Status
    booking.isPaid = true;
    await booking.save();

    // 3. Update Show seats to isPaid: true
    const show = await Show.findById(booking.show._id);
    booking.bookedSeats.forEach(seat => {
      if (show.occupiedSeats[seat]) {
        show.occupiedSeats[seat].isPaid = true;
      }
    });
    show.markModified("occupiedSeats");
    await show.save();

    // 4. Send Email (Wait for this to complete)
    try {
      await sendBookingEmail(booking);
      console.log("Email sent successfully to:", booking.user.email);
    } catch (emailErr) {
      console.error("Email failed but payment succeeded:", emailErr.message);
      // We don't return error here so user still sees the success UI
    }

    // 5. Send success response with updated booking data
    res.json({ success: true, message: "Payment successful", booking });
  } catch (err) {
    console.error("Payment confirmation error:", err);
    res.json({ success: false, message: err.message });
  }
};

export const getOccupiedSeats = async (req, res) => {
  const show = await Show.findById(req.params.showId);
  res.json({ success: true, occupiedSeats: Object.keys(show.occupiedSeats || {}) });
};

export const userBookings = async (req, res) => {
  const userId = req.headers["x-user-id"];
  const bookings = await Booking.find({ user: userId })
    .populate({ path: "show", populate: { path: "movie" } })
    .sort({ createdAt: -1 });

  res.json({ success: true, bookings });
};