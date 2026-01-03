import React, { useState, useEffect } from 'react';
import Title from '../../components/admin/Title';
import { Check, StarIcon, Trash2 } from 'lucide-react';
import { kConverter } from '../../lib/kConverter';
import { useAppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AddShows = () => {
  const { image_base_url, backendUrl } = useAppContext();

  const currency = import.meta.env.VITE_CURRENCY;

  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInput, setDateTimeInput] = useState('');
  const [showPrice, setShowPrice] = useState('');
  const [addingShow, setaddingShow] = useState(false);

  const fetchNowPlayingMovies = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/show/now-playing`);
      if (data.success) {
        setNowPlayingMovies(data.movies);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  useEffect(() => {
    fetchNowPlayingMovies();
  }, []);

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

  const handleAddShow = async () => {
    if (!selectedMovie) return toast.error('Please select a movie');
    if (!showPrice || showPrice <= 0) return toast.error('Please enter a price');
    if (Object.keys(dateTimeSelection).length === 0) return toast.error('Add at least one time');

    setaddingShow(true);

    try {
      // Transforming UI state to match backend's array-based "showsInput"
      const showsInput = Object.entries(dateTimeSelection).map(([date, times]) => ({
        date,
        time: times
      }));

      const payload = {
        movieId: selectedMovie,
        showPrice: Number(showPrice),
        showsInput: showsInput
      };

      const { data } = await axios.post(`${backendUrl}/api/show/add`, payload);

      if (data.success) {
        toast.success('Show added successfully!');
        setSelectedMovie(null);
        setShowPrice('');
        setDateTimeSelection({});
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error adding show:', error);
      toast.error(error.response?.data?.message || 'Server Error');
    } finally {
      setaddingShow(false);
    }
  };

  if (nowPlayingMovies.length === 0) {
    return <p className="mt-10 text-center text-white">Loading movies...</p>;
  }

  return (
    <>
      <Title text1="Add" text2="Shows" />
      <p className="mt-10 text-lg font-medium text-white">Now Playing Movies</p>

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
                  src={image_base_url + movie.poster_path}
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
              <p className="font-medium truncate text-white mt-1">{movie.title}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <label className="block text-sm font-medium mb-2 text-white">Show Price</label>
        <div className="inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md">
          <p className="text-gray-400 text-sm">{currency}</p>
          <input
            type="number"
            value={showPrice}
            onChange={(e) => setShowPrice(e.target.value)}
            className="outline-none bg-transparent text-white w-32"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium mb-2 text-white">Select Date and Time</label>
        <div className="inline-flex gap-5 border border-gray-600 p-1 pl-3 rounded-lg">
          <input
            type="datetime-local"
            value={dateTimeInput}
            min={minDateTime}
            onChange={(e) => setDateTimeInput(e.target.value)}
            className="outline-none bg-transparent text-white"
          />
          <button
            onClick={handleDateTimeAdd}
            className="bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary"
          >
            Add Time
          </button>
        </div>
      </div>

      {Object.keys(dateTimeSelection).length > 0 && (
        <div className="mt-6 text-white">
          <h2 className="mb-2 font-medium">Selected Slots</h2>
          <ul className="space-y-3">
            {Object.entries(dateTimeSelection).map(([date, times]) => (
              <li key={date}>
                <div className="font-medium text-sm text-gray-400">{date}</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {times.map((time) => (
                    <div key={time} className="border border-primary px-2 py-1 flex items-center rounded text-sm">
                      <span>{time}</span>
                      <Trash2
                        onClick={() => handleRemoveTime(date, time)}
                        size={14}
                        className="ml-2 text-red-500 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleAddShow}
        disabled={addingShow}
        className={`px-8 py-2 mt-8 rounded-md transition-all bg-primary text-white ${addingShow ? 'opacity-50' : 'hover:scale-105'}`}
      >
        {addingShow ? 'Processing...' : 'Add Show'}
      </button>
    </>
  );
};

export default AddShows;