import express from 'express';
import { createBooking, getOccupiedSeats, userBookings } from '../controllers/bookingController.js';
import authUser from '../middleware/auth.js'; // Ensure you import your auth middleware

const bookingRouter = express.Router();

// Apply the authUser middleware to the create route
bookingRouter.post('/create', authUser, createBooking); 
bookingRouter.get('/seats/:showId', getOccupiedSeats);
bookingRouter.get('/user-bookings', authUser, userBookings);

export default bookingRouter;