import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

export const releaseUnpaidBookings = async () => {
  try {
    // Release if older than 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    const unpaidBookings = await Booking.find({
      isPaid: false,
      createdAt: { $lte: twoMinutesAgo }
    });

    for (const booking of unpaidBookings) {
      const show = await Show.findById(booking.show);
      if (!show) continue;

      booking.bookedSeats.forEach(seat => {
        const seatData = show.occupiedSeats[seat];
        // Only release if the seat is still marked as unpaid
        if (seatData && seatData.isPaid === false) {
          delete show.occupiedSeats[seat];
        }
      });

      show.markModified("occupiedSeats");
      await show.save();
      await Booking.findByIdAndDelete(booking._id);
      console.log(`Released unpaid seats for booking ${booking._id}`);
    }
  } catch (err) {
    console.error("Cleanup error:", err.message);
  }
};