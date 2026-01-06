import React, { useEffect, useState } from "react";
import Title from "../../components/admin/Title";
import axios from "axios";
import { useAppContext } from "../../context/AppContext";

const ListShows = () => {
  const { backendUrl, image_base_url } = useAppContext();
  const currency = import.meta.env.VITE_CURRENCY || "$";

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllShows = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/admin/all-shows`);
      const allShows = res.data?.shows || [];

      // Group shows by movie
      const movieMap = {};
      allShows.forEach((show) => {
        const movieId = show.movie?._id || show.movie;
        if (!movieMap[movieId]) {
          movieMap[movieId] = {
            movie: show.movie,
            schedules: []
          };
        }
        movieMap[movieId].schedules.push({
          price: show.showPrice,
          occupiedSeats: show.occupiedSeats
        });
      });

      setShows(Object.values(movieMap));
    } catch (error) {
      console.error("Error fetching shows:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllShows();
  }, []);

  if (loading) {
    return <p className="mt-10 text-center text-white">Loading shows...</p>;
  }

  return (
    <>
      <Title text1="List" text2="Shows" />

      <div className="max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-white">
          <thead>
            <tr className="bg-primary/20 text-left">
              <th className="p-2 pl-5">Movie</th>
              <th className="p-2">Total Bookings</th>
              <th className="p-2">Earnings</th>
            </tr>
          </thead>

          <tbody>
            {shows.map((item, index) => {
              const totalBookings = item.schedules.reduce(
                (acc, sched) => acc + Object.keys(sched.occupiedSeats).length,
                0
              );

              const totalEarnings = item.schedules.reduce(
                (acc, sched) =>
                  acc + Object.keys(sched.occupiedSeats).length * sched.price,
                0
              );

              return (
                <tr key={index} className="border-b border-primary/10">
                  {/* Movie poster + title */}
                  <td className="p-2 pl-5 flex items-center gap-3">
                    <img
                      src={image_base_url + item.movie.poster_path}
                      alt={item.movie.title}
                      className="w-14 h-20 object-cover rounded-md"
                    />
                    <span className="font-medium">{item.movie.title}</span>
                  </td>

                  <td className="p-2">{totalBookings}</td>

                  <td className="p-2 font-medium">
                    {currency} {totalEarnings}
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
