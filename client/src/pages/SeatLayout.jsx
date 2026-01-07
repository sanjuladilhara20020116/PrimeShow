import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import { Clock, ArrowBigRight } from "lucide-react";
import { toast } from "react-hot-toast";
import BlurCircle from "../components/BlurCircle";
import { useAppContext } from "../context/AppContext";
import axios from "axios";

const SeatLayout = () => {
  const groupRows = [["A", "B"], ["C", "E", "G"], ["D", "F", "H"], ["I", "K"], ["J", "L"], ["M"], ["N"]];

  const { id, date } = useParams();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);
  // ✅ Changed state to an object to store seat status { "A1": { status: "confirmed" } }
  const [occupiedSeats, setOccupiedSeats] = useState({}); 

  const navigate = useNavigate();
  const { user } = useAppContext();

  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`);
      if (data.success) {
        setShow(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSeatClick = (seatId) => {
    if (!selectedTime) return toast("Please select time first");

    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 10) {
      return toast("You can only select 10 seats");
    }

    // ✅ Logic change: Check for existence in the object regardless of status
    if (occupiedSeats[seatId]) {
      return toast("This seat is already booked or held");
    }

    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(seat => seat !== seatId)
        : [...prev, seatId]
    );
  };

  const renderSeats = (row, count = 9) => (
  <div key={row} className="flex gap-2 mt-2">
    <div className="flex flex-wrap items-center justify-center gap-2">
      {Array.from({ length: count }, (_, i) => {
        const seatId = `${row}${i + 1}`;
        const seatData = occupiedSeats[seatId]; // This is now an object {status: "..."}
        
        const isPaid = seatData?.status === "confirmed";
        const isPending = seatData?.status === "locked";
        const isSelected = selectedSeats.includes(seatId);

        return (
          <button
            key={seatId}
            onClick={() => handleSeatClick(seatId)}
            disabled={isPaid || isPending}
            className={`h-8 w-8 rounded border text-[10px] transition-colors
              ${isPaid ? "bg-red-600 border-none text-white" : "border-primary/60"}
              ${isSelected ? "bg-gray-500 text-white border-none" : ""}
              ${isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {seatId}
          </button>
        );
      })}
    </div>
  </div>
);

  const getOccupiedSeats = async () => {
    try {
      if (!selectedTime || !selectedTime.showId) return;

      const { data } = await axios.get(`/api/booking/seats/${selectedTime.showId}`);
      if (data.success) {
        // ✅ We now store the raw object instead of just the keys array
        setOccupiedSeats(data.occupiedSeats || {});
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const bookTickets = async () => {
    try {
      if (!user) return toast.error("Please login to proceed");
      if (!selectedTime || !selectedSeats.length) return toast.error("Please select a time and seats");
      if (!selectedTime.showId) return toast.error("Invalid show selection");

      const { data } = await axios.post(
        "/api/booking/create",
        {
          showId: selectedTime.showId,
          selectedSeats
        },
        {
          headers: {
            "x-user-id": user._id
          }
        }
      );

      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getShow();
  }, []);

  useEffect(() => {
    if (selectedTime) getOccupiedSeats();
  }, [selectedTime]);

  if (!show || !show.dateTime?.[date]) {
    return (
      <div className="text-center mt-40 text-gray-400">
        No shows available for this date
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50">
      {/* Available Timings */}
      <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30">
        <p className="text-lg font-semibold px-6">Available Timings</p>
        <div className="mt-5 space-y-1">
          {show.dateTime[date].map((item, index) => (
            <div
              key={index}
              onClick={() => setSelectedTime(item)}
              className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition
                ${
                  selectedTime?.time === item.time
                    ? "bg-primary text-white"
                    : "hover:bg-primary/20"
                }`}
            >
              <Clock className="w-4 h-4" />
              <p className="text-sm">
                {new Date(item.time).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Seat Layout */}
      <div className="relative flex-1 flex flex-col items-center max-md:mt-16">
        <BlurCircle top="-100px" center="-100px" />

        <h1 className="text-2xl font-semibold mb-4">Select Your Seat</h1>
        <img src={assets.screenImage} alt="screen" />
        <p className="text-gray-400 text-sm mb-6">SCREEN SIDE</p>

        {/* ✅ Visual Legend so users understand the difference */}
        <div className="flex gap-6 mb-8 text-[10px] uppercase tracking-widest text-gray-400">
           <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-600 rounded"></div> Pending</div>
           <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-600 rounded"></div> Paid</div>
           <div className="flex items-center gap-2"><div className="w-3 h-3 bg-primary rounded"></div> Selected</div>
        </div>

        <div className="flex flex-col items-center mt-10 text-xs text-gray-300">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6">
            {groupRows[0].map(row => renderSeats(row))}
          </div>
          <div className="grid grid-cols-2 gap-11">
            {groupRows.slice(1).map((group, idx) => (
              <div key={idx}>
                {group.map(row => renderSeats(row))}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={bookTickets}
          className="flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95"
        >
          Proceed to Checkout
          <ArrowBigRight strokeWidth={2} className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SeatLayout;