import React, { useEffect, useState } from "react";
import Title from "../../components/admin/Title";
import { dummyShowsData } from "../../assets/assets";


const ListShows = () => {
  const currency = import.meta.env.VITE_CURRENCY || "";

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Updated local date formatter for "08.30 AM" format
  const dateFormat = (date) => {
    return new Date(date).toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(':', '.'); 
  };

  const getAllShows = async () => {
    try {
      setShows([
        {
          movie: dummyShowsData[0],
          showDateTime: "2025-06-30T02:30:00.000Z",
          showPrice: 59,
          occupiedSeats: {
            A1: "user_1",
            B1: "user_2",
            C1: "user_3",
          },
        },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllShows();
  }, []);

  

  return (
    <>
      <Title text1="List" text2=" Shows" />

      <div className="max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-white">
          <thead>
            <tr className="bg-primary/20 text-left">
              <th className="p-2 pl-5">Movie</th>
              <th className="p-2">Show Time</th>
              <th className="p-2">Total Bookings</th>
              <th className="p-2">Earnings</th>
            </tr>
          </thead>

          <tbody>
            {shows.map((show, index) => {
              const totalBookings = Object.keys(show.occupiedSeats).length;
              const earnings = totalBookings * show.showPrice;

              return (
                <tr
                  key={index}
                  className="border-b border-primary/10"
                >
                  <td className="p-2 pl-5">
                    {show.movie.title}
                  </td>

                  <td className="p-2">
                    {dateFormat(show.showDateTime)}
                  </td>

                  <td className="p-2">
                    {totalBookings}
                  </td>

                  <td className="p-2 font-medium">
                    {currency} {earnings}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ListShows;



