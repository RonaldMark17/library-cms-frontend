import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
import { AppContext } from "../Context/AppContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../Components/LanguageSwitcher";
import ThemeToggle from "../Components/ThemeToggle";
import {
  Menu,
  X,
  BookOpen,
  Search as SearchIcon,
} from "lucide-react";
import LoadingSpinner from "../Components/LoadingSpinner";

// Backend API URL from environment
const API_URL = import.meta.env.VITE_API_URL;

// Search icon-only component
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

// User dropdown component
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
    `px-4 py-2 text-sm rounded ${
      isActive
        ? "bg-primary-500 text-white"
        : "text-gray-700 dark:text-gray-200"
    } hover:bg-gray-100 dark:hover:bg-gray-700`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-1 px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {user.name}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 shadow-lg rounded-md z-50">
          <div className="flex flex-col py-1">
            {(user.role === "admin" || user.role === "librarian") && (
              <NavLink to="/dashboard" className={activeClass}>
                {t("dashboard")}
              </NavLink>
            )}
            <NavLink to="/settings" className={activeClass}>
              {t("settings")}
            </NavLink>
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
  const { user, token, setUser, setToken, loading } = useContext(AppContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  const handleSearch = (query) => {
    if (query) navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  if (loading) return <LoadingSpinner />;

  const activeClass = ({ isActive }) =>
    `nav-link px-3 py-1 rounded ${isActive ? "bg-primary-500 text-white" : ""}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                LibroSys
              </span>
            </NavLink>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <NavLink to="/" className={activeClass}>
                {t("home")}
              </NavLink>
              <NavLink to="/about" className={activeClass}>
                {t("about")}
              </NavLink>
              <NavLink to="/staff" className={activeClass}>
                {t("staff")}
              </NavLink>
              <NavLink to="/announcements" className={activeClass}>
                {t("announcements")}
              </NavLink>
              <NavLink to="/resources" className={activeClass}>
                {t("resources")}
              </NavLink>

              {/* Search icon */}
              <div className="ml-4">
                <SearchBarIcon onSearch={handleSearch} />
              </div>
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center space-x-3">
              <ThemeToggle />
              <LanguageSwitcher />

              {!user ? (
                <NavLink to="/login" className="primary-btn">
                  {t("login")}
                </NavLink>
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

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col space-y-3">
                <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className={activeClass}>
                  {t("home")}
                </NavLink>
                <NavLink to="/about" onClick={() => setMobileMenuOpen(false)} className={activeClass}>
                  {t("about")}
                </NavLink>
                <NavLink to="/staff" onClick={() => setMobileMenuOpen(false)} className={activeClass}>
                  {t("staff")}
                </NavLink>
                <NavLink to="/announcements" onClick={() => setMobileMenuOpen(false)} className={activeClass}>
                  {t("announcements")}
                </NavLink>
                <NavLink to="/resources" onClick={() => setMobileMenuOpen(false)} className={activeClass}>
                  {t("resources")}
                </NavLink>

                {/* Mobile search */}
                <div className="pt-2">
                  <SearchBarIcon onSearch={handleSearch} isMobile />
                </div>

                {user && (user.role === "admin" || user.role === "librarian") && (
                  <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={activeClass}>
                    {t("dashboard")}
                  </NavLink>
                )}

                <div className="flex items-center space-x-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <ThemeToggle />
                  <LanguageSwitcher />
                </div>

                {!user ? (
                  <>
                    <NavLink to="/login" className="primary-btn text-center" onClick={() => setMobileMenuOpen(false)}>
                      {t("login")}
                    </NavLink>
                    <NavLink to="/register" className="secondary-btn text-center" onClick={() => setMobileMenuOpen(false)}>
                      {t("register")}
                    </NavLink>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">LibroSys</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Empowering communities through knowledge and innovation.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
              <div className="flex flex-col space-y-2">
                <NavLink to="/about" className={activeClass}>{t("about")}</NavLink>
                <NavLink to="/staff" className={activeClass}>{t("staff")}</NavLink>
                <NavLink to="/announcements" className={activeClass}>{t("announcements")}</NavLink>
                <NavLink to="/resources" className={activeClass}>{t("resources")}</NavLink>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Email: library@example.com<br />
                Phone: (123) 456-7890
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-600 dark:text-gray-400 text-sm">
            © 2025 LibroSys. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
