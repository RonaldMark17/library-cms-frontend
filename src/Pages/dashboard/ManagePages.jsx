import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../Context/AppContext";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Plus, Edit, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function ManagePages() {
  const { token } = useContext(AppContext);
  const { t } = useTranslation();
  const API_URL = import.meta.env.VITE_API_URL;

  const [pages, setPages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false); // <-- Loading state
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    content: "",
    meta_description: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPages();
  }, []);

  async function fetchPages() {
    try {
      const res = await fetch(`${API_URL}/pages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch pages");
      const data = await res.json();
      setPages(data);
    } catch (error) {
      console.error(error);
      setMessage(t("Error Fetching Pages"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true); // <-- Start loading
    setMessage("");

    try {
      const url = editingId ? `${API_URL}/pages/${editingId}` : `${API_URL}/pages`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage(editingId ? t("Page Updated") : t("Page Created"));
        setShowModal(false);
        resetForm();
        fetchPages();
      } else {
        setMessage(t("Error Saving Page"));
      }
    } catch (error) {
      console.error(error);
      setMessage(t("Error Saving Page"));
    } finally {
      setSubmitting(false); // <-- Stop loading
    }
  }

  async function handleDelete(id) {
    if (!confirm(t("Confirm Delete Page"))) return;
    try {
      const res = await fetch(`${API_URL}/pages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage(t("Page Deleted"));
        fetchPages();
      } else {
        setMessage(t("Error Deleting Page"));
      }
    } catch (error) {
      console.error(error);
      setMessage(t("Error Deleting Page"));
    }
  }

  const resetForm = () => {
    setFormData({ slug: "", title: "", content: "", meta_description: "" });
    setEditingId(null);
  };

  const startEditing = (page) => {
    setEditingId(page.id);
    setFormData({
      slug: page.slug || "",
      title: page.title?.en || "",
      content: page.content?.en || "",
      meta_description: page.meta_description || "",
    });
    setShowModal(true);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="text-primary-600 dark:text-primary-400">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="title mb-0">{t("Manage Pages")}</h1>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="primary-btn flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>{t("Add Page")}</span>
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
          <p className="text-primary-600 dark:text-primary-400">{message}</p>
        </div>
      )}

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pages.map((page) => (
          <div key={page.id} className="card">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{page.title.en}</h3>
            <p className="text-sm text-primary-600 dark:text-primary-400 mb-3">/{page.slug}</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">{page.content.en}</p>
            <div className="flex space-x-2">
              <button onClick={() => startEditing(page)} className="secondary-btn flex items-center space-x-1 flex-1">
                <Edit className="w-4 h-4" /><span>{t("edit")}</span>
              </button>
              <button onClick={() => handleDelete(page.id)} className="danger-btn flex items-center space-x-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{editingId ? t("editPage") : t("addPage")}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("Slug")} *</label>
                <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="input-field" placeholder="about-us" required />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("URL Will Be")}: /pages/{formData.slug}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("Title")} *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-field" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("Content")} *</label>
                <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows="10" className="input-field" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("Meta Description")}</label>
                <textarea value={formData.meta_description} onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })} rows="2" className="input-field" placeholder={t("SEO Description")} />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="secondary-btn">{t("Cancel")}</button>
                <button type="submit" className="primary-btn flex-1" disabled={submitting}>
                  {submitting ? (
                    <div className="flex items-center space-x-2 justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>{editingId ? t("Updating") : t("Saving")}...</span>
                    </div>
                  ) : (
                    editingId ? t("Update") : t("Create")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
