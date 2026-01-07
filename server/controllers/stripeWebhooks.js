import stripe from "stripe";
import Booking from "../models/Booking.js";

const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // When payment is successful
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata.bookingId;

    // ✅ FIX: Mark booking as paid so releaseExpiredSeats() ignores it
    await Booking.findByIdAndUpdate(bookingId, { isPaid: true });
    console.log(`✅ Booking ${bookingId} paid and secured.`);
  }

  res.json({ received: true });
};