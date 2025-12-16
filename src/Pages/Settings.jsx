import { useContext, useState } from "react";
import { AppContext } from "../Context/AppContext";
import { useTranslation } from "react-i18next";
import { Shield, ShieldCheck } from "lucide-react";

export default function Settings() {
  const { user, token, setUser } = useContext(AppContext);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setUser(prev => ({ ...prev, two_factor_enabled: enable }));
      } else if (data.message) {
        setMessage(data.message);
      } else {
        setMessage("An error occurred");
      }
    } catch (error) {
      console.error(error);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="title">{t("settings")}</h1>

        {/* Account Security */}
        <div className="card">
          <h2 className="subtitle">Account Security</h2>

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
              {loading ? t("loading") : user.two_factor_enabled ? "Disable" : "Enable"}
            </button>

          </div>

          {message && (
            <div className="mt-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-3">
              <p className="text-primary-600 dark:text-primary-400 text-sm">{message}</p>
            </div>
          )}
        </div>

        {/* Profile Information */}
        <div className="card">
          <h2 className="subtitle">Profile Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <p className="text-gray-900 dark:text-white">{user.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <p className="text-gray-900 dark:text-white">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <span className="badge badge-primary capitalize">{user.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
