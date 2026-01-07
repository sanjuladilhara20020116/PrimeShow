import stripe from "stripe";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

export const stripeWebhooks = async (req, res) => {
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
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

  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const sessions = await stripeInstance.checkout.sessions.list({ payment_intent: paymentIntent.id });
      const session = sessions.data[0];
      const { bookingId } = session.metadata;

      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        { isPaid: true, paymentLink: "" },
        { new: true }
      );

      const show = await Show.findById(booking.show);
      booking.bookedSeats.forEach(seat => {
        show.occupiedSeats.set(seat, booking.user);
        show.lockedSeats.delete(seat);
        console.log(`[Toast] Seat ${seat} marked as PAID for booking ${bookingId}`);
      });

      await show.save();
    } else {
      console.log('Unhandled event type:', event.type);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.status(500).send("Internal Server Error");
  }
};
