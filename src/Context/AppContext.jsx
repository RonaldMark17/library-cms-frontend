import { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [loading, setLoading] = useState(true);
  const [siteName, setSiteName] = useState("LibroSys"); // default site name

  // Fetch initial site name
  useEffect(() => {
    async function fetchSiteName() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/settings`);
        const data = await res.json();
        setSiteName(data.site_name || "LibroSys");
      } catch (err) {
        console.error("Error fetching site name:", err);
      }
    }
    fetchSiteName();
  }, []);

  // Fetch current user
  useEffect(() => {
    async function getUser() {
      if (!token) return setLoading(false);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setToken("");
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    getUser();
  }, [token]);

  // Theme handling
  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <AppContext.Provider value={{
      token, setToken,
      user, setUser,
      theme, toggleTheme,
      loading,
      siteName, setSiteName
    }}>
      {children}
    </AppContext.Provider>
  );
}
