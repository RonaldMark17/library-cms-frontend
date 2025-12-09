import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search as SearchIcon } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Search() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState({
    announcements: [],
    staff: [],
    pages: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      searchContent();
    }
  }, [query]);

  async function searchContent() {
    setLoading(true);
    try {
      const [announcementsRes, staffRes, pagesRes] = await Promise.all([
        fetch(`${API_URL}/announcements`),
        fetch(`${API_URL}/staff-members`),
        fetch(`${API_URL}/pages`)
      ]);

      const [announcements, staff, pages] = await Promise.all([
        announcementsRes.json(),
        staffRes.json(),
        pagesRes.json()
      ]);

      const currentLang = i18n.language;
      const searchLower = query.toLowerCase();

      // Filter announcements
      const filteredAnnouncements = (announcements.data || announcements).filter(item =>
        (item.title[currentLang] || item.title.en).toLowerCase().includes(searchLower) ||
        (item.content[currentLang] || item.content.en).toLowerCase().includes(searchLower)
      );

      // Filter staff
      const filteredStaff = staff.filter(item =>
        (item.name[currentLang] || item.name.en).toLowerCase().includes(searchLower) ||
        (item.role[currentLang] || item.role.en).toLowerCase().includes(searchLower)
      );

      // Filter pages
      const filteredPages = pages.filter(item =>
        (item.title[currentLang] || item.title.en).toLowerCase().includes(searchLower) ||
        (item.content[currentLang] || item.content.en).toLowerCase().includes(searchLower)
      );

      setResults({
        announcements: filteredAnnouncements,
        staff: filteredStaff,
        pages: filteredPages
      });
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  }

  const currentLang = i18n.language;
  const totalResults = results.announcements.length + results.staff.length + results.pages.length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="title flex items-center">
          <SearchIcon className="w-8 h-8 mr-3" />
          {t('search')} Results
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Found {totalResults} results for "{query}"
        </p>
      </div>

      {totalResults === 0 ? (
        <div className="card text-center py-12">
          <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No results found. Try a different search term.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Announcements */}
          {results.announcements.length > 0 && (
            <div>
              <h2 className="subtitle">{t('announcements')} ({results.announcements.length})</h2>
              <div className="space-y-4">
                {results.announcements.map(item => (
                  <Link
                    key={item.id}
                    to={`/announcements/${item.id}`}
                    className="card hover:shadow-lg transition-shadow block"
                  >
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {item.title[currentLang] || item.title.en}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                      {item.content[currentLang] || item.content.en}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Staff */}
          {results.staff.length > 0 && (
            <div>
              <h2 className="subtitle">{t('staff')} ({results.staff.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.staff.map(item => (
                  <div key={item.id} className="card hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {item.name[currentLang] || item.name.en}
                    </h3>
                    <p className="text-primary-600 dark:text-primary-400">
                      {item.role[currentLang] || item.role.en}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pages */}
          {results.pages.length > 0 && (
            <div>
              <h2 className="subtitle">Pages ({results.pages.length})</h2>
              <div className="space-y-4">
                {results.pages.map(item => (
                  <Link
                    key={item.id}
                    to={`/pages/${item.slug}`}
                    className="card hover:shadow-lg transition-shadow block"
                  >
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {item.title[currentLang] || item.title.en}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                      {item.content[currentLang] || item.content.en}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
