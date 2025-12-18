import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";

const API_URL = import.meta.env.VITE_API_URL;

export default function Announcements() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting & Filtering
  const [sortOption, setSortOption] = useState("date"); // date | priority
  const [sortDirection, setSortDirection] = useState("desc"); // asc | desc
  const [filterPriority, setFilterPriority] = useState(""); // high | medium | low | ""
  const [filterFromDate, setFilterFromDate] = useState(""); // YYYY-MM-DD
  const [filterToDate, setFilterToDate] = useState(""); // YYYY-MM-DD

  useEffect(() => {
    fetchAnnouncements();
  }, [currentPage, sortOption, sortDirection, filterPriority, filterFromDate, filterToDate]);

  async function fetchAnnouncements() {
    setLoading(true);
    try {
      // Build query params
      let query = `?page=${currentPage}&sort=${sortOption}&direction=${sortDirection}`;
      if (filterPriority) query += `&priority=${filterPriority}`;
      if (filterFromDate) query += `&from_date=${filterFromDate}`;
      if (filterToDate) query += `&to_date=${filterToDate}`;

      const res = await fetch(`${API_URL}/announcements${query}`);
      if (!res.ok) throw new Error("Failed to fetch announcements");
      const data = await res.json();
      let items = data.data || data;

      // Local filtering by date
      const today = new Date();
      items = items.filter(a => {
        const published = new Date(a.published_at);
        const expires = a.expires_at ? new Date(a.expires_at) : null;
        let valid = published <= today && (!expires || expires >= today);

        if (filterFromDate) valid = valid && published >= new Date(filterFromDate);
        if (filterToDate) valid = valid && published <= new Date(filterToDate);

        return valid;
      });

      // Manual sorting
      if (sortOption === "date") {
        items.sort((a, b) => sortDirection === "asc"
          ? new Date(a.published_at) - new Date(b.published_at)
          : new Date(b.published_at) - new Date(a.published_at)
        );
      } else if (sortOption === "priority") {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        items.sort((a, b) => sortDirection === "asc"
          ? (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4)
          : (priorityOrder[b.priority] || 4) - (priorityOrder[a.priority] || 4)
        );
      }

      setAnnouncements(items);
      setTotalPages(data.last_page || 1);
    } catch (error) {
      console.error(error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }

  const priorityColors = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800"
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  if (!announcements.length) return (
    <div className="text-center py-12">
      <p className="text-gray-600 dark:text-gray-400">{t('noAnnouncements') || 'No announcements available.'}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-12">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('latestNews')}</h1>

        <div className="flex flex-wrap items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg shadow-sm">
          {/* Sort Option */}
          <div className="flex items-center gap-1">
            <span className="text-gray-700 dark:text-gray-300">{t('Sort By')}:</span>
            <select
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
              className="border rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
            >
              <option value="date">{t('Date')}</option>
              <option value="priority">{t('Priority')}</option>
            </select>
          </div>

          {/* Sort Direction */}
          <div className="flex items-center gap-1">
            <span className="text-gray-700 dark:text-gray-300">{t('Sort')}:</span>
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="border rounded px-2 py-1 flex items-center gap-1 dark:bg-gray-700 dark:text-white"
            >
              {sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {sortDirection === 'asc' ? t('Ascending') : t('Descending')}
            </button>
          </div>



          {/* Date Filters */}
          <div className="flex items-center gap-1">
            <span className="text-gray-700 dark:text-gray-300">{t('From')}:</span>
            <input
              type="date"
              value={filterFromDate}
              onChange={e => setFilterFromDate(e.target.value)}
              className="border rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
            />
            <span className="text-gray-700 dark:text-gray-300">{t('To')}:</span>
            <input
              type="date"
              value={filterToDate}
              onChange={e => setFilterToDate(e.target.value)}
              className="border rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
            />
          </div>

          
        </div>
      </div>

      {/* Announcement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {announcements.map(a => (
          <div key={a.id} className="bg-white dark:bg-gray-900 rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col">
            {a.image_url ? (
              <img
                src={a.image_url}
                className="w-full h-48 object-cover rounded-lg mb-4"
                alt={a.title[lang] || a.title.en}
              />
            ) : (
              <div className="w-full h-48 mb-4 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            )}

            <div className="flex flex-col flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded text-sm font-semibold ${priorityColors[a.priority] || "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"}`}>
                  {a.priority?.charAt(0).toUpperCase() + a.priority?.slice(1)}
                </span>
                <span className="flex items-center text-gray-500 dark:text-gray-400 text-sm gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(a.published_at).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {a.title[lang] || a.title.en}
              </h3>

              <p className="text-gray-600 dark:text-gray-400 flex-1 mb-4">
                {a.content[lang] || a.content.en}
              </p>

              <Link
                to={`/announcements/${a.id}`}
                className="self-start text-primary-600 dark:text-primary-400 font-semibold hover:underline"
              >
                {t('readMore')}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
