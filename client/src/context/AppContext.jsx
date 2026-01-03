import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BASE_URL;

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userData');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isAdmin, setIsAdmin] = useState(user?.role === 'admin');
  const [shows, setShows] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);

  // FIXED: Changed VITE_TMDB_BASE_URL to VITE_TMDB_IMAGE_BASE_URL to match your .env
  const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      localStorage.setItem('userData', JSON.stringify(user));
      setIsAdmin(user.role === 'admin');
    } else {
      localStorage.removeItem('userData');
      setIsAdmin(false);
    }
  }, [user]);

  const logout = () => {
    setUser(null);
    navigate('/login');
    toast.success("Logged out successfully");
  };

  const fetchShows = async () => {
    try {
      const { data } = await axios.get('/api/show/all');
      if (data.success) setShows(data.shows);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  const value = {
    user, setUser,
    isAdmin, setIsAdmin,
    shows, setShows,
    favoriteMovies, setFavoriteMovies,
    image_base_url,
    backendUrl,
    logout
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);