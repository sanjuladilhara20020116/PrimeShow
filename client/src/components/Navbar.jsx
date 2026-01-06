import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { Menu, Search, X, Ticket, ChevronDown, User } from "lucide-react"; // Added User icon
import { AppContext, useAppContext } from "../context/AppContext"; 

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useContext(AppContext);
  const navigate = useNavigate();

  const {favoriteMovies} = useAppContext()

  const handleSignOut = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-6 bg-transparent">
      
      {/* Left: Logo */}
      <Link to="/" className="flex-shrink-0">
        <img src={assets.logo} alt="Logo" className="w-40 md:w-65 h-auto" />
      </Link>

      {/* Middle: Centered Pill Menu (Desktop) */}
      <div className="hidden md:flex items-center gap-8 px-10 py-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-lg">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <Link to="/movies" className="hover:text-primary transition-colors">Movies</Link>
        <Link to="/" className="hover:text-primary transition-colors">Theaters</Link>
        <Link to="/" className="hover:text-primary transition-colors">Releases</Link>
        {favoriteMovies.length > 0 && <Link to="/favorite" className="hover:text-primary transition-colors">Favorites</Link>}
      </div>

      {/* Right: Search and Auth */}
      <div className="flex items-center gap-6">
        <Search className="w-6 h-6 cursor-pointer hover:text-primary transition-colors" />

        {!user ? (
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-2.5 bg-primary hover:bg-primary-dull text-white transition rounded-full font-medium shadow-lg shadow-primary/20"
          >
            Login
          </button>
        ) : (
          <div className="relative">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <img
                src={user.image || "https://avatar.iran.liara.run/public"}
                alt="avatar"
                className="w-10 h-10 rounded-full border-2 border-primary/50"
              />
              <ChevronDown size={16} className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </div>

            {profileOpen && (
              <div className="absolute right-0 mt-4 w-48 bg-[#1a1a1e] rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden">
                <button
                  onClick={() => { navigate("/my-bookings"); setProfileOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-4 text-sm hover:bg-white/5 transition border-b border-white/5"
                >
                  <Ticket size={16} className="text-primary" />
                  My Bookings
                </button>

                {/* --- NEW VIEW PROFILE BUTTON --- */}
                <button
                  onClick={() => { navigate("/profile"); setProfileOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-4 text-sm hover:bg-white/5 transition"
                >
                  <User size={16} className="text-primary" />
                  View Profile
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-4 text-sm text-red-500 hover:bg-red-500/5 transition border-t border-white/5"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu Toggle */}
        <Menu
          className="md:hidden w-8 h-8 cursor-pointer"
          onClick={() => setIsOpen(true)}
        />
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed top-0 left-0 h-screen w-full bg-black/95 z-[60] flex flex-col items-center justify-center gap-8 transition-transform duration-500 ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <X
          className="absolute top-8 right-8 w-8 h-8 cursor-pointer"
          onClick={() => setIsOpen(false)}
        />
        <Link onClick={() => setIsOpen(false)} to="/" className="text-2xl">Home</Link>
        <Link onClick={() => setIsOpen(false)} to="/movies" className="text-2xl">Movies</Link>
        {favoriteMovies.length > 0 && <Link onClick={() => {scrollTo(0,0); setIsOpen(false)}} to='/favorite'>Favorites</Link>}
        {user && <Link onClick={() => setIsOpen(false)} to="/profile" className="text-2xl">Profile</Link>}
        {!user && (
           <button onClick={() => { setIsOpen(false); navigate("/login"); }} className="px-10 py-3 bg-primary rounded-full">Login</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;