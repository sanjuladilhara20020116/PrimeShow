import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

// Check if user is admin
export const isAdmin = async (req, res) => {
  try {
    const { userid } = req.headers;
    const user = await User.findById(userid);

    if (user && user.role === "admin") {
      res.json({ success: true, isAdmin: true });
    } else {
      res.json({ success: false, isAdmin: false, message: "Access Denied" });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get dashboard data
export const getDashboardData = async (req, res) => {
  try {
    // ✅ Total bookings and revenue
    const bookings = await Booking.find({ isPaid: true });
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((acc, booking) => acc + booking.amount, 0);

    // ✅ Total users
    const totalUser = await User.countDocuments();

    // ✅ Fetch all shows, not just future shows
    const activeShows = await Show.find({})
      .populate("movie")
      .sort({ showDateTime: 1 });

    res.json({
      success: true,
      dashboardData: { totalBookings, totalRevenue, totalUser, activeShows }
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Get all shows
export const getAllShows = async (req, res) => {
  try {
    // ✅ Fetch all shows, not just future shows
    const shows = await Show.find({})
      .populate("movie")
      .sort({ showDateTime: 1 });

    res.json({ success: true, shows });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("user")
      .populate({
        path: "show",
        populate: { path: "movie" }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
