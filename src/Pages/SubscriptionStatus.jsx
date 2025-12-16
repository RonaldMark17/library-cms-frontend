import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Loader } from "lucide-react";

export default function VerifySubscription() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const statusParam = searchParams.get("status");
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      verifySubscription();
    } else if (statusParam === "success") {
      // For testing purposes
      setStatus("success");
      setMessage("Subscription verified (test)!");
      setTimeout(() => navigate("/"), 3000);
    } else if (statusParam === "error") {
      setStatus("error");
      setMessage("Verification failed (test)!");
    } else {
      setStatus("error");
      setMessage("Invalid verification link");
    }
  }, [token, statusParam]);

  async function verifySubscription() {
    try {
      const res = await fetch(`http://localhost:8000/api/verify-subscription`, {
        method: "POST", // Change to GET if your backend uses GET
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Subscription verified successfully!");
        setTimeout(() => navigate("/"), 3000);
      } else {
        setStatus("error");
        setMessage(data.message || "Verification failed");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred during verification");
      console.error("Verification error:", error);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-12">
      <div className="max-w-md mx-auto mt-12">
        <div className="card text-center p-6 shadow-md rounded-lg">
          {status === "loading" && (
            <>
              <Loader className="w-16 h-16 text-primary-600 dark:text-primary-400 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verifying Your Subscription
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we verify your email...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Subscription Verified!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You will now receive email notifications about new announcements.
                Redirecting to home page...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Go to Home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
