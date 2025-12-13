import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Bell, Users, BookOpen } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  const { t, i18n } = useTranslation();
  const [contentSections, setContentSections] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carousel state
  const carouselImages = ["/1.jpg", "/2.png"];
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    fetchHomeData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchHomeData() {
    try {
      const [sectionsRes, announcementsRes] = await Promise.all([
        fetch(`${API_URL}/content-sections`),
        fetch(`${API_URL}/announcements?per_page=3`),
      ]);

      const sectionsData = await sectionsRes.json();
      const announcementsData = await announcementsRes.json();

      // Format content sections
      const sections = {};
      sectionsData.forEach((section) => {
        sections[section.key] = section.content;
      });
      setContentSections(sections);

      // Filter active announcements only
      const today = new Date();
      let items = announcementsData.data || announcementsData;
      items = items.filter((a) => {
        const published = new Date(a.published_at);
        const expires = a.expires_at ? new Date(a.expires_at) : null;
        return published <= today && (!expires || expires >= today);
      });

      // Sort newest first
      items.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

      setAnnouncements(items);
    } catch (error) {
      console.error("Error fetching home data:", error);
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
      {/* Hero Section with Carousel */}
      <section
        className="relative rounded-2xl overflow-hidden h-[500px] md:h-[600px]"
        style={{
          backgroundImage: `url(${carouselImages[currentImage]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "background-image 1s ease-in-out",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative px-8 py-16 md:py-24 text-center flex flex-col justify-center h-full">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t("welcome")} to LibroSys
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Empowering communities through accessible knowledge and innovative digital services
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/announcements"
              className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              {t("announcements")}
            </Link>
            <Link
              to="/about"
              className="bg-primary-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-800 transition-colors"
            >
              {t("about")}
            </Link>
          </div>
        </div>
      </section>

      {/* Vision, Mission, Goals */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { key: "vision", title: t("ourVision"), icon: <BookOpen />, bg: "bg-primary-100 dark:bg-primary-900", color: "text-primary-600 dark:text-primary-400" },
          { key: "mission", title: t("ourMission"), icon: <Users />, bg: "bg-green-100 dark:bg-green-900", color: "text-green-600 dark:text-green-400" },
          { key: "goals", title: t("ourGoals"), icon: <Bell />, bg: "bg-yellow-100 dark:bg-yellow-900", color: "text-yellow-600 dark:text-yellow-400" },
        ].map((item) => (
          <div key={item.key} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-3 rounded-lg ${item.bg}`}>{item.icon}</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{item.title}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {contentSections[item.key]?.[currentLang] || contentSections[item.key]?.en || "Loading..."}
            </p>
          </div>
        ))}
      </section>

      {/* Latest Announcements */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t("latestNews")}</h2>
          <Link
            to="/announcements"
            className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {announcements.map((announcement) => {
            const imageSrc =
              announcement.image_url ||
              (announcement.image_path ? `${API_URL}/storage/${announcement.image_path}` : null);

            return (
              <div key={announcement.id} className="card hover:shadow-lg transition-shadow">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    alt="" // don't show alt
                  />
                ) : (
                  <div className="w-full h-48 mb-4 flex items-center justify-center bg-gray-800/20 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-500">{t("")}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2 mb-2">
                  <span
                    className={`badge ${announcement.priority === "high"
                        ? "badge-danger"
                        : announcement.priority === "medium"
                          ? "badge-warning"
                          : "badge-success"
                      }`}
                  >
                    {announcement.priority}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(announcement.published_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {announcement.title[currentLang] || announcement.title.en}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                  {announcement.content[currentLang] || announcement.content.en}
                </p>
                <Link
                  to={`/announcements/${announcement.id}`}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center"
                >
                  {t("readMore")}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>


      {/* Subscribe Section */}
      <section className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t("subscribeTitle")}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">{t("subscribeText")}</p>
        <Link to="/subscribe" className="primary-btn inline-block">{t("subscribeButton")}</Link>
      </section>
    </div>
  );
}
