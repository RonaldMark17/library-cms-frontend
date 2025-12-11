import { useState, useEffect, useContext } from "react";
import { AppContext } from "../Context/AppContext";
import { useTranslation } from "react-i18next";
import { Mail, Phone, User } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Staff() {
  const { token } = useContext(AppContext);
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to fetch users");
      }

      const data = await res.json();

      // Filter out disabled users
      const activeUsers = data.filter(user => !user.disabled);

      setUsers(activeUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(t("Error Fetching Users"));
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

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="title">{t("Our Staffs")}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Dedicated users who make our platform thrive
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="card text-center hover:shadow-lg transition-shadow">
            <div className="mb-4">
              {user.image_path ? (
                <img
                  src={`http://127.0.0.1:8000/storage/${user.image_path}`}
                  alt={typeof user.name === "string" ? user.name : user.name?.[currentLang] || user.name?.en}
                  className="w-32 h-32 rounded-full mx-auto object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full mx-auto bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <User className="w-16 h-16 text-primary-600 dark:text-primary-400" />
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {typeof user.name === "string" ? user.name : user.name?.[currentLang] || user.name?.en || ""}
            </h3>

            <p className="text-primary-600 dark:text-primary-400 font-medium mb-4">
              {user.role?.[currentLang] || user.role?.en || ""}
            </p>

            {user.bio && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {user.bio?.[currentLang] || user.bio?.en || ""}
              </p>
            )}

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
        ))}
      </div>
    </div>
  );
}
