import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../Context/AppContext";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "react-router-dom";

export default function ManageContent() {
  const { token } = useContext(AppContext);
  const { t } = useTranslation();
  const [sections, setSections] = useState([]);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({ content: { en: "", tl: "" } });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL; // <-- Make sure you set this in your .env

  useEffect(() => {
    fetchSections();
  }, []);

  async function fetchSections() {
    try {
      const res = await fetch(`${API_URL}/content-sections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch sections");
      const data = await res.json();
      setSections(data);
    } catch (error) {
      console.error("Error fetching sections:", error);
      setMessage(t("errorFetchingSections"));
    } finally {
      setLoading(false);
    }
  }

  const startEditing = (section) => {
    setEditingSection(section.id);
    setFormData({ content: section.content || { en: "", tl: "" } });
  };

  async function handleUpdate(sectionId) {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/content-sections/${sectionId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage(t("contentUpdated"));
        setEditingSection(null);
        fetchSections();
      } else {
        setMessage(t("errorUpdatingContent"));
      }
    } catch (error) {
      console.error(error);
      setMessage(t("errorUpdatingContent"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="text-primary-600 dark:text-primary-400 hover:text-primary-700">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="title mb-0">{t("manageContent")}</h1>
        </div>
      </div>

      {message && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
          <p className="text-primary-600 dark:text-primary-400">{message}</p>
        </div>
      )}

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                {section.key}
              </h2>
              {editingSection !== section.id && (
                <button onClick={() => startEditing(section)} className="primary-btn">
                  {t("edit")}
                </button>
              )}
            </div>

            {editingSection === section.id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content (English)
                  </label>
                  <textarea
                    value={formData.content.en}
                    onChange={(e) =>
                      setFormData({ ...formData, content: { ...formData.content, en: e.target.value } })
                    }
                    rows="6"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nilalaman (Tagalog)
                  </label>
                  <textarea
                    value={formData.content.tl}
                    onChange={(e) =>
                      setFormData({ ...formData, content: { ...formData.content, tl: e.target.value } })
                    }
                    rows="6"
                    className="input-field"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleUpdate(section.id)}
                    disabled={saving}
                    className="primary-btn flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? t("loading") : t("save")}</span>
                  </button>
                  <button onClick={() => setEditingSection(null)} className="secondary-btn">
                    {t("cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">English:</p>
                  <p className="text-gray-700 dark:text-gray-300">{section.content.en}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tagalog:</p>
                  <p className="text-gray-700 dark:text-gray-300">{section.content.tl || t("notSet")}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
