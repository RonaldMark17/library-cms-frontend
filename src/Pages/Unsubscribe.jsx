import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";

export default function Unsubscribe() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // "loading", "success", "error", "info"
  const [message, setMessage] = useState("");
  const [completed, setCompleted] = useState(false); // prevent duplicate requests

  useEffect(() => {
    let timer;

    if (!token) {
      setStatus("error");
      setMessage("Invalid unsubscribe link");
      return;
    }

    if (!completed) {
      unsubscribe();
    }

    return () => clearTimeout(timer);

    async function unsubscribe() {
      try {
        const res = await fetch("/api/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        setCompleted(true);
        setStatus(data.status || "error");
        setMessage(data.message || "Something went wrong");

        // Remove token from URL so page refresh won't resend request
        setSearchParams({});

        if (data.status === "success" || data.status === "info") {
          timer = setTimeout(() => navigate("/"), 3000);
        }
      } catch {
        setCompleted(true);
        setStatus("error");
        setMessage("An error occurred while unsubscribing");
      }
    }
  }, [token, navigate, completed, setSearchParams]);

  const iconProps = "w-16 h-16 mx-auto mb-4";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-12">
      <div className="max-w-md mx-auto mt-12">
        <div className="card text-center p-6 shadow rounded bg-white dark:bg-gray-900 dark:text-white">

          {status === "loading" && (
            <>
              <Loader className={`${iconProps} text-blue-600 animate-spin`} />
              <h2 className="text-2xl font-bold mb-2 dark:text-white">Processing...</h2>
              <p className="dark:text-gray-300">Please wait while we unsubscribe you...</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className={`${iconProps} text-green-600`} />
              <h2 className="text-2xl font-bold mb-2 dark:text-white">Unsubscribed!</h2>
              <p className="dark:text-gray-300">{message}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting to homepage...</p>
            </>
          )}

          {status === "info" && (
            <>
              <CheckCircle className={`${iconProps} text-blue-600`} />
              <h2 className="text-2xl font-bold mb-2 dark:text-white">Notice</h2>
              <p className="dark:text-gray-300">{message}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting to homepage...</p>
            </>
          )}

          {status === "error" && (
            <>
              <CheckCircle className={`${iconProps} text-green-600`} />
              <h2 className="text-2xl font-bold mb-2 dark:text-white">Unsubscribed!</h2>
              <p className="dark:text-gray-300">{message}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting to homepage...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
