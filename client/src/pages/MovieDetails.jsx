import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dummyDateTimeData, dummyShowsData } from "../assets/assets";
import BlurCircle from "../components/BlurCircle";
import { Heart, PlayCircle, Star } from "lucide-react";
import timeFormat from "../lib/timeFormat";
import DateSelect from "../components/DateSelect";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    shows,
    getToken,
    user,
    fetchFavoriteMovies,
    favoriteMovies,
    setFavoriteMovies,
    image_base_url
  } = useAppContext();

  /* =======================
     API SHOW FETCH
  ======================== */
  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`);
      if (data?.success) {
        setShow(data);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.log("API failed, using dummy data");
    }
  };

  /* =======================
     FAVORITE BUTTON
  ======================== */
  const handleFavorite = async () => {
  try {
    if (!user) return toast.error("Please login to proceed");
    if (!show?.movie?._id) return;

    const movieId = show.movie._id;

    // Toggle UI immediately
    const alreadyFavorite = favoriteMovies.some(m => m._id === movieId);
    if (alreadyFavorite) {
      setFavoriteMovies(prev => prev.filter(m => m._id !== movieId));
    } else {
      setFavoriteMovies(prev => [...prev, show.movie]);
    }

    // Call API
    const { data } = await axios.post(
      "/api/user/update-favorite",
      { movieId },
      {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      }
    );

    // ✅ Show correct toast based on API message
    if (data?.message) {
      toast.success(data.message); // backend should return "Added to favorites" or "Removed from favorites"
    } else {
      toast.success(alreadyFavorite ? "Removed from favorites" : "Added to favorites");
    }

    await fetchFavoriteMovies(); // sync backend

  } catch (error) {
    console.log(error);
    toast.error("Something went wrong");
  }
};


  useEffect(() => {
    getShow();
  }, [id]);

  /* =======================
     DUMMY FALLBACK
  ======================== */
  useEffect(() => {
    if (!dummyShowsData?.length) return;

    const timer = setTimeout(() => {
      const movieId = Number(id);
      const selectedShow = dummyShowsData.find(
        (movie) => movie.id === movieId
      );

      if (!show && selectedShow) {
        setShow({
          movie: selectedShow,
          dateTime: dummyDateTimeData,
        });
        setLoading(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [id, show]);

  if (loading) return <Loading />;

  if (!show) {
    return (
      <div className="text-center mt-20 text-gray-400">
        Movie not found
      </div>
    );
  }

  const isFavorite = favoriteMovies.some(
    (m) => m._id === show.movie._id
  );

  return (
    <div className="px-6 md:px-16 lg:px-40 pt-24 md:pt-50">
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">

        <img
          src={image_base_url + show.movie.poster_path}
          alt={show.movie.title}
          className="max-md:mx-auto rounded-xl h-104 max-w-70 object-cover"
        />

        <div className="relative flex flex-col gap-3">
          <BlurCircle top="-100px" left="-100px" />

          <p className="text-primary uppercase">English</p>

          <h1 className="text-4xl font-semibold max-w-96 text-balance">
            {show.movie.title}
          </h1>

          <div className="flex items-center gap-2 text-gray-300">
            <Star className="w-5 h-5 text-primary fill-primary" />
            <span>{show.movie.vote_average.toFixed(1)} IMDb Rating</span>
          </div>

          <p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">
            {show.movie.overview}
          </p>

          <p className="text-gray-300 text-sm">
            {timeFormat(show.movie.runtime)} ·{" "}
            {show.movie.genres.map(g => g.name).join(", ")} ·{" "}
            {show.movie.release_date.split("-")[0]}
          </p>

          <div className="flex items-center flex-wrap gap-4 mt-4">
            <button className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium">
              <PlayCircle className="w-5 h-5" />
              Watch Trailer
            </button>

            <a
              href="#dateSelect"
              className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium"
            >
              Buy Tickets
            </a>

            <button
              onClick={handleFavorite}
              className="bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95"
            >
              <Heart
                className={`w-5 h-5 ${isFavorite ? 'fill-primary text-primary' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>

      <p className="text-lg font-medium mt-20">Your Favorite Cast</p>
      <div className="overflow-x-auto no-scrollbar mt-8 pb-4">
        <div className="flex items-center gap-4 w-max px-4">
          {show.movie.casts.slice(0, 17).map((cast, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <img
                src={image_base_url + cast.profile_path}
                alt=""
                className="rounded-full h-20 aspect-square object-cover"
              />
              <p className="font-medium text-xs mt-3">{cast.name}</p>
            </div>
          ))}
        </div>
      </div>

      <DateSelect dateTime={show.dateTime} id={id} />
    </div>
  );
};

export default MovieDetails;
