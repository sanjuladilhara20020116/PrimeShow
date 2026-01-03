import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import SeatLayout from "./pages/SeatLayout";
import MyBookings from "./pages/MyBookings";
import Favorite from "./pages/Favorite";
import Login from "./pages/Login"; 
import Profile from "./pages/Profile";

// Admin
import Layout from "./pages/admin/Layout";
import Dashboard from "./pages/admin/Dashboard";
import AddShows from "./pages/admin/AddShows";
import ListShows from "./pages/admin/ListShows";
import ListBookings from "./pages/admin/ListBookings";

// Context
import { useAppContext } from "./context/AppContext.jsx";

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Get user and isAdmin status from context
  const { user, isAdmin } = useAppContext(); 

  return (
    <>
      <Toaster />

      {/* Show Navbar and Footer only on client-side routes */}
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/movies/:id/:date" element={<SeatLayout />} />
        
        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected User Routes */}
        <Route path="/profile" element={user ? <Profile /> : <Login />} />
        <Route path="/my-bookings" element={user ? <MyBookings /> : <Login />} />
        <Route path="/favorite" element={user ? <Favorite /> : <Login />} />

        {/* Admin Routes: 
          Requires both an active user session AND admin privileges.
        */}
        <Route path="/admin" element={user && isAdmin ? <Layout /> : <Login />}>
          <Route index element={<Dashboard />} />
          <Route path="add-shows" element={<AddShows />} />
          <Route path="list-shows" element={<ListShows />} />
          <Route path="list-bookings" element={<ListBookings />} />
        </Route>
      </Routes>

      {!isAdminRoute && <Footer />}
    </>
  );
};

export default App;