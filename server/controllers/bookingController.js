import Booking from "../models/Booking.js";
import Show from "../models/Show.js"

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

export const createBooking=async(req,res)=>{
  try{
    //const {userId} = req.auth();
    const { userId } = req; 
    const { showId, selectedSeats } = req.body;


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


    //stripe gateway initialize

    res.json({success: true, message: 'Booked successfully'})




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