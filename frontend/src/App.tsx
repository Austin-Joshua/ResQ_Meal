import { useState, useEffect } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/context/LanguageContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { OnboardingProvider, useOnboarding } from "@/context/OnboardingContext";
import { ModeProvider } from "@/context/ModeContext";
import { OnboardingModal } from "@/components/OnboardingModal";
import { SkipLink } from "@/components/SkipLink";
import LanguageSelectorPage from "@/pages/LanguageSelector";
import LoginPage from "@/pages/Login";
import SignupPage from "@/pages/Signup";
import OrganisationReport from "@/pages/OrganisationReport";
import SecurityMonitoringPage from "@/pages/SecurityMonitoringPage";
import MapView from "@/pages/MapView";
import ImpactDashboard from "@/pages/ImpactDashboard";
import ResQMealApp from "@/pages/App";
import type { LoginSuccessUser } from "@/pages/Login";
import { userApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

const queryClient = new QueryClient();

function OnboardingGate({ darkMode }: { darkMode: boolean }) {
  const { shouldShow } = useOnboarding();
  const user = useAuthStore((s) => s.user);
  if (!user || !shouldShow) return null;
  return (
    <OnboardingModal
      open
      onClose={() => {}}
      role={user.role ?? "volunteer"}
      darkMode={darkMode}
    />
  );
}

const FIRST_TIME_DONE_PREFIX = "resqmeal_first_time_done_";

function getFirstTimeDoneKey(userId: number): string {
  return `${FIRST_TIME_DONE_PREFIX}${userId}`;
}

function getFirstTimeDone(userId: number): boolean {
  try {
    return localStorage.getItem(getFirstTimeDoneKey(userId)) === "true";
  } catch {
    return false;
  }
}

function setFirstTimeDone(userId: number): void {
  try {
    localStorage.setItem(getFirstTimeDoneKey(userId), "true");
  } catch {}
}

import { ROUTES, isAppPath } from '@/router';
export { ROUTES } from '@/router';

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const authUser = useAuthStore((s) => s.user);
  const authToken = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const auth = isAuthenticated && authUser && authToken ? { token: authToken, user: authUser as LoginSuccessUser } : null;

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(true);
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
    if (auth?.user?.id != null) {
      getFirstTimeDone(auth.user.id);
    }
  }, [auth?.user?.id]);

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

  const handleLoginSuccess = async (user: LoginSuccessUser, token: string, rememberMe = true) => {
    login(user, token, rememberMe);
    setShowLoginModal(false);
    setLoginKey(Date.now());
    getFirstTimeDone(user.id);
    try {
      const me = await userApi.getMe();
      const isSecurityAdmin = Boolean((me.data as { data?: { is_security_admin?: boolean } })?.data?.is_security_admin);
      if (isSecurityAdmin) {
        navigate(ROUTES.ADMIN);
        return;
      }
    } catch {
      // Fall through to default route if admin check fails.
    }
    navigate(ROUTES.DASHBOARD);
  };

  const handleLogout = () => {
    logout();
  };

  const pathname = location.pathname;
  const onAppPath = isAppPath(pathname);
  const userRole = auth?.user?.role?.toLowerCase();
  const isOrgAdmin = userRole === 'restaurant' || userRole === 'ngo';

  const handleLanguageSelect = (lang: "en" | "ta" | "hi") => {
    setLanguage(lang);
    setShowLanguageSelector(false);
  };

  const content = (() => {
    if (pathname === ROUTES.IMPACT) {
      return <ImpactDashboard />;
    }

    if (pathname === ROUTES.MAP) {
      if (!auth) return <Navigate to={ROUTES.HOME} replace />;
      return <MapView />;
    }

    if (!auth && onAppPath) {
      return <Navigate to={ROUTES.HOME} replace />;
    }
    if (auth && pathname === ROUTES.SIGNUP) {
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
    if (auth && pathname === ROUTES.HOME) {
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }

    if (auth && pathname === ROUTES.ADMIN) {
      return (
        <SecurityMonitoringPage
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          language={language}
          setLanguage={setLanguage}
          user={auth.user}
          onLogout={handleLogout}
          onBack={() => navigate(ROUTES.DASHBOARD)}
        />
      );
    }

    if (!auth) {
      if (pathname === ROUTES.SIGNUP) {
        return (
          <SignupPage
            darkMode={darkMode}
            onSuccess={handleLoginSuccess}
            onBackToSignIn={() => navigate(ROUTES.HOME)}
            onChangeLanguage={() => setShowLanguageSelector(true)}
          />
        );
      }
      if (showLanguageSelector) {
        return (
          <LanguageSelectorPage
            darkMode={darkMode}
            onSelect={handleLanguageSelect}
          />
        );
      }
      return (
        <LoginPage
          darkMode={darkMode}
          onSuccess={handleLoginSuccess}
          onGoToSignUp={() => navigate(ROUTES.SIGNUP)}
          onChangeLanguage={() => setShowLanguageSelector(true)}
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

    if (onAppPath) {
      return (
        <ResQMealApp
          auth={auth?.user ?? null}
          loginKey={loginKey}
          onOpenSignIn={() => setShowLoginModal(true)}
          onLogout={auth?.user ? handleLogout : undefined}
          language={language}
          setLanguage={setLanguage}
          currentPath={pathname}
          routes={ROUTES}
        />
      );
    }
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  })();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SkipLink />
        <Toaster />
        <Sonner richColors closeButton position="top-right" />
        <OnboardingProvider>
          <ModeProvider>
            <LanguageProvider language={language} setLanguage={setLanguage}>
              <NotificationProvider>
                <div id="main-content">{content}</div>
              {showLoginModal && (
                <div
                  className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Sign in"
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
                      aria-label="Close sign in dialog"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
                <OnboardingGate darkMode={darkMode} />
              </NotificationProvider>
            </LanguageProvider>
          </ModeProvider>
        </OnboardingProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
