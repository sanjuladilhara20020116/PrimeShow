import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userData');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isAdmin, setIsAdmin] = useState(user?.role === 'admin');
  const [shows, setShows] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);

  const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

  /* =====================
     Persist user & role
  ===================== */
  useEffect(() => {
    if (user) {
      localStorage.setItem('userData', JSON.stringify(user));
      setIsAdmin(user.role === 'admin');
    } else {
      localStorage.removeItem('userData');
      setIsAdmin(false);
    }
  }, [user]);

  /* =====================
     Logout
  ===================== */
  const logout = () => {
    setUser(null);
    setFavoriteMovies([]);
    navigate('/login');
    toast.success("Logged out successfully");
  };

  /* =====================
     Fetch all shows
  ===================== */
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

  /* =====================
     Get Auth Token
  ===================== */
  const getToken = async () => {
    return user?.token || null;
  };

  /* =====================
     Fetch Favorite Movies
  ===================== */
  const fetchFavoriteMovies = async () => {
    if (!user) return;
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/user/favorites", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) setFavoriteMovies(data.favorites);
    } catch (error) {
      console.log(error);
    }
  };

  const value = {
    user, setUser,
    isAdmin, setIsAdmin,
    shows, setShows,
    favoriteMovies, setFavoriteMovies,
    image_base_url,
    backendUrl,
    logout,
    getToken,
    fetchFavoriteMovies,
    axios
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
