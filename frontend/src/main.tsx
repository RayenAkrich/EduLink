import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { UserContext } from "./context/UserContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UserContext.Provider value={{
      id_user: Number(localStorage.getItem("id_user")) || 1,
      token: localStorage.getItem("token") || "TEST_TOKEN"
    }}>
      <App />
    </UserContext.Provider>
  </React.StrictMode>
);
