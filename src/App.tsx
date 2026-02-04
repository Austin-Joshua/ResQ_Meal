import { lazy, Suspense, useState, useMemo, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/context/LanguageContext";
import LoginPage from "@/pages/Login";
import OrganisationReport from "@/pages/OrganisationReport";
import type { LoginSuccessUser } from "@/pages/Login";

const ResQMealApp = lazy(() => import("@/pages/App"));

const queryClient = new QueryClient();

function BaseAppFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-slate-600 text-sm">Loading…</p>
    </div>
  );
}

const STORAGE_TOKEN = "resqmeal_token";
const STORAGE_USER = "resqmeal_user";

function readAuth(): { token: string; user: LoginSuccessUser } | null {
  try {
    const token = localStorage.getItem(STORAGE_TOKEN);
    const userStr = localStorage.getItem(STORAGE_USER);
    if (!token || !userStr) return null;
    const user = JSON.parse(userStr) as LoginSuccessUser;
    return { token, user };
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

  const handleLoginSuccess = (user: LoginSuccessUser, token: string) => {
    localStorage.setItem(STORAGE_TOKEN, token);
    localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    setAuth({ token, user });
    setShowLoginModal(false);
    setLoginKey(Date.now());
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
    setAuth(null);
  };

  const isOrgAdmin = auth?.user?.role === "restaurant" || auth?.user?.role === "ngo";
  const showSignInPageFirst = !auth && !showBaseWithoutAuth;

  const content = useMemo(() => {
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
    return (
      <Suspense fallback={<BaseAppFallback />}>
        <ResQMealApp
          auth={auth?.user ?? null}
          loginKey={loginKey}
          onOpenSignIn={() => setShowLoginModal(true)}
          onLogout={auth?.user ? handleLogout : undefined}
        />
      </Suspense>
    );
  }, [auth, darkMode, language, isOrgAdmin, showSignInPageFirst]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LanguageProvider>
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
