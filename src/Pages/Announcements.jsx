import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";

const API_URL = import.meta.env.VITE_API_URL;

export default function Announcements() {
  const { t, i18n } = useTranslation();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchAnnouncements(); }, [currentPage]);

  async function fetchAnnouncements() {
    try {
      const res = await fetch(`${API_URL}/announcements?page=${currentPage}`);
      const data = await res.json();
      setAnnouncements(data.data || data);
      setTotalPages(data.last_page || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const lang = i18n.language;

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="title">{t('latestNews')}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {announcements.map(a => (
          <div key={a.id} className="card p-4 flex flex-col h-full">

            {/* Image container */}
            {a.image_url ? (
              <img
                src={a.image_url}
                className="w-full h-48 object-cover rounded-lg mb-4"
                alt={a.title[lang] || a.title.en}
              />
            ) : (
              // Empty placeholder div that centers content
              <div className="w-full h-48 mb-4 flex items-center justify-center bg-gray-800/20 dark:bg-gray-700 rounded-lg">
                {/* Optional: You can put an icon or text here */}
              </div>
            )}

            {/* Content section */}
            <div className={`flex flex-col ${!a.image_url ? "justify-center flex-1" : "flex-1"}`}>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />{a.priority}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />{new Date(a.published_at).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {a.title[lang] || a.title.en}
              </h3>

              <p className="text-gray-600 dark:text-gray-400 flex-1">
                {a.content[lang] || a.content.en}
              </p>

              <Link
                to={`/announcements/${a.id}`}
                className="text-primary-600 dark:text-primary-400 font-semibold mt-4"
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
