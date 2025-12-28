import axios from "axios";
import { Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfileCard = ({ user, setUser }) => {
  const nav = useNavigate();

  return (
    <div className="absolute right-0 mt-4 w-72 bg-black/90 rounded-xl p-4 border">
      <img src={user.image} className="w-14 h-14 rounded-full mx-auto"/>
      <p className="text-center mt-2">{user.name}</p>
      <p className="text-xs text-center text-gray-400">{user.email}</p>

      <button onClick={()=>nav("/my-bookings")}
        className="btn w-full mt-4 flex gap-2 justify-center">
        <Ticket size={16}/> My Bookings
      </button>

      <button onClick={async()=>{
        await axios.post("/api/auth/logout");
        setUser(null);
      }} className="btn w-full mt-2">
        Sign Out
      </button>

      <button onClick={async()=>{
        await axios.delete("/api/auth/delete");
        setUser(null);
      }} className="btn w-full mt-2 text-red-500">
        Delete Account
      </button>
    </div>
  );
};

export default ProfileCard;
