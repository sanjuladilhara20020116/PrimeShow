import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
export const releaseUnpaidBookings = async () => {
  const expiryTime = new Date(Date.now() - 1 * 60 * 1000); // 10 min window

  const unpaidBookings = await Booking.find({
    isPaid: false,
    createdAt: { $lt: expiryTime }
  });

  for (let booking of unpaidBookings) {
    const show = await Show.findById(booking.show);
    if (!show) continue;
// Inside the loop in releaseUnpaidBookings.js
booking.bookedSeats.forEach(seat => {
  const seatInfo = show.occupiedSeats[seat];
  
  // ONLY release if it is still "locked" and belongs to this booking
  if (seatInfo && seatInfo.status === "locked" && seatInfo.userId === booking.user.toString()) {
    delete show.occupiedSeats[seat];
  }
});

    show.markModified("occupiedSeats");
    await show.save();
    await Booking.findByIdAndDelete(booking._id);
  }
};