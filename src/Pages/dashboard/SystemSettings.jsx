import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../Context/AppContext";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Save, Mail, Users as UsersIcon } from "lucide-react";
import { Link } from "react-router-dom";

export default function SystemSettings() {
  const { token, siteName, setSiteName, defaultLanguage, setDefaultLanguage, theme, setTheme, updateSettings } =
    useContext(AppContext);
  const { t } = useTranslation();

  const [settings, setSettings] = useState({
    site_name: siteName || "",
    default_language: defaultLanguage || "en",
    default_theme: theme || "light",
  });
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function fetchSubscribers() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/subscribers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSubscribers(data.data || data);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setLoading(false);
    }
  }

  function isVerified(subscriber) {
    const v = subscriber.verified_at;
    return v !== null && v !== undefined && v !== "" && v !== "null";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await updateSettings(settings);
    setMessage(res.message);

    if (res.success) {
      setSiteName(settings.site_name);
      setDefaultLanguage(settings.default_language);
      setTheme(settings.default_theme);
    }

    setSaving(false);
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
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="text-primary-600 dark:text-primary-400">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="title mb-0">System Settings</h1>
        </div>

        {/* Message */}
        {message && (
          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
            <p className="text-primary-600 dark:text-primary-400">{message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings Form */}
          <div className="card">
            <h2 className="subtitle">General Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Site Name</label>
                <input
                  type="text"
                  value={settings.site_name || ""}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Language</label>
                <select
                  value={settings.default_language || "en"}
                  onChange={(e) => setSettings({ ...settings, default_language: e.target.value })}
                  className="input-field"
                >
                  <option value="en">English</option>
                  <option value="tl">Tagalog</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Theme</label>
                <select
                  value={settings.default_theme || "light"}
                  onChange={(e) => setSettings({ ...settings, default_theme: e.target.value })}
                  className="input-field"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="primary-btn w-full flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? "Saving..." : "Save Settings"}</span>
              </button>
            </form>
          </div>

          {/* Email Subscribers */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Mail className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              <h2 className="subtitle mb-0">Email Subscribers</h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Total Subscribers</span>
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{subscribers.length}</span>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {subscribers.map((subscriber) => (
                  <div
                    key={subscriber.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{subscriber.email}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {isVerified(subscriber) ? "✓ Verified" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <UsersIcon className="w-12 h-12 text-primary-600 dark:text-primary-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Active Subscribers</h3>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {subscribers.filter(isVerified).length}
            </p>
          </div>

          <div className="card text-center">
            <Mail className="w-12 h-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Pending Verification</h3>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {subscribers.filter((s) => !isVerified(s)).length}
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Engagement Rate</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {subscribers.length > 0
                ? Math.round((subscribers.filter(isVerified).length / subscribers.length) * 100)
                : 0}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
