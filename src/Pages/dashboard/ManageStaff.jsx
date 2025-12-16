import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../Context/AppContext";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Plus, Edit, X, Upload } from "lucide-react";
import { Link } from "react-router-dom";

export default function ManageUsers() {
  const { user, token } = useContext(AppContext);
  const { t } = useTranslation();
  const API_URL = import.meta.env.VITE_API_URL;

  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "staff",
    email: "",
    phone: "",
    bio: "",
    image: null,
    password: "",
    password_confirmation: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const currentLocale = "en";

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
      setMessage(t("Error Fetching Users"));
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      role: "staff",
      email: "",
      phone: "",
      bio: "",
      image: null,
      password: "",
      password_confirmation: "",
    });
    setImagePreview(null);
    setEditingId(null);
    setErrors({});
  };

  const startEditing = (userData) => {
    setEditingId(userData.id);
    setFormData({
      name: userData.name,
      role: userData.role || "staff",
      email: userData.email || "",
      phone: userData.phone || "",
      bio: userData.bio?.[currentLocale] || "",
      image: null,
      password: "",
      password_confirmation: "",
    });
    setImagePreview(userData.image_path ? `http://127.0.0.1:8000/storage/${userData.image_path}` : null);
    setShowModal(true);
  };

  // Password validation function
  const validatePassword = (password) => {
    if (!password) return "Password is required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain at least one special character.";
    return null;
  };


  async function handleSubmit(e) {
    e.preventDefault();

    setSubmitting(true);
    setErrors({});
    setMessage("");

    // Only validate password when creating a new user and admin
    if (!editingId && user.role === "admin") {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        setErrors({ password: [passwordError] });
        setSubmitting(false);
        return;
      }

      if (formData.password !== formData.password_confirmation) {
        setErrors({ password_confirmation: ["Passwords do not match."] });
        setSubmitting(false);
        return;
      }
    }

    // Prevent librarians from creating new users
    if (!editingId && user.role === "librarian") {
      setMessage(t("You are not allowed to add users"));
      setSubmitting(false);
      return;
    }

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("role", formData.role || "staff");
    if (formData.email) payload.append("email", formData.email);

    if (!editingId) {
      // Add user password for new users
      payload.append("password", formData.password);
      payload.append("password_confirmation", formData.password_confirmation);
    } else {
      if (formData.phone) payload.append("phone", formData.phone);
      if (formData.bio) payload.append("bio", formData.bio);
      if (formData.image) payload.append("image", formData.image);
      payload.append("_method", "PUT");
    }

    const url = editingId ? `${API_URL}/users/${editingId}` : `${API_URL}/users`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(editingId ? t("User Updated") : t("User Created"));
        setShowModal(false);
        resetForm();
        fetchUsers();
      } else {
        setErrors(data.errors || {});
        setMessage(data.message || t("Error Saving User"));
      }
    } catch (error) {
      console.error(error);
      setMessage(t("Error Saving User"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleDisable(id) {
    if (!window.confirm(t("Confirm Toggle User"))) return;

    try {
      const res = await fetch(`${API_URL}/users/${id}/toggle-disable`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        fetchUsers();
      } else {
        setMessage(data.message || t("Error Updating User"));
      }
    } catch (error) {
      console.error(error);
      setMessage(t("Error Updating User"));
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-12">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-primary-600 dark:text-primary-400">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="title mb-0">{t("Manage Users")}</h1>
          </div>

          {/* Add User Button only for admin */}
          {user.role === "admin" && (
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="primary-btn flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>{t("Add User")}</span>
            </button>
          )}
        </div>

        {/* Message */}
        {message && (
          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
            <p className="text-primary-600 dark:text-primary-400">{message}</p>
          </div>
        )}

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((u) => (
            <div key={u.id} className={`card ${u.disabled ? "opacity-60" : ""}`}>
              {u.image_path ? (
                <img
                  src={`http://127.0.0.1:8000/storage/${u.image_path}`}
                  alt={u.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg mb-4">
                  <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
                  </svg>
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{u.name}</h3>
              <p className="text-primary-600 dark:text-primary-400 mb-2">
                {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{u.email}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{u.bio?.[currentLocale] || ""}</p>
              {u.disabled && <span className="text-red-600 font-semibold text-sm mb-2 block">Disabled</span>}

              <div className="flex space-x-2">
                <button
                  onClick={() => startEditing(u)}
                  className="secondary-btn flex items-center space-x-1 flex-1"
                  disabled={u.disabled && user.role === "librarian"}
                >
                  <Edit className="w-4 h-4" />
                  <span>{t("edit")}</span>
                </button>

                {user.role === "admin" && (
                  <button
                    onClick={() => handleToggleDisable(u.id)}
                    className={`flex-1 ${u.disabled ? "primary-btn" : "danger-btn"} flex items-center justify-center`}
                  >
                    {u.disabled ? t("Enable") : t("Disable")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 w-full ${editingId ? "max-w-2xl max-h-[90vh] overflow-y-auto" : "max-w-md"}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingId ? "Edit User" : "Add User"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="staff">Staff</option>
                    <option value="librarian">Librarian</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Password (only for creating new user) */}
                {!editingId && user.role === "admin" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password *</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="input-field"
                        required
                      />
                      {errors.password && <p className="error-text">{errors.password[0]}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password *</label>
                      <input
                        type="password"
                        value={formData.password_confirmation}
                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                        className="input-field"
                        required
                      />
                      {errors.password_confirmation && <p className="error-text">{errors.password_confirmation[0]}</p>}
                    </div>
                  </>
                )}

                {/* Edit user fields */}
                {editingId && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
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
                        <span>Image</span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          setFormData({ ...formData, image: e.target.files[0] });
                          setImagePreview(URL.createObjectURL(e.target.files[0]));
                        }}
                        className="input-field"
                      />
                      {imagePreview && (
                        <img src={imagePreview} alt="preview" className="mt-2 w-32 h-32 object-cover rounded-lg" />
                      )}
                    </div>
                  </>
                )}

                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="primary-btn flex-1">
                    {submitting ? (editingId ? "Updating..." : "Creating...") : (editingId ? "Update" : "Create")}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="secondary-btn">
                    Cancel
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
