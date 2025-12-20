import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import { useTranslation } from "react-i18next";
import TwoFactorModal from "../../Components/TwoFactorModal";
import { LogIn, Mail, Lock } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const { setToken } = useContext(AppContext);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [userId, setUserId] = useState(null);

  const MAX_ATTEMPTS = 5;
  const COOLDOWN = 60;

  // 🔒 persisted state
  const [attemptsMap, setAttemptsMap] = useState(() => {
    return JSON.parse(localStorage.getItem("login_attempts")) || {};
  });

  const [lockoutMap, setLockoutMap] = useState(() => {
    return JSON.parse(localStorage.getItem("login_lockouts")) || {};
  });

  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  // persist
  useEffect(() => {
    localStorage.setItem("login_attempts", JSON.stringify(attemptsMap));
  }, [attemptsMap]);

  useEffect(() => {
    localStorage.setItem("login_lockouts", JSON.stringify(lockoutMap));
  }, [lockoutMap]);

  // cooldown timer (unchanged UI)
  useEffect(() => {
    clearInterval(timerRef.current);

    const email = formData.email;
    const lockoutEnd = lockoutMap[email];

    if (lockoutEnd && lockoutEnd > Date.now()) {
      setTimer(Math.ceil((lockoutEnd - Date.now()) / 1000));

      timerRef.current = setInterval(() => {
        const remaining = Math.ceil((lockoutEnd - Date.now()) / 1000);

        if (remaining <= 0) {
          clearInterval(timerRef.current);
          setTimer(0);

          setLockoutMap(prev => {
            const updated = { ...prev };
            delete updated[email];
            return updated;
          });

          setAttemptsMap(prev => {
            const updated = { ...prev };
            delete updated[email];
            return updated;
          });
        } else {
          setTimer(remaining);
        }
      }, 1000);
    } else {
      setTimer(0);
    }

    return () => clearInterval(timerRef.current);
  }, [formData.email, lockoutMap]);

  const handleEmailChange = (e) => {
    setFormData({ ...formData, email: e.target.value });
  };

  async function handleLogin(e) {
    e.preventDefault();
    const email = formData.email;

    const lockoutEnd = lockoutMap[email];
    if (lockoutEnd && lockoutEnd > Date.now()) {
      toast.error(
        `Login disabled for this email. Please wait ${Math.ceil(
          (lockoutEnd - Date.now()) / 1000
        )} seconds.`
      );
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const currentAttempts = (attemptsMap[email] || 0) + 1;

        setAttemptsMap(prev => ({
          ...prev,
          [email]: currentAttempts,
        }));

        if (currentAttempts >= MAX_ATTEMPTS) {
          setLockoutMap(prev => ({
            ...prev,
            [email]: Date.now() + COOLDOWN * 1000,
          }));

          toast.error("Maximum login attempts reached. Please wait 1 minute.");
        } else {
          toast.error(
            `Invalid credentials. Attempts left: ${
              MAX_ATTEMPTS - currentAttempts
            }`
          );
        }

        setErrors({ general: ["Invalid credentials or unauthorized access."] });
        setLoading(false);
        return;
      }

      const data = await res.json();

      // ✅ reset attempts on success
      setAttemptsMap(prev => {
        const updated = { ...prev };
        delete updated[email];
        return updated;
      });

      setLockoutMap(prev => {
        const updated = { ...prev };
        delete updated[email];
        return updated;
      });

      if (data.requires_2fa) {
        setUserId(data.user_id);
        setShow2FA(true);
      } else {
        localStorage.setItem("token", data.access_token);
        setToken(data.access_token);
        navigate("/");
      }
    } catch (error) {
      const currentAttempts = (attemptsMap[email] || 0) + 1;

      setAttemptsMap(prev => ({
        ...prev,
        [email]: currentAttempts,
      }));

      toast.error("An error occurred. Please try again.");
      setErrors({ general: ["An error occurred. Please try again."] });
    } finally {
      setLoading(false);
    }
  }

  const handle2FAVerify = (token) => {
    localStorage.setItem("token", token);
    setToken(token);
    navigate("/");
  };

  const currentEmailLockout = lockoutMap[formData.email];
  const isDisabled = currentEmailLockout && currentEmailLockout > Date.now();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-12">
      <div className="max-w-md mx-auto">
        <ToastContainer position="top-right" autoClose={5000} />

        <div className="card">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mb-4">
              <LogIn className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("loginTitle")}
            </h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="inline w-4 h-4 mr-1" />
                {t("email")}
              </label>
              <input
                type="email"
                placeholder={t("emailPlaceholder")}
                value={formData.email}
                onChange={handleEmailChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Lock className="inline w-4 h-4 mr-1" />
                {t("password")}
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="input-field"
                required
              />

              <div className="text-right mt-2">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
            </div>

            {errors.general && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {errors.general[0]}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || isDisabled}
              className="primary-btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t("loading") : t("login")}
            </button>

            {isDisabled && (
              <p className="text-red-500 text-sm mt-2">
                Login disabled for this email. Try again in {timer} second
                {timer > 1 ? "s" : ""}.
              </p>
            )}
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
    </div>
  );
}
