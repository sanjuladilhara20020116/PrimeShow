import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dummyDateTimeData, dummyShowsData } from "../assets/assets";
import BlurCircle from "../components/BlurCircle";
import { Heart, PlayCircle, Star } from "lucide-react";
import timeFormat from "../lib/timeFormat";
import DateSelect from "../components/DateSelect";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";

const MovieDetails = () => {
  
  const navigate = useNavigate();
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dummyShowsData?.length) return;

    setLoading(true);

    // ⏳ Artificial delay for long loading spinner
    const timer = setTimeout(() => {
      const movieId = Number(id);
      const selectedShow = dummyShowsData.find(
        (movie) => movie.id === movieId
      );

      if (selectedShow) {
        setShow({
          movie: selectedShow,
          dateTime: dummyDateTimeData,
        });
      }

      setLoading(false);
    }, 2000); // 👈 spinner visible for 2 seconds

    return () => clearTimeout(timer);
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (!show) {
    return (
      <div className="text-center mt-20 text-gray-400">
        Movie not found
      </div>
    );
  }

  return (
    <div className="px-6 md:px-16 lg:px-40 pt-24 md:pt-50">
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">

        {/* Poster */}
        <img
          src={show.movie.poster_path}
          alt={show.movie.title}
          className="max-md:mx-auto rounded-xl h-104 max-w-70 object-cover"
        />

        {/* Info */}
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

          {/* Actions */}
          <div className="flex items-center flex-wrap gap-4 mt-4">
            <button className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium active:scale-95">
              <PlayCircle className="w-5 h-5" />
              Watch Trailer
            </button>

            <a
              href="#dateSelect"
              className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium active:scale-95"
            >
              Buy Tickets
            </a>

            <button className="bg-gray-700 p-2.5 rounded-full transition active:scale-95">
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cast */}
      <p className="text-lg font-medium mt-20">Cast</p>
      <div className="overflow-x-auto no-scrollbar mt-8 pb-4">
        <div className="flex items-center gap-6 w-max px-4">
          {show.movie.casts.slice(0, 12).map((cast, index) => (
            <div key={index} className="flex flex-col items-center gap-2 w-20">
              <img
                src={cast.profile_path}
                alt={cast.name}
                className="rounded-full h-20 w-20 object-cover"
              />
              <p className="text-xs text-center text-gray-300 mt-3">
                {cast.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      <DateSelect dateTime={show.dateTime} id={id} />

      <p className="text-lg font-medium mt-20 mb-8">You May Also Like</p>
      <div className="flex flex-wrap max-sm:justify-center gap-8">
        {dummyShowsData.slice(0, 4).map((movie, index) => (
          <MovieCard key={index} movie={movie} />
        ))}
      </div>

      <div className="flex justify-center mt-20">
        <button
          onClick={() => {
            navigate("/movies");
            scrollTo(0, 0);
          }}
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
        >
          Show More
        </button>
      </div>
    </div>
  );
};

export default MovieDetails;
