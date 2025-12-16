import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AppContext } from "../Context/AppContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../Components/LanguageSwitcher";
import ThemeToggle from "../Components/ThemeToggle";
import { Menu, X, Search as SearchIcon } from "lucide-react";
import * as Icons from "lucide-react";
import LoadingSpinner from "../Components/LoadingSpinner";

const API_URL = import.meta.env.VITE_API_URL;

function SearchBarIcon({ onSearch, isMobile }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const handleChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
    setOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
    setOpen(false);
  };

  if (isMobile) {
    return (
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Search..."
            autoFocus
            className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-full
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white
                       text-sm transition-all duration-150"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        <SearchIcon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          className="absolute right-0 top-full mt-2 w-48 md:w-64 lg:w-72"
        >
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={handleChange}
              placeholder="Search..."
              autoFocus
              className="w-full pl-3 pr-10 py-1.5 border border-gray-300 dark:border-gray-600 rounded-full
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white
                         text-sm transition-all duration-150"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

function UserDropdown({ user, t, handleLogout }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLinkClick = () => setOpen(false);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.name}</span>
        <Icons.ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-xl rounded-lg z-50 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex flex-col">
            {(user.role === "admin" || user.role === "librarian") && (
              <NavLink
                to="/dashboard"
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                onClick={handleLinkClick}
              >
                {t("dashboard")}
              </NavLink>
            )}
            <NavLink
              to="/settings"
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              onClick={handleLinkClick}
            >
              {t("settings")}
            </NavLink>
            <form
              onSubmit={(e) => {
                handleLogout(e);
                setOpen(false);
              }}
            >
              <button
                type="submit"
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                {t("logout")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const { user, token, setUser, setToken, loading, siteName, defaultLanguage, theme } = useContext(AppContext);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (id) => setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => { i18n.changeLanguage(defaultLanguage); }, [defaultLanguage]);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch(`${API_URL}/menu-items`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to fetch menu");
        const data = await res.json();
        setMenuItems(data.filter(item => !item.hidden));
      } catch (err) {
        console.error(err);
      } finally { setMenuLoading(false); }
    }
    if (token) fetchMenu();
  }, [token]);

  async function handleLogout(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/logout`, { headers: { Authorization: `Bearer ${token}` }, method: "POST" });
      if (res.ok) {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        navigate("/login");
      }
    } catch (err) { console.error(err); }
  }

  if (loading) return <LoadingSpinner />;

  const renderMenu = (items, parentId = null, isMobile = false) =>
    items
      .filter(item => item.parent_id === parentId && item.is_active)
      .map(item => {
        const children = items.filter(child => child.parent_id === item.id && child.is_active);
        const label = item.label[i18n.language] || item.label.en;

        if (children.length > 0) {
          if (isMobile) {
            return (
              <div key={item.id} className="flex flex-col">
                <button
                  className="flex justify-between items-center px-3 py-2 w-full text-left text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                  onClick={() => toggleItem(item.id)}
                >
                  {label}
                  <Icons.ChevronDown className={`w-4 h-4 transition-transform ${openItems[item.id] ? "rotate-180" : ""}`} />
                </button>
                {openItems[item.id] && (
                  <div className="pl-4 flex flex-col space-y-1">
                    {renderMenu(items, item.id, isMobile)}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={item.id} className="relative group">
              <NavLink
                to={item.url || "#"}
                className="px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center space-x-1 text-gray-700 dark:text-gray-200"
              >
                <span>{label}</span>
                <Icons.ChevronDown className="w-3 h-3" />
              </NavLink>
              <div className="absolute left-0 hidden group-hover:block bg-white dark:bg-gray-800 shadow-lg rounded mt-1 min-w-[200px] z-50">
                {renderMenu(items, item.id)}
              </div>
            </div>
          );
        }

        return (
          <NavLink
            key={item.id}
            to={item.url || "#"}
            className={({ isActive }) =>
              `px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition ${isActive ? "bg-primary-500 text-white" : "text-gray-700 dark:text-gray-200"}`
            }
          >
            {label}
          </NavLink>
        );
      });

  const handleSearch = (query) => { if (query) navigate(`/search?q=${encodeURIComponent(query)}`); };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <NavLink to="/" className="flex items-center space-x-2">
              <img
                src={theme === "dark" ? "/3.png" : "/4.png"}
                alt={siteName}
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white">{siteName}</span>
            </NavLink>

            <div className="hidden md:flex items-center space-x-4">
              {menuLoading ? <LoadingSpinner /> : renderMenu(menuItems)}
              <div className="ml-4">
                <SearchBarIcon onSearch={handleSearch} />
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-3">
              <ThemeToggle />
              <LanguageSwitcher />
              {!user ? (
                <NavLink to="/login" className="primary-btn">{t("login")}</NavLink>
              ) : (
                <UserDropdown user={user} t={t} handleLogout={handleLogout} />
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col space-y-3">
                {menuLoading ? <LoadingSpinner /> : renderMenu(menuItems, null, true)}
                <div className="pt-2">
                  <SearchBarIcon onSearch={handleSearch} isMobile />
                </div>
                <div className="flex items-center space-x-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <ThemeToggle />
                  <LanguageSwitcher />
                </div>
                {!user ? (
                  <NavLink to="/login" className="primary-btn text-center" onClick={() => setMobileMenuOpen(false)}>{t("login")}</NavLink>
                ) : (
                  <form onSubmit={handleLogout} className="pt-3">
                    <button className="danger-btn w-full">{t("logout")}</button>
                  </form>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      <main className="bg-gray-50 dark:bg-gray-900 transition-colors">
        <Outlet context={{ menuItems, setMenuItems }} />
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{siteName}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Empowering minds and enriching lives through knowledge, innovation, and community engagement.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
              <div className="flex flex-col space-y-2">
                {menuLoading ? <LoadingSpinner /> : menuItems.filter(i => !i.parent_id).map(i => {
                  const label = i.label[i18n.language] || i.label.en;
                  return <NavLink key={i.id} to={i.url || "#"} className="hover:underline text-gray-700 dark:text-gray-200">{label}</NavLink>
                })}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Email: <a href="mailto:library@example.com" className="hover:underline">library@example.com</a><br />
                Phone: <a href="tel:+1234567890" className="hover:underline">(123) 456-7890</a><br />
                Address: 123 Library Street, Knowledge City, 4567<br />
                Hours: Mon-Fri 8:00am - 6:00pm
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Follow Us</h3>
              <div className="flex space-x-4 text-gray-600 dark:text-gray-400">
                <Icons.Facebook className="w-5 h-5 hover:text-blue-600 transition" />
                <Icons.Twitter className="w-5 h-5 hover:text-blue-400 transition" />
                <Icons.Instagram className="w-5 h-5 hover:text-pink-500 transition" />
                <Icons.Linkedin className="w-5 h-5 hover:text-blue-700 transition" />
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-600 dark:text-gray-400 text-sm">
            © 2025 {siteName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
