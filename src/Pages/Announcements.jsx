import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Calendar, Tag } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Announcements() {
  const { t, i18n } = useTranslation();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAnnouncements();
  }, [currentPage]);

  async function fetchAnnouncements() {
    try {
      const res = await fetch(`${API_URL}/announcements?page=${currentPage}`);
      const data = await res.json();
      setAnnouncements(data.data || data);
      setTotalPages(data.last_page || 1);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  }

  const currentLang = i18n.language;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="title">{t('latestNews')}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Stay updated with our latest news and announcements
        </p>
      </div>

      <div className="space-y-6">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row gap-6">
              {announcement.image_path && (
                <img
                  src={`${API_URL}/storage/${announcement.image_path}`}
                  alt={announcement.title[currentLang] || announcement.title.en}
                  className="w-full md:w-64 h-48 object-cover rounded-lg"
                />
              )}
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className={`badge ${
                    announcement.priority === 'high' ? 'badge-danger' :
                    announcement.priority === 'medium' ? 'badge-warning' :
                    'badge-success'
                  }`}>
                    <Tag className="w-3 h-3 inline mr-1" />
                    {announcement.priority}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(announcement.published_at).toLocaleDateString(
                      currentLang === 'tl' ? 'tl-PH' : 'en-US',
                      { year: 'numeric', month: 'long', day: 'numeric' }
                    )}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {announcement.title[currentLang] || announcement.title.en}
                </h2>

                <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                  {announcement.content[currentLang] || announcement.content.en}
                </p>

                <Link
                  to={`/announcements/${announcement.id}`}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  {t('readMore')} →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="secondary-btn disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="flex items-center px-4 text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="secondary-btn disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
