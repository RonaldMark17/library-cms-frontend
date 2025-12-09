import { useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function TwoFactorModal({ userId, onVerify, onClose }) {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/verify-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId, code }),
      });

      const data = await res.json();

      if (res.ok) {
        onVerify(data.access_token);
      } else {
        setError(data.message || "Invalid code");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-2xl font-bold mb-4 dark:text-white">
          Two-Factor Authentication
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Enter the 6-digit code sent to your email
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="000000"
              maxLength="6"
              className="input-field text-center text-2xl tracking-widest"
              required
            />
            {error && <p className="error-text">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="primary-btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('loading') : "Verify"}
          </button>
        </form>
      </div>
    </div>
  );
}