import express from "express";
import { createBooking, getOccupiedSeats, userBookings } from "../controllers/bookingController.js";

const bookingRouter = express.Router();

// --------------------
// Routes
// --------------------

// Create a booking
// Frontend sends x-user-id header
bookingRouter.post("/create", createBooking);

// Get occupied seats for a show
bookingRouter.get("/seats/:showId", getOccupiedSeats);

// Get all bookings for a user
// Frontend sends x-user-id header
bookingRouter.get("/user-bookings", userBookings);

export default bookingRouter;
