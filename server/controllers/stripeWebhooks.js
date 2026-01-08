import Booking from "../models/Booking.js";
import { sendSuccessEmail } from "./bookingController.js"; // Export the helper

export const stripeWebhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  // Handle successful payment intent
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const bookingId = paymentIntent.metadata.bookingId;
    const userEmail = paymentIntent.metadata.userEmail;

    const booking = await Booking.findById(bookingId).populate({
        path: 'show',
        populate: { path: 'movie' }
    });

    if (booking) {
      booking.isPaid = true;
      await booking.save();

      // Update seats to paid
      const show = await Show.findById(booking.show);
      booking.bookedSeats.forEach(seat => {
        if (show.occupiedSeats[seat]) show.occupiedSeats[seat].isPaid = true;
      });
      show.markModified("occupiedSeats");
      await show.save();

      // Trigger Email
      await sendSuccessEmail(userEmail, booking);
    }
  }

  res.json({ received: true });
};