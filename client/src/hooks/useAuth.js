import { useEffect, useState } from "react";
import axios from "axios";

export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get("/api/auth/me").then(res => setUser(res.data));
  }, []);

  return { user, setUser };
};
