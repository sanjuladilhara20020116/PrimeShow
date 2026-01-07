import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]);
  const { getToken, user } = useAppContext();
  const navigate = useNavigate();

  // Fetch show details
  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`);
      if (data.success) setShow(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch occupied and locked seats for selected show time
  const getOccupiedSeats = async () => {
    if (!selectedTime) return;
    try {
      const { data } = await axios.get(`/api/booking/seats/${selectedTime.showId}`);
      if (data.success) {
        const allOccupied = data.occupiedSeats; // backend returns both paid + locked
        setOccupiedSeats(allOccupied);

        // Identify temporarily locked seats (not booked by this user)
        const locked = allOccupied.filter(seat => !selectedSeats.includes(seat));
        setLockedSeats(locked);

        locked.forEach(seat => {
          toast(`${seat} is temporarily locked for 1 minute`, { icon: "⏳" });
        });
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle seat selection
  const handleSeatClick = (seatId) => {
    if (!selectedTime) return toast("Please select time first");

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(seat => seat !== seatId));
      return;
    }

    if (selectedSeats.length >= 10) return toast("You can only select 10 seats");
    if (occupiedSeats.includes(seatId)) return toast("This seat is already booked or locked");

    setSelectedSeats(prev => [...prev, seatId]);
    toast(`${seatId} temporarily locked for you`, { icon: "🔒" });
  };

  // Render seats
  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-2 mt-2">
      {Array.from({ length: count }, (_, i) => {
        const seatId = `${row}${i + 1}`;
        const isSelected = selectedSeats.includes(seatId);
        const isOccupied = occupiedSeats.includes(seatId);
        return (
          <button
            key={seatId}
            onClick={() => handleSeatClick(seatId)}
            className={`
              h-8 w-8 rounded border border-primary/60 cursor-pointer
              ${isSelected ? "bg-primary text-white" : ""}
              ${isOccupied ? "opacity-50 cursor-not-allowed" : ""}
            `}
            disabled={isOccupied}
          >
            {seatId}
          </button>
        );
      })}
    </div>
  );

  // Book tickets via backend
  const bookTickets = async () => {
    if (!user) return toast.error("Please login to proceed");
    if (!selectedTime || !selectedSeats.length) return toast.error("Select time and seats");

    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/booking/create",
        { showId: selectedTime.showId, selectedSeats },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        window.location.href = data.url; // redirect to Stripe
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => { getShow(); }, []);
  useEffect(() => { getOccupiedSeats(); }, [selectedTime, selectedSeats]);

  if (!show || !show.dateTime?.[date]) {
    return <div className="text-center mt-40 text-gray-400">No shows available for this date</div>;
  }

  return (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50">
      {/* Available Times */}
      <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30">
        <p className="text-lg font-semibold px-6">Available Timings</p>
        <div className="mt-5 space-y-1">
          {show.dateTime[date].map((item, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedTime(item)}
              className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition
                ${selectedTime?.time === item.time ? "bg-primary text-white" : "hover:bg-primary/20"}`}
            >
              <Clock className="w-4 h-4" />
              <p className="text-sm">{new Date(item.time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Seat Layout */}
      <div className="relative flex-1 flex flex-col items-center max-md:mt-16">
        <BlurCircle top="-100px" center="-100px" />
        <h1 className="text-2xl font-semibold mb-4">Select Your Seat</h1>
        <img src="/assets/screen.png" alt="screen" />
        <p className="text-gray-400 text-sm mb-6">SCREEN SIDE</p>

        <div className="flex flex-col items-center mt-10 text-xs text-gray-300">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6">
            {groupRows[0].map(row => renderSeats(row))}
          </div>
          <div className="grid grid-cols-2 gap-11">
            {groupRows.slice(1).map((group, idx) => (
              <div key={idx}>{group.map(row => renderSeats(row))}</div>
            ))}
          </div>
        </div>

        <button
          onClick={bookTickets}
          className="flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95"
        >
          Proceed to Checkout <ArrowBigRight strokeWidth={2} className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SeatLayout;
