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
  const [formData, setFormData] = useState({ content: { en: "" } });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // tracks save loading
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

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
      console.error("Error:", error);
      setMessage(t("Error Fetching Sections"));
    } finally {
      setLoading(false);
    }
  }

  const startEditing = (section) => {
    setEditingSection(section.id);
    setFormData({ content: { en: section.content.en || "" } });
  };

  async function handleUpdate(sectionId) {
    setSaving(true);
    setMessage("");

    try {
      const payload = { content: { en: formData.content.en } };

      const res = await fetch(`${API_URL}/content-sections/${sectionId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage(t("Content Updated"));
        setEditingSection(null);
        fetchSections();
      } else {
        setMessage(t("Error Updating Content"));
      }
    } catch (error) {
      console.error(error);
      setMessage(t("Error Updating Content"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-900 dark:text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="title mb-0">{t("manageContent")}</h1>
        </div>
      </div>

      {message && (
        <div className="bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-primary-700 rounded-lg p-4">
          <p className="text-primary-600 dark:text-white">{message}</p>
        </div>
      )}

      <div className="space-y-6">
        {sections.map((section) => (
          <div
            key={section.id}
            className="card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold capitalize text-gray-900 dark:text-white">{section.key}</h2>
              {editingSection !== section.id && (
                <button onClick={() => startEditing(section)} className="primary-btn">
                  {t("edit")}
                </button>
              )}
            </div>

            {editingSection === section.id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                    {t("Content")}
                  </label>
                  <textarea
                    value={formData.content.en}
                    onChange={(e) =>
                      setFormData({
                        content: { en: e.target.value },
                      })
                    }
                    rows="6"
                    disabled={saving} // disable while saving
                    className="input-field bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg p-2 w-full"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleUpdate(section.id)}
                    disabled={saving}
                    className="primary-btn flex items-center space-x-2"
                  >
                    {saving ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>{t("Saving")}...</span>
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{t("save")}</span>
                      </>
                    )}
                  </button>
                  <button onClick={() => setEditingSection(null)} className="secondary-btn">
                    {t("cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{t("English")}:</p>
                  <p className="text-gray-700 dark:text-white">{section.content.en}</p>
                </div>

                {/* <div>
                  <p className="font-medium text-gray-900 dark:text-white">{t("Tagalog")}:</p>
                  <p className="text-gray-700 dark:text-white">{section.content.tl || t("Not set")}</p>
                </div> */}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
