import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../Context/AppContext";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Plus, Edit, Trash2, X, MoveUp, MoveDown } from "lucide-react";
import { Link } from "react-router-dom";

export default function ManageMenu() {
  const { token } = useContext(AppContext);
  const { t } = useTranslation();
  const [menuItems, setMenuItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    label: { en: "", tl: "" },
    url: "",
    type: "page",
    icon: "",
    parent_id: null,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchMenuItems();
  }, []);

  async function fetchMenuItems() {
    try {
      const res = await fetch(`${API_URL}/menu-items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch menu items");
      const data = await res.json();
      setMenuItems(data);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      setMessage(t("errorFetchingMenu"));
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setFormData({ label: { en: "", tl: "" }, url: "", type: "page", icon: "", parent_id: null });
    setEditingId(null);
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setFormData({
      label: item.label || { en: "", tl: "" },
      url: item.url || "",
      type: item.type || "page",
      icon: item.icon || "",
      parent_id: item.parent_id || null,
    });
    setShowModal(true);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const url = editingId ? `${API_URL}/menu-items/${editingId}` : `${API_URL}/menu-items`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setMessage(editingId ? t("menuUpdated") : t("menuCreated"));
        setShowModal(false);
        resetForm();
        fetchMenuItems();
      } else {
        setMessage(t("errorSavingMenu"));
      }
    } catch (error) {
      console.error(error);
      setMessage(t("errorSavingMenu"));
    }
  }

  async function handleDelete(id) {
    if (!confirm(t("confirmDeleteMenu"))) return;
    try {
      const res = await fetch(`${API_URL}/menu-items/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setMessage(t("menuDeleted"));
        fetchMenuItems();
      } else {
        setMessage(t("errorDeletingMenu"));
      }
    } catch (error) {
      console.error(error);
      setMessage(t("errorDeletingMenu"));
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
        setMessage(t("menuReordered"));
        fetchMenuItems();
      }
    } catch (error) {
      console.error(error);
      setMessage(t("errorReorderingMenu"));
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
          <h1 className="title mb-0">{t("manageMenu")}</h1>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="primary-btn flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>{t("addMenuItem")}</span>
        </button>
      </div>

      {/* Messages */}
      {message && <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4"><p className="text-primary-600 dark:text-primary-400">{message}</p></div>}

      {/* Menu Items */}
      <div className="card">
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">{item.label.en}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.type} • {item.url || t("noURL")}</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => moveItem(index, "up")} disabled={index === 0} className="secondary-btn p-2 disabled:opacity-50"><MoveUp className="w-4 h-4" /></button>
                <button onClick={() => moveItem(index, "down")} disabled={index === menuItems.length - 1} className="secondary-btn p-2 disabled:opacity-50"><MoveDown className="w-4 h-4" /></button>
                <button onClick={() => startEditing(item)} className="secondary-btn p-2"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="danger-btn p-2"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{editingId ? t("editMenuItem") : t("addMenuItem")}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Form fields same as before */}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
