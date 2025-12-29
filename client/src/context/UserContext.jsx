// src/context/UserContext.jsx
import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const backendUrl = "http://localhost:3000"; // Update with your server URL
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('userData')) || null);

    // Persist user data in localStorage
    useEffect(() => {
        if (user) {
            localStorage.setItem('userData', JSON.stringify(user));
        } else {
            localStorage.removeItem('userData');
        }
    }, [user]);

    const login = (userData) => {
        setUser(userData);
        toast.success("Welcome to PrimeShow!");
    };

    const logout = () => {
        setUser(null);
        toast.success("Signed out successfully");
    };

    const deleteAccount = async () => {
        try {
            if (!user?._id) return;
            const { data } = await axios.delete(`${backendUrl}/api/user/delete/${user._id}`);
            if (data.success) {
                setUser(null);
                toast.success("Account deleted permanently");
            }
        } catch (error) {
            toast.error("Failed to delete account");
            console.error(error);
        }
    };

    return (
        <UserContext.Provider value={{ backendUrl, user, setUser, login, logout, deleteAccount }}>
            {children}
        </UserContext.Provider>
    );
};