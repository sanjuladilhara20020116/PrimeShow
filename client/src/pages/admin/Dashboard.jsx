import {
  ChartLineIcon,
  CircleDollarSignIcon,
  PlayCircleIcon,
  UsersIcon,
  StarIcon
} from "lucide-react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import { useAppContext } from "../../context/AppContext";

const Dashboard = () => {
  const { image_base_url, backendUrl } = useAppContext();
  const currency = import.meta.env.VITE_CURRENCY || "$";

  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: [],
    totalUser: 0
  });

  const [loading, setLoading] = useState(true);

  const formatShowDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    }) + " | " + d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(`${backendUrl}/api/admin/dashboard`);
      if (!data?.success || !data.dashboardData) throw new Error("Failed to fetch dashboard data");

      const showsRes = await axios.get(`${backendUrl}/api/admin/all-shows`);
      const allShows = showsRes.data?.shows || [];

      // 🔹 Group shows by movie
      const movieMap = {};
      allShows.forEach((show) => {
        const movieId = show.movie?._id || show.movie;
        if (!movieMap[movieId]) {
          movieMap[movieId] = {
            movie: show.movie,
            showTimes: [] // will store { dateTime, price }
          };
        }
        movieMap[movieId].showTimes.push({
          dateTime: show.showDateTime,
          price: show.showPrice
        });
      });

      const groupedShows = Object.values(movieMap);

      setDashboardData({
        totalBookings: data.dashboardData.totalBookings || 0,
        totalRevenue: data.dashboardData.totalRevenue || 0,
        activeShows: groupedShows,
        totalUser: data.dashboardData.totalUser || 0
      });
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      setDashboardData({
        totalBookings: 0,
        totalRevenue: 0,
        activeShows: [],
        totalUser: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!backendUrl) return;
    fetchDashboardData();
  }, [backendUrl]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  const dashboardCards = [
    {
      title: "Total Bookings",
      value: dashboardData.totalBookings,
      icon: ChartLineIcon
    },
    {
      title: "Total Revenue",
      value: `${currency} ${dashboardData.totalRevenue}`,
      icon: CircleDollarSignIcon
    },
    {
      title: "Active Shows",
      value: dashboardData.activeShows.length,
      icon: PlayCircleIcon
    },
    {
      title: "Total Users",
      value: dashboardData.totalUser,
      icon: UsersIcon
    }
  ];

  return (
    <>
      <Title text1="Admin" text2="Dashboard" />

      {/* Dashboard cards */}
      <div className="relative flex flex-wrap gap-4 mt-6">
        <BlurCircle top="-100px" left="0" />
        <div className="flex flex-wrap gap-4 w-full">
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-md w-full max-w-sm"
            >
              <div>
                <h1 className="text-sm">{card.title}</h1>
                <p className="text-xl font-medium mt-1">{card.value}</p>
              </div>
              <card.icon className="w-6 h-6" />
            </div>
          ))}
        </div>
      </div>

      {/* Active shows */}
      <p className="mt-10 text-lg font-medium">Active Shows</p>
      <div className="relative flex flex-wrap gap-6 mt-4 max-w-9xl">
        <BlurCircle top="-100px" left="-10%" />

        {dashboardData.activeShows.length > 0 ? (
          dashboardData.activeShows.map((item) => (
            <div
              key={item.movie._id}
              className="w-64 rounded-lg overflow-hidden h-full pb-3 bg-primary/10 border border-primary/20 hover:-translate-y-1 transition duration-300"
            >
              <img
                src={image_base_url + (item.movie?.poster_path || "")}
                alt={item.movie?.title || "No Title"}
                className="h-60 w-full object-cover bg-gray-800"
              />
              <p className="font-medium p-2 truncate">{item.movie?.title}</p>
              <div className="flex items-center justify-between px-2">
                <p className="text-lg font-medium">
                  {/* Show minimum price among all schedules */}
                  {currency} {Math.min(...item.showTimes.map(st => st.price))}
                </p>
                <p className="flex items-center gap-1 text-sm text-gray-400">
                  <StarIcon className="w-4 h-4 text-primary fill-primary" />
                  {item.movie?.vote_average?.toFixed(1) || "N/A"}
                </p>
              </div>

              {/* List all dates and times for this movie */}
              <div className="px-2 pt-2 text-sm text-gray-500">
                {item.showTimes
                  .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
                  .map((st, idx) => (
                    <p key={idx}>
                      {formatShowDate(st.dateTime)} - {currency} {st.price}
                    </p>
                  ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">No shows to display.</p>
        )}
      </div>
    </>
  );
};

export default Dashboard;
