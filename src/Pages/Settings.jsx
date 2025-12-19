import { useContext, useState } from "react";
import { AppContext } from "../Context/AppContext";
import { useTranslation } from "react-i18next";
import { Shield, ShieldCheck, KeyRound, X } from "lucide-react";

export default function Settings() {
  const { user, token, setUser } = useContext(AppContext);
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: ""
  });

  // Password validation
  function isPasswordValid(password) {
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])/;
    return password.length >= 8 && regex.test(password);
  }

  // Toggle 2FA
  async function toggle2FA(enable) {
    setLoading(true);
    setMessage("");

    try {
      const endpoint = enable ? "/api/enable-2fa" : "/api/disable-2fa";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setUser(prev => ({ ...prev, two_factor_enabled: enable }));
        setMessage(data.message);
      } else {
        setMessage(data.message || "An error occurred");
      }
    } catch {
      setMessage("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  // Change password
  async function changePassword(e) {
    e.preventDefault();
    setMessage("");

    if (!isPasswordValid(passwordData.password)) {
      setMessage(
        "Password must be at least 8 characters and include a number and a special character."
      );
      return;
    }

    if (passwordData.password !== passwordData.password_confirmation) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(passwordData)
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setShowPasswordModal(false);
        setPasswordData({
          current_password: "",
          password: "",
          password_confirmation: ""
        });
      } else {
        setMessage(data.message || "Failed to change password");
      }
    } catch {
      setMessage("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          Please login to access settings
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="title">{t("settings")}</h1>

          {/* Account Security */}
          <div className="card">
            <h2 className="subtitle">Account Security</h2>

            {/* 2FA */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-3">
                {user.two_factor_enabled ? (
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                ) : (
                  <Shield className="w-6 h-6 text-gray-400" />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.two_factor_enabled ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => toggle2FA(!user.two_factor_enabled)}
                disabled={loading}
                className={user.two_factor_enabled ? "danger-btn" : "primary-btn"}
              >
                {loading
                  ? t("loading")
                  : user.two_factor_enabled
                  ? "Disable"
                  : "Enable"}
              </button>
            </div>

            {/* Change Password */}
            <div className="flex items-center justify-between py-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-3">
                <KeyRound className="w-6 h-6 text-gray-400" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Password
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Change your account password
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setMessage("");
                  setShowPasswordModal(true);
                }}
                className="primary-btn"
              >
                Change
              </button>
            </div>

            {message && (
              <div className="mt-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-3">
                <p className="text-primary-600 dark:text-primary-400 text-sm">
                  {message}
                </p>
              </div>
            )}
          </div>

          {/* Profile Information */}
          <div className="card">
            <h2 className="subtitle">Profile Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-white">Name</label>
                <p className="text-gray-900 dark:text-white">{user.name}</p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 dark:text-white">Email</label>
                <p className="text-gray-900 dark:text-white">{user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 dark:text-white">Role</label>
                <span className="badge badge-primary capitalize">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-xl p-6 relative">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>

            <h2 className="subtitle mb-4">Change Password</h2>

            <form onSubmit={changePassword} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current password
                </label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700
                    bg-white dark:bg-gray-800 px-4 py-2.5 text-sm
                    text-gray-900 dark:text-white placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-primary-500
                    focus:border-primary-500 transition"
                  placeholder="Enter current password"
                  value={passwordData.current_password}
                  onChange={e =>
                    setPasswordData({
                      ...passwordData,
                      current_password: e.target.value
                    })
                  }
                  required
                />
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  New password
                </label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700
                    bg-white dark:bg-gray-800 px-4 py-2.5 text-sm
                    text-gray-900 dark:text-white placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-primary-500
                    focus:border-primary-500 transition"
                  placeholder="Create a new password"
                  value={passwordData.password}
                  onChange={e =>
                    setPasswordData({
                      ...passwordData,
                      password: e.target.value
                    })
                  }
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm new password
                </label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700
                    bg-white dark:bg-gray-800 px-4 py-2.5 text-sm
                    text-gray-900 dark:text-white placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-primary-500
                    focus:border-primary-500 transition"
                  placeholder="Re-enter new password"
                  value={passwordData.password_confirmation}
                  onChange={e =>
                    setPasswordData({
                      ...passwordData,
                      password_confirmation: e.target.value
                    })
                  }
                  required
                />
              </div>

              <p className="text-xs text-gray-500">
                Must be at least 8 characters, include a number and a special character.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="secondary-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="primary-btn"
                >
                  {loading ? t("loading") : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
