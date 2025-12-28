import { useState } from "react";
import axios from "axios";

const AuthCard = ({ onClose, setUser }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = async () => {
    const url = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
    const res = await axios.post(url, form);
    setUser(res.data);
    onClose();
  };

  return (
    <div className="absolute right-0 mt-4 w-80 bg-black/90 border border-gray-700 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">
        {mode === "login" ? "Sign In" : "Sign Up"}
      </h2>

      {mode === "signup" && (
        <input placeholder="Name" className="input" onChange={e=>setForm({...form,name:e.target.value})}/>
      )}
      <input placeholder="Email" className="input" onChange={e=>setForm({...form,email:e.target.value})}/>
      <input type="password" placeholder="Password" className="input" onChange={e=>setForm({...form,password:e.target.value})}/>

      <button onClick={submit} className="w-full mt-4 bg-primary rounded-full py-2">
        {mode === "login" ? "Login" : "Create account"}
      </button>

      <p className="mt-3 text-sm text-center cursor-pointer"
         onClick={() => setMode(mode === "login" ? "signup" : "login")}>
        {mode === "login" ? "Create account" : "Already have account?"}
      </p>
    </div>
  );
};

export default AuthCard;
