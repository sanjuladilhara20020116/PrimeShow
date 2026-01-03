import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BASE_URL;

  // 1. Initialize user first from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userData');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 2. Initialize isAdmin AFTER user is defined
  const [isAdmin, setIsAdmin] = useState(user?.role === 'admin');
  
  const [shows, setShows] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  // 3. Keep isAdmin and localStorage in sync whenever user data changes
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