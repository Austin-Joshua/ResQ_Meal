import React, { useState } from 'react';
import { Lock, Mail, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { get } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { loginSchema } from '@/schemas';
import { authApi } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';
import { AppLogo } from '@/components/AppLogo';
import { BackendStatus } from '@/components/BackendStatus';
import { AuthDivider, GoogleSignInButton } from '@/components/GoogleSignInButton';
import { isFirebaseConfigured } from '@/lib/firebase';

const REMEMBER_EMAIL_KEY = 'resqmeal_remember_email';
const REMEMBER_ME_KEY = 'resqmeal_remember_me';

export interface LoginSuccessUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface LoginPageProps {
  darkMode: boolean;
  onSuccess: (user: LoginSuccessUser, token: string, rememberMe?: boolean) => void;
  onGoToSignUp?: () => void;
  onChangeLanguage?: () => void;
}

function getStoredRememberMe(): boolean {
  try {
    const v = localStorage.getItem(REMEMBER_ME_KEY);
    return v !== null ? v === 'true' : true;
  } catch {
    return true;
  }
}

function getStoredEmail(): string {
  try {
    return localStorage.getItem(REMEMBER_EMAIL_KEY) || '';
  } catch {
    return '';
  }
}

const LoginPage: React.FC<LoginPageProps> = ({ darkMode, onSuccess, onGoToSignUp, onChangeLanguage }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState(() => (getStoredRememberMe() ? getStoredEmail() : ''));
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(getStoredRememberMe);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isBackendOffline, setIsBackendOffline] = useState(false);

  const clearError = () => {
    setError(null);
    setIsBackendOffline(false);
  };

  const checkBackendHealth = async (): Promise<{ available: boolean; error?: string }> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    try {
      await get(endpoints.health, { signal: controller.signal });
      return { available: true };
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string; code?: string };
      if (e.name === 'AbortError') {
        return { available: false, error: 'NETWORK' };
      }
      if (e.message?.includes('CORS') || e.message?.includes('Access-Control')) {
        return { available: false, error: 'CORS' };
      }
      if (e.message?.includes('Failed to fetch') || e.code === 'ERR_NETWORK') {
        return { available: false, error: 'NETWORK' };
      }
      return { available: false, error: e.message ?? 'UNKNOWN' };
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsBackendOffline(false);

    const parsed = loginSchema.safeParse({ email: email.trim(), password, rememberMe });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Invalid input');
      return;
    }

    setLoading(true);
    
    try {
      // Quick backend health check before attempting login
      const healthCheck = await checkBackendHealth();
      if (!healthCheck.available) {
        setIsBackendOffline(true);
        if (healthCheck.error === 'CORS') {
          setError('CORS error: API is running but blocking requests. Check Spring CORS in server WebConfig.');
        } else if (healthCheck.error === 'NETWORK') {
          setError('API server is not running. Start it with: npm run dev:all or cd server && mvnw spring-boot:run');
        } else {
          setError(`Backend connection issue: ${healthCheck.error}. Check if the Spring Boot API is running (default port 8080) and Vite proxy is configured.`);
        }
        setLoading(false);
        return;
      }

      const { data } = await authApi.login(email.trim(), password);
      if (data?.token) {
        const { token, id, name, email: userEmail, role } = data;
        try {
          localStorage.setItem(REMEMBER_ME_KEY, String(rememberMe));
          if (rememberMe) localStorage.setItem(REMEMBER_EMAIL_KEY, userEmail);
          else localStorage.removeItem(REMEMBER_EMAIL_KEY);
        } catch (storageErr) {
          console.error('Failed to persist remember-me preference:', storageErr);
        }
        onSuccess({ id, name, email: userEmail, role }, token, rememberMe);
      } else {
        setError('Invalid response from server.');
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } }; code?: string; message?: string };
      if (!ax.response && (ax.code === 'ERR_NETWORK' || ax.code === 'ECONNREFUSED' || (ax as Error).message?.includes('Network') || (ax as Error).message?.includes('Failed to fetch'))) {
        setIsBackendOffline(true);
        setError('Cannot connect to the API. Ensure Spring Boot is running (port 8080) or use npm run dev:all.');
      } else {
        const msg = ax.response?.data?.message;
        setError(msg || 'Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (user: LoginSuccessUser, token: string) => {
    try {
      localStorage.setItem(REMEMBER_ME_KEY, String(rememberMe));
      if (rememberMe) localStorage.setItem(REMEMBER_EMAIL_KEY, user.email);
      else localStorage.removeItem(REMEMBER_EMAIL_KEY);
    } catch (storageErr) {
      console.error('Failed to persist remember-me preference:', storageErr);
    }
    onSuccess(user, token, rememberMe);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-3 sm:p-4 transition-colors duration-300 ${
      darkMode ? 'bg-[hsl(var(--background))]' : 'bg-blue-50/40'
    }`}>
      <div className={`w-full max-w-md p-5 sm:p-6 transition-all duration-300 rounded-2xl border shadow-lg ${
        darkMode
          ? 'bg-gradient-to-br from-blue-900/50 to-blue-950/50 border-[#D4AF37]/30'
          : 'bg-white border-blue-200 shadow-blue-900/5'
      }`}>
          <div className="flex justify-center mb-4">
            <div className={`rounded-lg p-2 border-2 ${darkMode ? 'bg-white/10 border-white/30' : 'bg-blue-50 border-blue-200'}`}>
              <AppLogo size="login" placeholderVariant={darkMode ? 'dark' : 'light'} className="h-12 w-12 object-contain" />
            </div>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-bold text-center mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            ResQ Meal
          </h1>
          <p className={`text-center text-sm mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {t('signInWithEmailPassword')}
          </p>

          {/* Backend Status Indicator */}
          <div className="mb-4">
            <BackendStatus showDetails={false} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div
                role="alert"
                className={`flex flex-col gap-2 p-4 rounded-lg text-sm animate-in fade-in duration-200 ${
                  darkMode
                    ? 'bg-red-900/40 text-red-200 border border-red-700/50'
                    : 'bg-red-50 text-red-700 border border-red-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="flex-1 font-medium">{error}</span>
                </div>
                {isBackendOffline && (
                  <p className={`ml-6 text-xs ${darkMode ? 'text-red-300/80' : 'text-red-600'}`}>
                    Check that the API is running and try again.
                  </p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="login-email" className={`block text-sm font-semibold mb-1.5 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                {t('email')}
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-[#D4AF37]' : 'text-blue-600'}`} />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  placeholder={t('enterYourEmail')}
                  required
                  autoComplete="email"
                  disabled={loading}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm transition focus:ring-2 focus:ring-offset-1 ${
                    darkMode
                      ? 'bg-blue-900/40 border-[#D4AF37]/50 text-white placeholder-slate-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]/50'
                      : 'bg-white border-blue-200 text-slate-900 placeholder-slate-500 focus:border-[#D4AF37] focus:ring-[#D4AF37]/30'
                  } focus:outline-none`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className={`block text-sm font-semibold mb-1.5 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                {t('password')}
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-[#D4AF37]' : 'text-blue-600'}`} />
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  placeholder={t('enterYourPassword')}
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm transition focus:ring-2 focus:ring-offset-1 ${
                    darkMode
                      ? 'bg-blue-900/40 border-[#D4AF37]/50 text-white placeholder-slate-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]/50'
                      : 'bg-white border-blue-200 text-slate-900 placeholder-slate-500 focus:border-[#D4AF37] focus:ring-[#D4AF37]/30'
                  } focus:outline-none`}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                id="login-remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
                className={`h-4 w-4 rounded border-2 transition ${
                  darkMode
                    ? 'border-[#D4AF37]/50 text-[#D4AF37] focus:ring-[#D4AF37]/50'
                    : 'border-[#D4AF37] text-blue-600 focus:ring-[#D4AF37]'
                } focus:ring-2 focus:ring-offset-1`}
                aria-label="Remember me"
              />
              <label
                htmlFor="login-remember"
                className={`text-sm cursor-pointer select-none font-medium ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}
              >
                {t('rememberMe')}
              </label>
              <span className={`text-xs ${darkMode ? 'text-[#D4AF37]/70' : 'text-blue-600/70'}`}>
                {rememberMe ? t('staySignedIn') : t('signOutWhenClose')}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed touch-manipulation min-h-[44px] ${
                darkMode
                  ? 'bg-[#D4AF37] text-[#1e3a5f] hover:bg-[#FFD700] active:scale-[0.98] shadow-[#D4AF37]/30'
                  : 'bg-[#D4AF37] text-[#1e3a5f] hover:bg-[#FFD700] active:scale-[0.98] shadow-[#D4AF37]/30'
              }`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              {loading ? t('signingIn') : t('signIn')}
            </button>

            {isFirebaseConfigured() && (
              <>
                <AuthDivider darkMode={darkMode} />
                <GoogleSignInButton
                  darkMode={darkMode}
                  disabled={loading}
                  onSuccess={handleGoogleSuccess}
                  onError={(msg) => {
                    if (msg) setError(msg);
                    else clearError();
                  }}
                />
              </>
            )}
          </form>

          {onGoToSignUp && (
            <p className={`mt-4 text-center text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('dontHaveAccount') || "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={onGoToSignUp}
                className={`font-semibold underline ${darkMode ? 'text-[#D4AF37]' : 'text-blue-600'}`}
              >
                {t('signUp') || 'Sign up'}
              </button>
            </p>
          )}

          {onChangeLanguage && (
            <p className={`mt-3 text-center text-sm ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              <button
                type="button"
                onClick={onChangeLanguage}
                className="underline hover:no-underline"
              >
                {t('changeLanguage')}
              </button>
            </p>
          )}
      </div>
    </div>
  );
};

export { LoginPage };
