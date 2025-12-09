import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, Phone, User } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Staff() {
  const { t, i18n } = useTranslation();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    try {
      const res = await fetch(`${API_URL}/staff-members`);
      const data = await res.json();
      setStaff(data);
    } catch (error) {
      console.error("Error fetching staff:", error);
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
        <h1 className="title">{t("meetOurTeam")}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Dedicated professionals committed to serving you
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <div key={member.id} className="card text-center hover:shadow-lg transition-shadow">
            <div className="mb-4">
              {member.image_url ? (
                <img
                  src={member.image_url}
                  alt={member.name[currentLang] || member.name.en}
                  className="w-32 h-32 rounded-full mx-auto object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full mx-auto bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <User className="w-16 h-16 text-primary-600 dark:text-primary-400" />
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {member.name?.[currentLang] || member.name?.en || ""}
            </h3>

            <p className="text-primary-600 dark:text-primary-400 font-medium mb-4">
              {member.role?.[currentLang] || member.role?.en || ""}
            </p>

            {member.bio && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {member.bio?.[currentLang] || member.bio?.en || ""}
              </p>
            )}

            <div className="space-y-2 text-sm">
              {member.email && (
                <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4 mr-2" />
                  <a
                    href={`mailto:${member.email}`}
                    className="hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    {member.email}
                  </a>
                </div>
              )}
              {member.phone && (
                <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4 mr-2" />
                  <a
                    href={`tel:${member.phone}`}
                    className="hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    {member.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
