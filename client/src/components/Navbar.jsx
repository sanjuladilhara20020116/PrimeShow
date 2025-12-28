import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { Menu, Search, X, Ticket, ChevronDown } from "lucide-react";


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-2">

      {/* Logo */}
      <Link to="/" className="max-md:flex-1">
        <img src={assets.logo} alt="Logo" className="w-80 h-auto" />
      </Link>

      {/* Menu */}
      <div className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium
        max-md:text-lg z-50 flex flex-col md:flex-row items-center
        max-md:justify-center gap-8 md:px-8 py-3 max-md:h-screen
        md:rounded-full backdrop-blur bg-black/70 md:bg-white/10 md:border
        border-gray-300/20 overflow-hidden transition-[width] duration-300
        ${isOpen ? "max-md:w-full" : "max-md:w-0"}`}>

        <X className="md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer"
           onClick={() => setIsOpen(false)} />

        <Link to="/">Home</Link>
        <Link to="/movies">Movies</Link>
        <Link to="/">Theaters</Link>
        <Link to="/">Releases</Link>
        <Link to="/favorites">Favorites</Link>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6 relative">
        <Search className="max-md:hidden w-6 h-6 cursor-pointer" />

        {!user ? (
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-1 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull rounded-full"
          >
            Login
          </button>
        ) : (
          <div className="relative">
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <img
                src={user.image}
                className="w-9 h-9 rounded-full"
              />
              <ChevronDown size={16} />
            </div>

            {profileOpen && (
              <div className="absolute right-0 mt-3 w-44 bg-black/90 rounded-xl">
                <button
                  onClick={() => navigate("/my-bookings")}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-red-600 rounded-xl"
                >
                  <Ticket size={16} />
                  My Bookings
                </button>

                <button
                  onClick={logout}
                  className="w-full text-sm py-2 text-gray-300"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Menu className="md:hidden w-8 h-8" onClick={() => setIsOpen(true)} />
    </div>
  );
};

export default Navbar;
