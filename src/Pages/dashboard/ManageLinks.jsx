import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../Context/AppContext";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Plus, Edit, Trash2, X, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function ManageLinks() {
  const { token } = useContext(AppContext);
  const { t } = useTranslation();
  const [links, setLinks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: { en: "" }, url: "", description: { en: "" }, icon: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => { fetchLinks(); }, []);

  async function fetchLinks() {
    try {
      const res = await fetch(`${API_URL}/external-links`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setLinks(data);
    } catch (error) {
      console.error(error);
      setMessage(t("errorFetchingLinks"));
    } finally { setLoading(false); }
  }

  const resetForm = () => { setFormData({ title: { en: "" }, url: "", description: { en: "" }, icon: "" }); setEditingId(null); };
  const startEditing = (link) => { setEditingId(link.id); setFormData({ title: link.title, url: link.url, description: link.description || { en: "" }, icon: link.icon || "" }); setShowModal(true); };

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const url = editingId ? `${API_URL}/external-links/${editingId}` : `${API_URL}/external-links`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) { setMessage(editingId ? t("linkUpdated") : t("linkCreated")); setShowModal(false); resetForm(); fetchLinks(); }
      else setMessage(t("errorSavingLink"));
    } catch (error) { console.error(error); setMessage(t("errorSavingLink")); }
  }

  async function handleDelete(id) {
    if (!confirm(t("confirmDeleteLink"))) return;
    try {
      const res = await fetch(`${API_URL}/external-links/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { setMessage(t("linkDeleted")); fetchLinks(); } 
      else setMessage(t("errorDeletingLink"));
    } catch (error) { console.error(error); setMessage(t("errorDeletingLink")); }
  }

  if (loading) return <div className="flex justify-center items-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="text-primary-600 dark:text-primary-400"><ArrowLeft className="w-6 h-6" /></Link>
          <h1 className="title mb-0">{t("manageExternalLinks")}</h1>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="primary-btn flex items-center space-x-2"><Plus className="w-5 h-5" /><span>{t("addLink")}</span></button>
      </div>

      {message && <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4"><p className="text-primary-600 dark:text-primary-400">{message}</p></div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {links.map((link) => (
          <div key={link.id} className="card">
            <div className="flex items-start space-x-4">
              {link.icon && <div className="text-4xl">{link.icon}</div>}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{link.title.en}</h3>
                {link.description && <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{link.description.en}</p>}
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 text-sm flex items-center space-x-1 hover:underline"><ExternalLink className="w-4 h-4" /><span>{link.url}</span></a>
              </div>
            </div>

            <div className="flex space-x-2 mt-4">
              <button onClick={() => startEditing(link)} className="secondary-btn flex items-center space-x-1 flex-1"><Edit className="w-4 h-4" /><span>{t("edit")}</span></button>
              <button onClick={() => handleDelete(link.id)} className="danger-btn flex items-center space-x-1"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{editingId ? t("editLink") : t("addLink")}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("titleEnglish")}</label>
                <input type="text" value={formData.title.en} onChange={(e) => setFormData({ ...formData, title: { en: e.target.value } })} className="input-field" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("url")}</label>
                <input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="input-field" placeholder="https://example.com" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("descriptionEnglish")}</label>
                <textarea value={formData.description.en} onChange={(e) => setFormData({ ...formData, description: { en: e.target.value } })} rows="3" className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("icon")}</label>
                <input type="text" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="input-field" placeholder="🔗" maxLength="2" />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="primary-btn flex-1">{editingId ? t("update") : t("create")}</button>
                <button type="button" onClick={() => setShowModal(false)} className="secondary-btn">{t("cancel")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
