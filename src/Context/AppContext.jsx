// Context/AppContext.jsx
import { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [token, setToken] = useState("");
  const [siteName, setSiteName] = useState("LibroSys"); // default site name

  // Fetch initial site name on app load
  useEffect(() => {
    const fetchSiteName = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/settings`);
        const data = await res.json();
        setSiteName(data.site_name || "LibroSys");
      } catch (err) {
        console.error("Error fetching site name:", err);
      }
    };
    fetchSiteName();
  }, []);

  return (
    <AppContext.Provider value={{ token, setToken, siteName, setSiteName }}>
      {children}
    </AppContext.Provider>
  );
}
