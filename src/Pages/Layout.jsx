import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AppContext } from "../Context/AppContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../Components/LanguageSwitcher";
import ThemeToggle from "../Components/ThemeToggle";
import { Menu, X, BookOpen, Search as SearchIcon } from "lucide-react";
import * as Icons from "lucide-react"; // for dynamic icons
import LoadingSpinner from "../Components/LoadingSpinner";

const API_URL = import.meta.env.VITE_API_URL;

// Search component
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
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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

// User dropdown
function UserDropdown({ user, t, handleLogout }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeClass = ({ isActive }) =>
    `px-4 py-2 text-sm rounded ${isActive ? "bg-primary-500 text-white" : "text-gray-700 dark:text-gray-200"} hover:bg-gray-100 dark:hover:bg-gray-700`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-1 px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{user.name}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 shadow-lg rounded-md z-50">
          <div className="flex flex-col py-1">
            {(user.role === "admin" || user.role === "librarian") && (
              <NavLink to="/dashboard" className={activeClass}>
                {t("dashboard")}
              </NavLink>
            )}
            <NavLink to="/settings" className={activeClass}>{t("settings")}</NavLink>
            <form onSubmit={handleLogout}>
              <button
                type="submit"
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
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
  const { user, token, setUser, setToken, loading, siteName, defaultLanguage } = useContext(AppContext);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);

  // Update i18n language dynamically
  useEffect(() => {
    i18n.changeLanguage(defaultLanguage);
  }, [defaultLanguage]);

  // Fetch menu items
  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch(`${API_URL}/menu-items`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch menu");
        const data = await res.json();
        setMenuItems(data.filter(item => !item.hidden)); // only show non-hidden items
      } catch (err) {
        console.error("Error fetching menu:", err);
      } finally {
        setMenuLoading(false);
      }
    }
    if (token) fetchMenu();
  }, [token]);

  // Logout
  async function handleLogout(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/logout`, {
        headers: { Authorization: `Bearer ${token}` },
        method: "POST",
      });
      if (res.ok) {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        navigate("/login");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  if (loading) return <LoadingSpinner />;

  const activeClass = ({ isActive }) =>
    `nav-link px-3 py-1 rounded ${isActive ? "bg-primary-500 text-white" : ""}`;

  // Render menu items, with optional footer styling
  const renderMenu = (items, parentId = null, isFooter = false) =>
    items
      .filter((item) => item.parent_id === parentId && item.is_active)
      .map((item) => {
        const children = renderMenu(items, item.id, isFooter);
        const linkClass = isFooter
          ? "text-gray-700 dark:text-gray-200 hover:underline" // footer style
          : activeClass; // header style

        if (children.length > 0) {
          return (
            <div key={item.id} className="relative group">
              <NavLink to={item.url || "#"} className={linkClass}>
                {item.label.en}
              </NavLink>
              <div className="absolute hidden group-hover:block bg-white dark:bg-gray-800 shadow-lg rounded mt-1">
                {children}
              </div>
            </div>
          );
        }
        return (
          <NavLink key={item.id} to={item.url || "#"} className={linkClass}>
            {item.label.en}
          </NavLink>
        );
      });

  const handleSearch = (query) => {
    if (query) navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">{siteName}</span>
            </NavLink>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-4">
              {menuLoading ? <LoadingSpinner /> : renderMenu(menuItems)}
              <div className="ml-4">
                <SearchBarIcon onSearch={handleSearch} />
              </div>
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center space-x-3">
              <ThemeToggle />
              <LanguageSwitcher />
              {!user ? (
                <NavLink to="/login" className="primary-btn">{t("login")}</NavLink>
              ) : (
                <UserDropdown user={user} t={t} handleLogout={handleLogout} />
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col space-y-3">
                {menuLoading ? <LoadingSpinner /> : renderMenu(menuItems)}
                <div className="pt-2">
                  <SearchBarIcon onSearch={handleSearch} isMobile />
                </div>
                <div className="flex items-center space-x-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <ThemeToggle />
                  <LanguageSwitcher />
                </div>
                {!user ? (
                  <>
                    <NavLink to="/login" className="primary-btn text-center" onClick={() => setMobileMenuOpen(false)}>{t("login")}</NavLink>
                    <NavLink to="/register" className="secondary-btn text-center" onClick={() => setMobileMenuOpen(false)}>{t("register")}</NavLink>
                  </>
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

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet context={{ menuItems, setMenuItems }} />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About / Site */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{siteName}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Empowering minds and enriching lives through knowledge, innovation, and community engagement.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
              <div className="flex flex-col space-y-2">
                {menuLoading ? <LoadingSpinner /> : renderMenu(menuItems, null, true)}
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Email: <a href="mailto:library@example.com" className="hover:underline">library@example.com</a><br />
                Phone: <a href="tel:+1234567890" className="hover:underline">(123) 456-7890</a><br />
                Address: 123 Library Street, Knowledge City, 4567<br />
                Hours: Mon-Fri 8:00am - 6:00pm
              </p>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">
                  <Icons.Facebook className="w-5 h-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-400">
                  <Icons.Twitter className="w-5 h-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-pink-500">
                  <Icons.Instagram className="w-5 h-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-700">
                  <Icons.Linkedin className="w-5 h-5" />
                </a>
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
