import React, { useState, useEffect } from "react";
import BlurCircle from '../components/BlurCircle';
import { useAppContext } from '../context/AppContext';
import { Link } from "react-router-dom";

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const { axios, user, image_base_url } = useAppContext();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getMyBookings = async () => {
    try {
      if (!user) return;

      const { data } = await axios.get('/api/booking/user-bookings', {
        headers: {
          "x-user-id": user._id // ✅ pass userId in header
        }
      });

      if (data.success) {
        setBookings(data.bookings);
      } else {
        console.log("Error fetching bookings:", data.message);
      }
    } catch (error) {
      console.log("User bookings error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getMyBookings();
  }, [user]);

  // simple runtime formatter (minutes → hrs mins)
  const timeFormat = (minutes) => {
    if (!minutes) return "N/A";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  // format show date
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-gray-400">Loading bookings...</p>
      </div>
    );
  }

  if (!bookings.length) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-gray-400">No bookings found.</p>
      </div>
    );
  }

  return (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
      <h1 className="text-lg font-semibold mb-4">My Bookings</h1>

      {bookings.map((item, index) => (
        <div
          key={index}
          className="flex flex-col md:flex-row justify-between
                     bg-primary/8 border border-primary/20
                     rounded-lg mt-4 p-1.5 max-w-4xl"
        >
          <div className="flex flex-col md:flex-row w-full">
            <img
              src={image_base_url + item.show.movie.poster_path}
              alt={item.show.movie.title}
              className="md:max-w-45 aspect-video h-auto object-cover object-bottom rounded"
            />

            <div className="flex flex-col p-4 flex-1">
              <p className="text-lg font-semibold">{item.show.movie.title}</p>

              <p className="text-gray-400 text-sm">
                Duration: {timeFormat(item.show.movie.runtime)}
              </p>

              <p className="text-gray-400 text-sm mt-auto">
                Show Time: {formatDate(item.show.showDateTime || item.show.showDate)}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:items-end md:text-right justify-between p-4">
            <div className="flex items-center gap-4">
              <p className="text-2xl font-semibold mb-3">
                {currency}
                {item.amount}
              </p>
              {!item.isPaid && item.paymentLink && (
                <Link
                  to={item.paymentLink}
                  className="bg-primary px-5 py-1 mb-3 text-sm rounded-full font-small cursor-pointer"
                >
                  Pay
                </Link>
              )}
            </div>
            <div className="text-sm">
              <p>
                <span className="text-gray-400">Total Tickets:</span>{" "}
                {item.bookedSeats.length}
              </p>
              <p>
                <span className="text-gray-400">Seat Number:</span>{" "}
                {item.bookedSeats.join(", ")}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyBookings;
