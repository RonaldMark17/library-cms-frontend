import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../Context/AppContext";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Plus, Edit, Trash2, X, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export default function ManageAnnouncements() {
  const { token } = useContext(AppContext);
  const { t } = useTranslation();

  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "medium",
    published_at: "",
    expires_at: "",
    image: null,
  });

  const [listLoading, setListLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }

  const API_URL = import.meta.env.VITE_API_URL;
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Fetch announcements
  async function fetchAnnouncements() {
    setListLoading(true);
    try {
      const res = await fetch(`${API_URL}/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAnnouncements(data.data || data);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: t("Failed to load announcements") });
    } finally {
      setListLoading(false);
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      priority: "medium",
      published_at: "",
      expires_at: "",
      image: null,
    });
    setImagePreview(null);
    setEditingId(null);
  };

  const startEditing = (a) => {
    setEditingId(a.id);
    setFormData({
      title: a.title.en,
      content: a.content.en,
      priority: a.priority,
      published_at: a.published_at?.split("T")[0] || "",
      expires_at: a.expires_at?.split("T")[0] || "",
      image: null,
    });
    setImagePreview(a.image_url || null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm(t("Delete Confirm"))) return;
    try {
      await fetch(`${API_URL}/announcements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage({ type: "success", text: t("Announcement deleted") });
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: t("Delete failed") });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const formToSend = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val) formToSend.append(key, val);
    });
    if (editingId) formToSend.append("_method", "PUT");

    try {
      const url = editingId
        ? `${API_URL}/announcements/${editingId}`
        : `${API_URL}/announcements`;

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formToSend,
      });

      if (!res.ok) throw new Error();

      setMessage({
        type: "success",
        text: editingId
          ? t("Announcement updated successfully")
          : t("Announcement published successfully"),
      });

      setShowModal(false);
      resetForm();
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: t("Something went wrong") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-12">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <ArrowLeft className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </Link>
            <h1 className="title mb-0">{t("Manage Announcements")}</h1>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="primary-btn flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>{t("Add Announcement")}</span>
          </button>
        </div>

        {/* Message */}

        {message && <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4"><p className="text-primary-600 dark:text-primary-400">{message.text}</p></div>}

        {/* List */}
        {listLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            {t("No announcements found")}
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((a) => {
              const isExpired =
                a.expires_at && new Date(a.expires_at) < new Date();
              if (isExpired) return null;

              return (
                <div key={a.id} className="card flex gap-6">
                  {a.image_url && (
                    <img
                      src={a.image_url}
                      alt=""
                      className="w-48 h-32 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span
                        className={`badge ${a.priority === "high"
                          ? "badge-danger"
                          : a.priority === "medium"
                            ? "badge-warning"
                            : "badge-success"
                          }`}
                      >
                        {a.priority.charAt(0).toUpperCase() + a.priority.slice(1)}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditing(a)}
                          className="secondary-btn"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="danger-btn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold dark:text-white">
                      {a.title.en}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                      {a.content.en}
                    </p>

                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(a.published_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between mb-4">
                <h2 className="text-2xl font-bold dark:text-white">
                  {editingId ? t("Edit Announcement") : t("Add Announcement")}
                </h2>
                <button onClick={() => setShowModal(false)}>
                  <X className="dark:text-white" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 dark:text-white">{t("Title")}</label>
                  <input
                    className="input-field"
                    placeholder={t("Title")}
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 dark:text-white">{t("Content")}</label>
                  <textarea
                    className="input-field"
                    rows="5"
                    placeholder={t("Content")}
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 dark:text-white">{t("Priority")}</label>
                    <select
                      className="input-field"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value })
                      }
                    >
                      <option value="low">{t("Low")}</option>
                      <option value="medium">{t("Medium")}</option>
                      <option value="high">{t("High")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 dark:text-white">{t("Published At")}</label>
                    <input
                      type="date"
                      className="input-field"
                      value={formData.published_at}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          published_at: e.target.value,
                          expires_at:
                            formData.expires_at && formData.expires_at < e.target.value
                              ? ""
                              : formData.expires_at,
                        })
                      }
                      min={today}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 dark:text-white">{t("Expires At")}</label>
                    <input
                      type="date"
                      className="input-field"
                      value={formData.expires_at}
                      onChange={(e) =>
                        setFormData({ ...formData, expires_at: e.target.value })
                      }
                      min={formData.published_at || today}
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 dark:text-white">{t("Image")}</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="input-field"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setFormData({ ...formData, image: file });
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setImagePreview(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>

                {/* Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="primary-btn flex-1 flex justify-center items-center gap-2"
                    disabled={submitting || !formData.title || !formData.content}
                  >
                    {submitting && (
                      <span className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></span>
                    )}
                    {editingId ? t("Update") : t("Publish")}
                  </button>

                  <button
                    type="button"
                    className="secondary-btn flex-1"
                    onClick={() => setShowPreview(true)}
                  >
                    {t("Preview")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold dark:text-white">{t("Preview")}</h2>
                <button onClick={() => setShowPreview(false)}>
                  <X className="dark:text-white" />
                </button>
              </div>

              {/* Preview Content */}
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg mb-4 border border-gray-200 dark:border-gray-700"
                />
              )}

              <span
                className={`badge ${formData.priority === "high"
                  ? "badge-danger"
                  : formData.priority === "medium"
                    ? "badge-warning"
                    : "badge-success"
                  }`}
              >
                {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
              </span>

              <h3 className="text-xl font-bold mt-3 dark:text-white">
                {formData.title || t("Announcement title")}
              </h3>

              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {formData.content || t("Announcement content preview...")}
              </p>

              {(formData.published_at || formData.expires_at) && (
                <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  {formData.published_at && (
                    <div>{t("Published")}: {formData.published_at}</div>
                  )}
                  {formData.expires_at && (
                    <div>{t("Expires")}: {formData.expires_at}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}