import { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Plus, Edit, X, MoveUp, MoveDown, Eye, EyeOff } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";

export default function ManageMenu() {
  const { token } = useContext(AppContext);
  const { t } = useTranslation();
  const { menuItems, setMenuItems } = useOutletContext();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    label: { en: "" }, // Only English input
    url: "",
    type: "page",
    icon: "",
    parent_id: null,
  });

  const API_URL = import.meta.env.VITE_API_URL;

  const resetForm = () => {
    setFormData({ label: { en: "" }, url: "", type: "page", icon: "", parent_id: null });
    setEditingId(null);
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setFormData({
      label: { en: item.label?.en || "" }, // only English
      url: item.url || "",
      type: item.type || "page",
      icon: item.icon || "",
      parent_id: item.parent_id || null,
    });
    setShowModal(true);
  };

  // Auto-translate English to Tagalog
  async function translateToTagalog(text) {
    try {
      const res = await fetch(`${API_URL}/translate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ text, target: "tl" }),
      });
      if (!res.ok) return "";
      const data = await res.json();
      return data.translated_text || "";
    } catch (error) {
      console.error("Translation error:", error);
      return "";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      // Auto-translate English label
      const tlLabel = await translateToTagalog(formData.label.en);
      const payload = { ...formData, label: { en: formData.label.en, tl: tlLabel } };

      const url = editingId ? `${API_URL}/menu-items/${editingId}` : `${API_URL}/menu-items`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const savedItem = await res.json();
        if (editingId) {
          setMenuItems(menuItems.map(item => item.id === editingId ? savedItem : item));
          setMessage(t("Menu Updated"));
        } else {
          setMenuItems([...menuItems, savedItem]);
          setMessage(t("Menu Created"));
        }
        setShowModal(false);
        resetForm();
      } else {
        setMessage(t("Error Saving Menu"));
      }
    } catch (error) {
      console.error(error);
      setMessage(t("Error Saving Menu"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(id) {
    try {
      const res = await fetch(`${API_URL}/menu-items/toggle-active/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMenuItems(menuItems.map(item => item.id === id ? data.menuItem : item));
        setMessage(data.message);
      }
    } catch (error) {
      console.error(error);
      setMessage(t("Error Toggling Menu"));
    }
  }

  async function handleReorder(items) {
    try {
      const res = await fetch(`${API_URL}/menu-items/reorder`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (res.ok) {
        setMenuItems(items.map(orderItem => menuItems.find(item => item.id === orderItem.id)));
        setMessage(t("Menu Reordered"));
      }
    } catch (error) {
      console.error(error);
      setMessage(t("Error Reordering Menu"));
    }
  }

  const moveItem = (index, direction) => {
    const newItems = [...menuItems];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newItems.length) return;
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    const reorderData = newItems.map((item, idx) => ({ id: item.id, order: idx }));
    handleReorder(reorderData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="title mb-0 text-gray-900 dark:text-white">{t("Manage Menu")}</h1>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="primary-btn flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-400 dark:hover:bg-primary-500 text-white dark:text-gray-900 px-4 py-2 rounded"
        >
          <Plus className="w-5 h-5" />
          <span>{t("Add Menu Item")}</span>
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
          <p className="text-primary-600 dark:text-primary-400">{message}</p>
        </div>
      )}

      {/* Menu List */}
      <div className="card bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                item.is_active
                  ? "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                  : "bg-gray-200 dark:bg-gray-600 opacity-70"
              }`}
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                   {item.label?.en || ""} 
                   {/*<span className="text-sm text-gray-500 dark:text-gray-400">({item.label?.tl || ""})</span> */}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.type} • {item.url || t("noURL")}</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => moveItem(index, "up")} disabled={index === 0} className="secondary-btn p-2 disabled:opacity-50">
                  <MoveUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveItem(index, "down")} disabled={index === menuItems.length - 1} className="secondary-btn p-2 disabled:opacity-50">
                  <MoveDown className="w-4 h-4" />
                </button>
                <button onClick={() => startEditing(item)} className="secondary-btn p-2">
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggleActive(item.id)}
                  className="danger-btn p-2"
                  title={item.is_active ? t("Hide Menu Item") : t("Unhide Menu Item")}
                >
                  {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl shadow-lg transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{editingId ? t("editMenuItem") : t("Add Menu Item")}</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-200">{t("Label")}</label>
                <input
                  type="text"
                  value={formData.label.en}
                  onChange={(e) => setFormData({ ...formData, label: { en: e.target.value } })}
                  className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-200">{t("URL")}</label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-200">{t("Type")}</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="page">{t("Page")}</option>
                  <option value="link">{t("Link")}</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-200">{t("Parent Menu")}</label>
                <select
                  value={formData.parent_id || ""}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
                  className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">{t("None")}</option>
                  {menuItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label?.en || ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="secondary-btn px-4 py-2">
                  {t("Cancel")}
                </button>
                <button type="submit" className="primary-btn px-4 py-2" disabled={submitting}>
                  {submitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>{editingId ? t("Updating") : t("Saving")}...</span>
                    </div>
                  ) : editingId ? t("Update") : t("Save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
