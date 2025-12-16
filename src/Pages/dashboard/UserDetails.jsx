import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function UserDetails() {
  const { id } = useParams();
  const { token } = useContext(AppContext);
  const { t } = useTranslation();
  const API_URL = import.meta.env.VITE_API_URL;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentLocale = "en";

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error("Failed to fetch user", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <p className="text-center text-red-500">{t("User not found")}</p>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/admin/users">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="title mb-0">{t("User Details")}</h1>
      </div>

      {/* Card */}
      <div className="card grid md:grid-cols-2 gap-6">
        {/* Image */}
        <div>
          <img
            src={
              user.image_path
                ? `http://127.0.0.1:8000/storage/${user.image_path}`
                : "/placeholder-user.png"
            }
            alt={user.name}
            className="w-full h-80 object-cover rounded-lg"
          />
        </div>

        {/* Info */}
        <div className="space-y-3">
          <p><strong>{t("Name")}:</strong> {user.name}</p>
          <p><strong>{t("Email")}:</strong> {user.email}</p>
          <p><strong>{t("Role")}:</strong> {user.role}</p>
          <p><strong>{t("Phone")}:</strong> {user.phone || "-"}</p>
          <p>
            <strong>{t("Status")}:</strong>{" "}
            {user.disabled ? (
              <span className="text-red-500">{t("Disabled")}</span>
            ) : (
              <span className="text-green-600">{t("Active")}</span>
            )}
          </p>

          <div>
            <strong>{t("Bio")}:</strong>
            <p className="mt-1 text-gray-600 dark:text-gray-300">
              {user.bio?.[currentLocale] || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
