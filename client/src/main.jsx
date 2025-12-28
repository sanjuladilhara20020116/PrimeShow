import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";

// ✅ send cookies to backend
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:5000";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
