import stripe from "stripe";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js"; 

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

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata.bookingId;

      // 1. Find the booking and populate the show to access occupiedSeats
      const booking = await Booking.findById(bookingId).populate("show");
      
      if (booking) {
        // 2. Mark the booking itself as paid
        booking.isPaid = true;
        booking.paymentLink = "";
        await booking.save();

        // 3. Update the Show document to change seat status to 'confirmed'
        const show = await Show.findById(booking.show);
        if (show) {
          booking.bookedSeats.forEach((seat) => {
            if (show.occupiedSeats[seat]) {
              // This status change prevents the Cron job from releasing the seat
              show.occupiedSeats[seat].status = "confirmed";
            }
          });

          // Inform Mongoose that the nested object 'occupiedSeats' has changed
          show.markModified("occupiedSeats");
          await show.save();
          
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.status(500).send("Internal Server Error");
  }
};