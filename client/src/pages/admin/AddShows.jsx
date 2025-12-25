import React, { useState, useEffect } from 'react';
import { dummyShowsData } from '../../assets/assets';
import Title from '../../components/admin/Title';
import { Check, StarIcon, Trash2 } from 'lucide-react';
import { kConverter } from '../../lib/kConverter';

const AddShows = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInput, setDateTimeInput] = useState('');
  const [showPrice, setShowPrice] = useState('');

  useEffect(() => {
    setNowPlayingMovies(dummyShowsData);
  }, []);

  // ✅ Correct local datetime (prevents past dates)
  const minDateTime = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16);

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return;

    const [date, time] = dateTimeInput.split('T');
    if (!date || !time) return;

    setDateTimeSelection((prev) => {
      const times = prev[date] || [];
      if (!times.includes(time)) {
        return { ...prev, [date]: [...times, time] };
      }
      return prev;
    });

    setDateTimeInput('');
  };

  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const filteredTimes = prev[date].filter((t) => t !== time);

      if (filteredTimes.length === 0) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }

      return { ...prev, [date]: filteredTimes };
    });
  };

  // ✅ NEW: Add Show handler
  const handleAddShow = () => {
    if (!selectedMovie) {
      alert('Please select a movie');
      return;
    }

    if (!showPrice || showPrice <= 0) {
      alert('Please enter a valid show price');
      return;
    }

    if (Object.keys(dateTimeSelection).length === 0) {
      alert('Please add at least one show time');
      return;
    }

    const payload = {
      movieId: selectedMovie,
      price: showPrice,
      schedule: dateTimeSelection,
    };

    console.log('Show Added:', payload);
    alert('Show added successfully!');
  };

  if (nowPlayingMovies.length === 0) {
    return <p className="mt-10 text-center">Loading shows...</p>;
  }

  return (
    <>
      <Title text1="Add" text2="Shows" />

      <p className="mt-10 text-lg font-medium">Now Playing Movies</p>

      <div className="pb-4">
        <div className="group flex flex-wrap gap-4 mt-4">
          {nowPlayingMovies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => setSelectedMovie(movie.id)}
              className="relative max-w-40 cursor-pointer hover:-translate-y-1 transition duration-300"
            >
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={movie.poster_path}
                  alt={movie.title}
                  className="w-full object-cover brightness-90"
                />

                <div className="text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0">
                  <p className="flex items-center gap-1 text-gray-400">
                    <StarIcon className="w-4 h-4 text-primary fill-primary" />
                    {movie.vote_average.toFixed(1)}
                  </p>
                  <p className="text-gray-300">
                    {kConverter(movie.vote_count)} Votes
                  </p>
                </div>
              </div>

              {selectedMovie === movie.id && (
                <div className="absolute top-2 right-2 flex items-center justify-center bg-primary h-6 w-6 rounded">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              <p className="font-medium truncate">{movie.title}</p>
              <p className="text-gray-400 text-sm">{movie.release_date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Show Price */}
      <div className="mt-8">
        <label className="block text-sm font-medium mb-2">Show Price</label>
        <div className="inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md">
          <p className="text-gray-400 text-sm">{currency}</p>
          <input
            type="number"
            min={0}
            value={showPrice}
            onChange={(e) => setShowPrice(e.target.value)}
            placeholder="Enter show price"
            className="outline-none"
          />
        </div>
      </div>

      {/* Date & Time */}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">
          Select Date and Time
        </label>

        <div className="inline-flex gap-5 border border-gray-600 p-1 pl-3 rounded-lg">
          <input
            type="datetime-local"
            value={dateTimeInput}
            min={minDateTime}
            onChange={(e) => setDateTimeInput(e.target.value)}
            className="outline-none rounded-md"
          />

          <button
            onClick={handleDateTimeAdd}
            className="bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary"
          >
            Add Time
          </button>
        </div>
      </div>

      {/* Selected Date-Time */}
      {Object.keys(dateTimeSelection).length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 font-medium">Selected Date-Time</h2>
          <ul className="space-y-3">
            {Object.entries(dateTimeSelection).map(([date, times]) => (
              <li key={date}>
                <div className="font-medium">{date}</div>
                <div className="flex flex-wrap gap-2 mt-1 text-sm">
                  {times.map((time) => (
                    <div
                      key={time}
                      className="border border-primary px-2 py-1 flex items-center rounded"
                    >
                      <span>{time}</span>
                      <Trash2
                        onClick={() => handleRemoveTime(date, time)}
                        size={15}
                        className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ✅ Fixed Add Show Button */}
      <button
        onClick={handleAddShow}
        disabled={
          !selectedMovie ||
          !showPrice ||
          Object.keys(dateTimeSelection).length === 0
        }
        className={`px-8 py-2 mt-6 rounded-md transition-all
          ${
            !selectedMovie ||
            !showPrice ||
            Object.keys(dateTimeSelection).length === 0
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
      >
        Add Show
      </button>
    </>
  );
};

export default AddShows;
