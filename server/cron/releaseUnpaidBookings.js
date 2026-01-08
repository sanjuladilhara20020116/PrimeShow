import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

export const releaseUnpaidBookings = async () => {
  try {
    console.log("Running unpaid booking cleanup...");

    const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);

    const unpaidBookings = await Booking.find({
      isPaid: false,
      createdAt: { $lte: oneMinuteAgo }
    });

    for (const booking of unpaidBookings) {
      const show = await Show.findById(booking.show);
      if (!show) continue;

      const releasedSeats = [];

      booking.bookedSeats.forEach(seat => {
        const seatData = show.occupiedSeats[seat];
        if (seatData && seatData.isPaid === false) {
          delete show.occupiedSeats[seat];
          releasedSeats.push(seat);
        }
      });

      if (releasedSeats.length > 0) {
        show.markModified("occupiedSeats");
        await show.save();
        console.log(`Released unpaid seats [${releasedSeats}] for booking ${booking._id}`);
      }

      // ✅ only delete unpaid bookings
      await Booking.findByIdAndDelete(booking._id);
    }
  } catch (err) {
    console.error("Error in releasing unpaid bookings:", err.message);
  }
};
