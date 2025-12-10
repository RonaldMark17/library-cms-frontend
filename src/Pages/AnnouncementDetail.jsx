import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar, Tag, ArrowLeft, User } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function AnnouncementDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncement();
  }, [id]);

  async function fetchAnnouncement() {
    try {
      const res = await fetch(`${API_URL}/announcements/${id}`);
      const data = await res.json();
      setAnnouncement(data);
    } catch (error) {
      console.error("Error fetching announcement:", error);
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

  if (!announcement) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">{t('announcementNotFound') || 'Announcement not found'}</p>
      </div>
    );
  }

  // Use image_url if available, fallback to placeholder
  const imageSrc = announcement.image_url || '/placeholder.jpg';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        {t('back')}
      </button>

      <div className="card">
        <img
          src={imageSrc}
          alt={announcement.title[currentLang] || announcement.title.en}
          className="w-full h-96 object-cover rounded-lg mb-6"
        />

        <div className="flex flex-wrap items-center gap-3 mb-4">
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
          {announcement.creator && (
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <User className="w-4 h-4 mr-1" />
              {announcement.creator.name}
            </span>
          )}
        </div>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          {announcement.title[currentLang] || announcement.title.en}
        </h1>

        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed whitespace-pre-line">
            {announcement.content[currentLang] || announcement.content.en}
          </p>
        </div>
      </div>
    </div>
  );
}
