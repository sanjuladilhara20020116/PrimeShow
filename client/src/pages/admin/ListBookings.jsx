import React, { useState, useEffect } from 'react';
import Title from '../../components/admin/Title';
import { useAppContext } from '../../context/AppContext';
import axios from 'axios';

const ListBookings = () => {
  const { backendUrl, currency = import.meta.env.VITE_CURRENCY || "$" } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (date) =>
    new Date(date).toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(':', '.');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/admin/all-bookings`);
      setBookings(res.data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) {
    return <p className="mt-10 text-center text-white">Loading bookings...</p>;
  }

  return (
    <>
      <Title text1="List" text2="Bookings" />

      <div className="max-w-7xl mt-6 overflow-x-auto rounded-lg shadow-lg">
        <table className="w-full border-collapse text-white bg-primary/10 rounded-lg">
          <thead className="bg-primary/30">
            <tr>
              <th className="p-3 text-left font-semibold">User Name</th>
              <th className="p-3 text-left font-semibold">Movie Name</th>
              <th className="p-3 text-left font-semibold">Show Time</th>
              <th className="p-3 text-left font-semibold">Seats</th>
              <th className="p-3 text-left font-semibold">Amount</th>
            </tr>
          </thead>

          <tbody className="text-sm font-medium">
            {bookings.length > 0 ? (
              bookings.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  <td className="p-3">{item.user?.name || "N/A"}</td>
                  <td className="p-3">{item.show?.movie?.title || "N/A"}</td>
                  <td className="p-3">
                    {item.show?.showDateTime ? formatDate(item.show.showDateTime) : "N/A"}
                  </td>
                  <td className="p-3">
                    {item.bookedSeats
                      ? Object.keys(item.bookedSeats).join(", ")
                      : "N/A"}
                  </td>
                  <td className="p-3 font-semibold">
                    {currency} {item.amount || 0}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center p-6 text-gray-400">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ListBookings;
