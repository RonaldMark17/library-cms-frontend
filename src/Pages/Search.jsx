import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search as SearchIcon } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

/* ---------- helpers ---------- */
const safeText = (val, lang) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[lang] || val.en || "";
};

/* ---------- static pages ---------- */
const STATIC_PAGES = [
  { id: "home", title: "Home", content: "Library homepage", path: "/" },
  { id: "about", title: "About", content: "About the library", path: "/about" },
  { id: "staff", title: "Staff", content: "Library staff", path: "/staff" },
  { id: "announcements", title: "Announcements", content: "Latest news", path: "/announcements" },
];

export default function Search() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") || "").trim();
  const lang = i18n.language;

  const [results, setResults] = useState({
    announcements: [],
    staff: [],
    pages: [],
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    fetchAll();
  }, [query, lang]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [annRes, userRes, pageRes] = await Promise.all([
        fetch(`${API_URL}/announcements?per_page=1000`),
        fetch(`${API_URL}/users`),
        fetch(`${API_URL}/pages`),
      ]);

      const annData = await annRes.json();
      const users = await userRes.json();
      const pages = await pageRes.json();

      const q = query.toLowerCase();

      const announcements = (annData.data || annData).filter(a =>
        safeText(a.title, lang).toLowerCase().includes(q) ||
        safeText(a.content, lang).toLowerCase().includes(q)
      );

      const staff = users
        .filter(u => !u.disabled)
        .filter(u =>
          safeText(u.name, lang).toLowerCase().includes(q) ||
          safeText(u.role, lang).toLowerCase().includes(q)
        );

      const dynamicPages = pages.filter(p =>
        safeText(p.title, lang).toLowerCase().includes(q) ||
        safeText(p.content, lang).toLowerCase().includes(q)
      );

      const staticPages = STATIC_PAGES.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
      ).map(p => ({
        id: p.id,
        title: { [lang]: p.title },
        content: { [lang]: p.content },
        path: p.path,
      }));

      setResults({
        announcements,
        staff,
        pages: [...staticPages, ...dynamicPages],
      });
    } catch (err) {
      console.error("Search error:", err);
      setResults({ announcements: [], staff: [], pages: [] });
    } finally {
      setLoading(false);
    }
  }

  const total =
    results.announcements.length +
    results.staff.length +
    results.pages.length;

  /* ---------- UI ---------- */

  if (!query) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center text-gray-500 dark:text-gray-400">
        <SearchIcon className="w-12 h-12 mb-4" />
        {t("Type something to search")}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
      <div>
        <h1 className="title flex items-center gap-2 text-gray-900 dark:text-white">
          <SearchIcon />
          {t("search")} “{query}”
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {total} result{total !== 1 && "s"} found
        </p>
      </div>

      {total === 0 && (
        <div className="card text-center py-12">
          {t("No results found")}
        </div>
      )}

      {/* ================= ANNOUNCEMENTS ================= */}
      {results.announcements.length > 0 && (
        <section>
          <h2 className="subtitle">{t("announcements")}</h2>

          {results.announcements.map(a => (
            <Link
              key={a.id}
              to={`/announcements/${a.id}`}
              className="card block hover:shadow-lg transition"
            >
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {safeText(a.title, lang)}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                {safeText(a.content, lang)}
              </p>
            </Link>
          ))}
        </section>
      )}

      {/* ================= STAFF / USERS ================= */}
      {results.staff.length > 0 && (
        <section>
          <h2 className="subtitle">{t("staff")}</h2>

          {results.staff.map(u => (
            <Link
              key={u.id}
              to={`/staff/${u.id}`}   // 🔥 redirects to staff profile
              className="card block hover:shadow-lg transition"
            >
              <h3 className="font-bold text-gray-900 dark:text-white">
                {safeText(u.name, lang)}
              </h3>
              <p className="text-primary-600 dark:text-primary-400">
                {safeText(u.role, lang)}
              </p>
            </Link>
          ))}
        </section>
      )}

      {/* ================= PAGES ================= */}
      {results.pages.length > 0 && (
        <section>
          <h2 className="subtitle">{t("Pages")}</h2>

          {results.pages.map(p => (
            <Link
              key={p.id}
              to={p.path || `/pages/${p.slug}`}  // 🔥 dynamic OR static
              className="card block hover:shadow-lg transition"
            >
              <h3 className="font-bold text-gray-900 dark:text-white">
                {safeText(p.title, lang)}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                {safeText(p.content, lang)}
              </p>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
