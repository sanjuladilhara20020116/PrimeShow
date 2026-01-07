// stripeWebhooks.js
import Booking from "../models/Booking.js";

export const stripeWebhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata.bookingId;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).send("Booking not found");

    // Mark booking as paid
    booking.isPaid = true;
    await booking.save();
  }

  res.json({ received: true });
};
