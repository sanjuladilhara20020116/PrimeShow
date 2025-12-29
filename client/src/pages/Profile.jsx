import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Camera, Trash2, Ticket, Save, LogOut } from "lucide-react";

const Profile = () => {
  const { user, setUser, logout, backendUrl } = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name);
  const [image, setImage] = useState(user?.image);
  const navigate = useNavigate();

  if (!user) return <div className="pt-40 text-center">Please Login...</div>;

  const handleUpdate = async () => {
    const { data } = await axios.post(`${backendUrl}/api/user/update`, { userId: user._id, name, image });
    if (data.success) {
      setUser(data.user);
      localStorage.setItem('userData', JSON.stringify(data.user));
      setIsEditing(false);
      toast.success("Profile Updated");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Delete account permanently?")) {
      await axios.delete(`${backendUrl}/api/user/delete/${user._id}`);
      logout();
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 flex justify-center px-6 bg-[#09090b]">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-[3rem] p-8 h-fit backdrop-blur-md">
        <div className="relative w-32 h-32 mx-auto mb-8 group">
          <img src={image || "https://avatar.iran.liara.run/public"} className="w-full h-full rounded-full object-cover border-4 border-primary p-1" />
          {isEditing && (
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition">
              <Camera className="text-white" />
              <input type="file" className="hidden" onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))} />
            </label>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Full Name</p>
            <input disabled={!isEditing} className="w-full bg-transparent text-white outline-none disabled:text-gray-400" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Email</p>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </div>

        <div className="mt-10 space-y-3">
          {isEditing ? (
            <button onClick={handleUpdate} className="w-full py-4 bg-primary rounded-2xl font-bold flex items-center justify-center gap-2"><Save size={20}/> Save Changes</button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="w-full py-4 border border-primary text-primary hover:bg-primary hover:text-white rounded-2xl font-bold transition">Edit Profile</button>
          )}
          
          <button onClick={() => navigate("/my-bookings")} className="w-full py-4 bg-white/10 flex items-center justify-center gap-2 rounded-2xl font-bold hover:bg-white/20 transition">
            <Ticket size={20} /> My Bookings
          </button>

          <div className="flex gap-2 pt-4">
            <button onClick={logout} className="flex-1 py-3 bg-zinc-800 text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-700 transition"><LogOut size={16}/> Sign Out</button>
            <button onClick={handleDelete} className="flex-1 py-3 bg-red-500/10 text-red-500 text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition"><Trash2 size={16}/> Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;