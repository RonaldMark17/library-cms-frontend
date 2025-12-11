import { useState, useEffect } from "react";
import { AppContext } from "./AppContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function AppProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [defaultLanguage, setDefaultLanguage] = useState("en");
  const [siteName, setSiteName] = useState("LibroSys");
  const [loading, setLoading] = useState(true);

  // Fetch user
  useEffect(() => {
    async function getUser() {
      if (!token) return setLoading(false);
      try {
        const res = await fetch(`${API_URL}/me`, {
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
        console.error("Error fetching user:", err);
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

  const toggleTheme = () => setTheme(prev => (prev === "light" ? "dark" : "light"));

  // Update system settings
  async function updateSettings(newSettings) {
    try {
      const res = await fetch(`${API_URL}/settings/bulk`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings: newSettings }),
      });

      if (!res.ok) {
        const err = await res.json();
        return { success: false, message: err.message || "Failed to update settings" };
      }

      const data = await res.json();
      return { success: true, message: data.message || "Settings updated successfully" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error updating settings" };
    }
  }

  return (
    <AppContext.Provider
      value={{
        token,
        setToken,
        user,
        setUser,
        theme,
        setTheme,
        toggleTheme,
        defaultLanguage,
        setDefaultLanguage,
        siteName,
        setSiteName,
        loading,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
