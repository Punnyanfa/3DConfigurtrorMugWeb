import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App"; // Update the import path to point to src/components/App.jsx
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);