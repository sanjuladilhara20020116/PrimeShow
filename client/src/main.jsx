import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext"; // Import the provider

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Ensure the Provider wraps the App component */}
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);