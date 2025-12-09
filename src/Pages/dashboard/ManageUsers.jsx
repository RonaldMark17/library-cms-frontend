import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../Context/AppContext";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Plus, Edit, Trash2, Shield, ShieldCheck, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function ManageUsers() {
  const { token } = useContext(AppContext);
  const { t } = useTranslation();
  const API_URL = import.meta.env.VITE_API_URL || "";

  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "staff",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setMessage("Error fetching users");
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role: "staff",
    });
    setEditingId(null);
    setErrors({});
  };

  const startEditing = (user) => {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      password_confirmation: "",
      role: user.role,
    });
    setShowModal(true);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      const url = editingId ? `${API_URL}/users/${editingId}` : `${API_URL}/register`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        else setMessage(data.message || "Error saving user");
      } else {
        setMessage(editingId ? "User updated successfully!" : "User registered successfully!");
        setShowModal(false);
        resetForm();
        fetchUsers();
      }
    } catch (error) {
      console.error(error);
      setMessage("Error saving user");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setMessage("User deleted!");
        fetchUsers();
      }
    } catch (error) {
      console.error(error);
      setMessage("Error deleting user");
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="text-primary-600 dark:text-primary-400">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="title mb-0">Manage Users</h1>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="primary-btn flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>{editingId ? "Edit User" : "Register New User"}</span>
        </button>
      </div>

      {message && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
          <p className="text-primary-600 dark:text-primary-400">{message}</p>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Role</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">2FA</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.name}</td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.email}</td>
                <td className="py-3 px-4">
                  <span className="badge badge-primary capitalize">{user.role}</span>
                </td>
                <td className="py-3 px-4">
                  {user.two_factor_enabled ? <ShieldCheck className="w-5 h-5 text-green-600"/> : <Shield className="w-5 h-5 text-gray-400"/>}
                </td>
                <td className="py-3 px-4 flex space-x-2">
                  <button onClick={() => startEditing(user)} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center space-x-1">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-700 dark:text-red-400 flex items-center space-x-1">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{editingId ? "Edit User" : "Register New User"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field" required/>
                {errors.name && <p className="error-text">{errors.name[0]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input-field" required/>
                {errors.email && <p className="error-text">{errors.email[0]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role *</label>
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="input-field" required>
                  <option value="staff">Staff</option>
                  <option value="librarian">Librarian</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {!editingId && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password *</label>
                    <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="input-field" required/>
                    {errors.password && <p className="error-text">{errors.password[0]}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password *</label>
                    <input type="password" value={formData.password_confirmation} onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})} className="input-field" required/>
                  </div>
                </>
              )}

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="primary-btn flex-1" disabled={submitting}>{submitting ? "Saving..." : editingId ? "Update User" : "Register User"}</button>
                <button type="button" onClick={() => setShowModal(false)} className="secondary-btn">{t('cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
