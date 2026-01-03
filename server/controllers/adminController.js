// API to check if user is admin
export const isAdmin = async (req, res) => {
    try {
        const { userid } = req.headers; // Or however you pass the ID
        const user = await User.findById(userid);
        
        if (user && user.role === 'admin') {
            res.json({ success: true, isAdmin: true });
        } else {
            res.json({ success: false, isAdmin: false, message: "Access Denied" });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// API to get dashboard data
export const getDashboardData = async (req, res) => {
    try {
        const bookings = await Booking.find({isPaid: true});
        const activeShows = await Show.find({showDateTime: {$gte: new Date()}}).
        populate('movie');

        const totalUser = await User.countDocuments();

        const dashboardData = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((acc, booking)=> acc + booking.amount, 0),
            activeShows,
            totalUser
        }

        res.json({success: true, dashboardData})
    } catch (error) {
      console.error(error);
      res.json({success: false, message: error.message})
        
    }
}

// API to get all shows
export const getAllShows = async (req, res) => {
    try {
        const shows = await Show.find({ showDateTime: { $gte: new Date() } }).populate
        ('movie').sort({ showDateTime: 1 })
        res.json({ success: true, shows })
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}


// API to get all bookings
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({}).populate('user').populate({
            path: "show",
            populate: {path: "movie"}
        }).sort({ createdAt: -1 })
        res.json({success: true, bookings })
    } catch (error) {
        console.error(error);
        res.json({success: false, message: error.message})
    }
}