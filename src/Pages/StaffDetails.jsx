// src/Pages/Staff/StaffDetails.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Mail, Phone, User, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

const API_URL = import.meta.env.VITE_API_URL;

export default function StaffDetails() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentLang = i18n.language;

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchUser() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/users/${id}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to fetch staff details");
      }

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error("Error fetching staff details:", err);
      setError(t("Error Fetching Staff Details"));
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

  if (error) {
    return (
      <div className="text-center text-red-600 dark:text-red-400 py-10">{error}</div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400 py-10">
        {t("Staff Not Found")}
      </div>
    );
  }

  const name =
    typeof user.name === "string"
      ? user.name
      : user.name?.[currentLang] || user.name?.en || "";

  const role =
    typeof user.role === "string"
      ? user.role
      : user.role?.[currentLang] || user.role?.en || "";

  const bio = user.bio?.[currentLang] || user.bio?.en || "";

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <Link
        to="/staff"
        className="flex items-center text-primary-600 hover:text-primary-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t("Back to Staff")}
      </Link>

      <div className="text-center space-y-4">
        {user.image_path ? (
          <img
            src={`${API_URL.replace("/api", "")}/storage/${user.image_path}`}
            alt={name}
            className="w-40 h-40 rounded-full mx-auto object-cover"
          />
        ) : (
          <div className="w-40 h-40 rounded-full mx-auto bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <User className="w-20 h-20 text-primary-600 dark:text-primary-400" />
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{name}</h1>

        {role && (
          <span className="inline-block bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm px-3 py-1 rounded-full">
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        )}

        {bio && (
          <p className="text-gray-600 dark:text-gray-400 mt-4">{bio}</p>
        )}

        <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
          {user.email && (
            <div className="flex items-center justify-center">
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
            <div className="flex items-center justify-center">
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
    </div>
  );
}
