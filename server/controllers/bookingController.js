import Booking from "../models/Booking.js";
import Show from "../models/Show.js"
import stripe from 'stripe'

//functon to check availability of selected seates for a movie
const checkSeatAvailability = async(showId, selectedSeats)=>{
  try{
    const showData=await Show.findById(showId)
    if(!showData) return false;

    const occupiedSeats=showData.occupiedSeats;

    const isAnySeatTaken=selectedSeats.some(seat=>occupiedSeats[seat]);

    return !isAnySeatTaken;

  }catch(error){
    console.log(error.message);
    return false;
  }
}

// NEW: Function to release seats for expired/unpaid bookings
export const releaseSeat = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId);
    
    if (!booking || booking.isPaid) {
      return; // Don't release if booking doesn't exist or is already paid
    }

    const show = await Show.findById(booking.show);
    
    if (!show) {
      return;
    }

    // Release each booked seat
    booking.bookedSeats.forEach(seat => {
      if (show.occupiedSeats[seat] === booking.user) {
        delete show.occupiedSeats[seat];
      }
    });

    show.markModified('occupiedSeats');
    await show.save();

    console.log(`Seats released for booking: ${bookingId}`);
  } catch (error) {
    console.error('Error releasing seats:', error.message);
  }
};

// NEW: Check and release expired bookings
export const checkExpiredBookings = async (req, res) => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    // Find unpaid bookings older than 30 minutes
    const expiredBookings = await Booking.find({
      isPaid: false,
      createdAt: { $lt: thirtyMinutesAgo }
    });

    let releasedCount = 0;

    for (const booking of expiredBookings) {
      await releaseSeat(booking._id.toString());
      releasedCount++;
    }

    res.json({ 
      success: true, 
      message: `Released ${releasedCount} expired bookings` 
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const createBooking=async(req,res)=>{
  try{
    //const {userId} = req.auth();
    const { userId } = req; 
    const { showId, selectedSeats } = req.body;
    const {origin} = req.headers;


    //check if the set is available for the selected show
    const isAvailable =await checkSeatAvailability(showId,selectedSeats)

    if(!isAvailable){
      return res.json({success:false,message:"Selected seats are not available."})
    }

    //get the show details
    const showData = await Show.findById(showId).populate('movie');

    //create a new booking
    const booking = await Booking.create({
      user: userId ,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats
      
    })

    selectedSeats.map((seat) => {
      showData.occupiedSeats[seat] = userId;
    })

    showData.markModified('occupiedSeats');

    await showData.save();


    // Stripe Gateway Initialize
     const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

    // Creating line items to for Stripe
    const line_items = [{
    price_data: {
        currency: 'usd',
        product_data: {
            name: showData.movie.title
        },
        unit_amount: Math.floor(booking.amount) * 100
    },
    quantity: 1
  }]

  const session = await stripeInstance.checkout.sessions.create({
    success_url: `${origin}/loading/my-bookings`,
    cancel_url: `${origin}/my-bookings`,
    line_items: line_items,
    mode: 'payment',
    metadata: {
    bookingId: booking._id.toString()
    },
    expires_at: Math.floor(Date.now() / 1000) + 2 * 60, // Expires in 2 minutes

  })

  booking.paymentLink = session.url
  await booking.save()

  // NEW: Schedule auto-release after 2 minutes (1 minute buffer after Stripe expiry)
  setTimeout(async () => {
    await releaseSeat(booking._id.toString());
  }, 2 * 60 * 1000);

  res.json({success: true, url: session.url})




  } catch (error){
    console.log(error.message);
    res.json({success: false, message: error.message})

  }
}


export const getOccupiedSeats = async (req, res) => {
    try {

        const {showId} = req.params;
        const showData = await Show.findById(showId)

        const occupiedSeats = Object.keys(showData.occupiedSeats)

        res.json({success: true, occupiedSeats})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

export const userBookings = async (req, res) => {
  try {
    // FIX: Get userId from req.userId
    const { userId } = req; 

    // Fetch and populate nested data
    const bookings = await Booking.find({ user: userId })
      .populate({
        path: 'show',
        populate: { path: 'movie' }
      });

    res.json({ success: true, bookings });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
}