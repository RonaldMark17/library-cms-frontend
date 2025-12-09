import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "./Context/AppContext";
import "./App.css";
import "./i18n/config";

// Layout
import Layout from "./Pages/Layout";

// Public Pages
import Home from "./Pages/Home";
import About from "./Pages/About";
import Staff from "./Pages/Staff";
import Announcements from "./Pages/Announcements";
import AnnouncementDetail from "./Pages/AnnouncementDetail";
import Resources from "./Pages/Resources";
import Subscribe from "./Pages/Subscribe";
import Search from "./Pages/Search";
import PageView from "./Pages/PageView";
import VerifySubscription from "./Pages/VerifySubscription";
import SubscriptionStatus from "./Pages/SubscriptionStatus"; // NEW

// Auth Pages
import Login from "./Pages/Auth/Login";

// Protected Pages
import Settings from "./Pages/Settings";

// Dashboard Pages
import Dashboard from "./Pages/dashboard/Dashboard";
import ManageContent from "./Pages/dashboard/ManageContent";
import ManageStaff from "./Pages/dashboard/ManageStaff";
import ManageAnnouncements from "./Pages/dashboard/ManageAnnouncements";
import ManageMenu from "./Pages/dashboard/ManageMenu";
import ManagePages from "./Pages/dashboard/ManagePages";
import ManageLinks from "./Pages/dashboard/ManageLinks";
import SystemSettings from "./Pages/dashboard/SystemSettings";
import ManageUsers from "./Pages/dashboard/ManageUsers";

// 404 Page
function NotFound() {
  return (
    <div className="text-center py-16">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Page not found</p>
      <a href="/" className="primary-btn">Go Home</a>
    </div>
  );
}

// Protected Route
function ProtectedRoute({ children, requireAuth = true, requireAdmin = false }) {
  const { user, loading } = useContext(AppContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (requireAuth && !user) return <Navigate to="/login" replace />;
  if (!requireAuth && user) return <Navigate to="/" replace />;

  if (requireAdmin && user && !["admin", "librarian"].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public */}
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="staff" element={<Staff />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="announcements/:id" element={<AnnouncementDetail />} />
          <Route path="resources" element={<Resources />} />
          <Route path="subscribe" element={<Subscribe />} />
          <Route path="search" element={<Search />} />
          <Route path="pages/:slug" element={<PageView />} />
          <Route path="verify-subscription" element={<VerifySubscription />} />
          <Route path="subscription-status" element={<SubscriptionStatus />} /> {/* NEW */}

          {/* Auth (Only when NOT logged in) */}
          <Route
            path="login"
            element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            }
          />

          {/* Authenticated routes */}
          <Route
            path="settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Dashboard (Admin + Librarian) */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/content"
            element={
              <ProtectedRoute requireAdmin={true}>
                <ManageContent />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/staff"
            element={
              <ProtectedRoute requireAdmin={true}>
                <ManageStaff />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/announcements"
            element={
              <ProtectedRoute requireAdmin={true}>
                <ManageAnnouncements />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/menu"
            element={
              <ProtectedRoute requireAdmin={true}>
                <ManageMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/pages"
            element={
              <ProtectedRoute requireAdmin={true}>
                <ManagePages />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/links"
            element={
              <ProtectedRoute requireAdmin={true}>
                <ManageLinks />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/users"
            element={
              <ProtectedRoute requireAdmin={true}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/system-settings"
            element={
              <ProtectedRoute requireAdmin={true}>
                <SystemSettings />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
