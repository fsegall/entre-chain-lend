
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("Main.tsx is executing");
console.log("Environment variables check:", {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "not defined",
  hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  redirectUrl: import.meta.env.VITE_AUTH_REDIRECT_URL || "not defined"
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
