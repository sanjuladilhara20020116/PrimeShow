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