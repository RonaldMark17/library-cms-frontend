import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search as SearchIcon } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

/* Static pages included in search */
const STATIC_PAGES = [
  { id: "home", titleKey: "home", contentKey: "homeDescription", path: "/" },
  { id: "about", titleKey: "aboutUs", contentKey: "aboutUsDescription", path: "/about" },
  { id: "staff", titleKey: "staffDirectory", contentKey: "staffDirectoryDescription", path: "/staff" },
  { id: "announcements", titleKey: "announcements", contentKey: "announcementsDescription", path: "/announcements" },
  { id: "resources", titleKey: "resources", contentKey: "resourcesDescription", path: "/resources" },
  { id: "contact", titleKey: "contact", contentKey: "contactDescription", path: "/pages/contact" }
];

/* 🔍 Keyword highlighter (adaptive dark/light text) */
function highlight(text, keyword) {
  if (!text || !keyword) return text;

  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <mark
        key={index}
        className="
          rounded px-1
          bg-yellow-200 text-yellow-800
          dark:bg-yellow-600 dark:text-yellow-100
        "
      >
        {part}
      </mark>
    ) : (
      <span
        key={index}
        className="text-gray-900 dark:text-gray-100"
      >
        {part}
      </span>
    )
  );
}

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
    } else {
      setLoading(false);
    }
  }, [query, i18n.language]);

  async function searchContent() {
    setLoading(true);

    try {
      const [annRes, staffRes, pagesRes] = await Promise.all([
        fetch(`${API_URL}/announcements`),
        fetch(`${API_URL}/staff-members`),
        fetch(`${API_URL}/pages`)
      ]);

      const [announcements, staff, pages] = await Promise.all([
        annRes.json(),
        staffRes.json(),
        pagesRes.json()
      ]);

      const lang = i18n.language;
      const q = query.toLowerCase();

      const filteredAnnouncements = (announcements.data || announcements).filter(
        item =>
          (item.title[lang] || item.title.en).toLowerCase().includes(q) ||
          (item.content[lang] || item.content.en).toLowerCase().includes(q)
      );

      const filteredStaff = staff.filter(
        item =>
          (item.name[lang] || item.name.en).toLowerCase().includes(q) ||
          (item.role[lang] || item.role.en).toLowerCase().includes(q)
      );

      const filteredPages = pages.filter(
        item =>
          (item.title[lang] || item.title.en).toLowerCase().includes(q) ||
          (item.content[lang] || item.content.en).toLowerCase().includes(q)
      );

      const staticPages = STATIC_PAGES.filter(
        page =>
          t(page.titleKey).toLowerCase().includes(q) ||
          t(page.contentKey).toLowerCase().includes(q)
      ).map(page => ({
        id: page.id,
        title: { [lang]: t(page.titleKey) },
        content: { [lang]: t(page.contentKey) },
        path: page.path
      }));

      setResults({
        announcements: filteredAnnouncements,
        staff: filteredStaff,
        pages: [...staticPages, ...filteredPages]
      });
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }

  const lang = i18n.language;
  const total =
    results.announcements.length +
    results.staff.length +
    results.pages.length;

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
        <h1 className="title flex items-center text-gray-900 dark:text-gray-100">
          <SearchIcon className="w-8 h-8 mr-3" />
          {t("search")} Results
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Found {total} results for "{query}"
        </p>
      </div>

      {total === 0 ? (
        <div className="card text-center py-12">
          <SearchIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No results found. Try a different search term.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Announcements */}
          {results.announcements.length > 0 && (
            <div>
              <h2 className="subtitle text-gray-900 dark:text-gray-100">
                {t("announcements")} ({results.announcements.length})
              </h2>
              <div className="space-y-4">
                {results.announcements.map(item => (
                  <Link
                    key={item.id}
                    to={`/announcements/${item.id}`}
                    className="card hover:shadow-lg transition-shadow block"
                  >
                    <h3 className="text-xl font-bold mb-2">
                      {highlight(item.title[lang] || item.title.en, query)}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                      {highlight(item.content[lang] || item.content.en, query)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Staff */}
          {results.staff.length > 0 && (
            <div>
              <h2 className="subtitle text-gray-900 dark:text-gray-100">
                {t("staff")} ({results.staff.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.staff.map(item => (
                  <div key={item.id} className="card hover:shadow-lg">
                    <h3 className="text-xl font-bold">
                      {highlight(item.name[lang] || item.name.en, query)}
                    </h3>
                    <p className="text-primary-600 dark:text-primary-400">
                      {highlight(item.role[lang] || item.role.en, query)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pages */}
          {results.pages.length > 0 && (
            <div>
              <h2 className="subtitle text-gray-900 dark:text-gray-100">
                Pages ({results.pages.length})
              </h2>
              <div className="space-y-4">
                {results.pages.map(item => (
                  <Link
                    key={item.id}
                    to={item.path || `/pages/${item.slug}`}
                    className="card hover:shadow-lg transition-shadow block"
                  >
                    <h3 className="text-xl font-bold mb-2">
                      {highlight(item.title[lang] || item.title.en, query)}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                      {highlight(item.content[lang] || item.content.en, query)}
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
