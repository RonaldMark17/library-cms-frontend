import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader } from "lucide-react";

export default function PageView() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, [slug]);

  async function fetchPage() {
    try {
      const res = await fetch(`/api/pages/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setPage(data);
      } else {
        setPage(null); // triggers 404
      }
    } catch (error) {
      console.error("Error fetching page:", error);
      setPage(null);
    } finally {
      setLoading(false);
    }
  }

  const currentLang = i18n.language;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader className="w-12 h-12 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-24">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mt-4 mb-8">
          {t('pageNotFound') || "Page not found"}
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          {t('goHome') || "Go Home"}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        {t('back') || "Back"}
      </button>

      <div className="card">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          {page.title[currentLang] || page.title.en}
        </h1>

        <div className="prose dark:prose-invert max-w-none">
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {page.content[currentLang] || page.content.en}
          </div>
        </div>
      </div>
    </div>
  );
}
