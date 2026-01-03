import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Camera, Trash2, Ticket, Save, LogOut, Eye, EyeOff } from "lucide-react";

const Profile = () => {
  const { user, setUser, logout, backendUrl } = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  
  const [name, setName] = useState(user?.name);
  const [email, setEmail] = useState(user?.email);
  const [password, setPassword] = useState(""); 
  const [image, setImage] = useState(user?.image);
  
  const navigate = useNavigate();

  // Keep local state in sync if global user object changes
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setImage(user.image);
    }
  }, [user]);

  if (!user) return <div className="pt-40 text-center text-white">Please Login...</div>;

  // Function to convert file to Base64 so it can be stored in MongoDB
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // This creates a permanent Base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    try {
      const updateData = { userId: user._id, name, email, image };
      if (password) {
        updateData.password = password;
      }

      const { data } = await axios.post(`${backendUrl}/api/user/update`, updateData);
      
      if (data.success) {
        // Update global state and localStorage with the fresh data from server
        setUser(data.user);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        setIsEditing(false);
        setPassword(""); 
        setShowPassword(false);
        toast.success("Profile Updated");
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      console.error("Update Error:", error);
      toast.error(error.response?.data?.message || "Server error: Update failed");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Delete account permanently?")) {
      try {
        await axios.delete(`${backendUrl}/api/user/delete/${user._id}`);
        logout();
        navigate("/");
      } catch (error) {
        toast.error("Delete failed");
      }
    }
  };

  return (
    <div className="min-h-screen pt-50 pb-20 flex justify-center px-6 bg-[#09090b]">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-[3rem] p-8 h-fit backdrop-blur-md">
        <div className="relative w-32 h-32 mx-auto mb-8 group">
          <img 
            src={image || "https://avatar.iran.liara.run/public"} 
            className="w-full h-full rounded-full object-cover border-4 border-primary p-1" 
            alt="Profile" 
          />
          {isEditing && (
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition">
              <Camera className="text-white" />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageChange} 
              />
            </label>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Full Name</p>
            <input 
              disabled={!isEditing} 
              className="w-full bg-transparent text-white outline-none disabled:text-gray-400" 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Email</p>
            <input 
              disabled={!isEditing} 
              className="w-full bg-transparent text-white outline-none disabled:text-gray-400" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>

          {isEditing && (
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 relative">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">New Password (Optional)</p>
              <div className="flex items-center">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Leave blank to keep current" 
                  className="w-full bg-transparent text-white outline-none" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 space-y-3">
          {isEditing ? (
            <button onClick={handleUpdate} className="w-full py-4 bg-primary rounded-2xl font-bold flex items-center justify-center gap-2 text-white transition active:scale-95 shadow-lg shadow-primary/20">
              <Save size={20}/> Save Changes
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="w-full py-4 border border-primary text-primary hover:bg-primary hover:text-white rounded-2xl font-bold transition">
              Edit Profile
            </button>
          )}
          
          <button onClick={() => navigate("/my-bookings")} className="w-full py-4 bg-white/10 flex items-center justify-center gap-2 rounded-2xl font-bold hover:bg-white/20 transition text-white">
            <Ticket size={20} /> My Bookings
          </button>

          <div className="flex gap-2 pt-4">
            <button onClick={logout} className="flex-1 py-3 bg-zinc-800 text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-700 transition text-white"><LogOut size={16}/> Sign Out</button>
            <button onClick={handleDelete} className="flex-1 py-3 bg-red-500/10 text-red-500 text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition"><Trash2 size={16}/> Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;