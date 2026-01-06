import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./context/AppContext.jsx"; // Import the provider

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Ensure the Provider wraps the App component */}
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);