import { useState } from "react";
import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SearchBarIcon({ onSearch, placeholder, isMobile }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false); // Toggle input

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
    setOpen(false); // close input on submit
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
    setOpen(false);
  };

  // For mobile, always show full input
  if (isMobile) {
    return (
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder={placeholder || t("searchPlaceholder")}
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

  // Desktop: show icon only
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        <Search className="w-5 h-5 text-gray-700 dark:text-gray-200" />
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
              placeholder={placeholder || t("searchPlaceholder")}
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
