import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Mail, Phone, User } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Staff() {
  const { t, i18n } = useTranslation();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentLang = i18n.language;

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError("");

    try {
      // ✅ PUBLIC endpoint (guests allowed)
      const res = await fetch(`${API_URL}/users`);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to fetch staff");
      }

      const data = await res.json();

      // ✅ Show only active staff
      const activeUsers = data.filter(user => !user.disabled);

      setUsers(activeUsers);
    } catch (err) {
      console.error("Error fetching staff:", err);
      setError(t("Error Fetching Staff"));
    } finally {
      setLoading(false);
    }
  }

  /* ================= STATES ================= */

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 dark:text-red-400 py-10">
        {error}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400 py-10">
        {t("No Staff Available")}
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-12">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="title">{t("Our Staffs")}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t("Dedicated users who make our platform thrive")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(user => {
            const name =
              typeof user.name === "string"
                ? user.name
                : user.name?.[currentLang] || user.name?.en || "";

            const role =
              typeof user.role === "string"
                ? user.role
                : user.role?.[currentLang] || user.role?.en || "";

            const bio =
              user.bio?.[currentLang] || user.bio?.en || "";

            return (
              <div
                key={user.id}
                className="card text-center hover:shadow-lg transition-shadow"
              >
                {/* ===== Avatar ===== */}
                <div className="mb-4">
                  {user.image_path ? (
                    <img
                      src={`${API_URL.replace("/api", "")}/storage/${user.image_path}`}
                      alt={name}
                      className="w-32 h-32 rounded-full mx-auto object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full mx-auto bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                      <User className="w-16 h-16 text-primary-600 dark:text-primary-400" />
                    </div>
                  )}
                </div>

                {/* ===== Name ===== */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {name}
                </h3>

                {/* ===== Role ===== */}
                {role && (
                  <span className="inline-block bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs px-3 py-1 rounded-full mb-4">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </span>
                )}

                {/* ===== Bio ===== */}
                {bio && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {bio}
                  </p>
                )}

                {/* ===== Contact ===== */}
                <div className="space-y-2 text-sm">
                  {user.email && (
                    <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4 mr-2" />
                      <a
                        href={`mailto:${user.email}`}
                        className="hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        {user.email}
                      </a>
                    </div>
                  )}

                  {user.phone && (
                    <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4 mr-2" />
                      <a
                        href={`tel:${user.phone}`}
                        className="hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        {user.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
