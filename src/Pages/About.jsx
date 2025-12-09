import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Target, Heart, TrendingUp } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function About() {
  const { t, i18n } = useTranslation();
  const [contentSections, setContentSections] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    try {
      const res = await fetch(`${API_URL}/content-sections`);
      const data = await res.json();

      const sections = {};
      data.forEach((section) => {
        sections[section.key] = section.content;
      });

      setContentSections(sections);
    } catch (error) {
      console.error("Error fetching content:", error);
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
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="title">{t("about")}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Learn more about our library's vision, mission, and goals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="card text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mb-4">
            <Target className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("vision")}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {contentSections.vision?.[currentLang] || contentSections.vision?.en || "Loading..."}
          </p>
        </div>

        <div className="card text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <Heart className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("mission")}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {contentSections.mission?.[currentLang] || contentSections.mission?.en || "Loading..."}
          </p>
        </div>

        <div className="card text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full mb-4">
            <TrendingUp className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("goals")}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {contentSections.goals?.[currentLang] || contentSections.goals?.en || "Loading..."}
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="subtitle">About Our Library</h2>
        <div className="space-y-4 text-gray-600 dark:text-gray-400">
          <p>
            Our library serves as a cornerstone of the community, providing access to knowledge, resources, and services that support lifelong learning and personal growth. We are committed to creating an inclusive environment where everyone can explore, discover, and connect.
          </p>
          <p>
            With a comprehensive collection of books, digital resources, and multimedia materials, we cater to diverse interests and needs. Our dedicated team of librarians and staff are always ready to assist you in your research, learning, and discovery journey.
          </p>
          <p>
            We continually evolve to meet the changing needs of our community, embracing new technologies and innovative services while maintaining the timeless values of education, accessibility, and community engagement.
          </p>
        </div>
      </div>
    </div>
  );
}
