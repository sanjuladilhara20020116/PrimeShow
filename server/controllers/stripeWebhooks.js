import stripe from "stripe";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js"; // Added import

export const stripeWebhooks = async (request, response) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers["stripe-signature"];

    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (error) {
        return response.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
        switch (event.type) {
            // SUCCESS: User paid for the booking
            case "checkout.session.completed": {
                const session = event.data.object;
                const { bookingId } = session.metadata;

                await Booking.findByIdAndUpdate(bookingId, {
                    isPaid: true,
                    paymentLink: ""
                });
                break;
            }

            // FAILURE/EXPIRY: Release seats if session expires or payment fails
            case "checkout.session.expired": {
                const session = event.data.object;
                const { bookingId } = session.metadata;

                const booking = await Booking.findById(bookingId);

                if (booking && !booking.isPaid) {
                    const show = await Show.findById(booking.show);
                    
                    if (show) {
                        // Remove seats from occupiedSeats object
                        booking.bookedSeats.forEach((seat) => {
                            delete show.occupiedSeats[seat];
                        });

                        show.markModified('occupiedSeats');
                        await show.save();
                    }

                    // Delete the unpaid booking record
                    await Booking.findByIdAndDelete(bookingId);
                }
                break;
            }

            default:
                console.log('Unhandled event type:', event.type);
        }
        
        response.json({ received: true });

    } catch (err) {
        console.error("Webhook processing error:", err);
        response.status(500).send("Internal Server Error");
    }
}