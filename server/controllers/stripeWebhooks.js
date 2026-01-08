import Stripe from "stripe";
import Booking from "../models/Booking.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,               // MUST be raw body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook verification failed:", err.message);
    return res.status(400).send(err.message);
  }

  console.log("✅ Stripe Event:", event.type);

  // ✅ THIS = CHECKOUT SUCCESS
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    console.log("👉 Payment status:", session.payment_status);
    console.log("👉 Booking ID:", session.metadata?.bookingId);

    if (session.payment_status === "paid") {
      const booking = await Booking.findById(session.metadata.bookingId);

      if (!booking) {
        console.error("❌ Booking not found");
        return res.json({ received: true });
      }

      // ✅ THIS IS THE STATE CHANGE YOU WANT
      booking.isPaid = true;
      booking.paidAt = new Date();
      await booking.save();

      console.log("✅ BOOKING UPDATED → isPaid = true");
    }
  }

  res.json({ received: true });
};
