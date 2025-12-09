import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../Context/AppContext";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Plus, Edit, Trash2, X, Upload } from "lucide-react";
import { Link } from "react-router-dom";

export default function ManageStaff() {
  const { token } = useContext(AppContext);
  const { t } = useTranslation();
  const API_URL = import.meta.env.VITE_API_URL;

  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: { en: "", tl: "" },
    role: { en: "", tl: "" },
    email: "",
    phone: "",
    bio: { en: "", tl: "" },
    image: null,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch staff members
  async function fetchStaff() {
    try {
      const res = await fetch(`${API_URL}/staff-members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch staff");
      const data = await res.json();
      setStaff(data);
    } catch (error) {
      console.error(error);
      setMessage(t("errorFetchingStaff"));
    } finally {
      setLoading(false);
    }
  }

  // Submit form (create/update)
  async function handleSubmit(e) {
    e.preventDefault();
    const payload = new FormData();

    payload.append("name[en]", formData.name.en);
    payload.append("name[tl]", formData.name.tl || formData.name.en);
    payload.append("role[en]", formData.role.en);
    payload.append("role[tl]", formData.role.tl || formData.role.en);
    payload.append("email", formData.email);
    payload.append("phone", formData.phone);
    if (formData.bio.en) {
      payload.append("bio[en]", formData.bio.en);
      payload.append("bio[tl]", formData.bio.tl || formData.bio.en);
    }
    if (formData.image) payload.append("image", formData.image);

    try {
      const url = editingId
        ? `${API_URL}/staff-members/${editingId}`
        : `${API_URL}/staff-members`;
      const method = editingId ? "POST" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });

      if (res.ok) {
        setMessage(editingId ? t("staffUpdated") : t("staffCreated"));
        setShowModal(false);
        resetForm();
        fetchStaff();
      } else {
        setMessage(t("errorSavingStaff"));
      }
    } catch (error) {
      console.error(error);
      setMessage(t("errorSavingStaff"));
    }
  }

  // Delete staff member
  async function handleDelete(id) {
    if (!confirm(t("confirmDeleteStaff"))) return;
    try {
      const res = await fetch(`${API_URL}/staff-members/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage(t("staffDeleted"));
        fetchStaff();
      } else {
        setMessage(t("errorDeletingStaff"));
      }
    } catch (error) {
      console.error(error);
      setMessage(t("errorDeletingStaff"));
    }
  }

  // Restore staff member
  async function handleRestore(id) {
    try {
      const res = await fetch(`${API_URL}/staff-members/${id}/restore`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage(t("staffRestored"));
        fetchStaff();
      } else {
        setMessage(t("errorRestoringStaff"));
      }
    } catch (error) {
      console.error(error);
      setMessage(t("errorRestoringStaff"));
    }
  }

  const resetForm = () => {
    setFormData({
      name: { en: "", tl: "" },
      role: { en: "", tl: "" },
      email: "",
      phone: "",
      bio: { en: "", tl: "" },
      image: null,
    });
    setEditingId(null);
  };

  const startEditing = (member) => {
    setEditingId(member.id);
    setFormData({
      name: member.name || { en: "", tl: "" },
      role: member.role || { en: "", tl: "" },
      email: member.email || "",
      phone: member.phone || "",
      bio: member.bio || { en: "", tl: "" },
      image: null,
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
          <h1 className="title mb-0">{t("manageStaff")}</h1>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="primary-btn flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>{t("addStaff")}</span>
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
          <p className="text-primary-600 dark:text-primary-400">{message}</p>
        </div>
      )}

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <div key={member.id} className="card">
            {member.image_path && (
              <img
                src={`${API_URL}/storage/${member.image_path}`}
                alt={member.name.en}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {member.name.en}
            </h3>
            <p className="text-primary-600 dark:text-primary-400 mb-2">{member.role.en}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{member.email}</p>
            <div className="flex space-x-2">
              <button
                onClick={() => startEditing(member)}
                className="secondary-btn flex items-center space-x-1 flex-1"
              >
                <Edit className="w-4 h-4" />
                <span>{t("edit")}</span>
              </button>
              <button
                onClick={() => handleDelete(member.id)}
                className="danger-btn flex items-center space-x-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingId ? t("editStaff") : t("addStaff")}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("nameEn")} *
                  </label>
                  <input
                    type="text"
                    value={formData.name.en}
                    onChange={(e) => setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("nameTl")}
                  </label>
                  <input
                    type="text"
                    value={formData.name.tl}
                    onChange={(e) => setFormData({ ...formData, name: { ...formData.name, tl: e.target.value } })}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Role */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("roleEn")} *
                  </label>
                  <input
                    type="text"
                    value={formData.role.en}
                    onChange={(e) => setFormData({ ...formData, role: { ...formData.role, en: e.target.value } })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("roleTl")}
                  </label>
                  <input
                    type="text"
                    value={formData.role.tl}
                    onChange={(e) => setFormData({ ...formData, role: { ...formData.role, tl: e.target.value } })}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("email")}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("phone")}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("bioEn")}</label>
                <textarea
                  value={formData.bio.en}
                  onChange={(e) => setFormData({ ...formData, bio: { ...formData.bio, en: e.target.value } })}
                  rows="3"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("bioTl")}</label>
                <textarea
                  value={formData.bio.tl}
                  onChange={(e) => setFormData({ ...formData, bio: { ...formData.bio, tl: e.target.value } })}
                  rows="3"
                  className="input-field"
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
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

              {/* Buttons */}
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
