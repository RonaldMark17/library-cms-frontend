import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../Context/AppContext";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Plus, Edit, Trash2, X, Upload, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export default function ManageAnnouncements() {
  const { token } = useContext(AppContext);
  const { t } = useTranslation();
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "medium",
    published_at: "",
    expires_at: "",
    image: null,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // <-- submit loader
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    try {
      const res = await fetch(`${API_URL}/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAnnouncements(data.data || data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
    setEditingId(null);
  };

  const startEditing = (announcement) => {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title.en,
      content: announcement.content.en,
      priority: announcement.priority,
      published_at: announcement.published_at?.split("T")[0] || "",
      expires_at: announcement.expires_at?.split("T")[0] || "",
      image: null,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm(t("deleteConfirm"))) return;
    try {
      const res = await fetch(`${API_URL}/announcements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage(t("announcementDeleted"));
        fetchAnnouncements();
      } else {
        const errorData = await res.json();
        setMessage(errorData.message || t("errorDeletingAnnouncement"));
      }
    } catch (error) {
      console.error(error);
      setMessage(t("errorDeletingAnnouncement"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    const formToSend = new FormData();
    formToSend.append("title", formData.title);
    formToSend.append("content", formData.content);
    formToSend.append("priority", formData.priority);
    if (formData.published_at) formToSend.append("published_at", formData.published_at);
    if (formData.expires_at) formToSend.append("expires_at", formData.expires_at);
    if (formData.image) formToSend.append("image", formData.image);
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

      if (res.ok) {
        setMessage(editingId ? t("announcementUpdated") : t("announcementCreated"));
        setShowModal(false);
        resetForm();
        fetchAnnouncements();
      } else {
        const errorData = await res.json();
        setMessage(errorData.message || t("errorSavingAnnouncement"));
      }
    } catch (error) {
      console.error(error);
      setMessage(t("errorSavingAnnouncement"));
    } finally {
      setSubmitting(false);
    }
  };

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
          <Link to="/dashboard" className="text-primary-600 dark:text-primary-400">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="title mb-0">{t("manageAnnouncements")}</h1>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="primary-btn flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>{t("addAnnouncement")}</span>
        </button>
      </div>

      {message && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 text-primary-600 dark:text-primary-400">
          {message}
        </div>
      )}

      <div className="space-y-4">
        {announcements.map(a => (
          <div key={a.id} className="card flex gap-6">
            <img
              src={a.image_url || '/placeholder.jpg'}
              alt={a.title.en}
              className="w-48 h-32 object-cover rounded-lg"
            />
            <div className="flex-1">
              <div className="flex justify-between mb-2">
                <span
                  className={`badge ${
                    a.priority === "high" ? "badge-danger" :
                    a.priority === "medium" ? "badge-warning" : "badge-success"
                  }`}
                >
                  {a.priority}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEditing(a)}
                    className="secondary-btn flex items-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{t("edit")}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="danger-btn flex items-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{a.title.en}</h3>
              <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{a.content.en}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{new Date(a.published_at).toLocaleDateString()}</span>
                {a.expires_at && <span>Expires: {new Date(a.expires_at).toLocaleDateString()}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingId ? t("editAnnouncement") : t("addAnnouncement")}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label>{t("title")} *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label>{t("content")} *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows="6"
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label>{t("priority")}</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="input-field"
                  >
                    <option value="low">{t("low")}</option>
                    <option value="medium">{t("medium")}</option>
                    <option value="high">{t("high")}</option>
                  </select>
                </div>
                <div>
                  <label>{t("publishedDate")}</label>
                  <input
                    type="date"
                    value={formData.published_at}
                    onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label>{t("expiresDate")}</label>
                  <input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>{t("image")}</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                  className="input-field"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="primary-btn flex-1"
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>{editingId ? t("updating") : t("creating")}...</span>
                    </div>
                  ) : (
                    editingId ? t("update") : t("create")
                  )}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="secondary-btn">
                  {t("cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
