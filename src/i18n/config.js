import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      home: "Home",
      about: "About",
      staff: "Staff",
      announcements: "Announcements",
      resources: "Resources",
      login: "Login",
      register: "Register",
      logout: "Logout",
      dashboard: "Dashboard",
      
      // Common
      welcome: "Welcome",
      search: "Search",
      searchPlaceholder: "Search...",
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      create: "Create",
      update: "Update",
      restore: "Restore",
      back: "Back",
      
      // Auth
      loginTitle: "Login to Your Account",
      registerTitle: "Register Account",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      name: "Name",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      
      // Library Content
      vision: "Vision",
      mission: "Mission",
      goals: "Goals",
      ourVision: "Our Vision",
      ourMission: "Our Mission",
      ourGoals: "Our Goals",
      
      // Announcements
      latestNews: "Latest News & Announcements",
      readMore: "Read More",
      publishedOn: "Published on",
      priority: "Priority",
      
      // Staff
      meetOurTeam: "Meet Our Team",
      contactInfo: "Contact Information",
      
      // Subscription
      subscribeTitle: "Subscribe to Announcements",
      subscribeText: "Get notified when we publish new announcements",
      subscribeButton: "Subscribe",
      emailPlaceholder: "Enter your email",
      
      // Settings
      language: "Language",
      theme: "Theme",
      lightMode: "Light Mode",
      darkMode: "Dark Mode",
      
      // Admin
      manageContent: "Manage Content",
      manageStaff: "Manage Staff",
      manageAnnouncements: "Manage Announcements",
      manageMenu: "Manage Menu",
      managePages: "Manage Pages",
      settings: "Settings",
      
      // Messages
      loginSuccess: "Login successful!",
      logoutSuccess: "Logout successful!",
      registerSuccess: "Registration successful!",
      updateSuccess: "Update successful!",
      deleteSuccess: "Deleted successfully!",
      restoreSuccess: "Restored successfully!",
      subscribeSuccess: "Subscription successful! Check your email.",
      error: "An error occurred. Please try again.",
    }
  },
  tl: {
    translation: {
      // Navigation
      home: "Tahanan",
      about: "Tungkol",
      staff: "Kawani",
      announcements: "Mga Pahayag",
      resources: "Mga Mapagkukunan",
      login: "Mag-login",
      register: "Magrehistro",
      logout: "Mag-logout",
      dashboard: "Dashboard",
      
      // Common
      welcome: "Maligayang pagdating",
      search: "Maghanap",
      searchPlaceholder: "Maghanap...",
      loading: "Naglo-load...",
      save: "I-save",
      cancel: "Kanselahin",
      delete: "Tanggalin",
      edit: "I-edit",
      create: "Lumikha",
      update: "I-update",
      restore: "Ibalik",
      back: "Bumalik",
      
      // Auth
      loginTitle: "Mag-login sa Iyong Account",
      registerTitle: "Magrehistro ng Account",
      email: "Email",
      password: "Password",
      confirmPassword: "Kumpirmahin ang Password",
      name: "Pangalan",
      rememberMe: "Tandaan ako",
      forgotPassword: "Nakalimutan ang password?",
      
      // Library Content
      vision: "Pananaw",
      mission: "Misyon",
      goals: "Mga Layunin",
      ourVision: "Aming Pananaw",
      ourMission: "Aming Misyon",
      ourGoals: "Aming Mga Layunin",
      
      // Announcements
      latestNews: "Pinakabagong Balita at Pahayag",
      readMore: "Magbasa Pa",
      publishedOn: "Nai-publish noong",
      priority: "Priyoridad",
      
      // Staff
      meetOurTeam: "Kilalanin ang Aming Koponan",
      contactInfo: "Impormasyon sa Pakikipag-ugnayan",
      
      // Subscription
      subscribeTitle: "Mag-subscribe sa mga Pahayag",
      subscribeText: "Makatanggap ng abiso kapag may bagong pahayag",
      subscribeButton: "Mag-subscribe",
      emailPlaceholder: "Ilagay ang iyong email",
      
      // Settings
      language: "Wika",
      theme: "Tema",
      lightMode: "Maliwanag na Mode",
      darkMode: "Madilim na Mode",
      
      // Admin
      manageContent: "Pamahalaan ang Nilalaman",
      manageStaff: "Pamahalaan ang Kawani",
      manageAnnouncements: "Pamahalaan ang mga Pahayag",
      manageMenu: "Pamahalaan ang Menu",
      managePages: "Pamahalaan ang mga Pahina",
      settings: "Mga Setting",
      
      // Messages
      loginSuccess: "Matagumpay na nag-login!",
      logoutSuccess: "Matagumpay na nag-logout!",
      registerSuccess: "Matagumpay na nagrehistro!",
      updateSuccess: "Matagumpay na na-update!",
      deleteSuccess: "Matagumpay na natanggal!",
      restoreSuccess: "Matagumpay na naibalik!",
      subscribeSuccess: "Matagumpay na nag-subscribe! Tingnan ang iyong email.",
      error: "May naganap na error. Subukan muli.",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;