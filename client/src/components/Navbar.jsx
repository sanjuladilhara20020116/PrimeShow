import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { Menu, Search, X, Ticket, ChevronDown } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null); // Your own user state
  const [authOpen, setAuthOpen] = useState(false); // Show login/signup dropdown
  const navigate = useNavigate();

  const handleSignOut = () => {
    setUser(null);
    setProfileOpen(false);
  };

  const handleDeleteAccount = () => {
    // Call your backend API to delete user
    setUser(null);
    setProfileOpen(false);
    alert("Account deleted");
  };

  return (
    <div className="fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-2">

      {/* Logo */}
      <Link to="/" className="max-md:flex-1">
        <img src={assets.logo} alt="Logo" className="w-80 h-auto" />
      </Link>

      {/* Menu */}
      <div
        className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium
        max-md:text-lg z-50 flex flex-col md:flex-row items-center
        max-md:justify-center gap-8 md:px-8 py-3 max-md:h-screen
        md:rounded-full backdrop-blur bg-black/70 md:bg-white/10 md:border
        border-gray-300/20 overflow-hidden transition-[width] duration-300
        ${isOpen ? "max-md:w-full" : "max-md:w-0"}`}
      >
        <X
          className="md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer"
          onClick={() => setIsOpen(false)}
        />

        <Link onClick={() => setIsOpen(false)} to="/">Home</Link>
        <Link onClick={() => setIsOpen(false)} to="/movies">Movies</Link>
        <Link onClick={() => setIsOpen(false)} to="/">Theaters</Link>
        <Link onClick={() => setIsOpen(false)} to="/">Releases</Link>
        <Link onClick={() => setIsOpen(false)} to="/favorites">Favorites</Link>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6 relative">
        <Search className="max-md:hidden w-6 h-6 cursor-pointer" />

        {!user ? (
          <button
            onClick={() => setAuthOpen(!authOpen)}
            className="px-4 py-1 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull transition rounded-full font-medium"
          >
            Login
          </button>
        ) : (
          <div className="relative">
            {/* Avatar */}
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <img
                src={user.avatar || "/default-avatar.png"}
                alt="avatar"
                className="w-9 h-9 rounded-full"
              />
              <ChevronDown size={16} />
            </div>

            {/* Custom Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-3 w-44 bg-black/90 backdrop-blur rounded-xl shadow-lg border border-gray-700 z-50">
                <button
                  onClick={() => {
                    navigate("/my-bookings");
                    setProfileOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm
           bg-red-600 hover:bg-red-700 text-white rounded-xl"
                >
                  <Ticket size={16} />
                  My Bookings
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="w-full px-4 py-2 text-sm hover:bg-gray-700 text-white rounded-b-xl"
                >
                  Delete Account
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-sm hover:bg-gray-700 text-white rounded-b-xl"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}

        {/* Auth Dropdown */}
        {authOpen && !user && (
          <div className="absolute right-0 mt-3 w-64 bg-black/90 backdrop-blur rounded-xl shadow-lg border border-gray-700 z-50 p-4">
            <h3 className="text-white font-semibold mb-2">Sign In / Sign Up</h3>
            {/* Replace with your login/signup forms */}
            <button
              onClick={() => {
                setUser({ name: "John Doe", avatar: "/default-avatar.png" });
                setAuthOpen(false);
              }}
              className="w-full py-2 bg-primary text-white rounded-lg mb-2"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setUser({ name: "Jane Doe", avatar: "/default-avatar.png" });
                setAuthOpen(false);
              }}
              className="w-full py-2 bg-secondary text-white rounded-lg"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>

      {/* Mobile menu button */}
      <Menu
        className="max-md:ml-4 md:hidden w-8 h-8 cursor-pointer"
        onClick={() => setIsOpen(true)}
      />
    </div>
  );
};

export default Navbar;
