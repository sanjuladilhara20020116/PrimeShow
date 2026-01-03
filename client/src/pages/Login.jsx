import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react"; 

const Login = () => {
  const [state, setState] = useState("Login");
  const [showPassword, setShowPassword] = useState(false); 
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  
  const { backendUrl, setUser } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = state === "Login" ? "/api/auth/login" : "/api/auth/register";
      const { data } = await axios.post(backendUrl + endpoint, formData);

      if (data.success) {
        setUser(data.user); 
        localStorage.setItem("userData", JSON.stringify(data.user));
        toast.success(`${state} Successful`);
        
        // Redirect to admin dashboard if the user is the admin
        if (data.user.email === "admin@primeshow.com") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Connection error to server");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
        <h2 className="text-4xl font-bold mb-2 text-white">{state}</h2>
        <p className="text-gray-400 mb-8">Access your PrimeShow account</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {state === "Sign Up" && (
            <input 
              type="text" 
              placeholder="Full Name" 
              required 
              className="w-full p-4 bg-white/10 rounded-2xl border border-white/10 text-white outline-none focus:border-primary" 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          )}
          <input 
            type="email" 
            placeholder="Email Address" 
            required 
            className="w-full p-4 bg-white/10 rounded-2xl border border-white/10 text-white outline-none focus:border-primary" 
            onChange={e => setFormData({...formData, email: e.target.value})} 
          />
          
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              required 
              className="w-full p-4 bg-white/10 rounded-2xl border border-white/10 text-white outline-none focus:border-primary pr-12" 
              onChange={e => setFormData({...formData, password: e.target.value})} 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
            
          <button type="submit" className="w-full py-4 bg-primary hover:bg-primary-dull text-white rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-lg shadow-primary/20">
            {state} 
          </button>
        </form>

        <p className="mt-8 text-center text-gray-400">
          {state === "Login" ? "New here?" : "Already have an account?"} 
          <button onClick={() => setState(state === "Login" ? "Sign Up" : "Login")} className="ml-2 text-primary font-bold hover:underline">
            {state === "Login" ? "Create Account" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;