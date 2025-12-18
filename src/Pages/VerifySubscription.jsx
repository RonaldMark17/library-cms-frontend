import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Loader } from "lucide-react";

export default function VerifySubscription() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // "loading", "success", "error"
  const [message, setMessage] = useState("");
  const [verified, setVerified] = useState(false); // prevent duplicate verification

  useEffect(() => {
    let timer;

    if (!token) {
      setStatus("error");
      setMessage(t("invalidVerificationLink") || "Invalid verification link");
      return;
    }

    // Verify subscription only once
    if (!verified) {
      verifySubscription();
    }

    return () => clearTimeout(timer);

    async function verifySubscription() {
      try {
        const res = await fetch("/api/verify-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setVerified(true);
          setStatus("success");
          setMessage(data.message || t("Email Verified") || "Email verified successfully!");

          // Remove token from URL to prevent re-verification
          setSearchParams({});

          // Redirect after 3 seconds
          timer = setTimeout(() => navigate("/"), 3000);
        } else {
          setStatus("error");
          setMessage(data.message || t("Verification Failed") || "Verification failed");
          timer = setTimeout(() => navigate("/"), 3000);
        }
      } catch (err) {
        setStatus("error");
        setMessage(t("Verification Error") || "An error occurred during verification");
        timer = setTimeout(() => navigate("/"), 3000);
      }
    }
  }, [token, navigate, t, verified, setSearchParams]);

  const iconProps = "w-16 h-16 mx-auto mb-4";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-12">
      <div className="max-w-md mx-auto mt-12">
        <div className="card text-center">
          {status === "loading" && (
            <>
              <Loader className={`${iconProps} text-primary-600 dark:text-primary-400 animate-spin`} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t("Verifying Subscription") || "Verifying Your Subscription"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t("Please Wait") || "Please wait while we verify your email..."}
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className={`${iconProps} text-green-600 dark:text-green-400`} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t("Subscription Verified") || "Subscription Verified!"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("Redirecting Home") || "Redirecting to home page..."}
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <CheckCircle className={`${iconProps} text-green-600 dark:text-green-400`} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t("Subscription Verified") || "Subscription Verified!"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("Redirecting Home") || "Redirecting to home page..."}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
