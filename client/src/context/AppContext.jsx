import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BASE_URL;
  const [isAdmin, setIsAdmin] = useState(false);
  const [shows, setShows] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  
  // Get user from localStorage on load
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('userData')) || null);

  const location = useLocation();
  const navigate = useNavigate();

  // Persist user data
  useEffect(() => {
    if (user) {
      localStorage.setItem('userData', JSON.stringify(user));
    } else {
      localStorage.removeItem('userData');
    }
  }, [user]);

  const fetchIsAdmin = async () => {
    try {
      // Check if user is admin when logged in
      const { data } = await axios.get('/api/admin/is-admin');
      setIsAdmin(data.isAdmin);

      if (!data.isAdmin && location.pathname.startsWith('/admin')) {
        navigate('/');
        toast.error('Not authorized');
      }
    } catch (error) {
      console.error("Admin check failed", error);
    }
  }

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('userData');
    navigate('/login');
    toast.success("Logged out");
  };

  const value = {
    user, setUser,
    isAdmin, setIsAdmin,
    fetchIsAdmin,
    shows, setShows,
    favoriteMovies, setFavoriteMovies,
    backendUrl,
    logout
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext);






































/* 
// src/context/AppContext.jsx
import { createContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {




  const backendUrl = "http://localhost:3000";
  
  // Initialize state from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("userData");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Sync state to localStorage whenever 'user' changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("userData", JSON.stringify(user));
    } else {
      localStorage.removeItem("userData");
    }
  }, [user]);

  // Simplified login function that accepts the user object from Login.jsx
  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userData");
    toast.success("Logged out successfully");
  };






  return (
    <AppContext.Provider value={{ backendUrl, user, setUser, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};
*/