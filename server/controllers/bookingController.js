import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import stripe from 'stripe';

const checkSeatAvailability = async (showId, selectedSeats) => {
    try {
        const showData = await Show.findById(showId);
        if (!showData) return false;

        const occupiedSeats = showData.occupiedSeats;
        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);

        return !isAnySeatTaken;
    } catch (error) {
        return false;
    }
};

export const createBooking = async (req, res) => {
    try {
        const { userId } = req;
        const { showId, selectedSeats } = req.body;
        const { origin } = req.headers;

        const isAvailable = await checkSeatAvailability(showId, selectedSeats);

        if (!isAvailable) {
            return res.json({ success: false, message: "Selected seats are no longer available." });
        }

        const showData = await Show.findById(showId).populate('movie');

        // 1. Create the booking record
        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: showData.showPrice * selectedSeats.length,
            bookedSeats: selectedSeats
        });

        // 2. Temporarily occupy seats using Booking ID
        selectedSeats.forEach((seat) => {
            showData.occupiedSeats[seat] = booking._id; 
        });

        showData.markModified('occupiedSeats');
        await showData.save();

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        const line_items = [{
            price_data: {
                currency: 'usd',
                product_data: { name: showData.movie.title },
                unit_amount: Math.floor(booking.amount) * 100
            },
            quantity: 1
        }];

        // 3. Create session with expiry
        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-bookings`,
            cancel_url: `${origin}/my-bookings`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                bookingId: booking._id.toString()
            },
            expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 mins
        });

        booking.paymentLink = session.url;
        await booking.save();

        res.json({ success: true, url: session.url });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getOccupiedSeats = async (req, res) => {
    try {
        const { showId } = req.params;
        const showData = await Show.findById(showId);
        const occupiedSeats = Object.keys(showData.occupiedSeats);
        res.json({ success: true, occupiedSeats });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const userBookings = async (req, res) => {
    try {
        const { userId } = req;
        const bookings = await Booking.find({ user: userId })
            .populate({
                path: 'show',
                populate: { path: 'movie' }
            });
        res.json({ success: true, bookings });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};