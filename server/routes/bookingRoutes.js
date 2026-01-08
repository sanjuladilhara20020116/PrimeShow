import express from "express";
import { 
    createBooking, 
    getOccupiedSeats, 
    userBookings, 
    getBookingDetails, // New controller function
    confirmPayment     // New controller function
} from "../controllers/bookingController.js";

const bookingRouter = express.Router();

// --------------------
// Routes
// --------------------

// Create a booking (Now returns bookingId instead of Stripe URL)
bookingRouter.post("/create", createBooking);

// Get occupied seats for a show
bookingRouter.get("/seats/:showId", getOccupiedSeats);

// Get all bookings for a user
bookingRouter.get("/user-bookings", userBookings);

// Get details for a single booking (For the Summary/Invoice page)
bookingRouter.get("/details/:bookingId", getBookingDetails);

// Confirm payment and trigger email notifications
bookingRouter.post("/confirm-payment", confirmPayment);

export default bookingRouter;