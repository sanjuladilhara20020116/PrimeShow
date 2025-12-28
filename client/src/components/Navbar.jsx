import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import {
  Menu,
  Search,
  X,
  Ticket,
  ChevronDown,
  Edit,
  Trash2,
  LogOut,
} from "lucide-react";
import axios from "axios";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    image: "",
  });

  const cardRef = useRef(null);
  const navigate = useNavigate();

  /* ---------- CLOSE ON OUTSIDE CLICK ---------- */
  useEffect(() => {
    const close = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setProfileOpen(false);
        setFormOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  /* ---------- LOAD USER SESSION ---------- */
  useEffect(() => {
    axios.get("/api/auth/me").then((res) => {
      if (res.data) {
        setUser(res.data);
        setFormData({ ...res.data, password: "" });
      }
    });
  }, []);

  /* ---------- SIGN IN ---------- */
  const handleSignIn = async () => {
  console.log("Sending login request", formData);
  try {
    const { data } = await axios.post("/api/auth/login", {
      email: formData.email,
      password: formData.password,
    });
    console.log("Login success:", data);
    setUser(data);
    setProfileOpen(false);
  } catch (err) {
    console.log(err.response?.data);
    alert(err.response?.data?.message || "Login failed");
  }
};

  /* ---------- SIGN UP ---------- */
  const handleSignUp = async () => {
    if (!formData.name || !formData.email || !formData.password)
      return alert("All fields required");

    const { data } = await axios.post("/api/auth/signup", formData);

    setUser(data);
    setProfileOpen(false);
    setFormData({ name: "", email: "", password: "", image: "" });
  };

  /* ---------- UPDATE ---------- */
  const handleUpdate = async () => {
    const { data } = await axios.put("/api/auth/update", {
      name: formData.name,
      email: formData.email,
      image: formData.image,
    });

    setUser(data);
    setFormOpen(false);
  };

  /* ---------- DELETE ---------- */
  const handleDelete = async () => {
    if (!confirm("Delete account permanently?")) return;
    await axios.delete("/api/auth/delete");
    setUser(null);
    setProfileOpen(false);
  };

  /* ---------- LOGOUT ---------- */
  const handleSignOut = async () => {
    await axios.post("/api/auth/logout");
    setUser(null);
    setProfileOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-2">
      {/* Logo */}
      <Link to="/" className="max-md:flex-1">
        <img src={assets.logo} className="w-80" />
      </Link>

      {/* Menu */}
      <div
        className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium
        max-md:text-lg z-50 flex flex-col md:flex-row items-center
        max-md:justify-center gap-8 md:px-8 py-3 max-md:h-screen
        md:rounded-full backdrop-blur bg-black/70 md:bg-white/10 md:border
        border-gray-300/20 transition-[width] duration-300
        ${isOpen ? "max-md:w-full" : "max-md:w-0"}`}
      >
        <X
          className="md:hidden absolute top-6 right-6 cursor-pointer"
          onClick={() => setIsOpen(false)}
        />
        <Link to="/">Home</Link>
        <Link to="/movies">Movies</Link>
        <Link to="/">Theaters</Link>
        <Link to="/">Releases</Link>
        <Link to="/favorites">Favorites</Link>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6 relative">
        <Search className="max-md:hidden w-6 h-6" />

        {!user ? (
          <div className="relative" ref={cardRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="px-6 py-2 bg-primary rounded-full"
            >
              Login
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-black/90 rounded-xl p-4 border flex flex-col gap-3">
                <input
                  placeholder="Email"
                  className="p-2 bg-white/10 rounded"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="p-2 bg-white/10 rounded"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button onClick={handleSignIn} className="bg-primary py-2 rounded">
                  Sign In
                </button>

                <hr className="border-gray-600" />

                <input
                  placeholder="Name"
                  className="p-2 bg-white/10 rounded"
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <input
                  placeholder="Image URL"
                  className="p-2 bg-white/10 rounded"
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                />
                <button onClick={handleSignUp} className="bg-primary py-2 rounded">
                  Sign Up
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="relative" ref={cardRef}>
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setFormOpen(false);
                setFormData({ ...user });
              }}
            >
              <img src={user.image} className="w-9 h-9 rounded-full" />
              <ChevronDown size={16} />
            </div>

            {profileOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-black/90 rounded-xl p-4 border flex flex-col gap-3">
                {formOpen ? (
                  <>
                    <input
                      className="p-2 bg-white/10 rounded"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                    <input
                      className="p-2 bg-white/10 rounded"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                    <input
                      className="p-2 bg-white/10 rounded"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                    />
                    <button onClick={handleUpdate} className="bg-primary py-2 rounded">
                      Update
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <img src={user.image} className="w-12 h-12 rounded-full" />
                      <div>
                        <p>{user.name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>

                    <button onClick={() => setFormOpen(true)} className="bg-gray-700 py-2 rounded">
                      <Edit size={16} /> Edit
                    </button>
                    <button onClick={handleDelete} className="bg-red-700 py-2 rounded">
                      <Trash2 size={16} /> Delete Account
                    </button>
                    <button
                      onClick={() => navigate("/my-bookings")}
                      className="bg-blue-600 py-2 rounded"
                    >
                      <Ticket size={16} /> My Bookings
                    </button>
                    <button onClick={handleSignOut} className="bg-gray-600 py-2 rounded">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </>
                )}
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
