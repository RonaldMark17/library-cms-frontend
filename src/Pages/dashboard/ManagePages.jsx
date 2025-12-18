import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../Context/AppContext";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Plus, Edit, Trash2, X, Loader } from "lucide-react";
import { Link } from "react-router-dom";

export default function ManagePages() {
  const { token } = useContext(AppContext);
  const { t } = useTranslation();
  const API_URL = import.meta.env.VITE_API_URL;

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    content: "",
    meta_description: "",
    image: null,
  });

  useEffect(() => {
    fetchPages();
  }, []);

  /* ================= FETCH ================= */

  async function fetchPages() {
    try {
      const res = await fetch(`${API_URL}/pages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPages(data);
    } catch {
      setMessage(t("Error Fetching Pages"));
    } finally {
      setLoading(false);
    }
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const url = editingId
        ? `${API_URL}/pages/${editingId}`
        : `${API_URL}/pages`;

      const data = new FormData();
      data.append("slug", formData.slug);
      data.append("title", formData.title);
      data.append("content", formData.content);
      data.append("meta_description", formData.meta_description);

      if (formData.image) {
        data.append("image", formData.image);
      }

      if (editingId) {
        data.append("_method", "PUT"); // Laravel spoof
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (!res.ok) throw new Error();

      setMessage(editingId ? t("Page Updated") : t("Page Created"));
      setShowModal(false);
      resetForm();
      fetchPages();
    } catch {
      setMessage(t("Error Saving Page"));
    } finally {
      setSubmitting(false);
    }
  }

  /* ================= DELETE ================= */

  async function handleDelete(id) {
    if (!confirm(t("Confirm Delete Page"))) return;

    try {
      const res = await fetch(`${API_URL}/pages/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error();
      setMessage(t("Page Deleted"));
      fetchPages();
    } catch {
      setMessage(t("Error Deleting Page"));
    }
  }

  /* ================= HELPERS ================= */

  const resetForm = () => {
    setFormData({
      slug: "",
      title: "",
      content: "",
      meta_description: "",
      image: null,
    });
    setEditingId(null);
  };

  const startEditing = (page) => {
    setEditingId(page.id);
    setFormData({
      slug: page.slug || "",
      title: page.title?.en || "",
      content: page.content?.en || "",
      meta_description: page.meta_description || "",
      image: null,
    });
    setShowModal(true);
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] bg-gray-50 dark:bg-gray-900">
        <Loader className="w-12 h-12 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-primary-600 dark:text-primary-400"
            >
              <ArrowLeft />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("Manage Pages")}
            </h1>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition flex items-center gap-2"
          >
            <Plus size={18} />
            {t("Add Page")}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="rounded-lg p-4 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800">
            <p className="text-primary-700 dark:text-primary-300">{message}</p>
          </div>
        )}

        {/* Pages Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {pages.map((page) => (
            <div
              key={page.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 space-y-3"
            >
              {page.image && (
                <img
                  src={`${API_URL.replace("/api", "")}/storage/${page.image}`}
                  alt={page.title.en}
                  className="w-full h-40 object-cover rounded-xl"
                />
              )}

              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {page.title.en}
              </h3>

              <p className="text-sm text-primary-600 dark:text-primary-400">
                /{page.slug}
              </p>

              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                {page.content.en}
              </p>

              <div className="flex gap-2 pt-3">
                <button
                  onClick={() => startEditing(page)}
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-1"
                >
                  <Edit size={16} />
                  {t("Edit")}
                </button>

                <button
                  onClick={() => handleDelete(page.id)}
                  className="px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingId ? t("Edit Page") : t("Add Page")}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 dark:text-gray-300"
                >
                  <X />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder={t("Slug")}
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="w-full input-field dark:bg-gray-700 dark:text-white"
                  required
                />

                <input
                  type="text"
                  placeholder={t("Title")}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full input-field dark:bg-gray-700 dark:text-white"
                  required
                />

                <textarea
                  rows="8"
                  placeholder={t("Content")}
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full input-field dark:bg-gray-700 dark:text-white"
                  required
                />

                <textarea
                  rows="2"
                  placeholder={t("Meta Description")}
                  value={formData.meta_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      meta_description: e.target.value,
                    })
                  }
                  className="w-full input-field dark:bg-gray-700 dark:text-white"
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.files[0] })
                  }
                  className="w-full text-sm text-gray-700 dark:text-gray-300"
                />

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  >
                    {t("Cancel")}
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition"
                  >
                    {submitting
                      ? t("Saving") + "..."
                      : editingId
                      ? t("Update")
                      : t("Create")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
