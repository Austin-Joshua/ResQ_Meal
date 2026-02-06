import { useState, useMemo, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/context/LanguageContext";
import LoginPage from "@/pages/Login";
import OrganisationReport from "@/pages/OrganisationReport";
import VolunteerMode from "@/pages/VolunteerMode";
import ResQMealApp from "@/pages/App";
import type { LoginSuccessUser } from "@/pages/Login";

const queryClient = new QueryClient();

const STORAGE_TOKEN = "resqmeal_token";
const STORAGE_USER = "resqmeal_user";

function getStorage(rememberMe: boolean): Storage {
  return rememberMe ? localStorage : sessionStorage;
}

function readAuth(): { token: string; user: LoginSuccessUser } | null {
  try {
    // Prefer localStorage (remember me), then sessionStorage (session only)
    for (const storage of [localStorage, sessionStorage]) {
      const token = storage.getItem(STORAGE_TOKEN);
      const userStr = storage.getItem(STORAGE_USER);
      if (token && userStr) {
        const user = JSON.parse(userStr) as LoginSuccessUser;
        return { token, user };
      }
    }
    return null;
  } catch {
    return null;
  }
}

const App = () => {
  const [auth, setAuth] = useState<{ token: string; user: LoginSuccessUser } | null>(readAuth);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showBaseWithoutAuth, setShowBaseWithoutAuth] = useState(false);
  /** Changes on each login so Dashboard can refresh "Did you know?" tip */
  const [loginKey, setLoginKey] = useState(() => Date.now());
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("darkMode");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const [language, setLanguage] = useState<"en" | "ta" | "hi">(() => {
    try {
      const saved = localStorage.getItem("resqmeal_lang") as "en" | "ta" | "hi" | null;
      return saved && ["en", "ta", "hi"].includes(saved) ? saved : "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("darkMode", JSON.stringify(darkMode));
      document.documentElement.classList.toggle("dark", darkMode);
    } catch {}
  }, [darkMode]);
  useEffect(() => {
    try {
      localStorage.setItem("resqmeal_lang", language);
    } catch {}
  }, [language]);

  const handleLoginSuccess = (user: LoginSuccessUser, token: string, rememberMe = true) => {
    const storage = getStorage(rememberMe);
    try {
      storage.setItem(STORAGE_TOKEN, token);
      storage.setItem(STORAGE_USER, JSON.stringify(user));
      const other = rememberMe ? sessionStorage : localStorage;
      other.removeItem(STORAGE_TOKEN);
      other.removeItem(STORAGE_USER);
    } catch (_) {}
    setAuth({ token, user });
    setShowLoginModal(false);
    setLoginKey(Date.now());
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
    sessionStorage.removeItem(STORAGE_TOKEN);
    sessionStorage.removeItem(STORAGE_USER);
    setAuth(null);
  };

  const showSignInPageFirst = !auth && !showBaseWithoutAuth;

  // Route users based on role: restaurant/ngo → OrganisationReport (admin mode), volunteer → Dashboard
  const content = (() => {
    if (showSignInPageFirst) {
      return (
        <LoginPage
          darkMode={darkMode}
          onSuccess={handleLoginSuccess}
          onBrowseWithoutSignIn={() => {
            setShowBaseWithoutAuth(true);
            setLoginKey(Date.now());
          }}
        />
      );
    }
    
    // Route restaurant and ngo roles to OrganisationReport (admin/organization mode)
    const userRole = auth?.user?.role?.toLowerCase();
    const isOrgAdmin = userRole === 'restaurant' || userRole === 'ngo';
    
    if (isOrgAdmin && auth?.user) {
      return (
        <OrganisationReport
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          language={language}
          setLanguage={setLanguage}
          user={auth.user}
          onLogout={handleLogout}
        />
      );
    }
    
    // Volunteer and unauthenticated users see Dashboard with hamburger menu
    return (
      <ResQMealApp
        auth={auth?.user ?? null}
        loginKey={loginKey}
        onOpenSignIn={() => setShowLoginModal(true)}
        onLogout={auth?.user ? handleLogout : undefined}
        language={language}
        setLanguage={setLanguage}
      />
    );
  })();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LanguageProvider language={language} setLanguage={setLanguage}>
          {content}
          {showLoginModal && !showSignInPageFirst && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
              role="dialog"
              aria-modal="true"
              onClick={() => setShowLoginModal(false)}
            >
              <div
                className="relative w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <LoginPage
                  darkMode={darkMode}
                  onSuccess={handleLoginSuccess}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition ${
                    darkMode ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-white text-slate-700 hover:bg-slate-100 shadow"
                  }`}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
