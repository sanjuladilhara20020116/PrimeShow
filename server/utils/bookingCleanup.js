import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

export const releaseExpiredBookings = async () => {
  const expired = await Booking.find({
    status: "pending",
    isPaid: false,
    expiresAt: { $lte: new Date() }
  });

  for (const booking of expired) {
    const show = await Show.findById(booking.show);
    if (!show) continue;

    booking.bookedSeats.forEach(seat => {
      if (show.occupiedSeats[seat] === booking._id.toString()) {
        delete show.occupiedSeats[seat];
      }
    });

    show.markModified("occupiedSeats");
    await show.save();

    booking.status = "expired";
    booking.paymentLink = "";
    await booking.save();
  }
};
