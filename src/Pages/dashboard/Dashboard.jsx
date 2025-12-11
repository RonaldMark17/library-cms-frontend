import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../Context/AppContext";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  FileText,
  Users,
  Bell,
  Menu as MenuIcon,
  FileCode,
  Link as LinkIcon,
  Settings as SettingsIcon
} from "lucide-react";
import { Users as UsersIcon } from "lucide-react";

export default function Dashboard() {
  const { user } = useContext(AppContext);
  const { t } = useTranslation();
  const [stats, setStats] = useState({ users: 0, announcements: 0 });

  if (!user || (user.role !== 'admin' && user.role !== 'librarian')) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          You don't have permission to access this page
        </p>
      </div>
    );
  }

  // Fetch dashboard stats
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/dashboard-stats", {
      headers: {
        Authorization: `Bearer ${user.token}`, // if using token auth
        Accept: "application/json"
      }
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("API fetch error:", err));
  }, [user]);

  const adminSections = [
    {
      title: t('manageContent'),
      icon: FileText,
      link: "/dashboard/content",
      color: "primary"
    },
    {
      title: t('manageStaff'),
      icon: Users,
      link: "/dashboard/staff",
      color: "green"
    },
    {
      title: t('manageAnnouncements'),
      icon: Bell,
      link: "/dashboard/announcements",
      color: "yellow"
    },
    {
      title: t('manageMenu'),
      icon: MenuIcon,
      link: "/dashboard/menu",
      color: "purple"
    },
    {
      title: t('managePages'),
      icon: FileCode,
      link: "/dashboard/pages",
      color: "blue"
    },
    {
      title: "External Links",
      icon: LinkIcon,
      link: "/dashboard/links",
      color: "red"
    },
    {
      title: "Manage Users",
      icon: UsersIcon,
      link: "/dashboard/users",
      color: "indigo"
    }
  ];

  if (user.role === 'admin') {
    adminSections.push({
      title: t('System Settings'),
      icon: SettingsIcon,
      link: "/dashboard/system-settings",
      color: "gray"
    });
  }

  // Filter sections based on role
  const filteredSections = adminSections.filter(section => {
    if (section.title === "Manage Users" && user.role !== "admin") {
      return false; // hide Manage Users for non-admins
    }
    return true;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="title">{t('dashboard')}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your library content and settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Quick Stats
          </h3>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {stats.users} Users
          </p>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Your Role
          </h3>
          <span className="badge badge-primary text-lg capitalize">
            {user.role}
          </span>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            System Status
          </h3>
          <span className={`badge text-lg ${user.role === "admin"
              ? "badge-success" // green for admin
              : "badge-warning" // yellow for librarian
            }`}>
            {user.role === "admin" ? "All Systems Operational" : "Some Systems Operational"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSections.map((section, index) => {
          const Icon = section.icon;
          const colorClasses = {
            primary: "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400",
            green: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
            yellow: "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400",
            purple: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
            blue: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
            red: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
            gray: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
            indigo: "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400"
          };

          return (
            <Link
              key={index}
              to={section.link}
              className="card hover:shadow-lg transition-all group"
            >
              <div className={`w-16 h-16 rounded-lg ${colorClasses[section.color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {section.title}
              </h3>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
