import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Movie from "../models/Movie.js";

// 1. Get User Bookings (Updated to use manual userId)
export const getUserBookings = async (req, res) => {
    try {
        // Updated: Get userId from body (matching your login/update pattern)
        const { userId } = req.body; 

        const bookings = await Booking.find({ user: userId }).populate({
            path: "show",
            populate: { path: "movie" }
        }).sort({ createdAt: -1 });

        res.json({ success: true, bookings });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

// 2. Toggle Favorite Movie
export const updateFavorite = async (req, res) => {
    try {
        const { userId, movieId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const isFavorite = user.favorites.includes(movieId);

        if (isFavorite) {
            // Remove from favorites
            user.favorites = user.favorites.filter((id) => id.toString() !== movieId);
            await user.save();
            return res.json({ success: true, message: "Removed from favorites", favorites: user.favorites });
        } else {
            // Add to favorites
            user.favorites.push(movieId);
            await user.save();
            return res.json({ success: true, message: "Added to favorites", favorites: user.favorites });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Get Full Favorite Movies List
export const getFavorites = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const favorites = user.favorites || [];
        const movies = await Movie.find({ _id: { $in: favorites } });

        res.json({ success: true, movies });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};