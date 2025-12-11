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
    name: "",
    role: "",
    email: "",
    phone: "",
    bio: "",
    image: null,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchStaff();
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
      setMessage(t("Error Fetching Staff"));
    } finally {
      setLoading(false);
    }
  }

  // Submit form (create/update)
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("role", formData.role);
    if (formData.email) payload.append("email", formData.email);
    if (formData.phone) payload.append("phone", formData.phone);
    if (formData.bio) payload.append("bio", formData.bio);
    if (formData.image) payload.append("image", formData.image);

    let url = `${API_URL}/staff-members`;
    if (editingId) {
      url = `${API_URL}/staff-members/${editingId}`;
      payload.append("_method", "PUT");
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });

      if (res.ok) {
        setMessage(editingId ? t("Staff Updated") : t("Staff Created"));
        setShowModal(false);
        resetForm();
        fetchStaff();
      } else {
        const errData = await res.json();
        console.error(errData);
        setMessage(t("Error Saving Staff"));
      }
    } catch (error) {
      console.error(error);
      setMessage(t("Error Saving Staff"));
    } finally {
      setSubmitting(false);
    }
  }

  // Delete staff member
  async function handleDelete(id) {
    if (!confirm(t("Confirm Delete Staff"))) return;
    try {
      const res = await fetch(`${API_URL}/staff-members/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage(t("Staff Deleted"));
        fetchStaff();
      } else {
        setMessage(t("Error Deleting Staff"));
      }
    } catch (error) {
      console.error(error);
      setMessage(t("Error Deleting Staff"));
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      email: "",
      phone: "",
      bio: "",
      image: null,
    });
    setEditingId(null);
  };

  const startEditing = (member) => {
    setEditingId(member.id);
    setFormData({
      name: member.name.en,
      role: member.role.en,
      email: member.email || "",
      phone: member.phone || "",
      bio: member.bio?.en || "",
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
          <h1 className="title mb-0">{t("Manage Staff")}</h1>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="primary-btn flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>{t("Add Staff")}</span>
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
            {member.image_url ? (
              <img
                src={member.image_url}
                alt={member.name.en}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg mb-4">
                <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/>
                </svg>
              </div>
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
                {editingId ? t("Edit Staff") : t("Add Staff")}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("Name")} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("Role")} *
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

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
                  {t("Phone")}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("Bio")}
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows="3"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>{t("Image")}</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                  className="input-field"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="primary-btn flex-1" disabled={submitting}>
                  {submitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>{editingId ? t("Updating...") : t("Creating...")}</span>
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
