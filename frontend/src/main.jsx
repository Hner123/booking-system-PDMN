import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import "react-datepicker/dist/react-datepicker.css";
import "rc-time-picker/assets/index.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <BrowserRouter>
    <ToastContainer />
    <App />
  </BrowserRouter>
  // {/* </React.StrictMode>, */}
);
