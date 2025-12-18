import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Mail, Phone, User } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL; // no trailing slash

export default function StaffDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

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
      const url = `${API_URL}/users/${id}`;
      console.log("Fetching staff details from:", url);

      const res = await fetch(url); // public GET, no auth needed
      console.log("Response status:", res.status);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to fetch staff details");
      }

      const data = await res.json();

      // Ensure disabled staff are not shown publicly
      if (data.disabled) {
        throw new Error("Staff not available");
      }

      setUser(data);
    } catch (err) {
      console.error("Error fetching staff details:", err);
      setError(t("Staff Not Found"));
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
      <div className="text-center text-red-600 dark:text-red-400 py-10">
        {error}
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        {t("Back")}
      </button>

      <div className="text-center space-y-4">
        {/* Avatar */}
        {user.image_path ? (
          <img
            src={`${API_URL.replace("/api", "")}/storage/${user.image_path}`}
            alt={name}
            className="w-48 h-48 rounded-full mx-auto object-cover"
          />
        ) : (
          <div className="w-48 h-48 rounded-full mx-auto bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <User className="w-20 h-20 text-primary-600 dark:text-primary-400" />
          </div>
        )}

        {/* Name */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {name}
        </h1>

        {/* Role */}
        {role && (
          <span className="inline-block bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm px-3 py-1 rounded-full">
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        )}

        {/* Bio */}
        {bio && <p className="text-gray-600 dark:text-gray-400 mt-4">{bio}</p>}

        {/* Contact */}
        <div className="mt-6 space-y-2 text-sm text-center">
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
    </div>
  );
}
