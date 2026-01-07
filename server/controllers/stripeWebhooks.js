import stripe from "stripe";
import Booking from "../models/Booking.js";

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
    return res.status(400).send(err.message);
  }

  if (event.type === "payment_intent.succeeded") {
    const sessionList = await stripeInstance.checkout.sessions.list({
      payment_intent: event.data.object.id
    });

    const bookingId = sessionList.data[0].metadata.bookingId;

    await Booking.findByIdAndUpdate(bookingId, {
      isPaid: true,
      status: "paid",
      paymentLink: ""
    });
  }

  res.json({ received: true });
};
