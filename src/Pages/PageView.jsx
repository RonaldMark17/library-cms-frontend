import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader } from "lucide-react";

export default function PageView() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;
  const BASE_URL = API_URL.replace("/api", "");

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, [slug]);

  async function fetchPage() {
    try {
      const res = await fetch(`${API_URL}/pages/${slug}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setPage(data);
    } catch (error) {
      console.error("Error fetching page:", error);
      setPage(null);
    } finally {
      setLoading(false);
    }
  }

  const currentLang = i18n.language;

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] bg-gray-50 dark:bg-gray-900">
        <Loader className="w-12 h-12 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  /* ================= 404 ================= */

  if (!page) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center text-center bg-gray-50 dark:bg-gray-900 px-4">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mt-4 mb-8">
          {t("pageNotFound") || "Page not found"}
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition"
        >
          {t("goHome") || "Go Home"}
        </button>
      </div>
    );
  }

  /* ================= PAGE VIEW ================= */

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back */}
          

          {/* Page Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            {/* Image */}
            {page.image && (
              <img
                src={`${BASE_URL}/storage/${page.image}`}
                alt={page.title[currentLang] || page.title.en}
                className="w-full max-h-[420px] object-cover rounded-xl"
                loading="lazy"
              />
            )}

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {page.title[currentLang] || page.title.en}
            </h1>

            {/* Content */}
            <div className="prose max-w-none dark:prose-invert">
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {page.content[currentLang] || page.content.en}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import { ArrowLeft, Loader } from "lucide-react";

// export default function PageView() {
//   const { slug } = useParams();
//   const { t, i18n } = useTranslation();
//   const navigate = useNavigate();

//   const API_URL = import.meta.env.VITE_API_URL;
//   const BASE_URL = API_URL.replace("/api", "");

//   const [page, setPage] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchPage();
//   }, [slug]);

//   async function fetchPage() {
//     try {
//       const res = await fetch(`${API_URL}/pages/${slug}`);
//       if (!res.ok) throw new Error();
//       const data = await res.json();
//       setPage(data);
//     } catch {
//       setPage(null);
//     } finally {
//       setLoading(false);
//     }
//   }

//   const lang = i18n.language;

//   /* ================= LOADING ================= */

//   if (loading) {
//     return (
//       <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
//         <Loader className="w-12 h-12 animate-spin text-primary-600 dark:text-primary-400" />
//       </div>
//     );
//   }

//   /* ================= 404 ================= */

//   if (!page) {
//     return (
//       <div className="min-h-[70vh] flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900 px-4">
//         <h1 className="text-7xl font-extrabold text-gray-900 dark:text-white">
//           404
//         </h1>
//         <p className="mt-4 text-gray-600 dark:text-gray-400">
//           {t("pageNotFound") || "Page not found"}
//         </p>
//         <button
//           onClick={() => navigate("/")}
//           className="mt-8 px-6 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition"
//         >
//           {t("goHome") || "Go Home"}
//         </button>
//       </div>
//     );
//   }

//   /* ================= PAGE ================= */

//   return (
//     <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-24">
//       {/* HERO IMAGE */}
//       {page.image && (
//         <div className="relative h-[360px] w-full overflow-hidden">
//           <img
//             src={`${BASE_URL}/storage/${page.image}`}
//             alt={page.title[lang] || page.title.en}
//             className="w-full h-full object-cover"
//           />
//           <div className="absolute inset-0 bg-black/40" />
//         </div>
//       )}

//       <div className="relative max-w-5xl mx-auto px-4 -mt-28">
//         {/* Back */}
//         <button
//           onClick={() => navigate(-1)}
//           className="mb-6 inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline"
//         >
//           <ArrowLeft size={16} />
//           {t("back") || "Back"}
//         </button>

//         {/* CONTENT CARD */}
//         <article className="bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 md:p-12 space-y-8 animate-fadeIn">
//           {/* Title */}
//           <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
//             {page.title[lang] || page.title.en}
//           </h1>

//           {/* Divider */}
//           <div className="h-1 w-20 bg-primary-600 rounded-full" />

//           {/* Content */}
//           <div className="prose prose-lg max-w-none dark:prose-invert">
//             <div className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">
//               {page.content[lang] || page.content.en}
//             </div>
//           </div>
//         </article>
//       </div>
//     </div>
//   );
// }


//=====================================================================================
// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import { ArrowLeft, Loader } from "lucide-react";

// export default function PageView() {
//   const { slug } = useParams();
//   const { t, i18n } = useTranslation();
//   const navigate = useNavigate();

//   const API_URL = import.meta.env.VITE_API_URL;
//   const BASE_URL = API_URL.replace("/api", "");

//   const [page, setPage] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchPage();
//   }, [slug]);

//   async function fetchPage() {
//     try {
//       const res = await fetch(`${API_URL}/pages/${slug}`);
//       if (!res.ok) throw new Error("Not found");
//       const data = await res.json();
//       setPage(data);
//     } catch (err) {
//       console.error(err);
//       setPage(null);
//     } finally {
//       setLoading(false);
//     }
//   }

//   const lang = i18n.language;

//   /* ================= LOADING ================= */

//   if (loading) {
//     return (
//       <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
//         <Loader className="w-12 h-12 animate-spin text-primary-600 dark:text-primary-400" />
//       </div>
//     );
//   }

//   /* ================= 404 ================= */

//   if (!page) {
//     return (
//       <div className="min-h-[70vh] flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-900 px-4">
//         <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
//         <p className="mt-4 text-gray-600 dark:text-gray-400">
//           {t("pageNotFound") || "Page not found"}
//         </p>
//         <button
//           onClick={() => navigate("/")}
//           className="mt-8 px-6 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition"
//         >
//           {t("goHome") || "Go Home"}
//         </button>
//       </div>
//     );
//   }

//   /* ================= PAGE ================= */

//   return (
//     <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-24">
//       {/* HERO */}
//       {page.image && (
//         <div className="relative h-[320px] w-full overflow-hidden">
//           <img
//             src={`${BASE_URL}/storage/${page.image}`}
//             alt={page.title[lang] || page.title.en}
//             className="w-full h-full object-cover"
//           />
//           <div className="absolute inset-0 bg-black/40" />
//         </div>
//       )}

//       {/* CONTENT */}
//       <div className="relative max-w-6xl mx-auto px-4">
//         <div className={`${page.image ? "-mt-24" : "pt-16"}`}>
//           {/* Back */}
//           <button
//             onClick={() => navigate(-1)}
//             className="mb-6 inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline"
//           >
//             <ArrowLeft size={16} />
//             {t("back") || "Back"}
//           </button>

//           {/* Card */}
//           <article className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-10 space-y-8">
//             {/* Title */}
//             <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
//               {page.title[lang] || page.title.en}
//             </h1>

//             {/* Accent */}
//             <div className="h-1 w-20 bg-primary-600 rounded-full" />

//             {/* Content */}
//             <div className="prose prose-lg max-w-none dark:prose-invert">
//               <div className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">
//                 {page.content[lang] || page.content.en}
//               </div>
//             </div>
//           </article>
//         </div>
//       </div>
//     </div>
//   );
// }
