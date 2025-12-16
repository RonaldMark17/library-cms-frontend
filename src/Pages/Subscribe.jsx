import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, Bell, CheckCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom"; // import if using react-router

const API_URL = import.meta.env.VITE_API_URL;

export default function Subscribe() {
  const { t } = useTranslation();
  const navigate = useNavigate(); // hook for navigation
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubscribe(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setEmail("");
      } else {
        setError(data.message || "An error occurred");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="card text-center p-6 relative">

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-4 flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            {t('back')}
          </button>

          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full mb-6">
            <Bell className="w-10 h-10 text-primary-600 dark:text-primary-400" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('subscribeTitle')}
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t('subscribeText')}
          </p>

          {success ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                {t('subscribeSuccess')}
              </h3>
              <p className="text-green-700 dark:text-green-300">
                Please check your email to verify your subscription.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="primary-btn w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('loading') : t('subscribeButton')}
              </button>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              By subscribing, you agree to receive email notifications about new announcements. You can unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
