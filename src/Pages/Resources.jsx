import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ExternalLink as ExternalLinkIcon } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Resources() {
  const { t, i18n } = useTranslation();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
  }, []);

  async function fetchLinks() {
    try {
      const res = await fetch(`${API_URL}/external-links`);
      const data = await res.json();
      setLinks(data);
    } catch (error) {
      console.error("Error fetching links:", error);
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
        <h1 className="title">{t('resources')}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Explore our collection of helpful resources and links
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card hover:shadow-lg transition-all group"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {link.icon ? (
                  <span className="text-4xl">{link.icon}</span>
                ) : (
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                    <ExternalLinkIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {link.title[currentLang] || link.title.en}
                  <ExternalLinkIcon className="w-4 h-4 inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>

                {link.description && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {link.description[currentLang] || link.description.en}
                  </p>
                )}

                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  {link.url}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
