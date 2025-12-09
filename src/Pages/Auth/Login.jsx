import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import { useTranslation } from "react-i18next";
import TwoFactorModal from "../../Components/TwoFactorModal";
import { LogIn, Mail, Lock } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
  const { setToken } = useContext(AppContext);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [userId, setUserId] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // Handle 401 or other HTTP errors
      if (!res.ok) {
        setErrors({ general: ["Invalid credentials or unauthorized access."] });
        toast.error("Invalid credentials or unauthorized access.");
        setLoading(false);
        return; // Stop further execution
      }

      const data = await res.json();

      if (data.requires_2fa) {
        setUserId(data.user_id);
        setShow2FA(true);
      } else {
        // Successful login
        localStorage.setItem("token", data.access_token);
        setToken(data.access_token);
        navigate("/"); // Navigate only on success
      }
    } catch (error) {
      setErrors({ general: ["An error occurred. Please try again."] });
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handle2FAVerify = (token) => {
    localStorage.setItem("token", token);
    setToken(token);
    navigate("/"); // Navigate after successful 2FA
  };

  return (
    <div className="max-w-md mx-auto">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="card">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('loginTitle')}
          </h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="inline w-4 h-4 mr-1" />
              {t('email')}
            </label>
            <input
              type="email"
              placeholder={t('emailPlaceholder')}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              required
            />
            {errors.email && <p className="error-text">{errors.email[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Lock className="inline w-4 h-4 mr-1" />
              {t('password')}
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-field"
              required
            />
            {errors.password && <p className="error-text">{errors.password[0]}</p>}
          </div>

          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-600 dark:text-red-400 text-sm">{errors.general[0]}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="primary-btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('loading') : t('login')}
          </button>
        </form>
      </div>

      {show2FA && (
        <TwoFactorModal
          userId={userId}
          onVerify={handle2FAVerify}
          onClose={() => setShow2FA(false)}
        />
      )}
    </div>
  );
}
