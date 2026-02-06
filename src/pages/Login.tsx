import React, { useState } from 'react';
import { Lock, Mail, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { authApi } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';
import logoIcon from '/BG remove.png';

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
  onBrowseWithoutSignIn?: () => void;
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

const LoginPage: React.FC<LoginPageProps> = ({ darkMode, onSuccess, onBrowseWithoutSignIn }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState(() => (getStoredRememberMe() ? getStoredEmail() : ''));
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(getStoredRememberMe);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clearError = () => setError(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await authApi.login(email.trim(), password);
      if (data.success && data.data) {
        const { token, id, name, email: userEmail, role } = data.data;
        try {
          localStorage.setItem(REMEMBER_ME_KEY, String(rememberMe));
          if (rememberMe) localStorage.setItem(REMEMBER_EMAIL_KEY, userEmail);
          else localStorage.removeItem(REMEMBER_EMAIL_KEY);
        } catch (_) {}
        onSuccess({ id, name, email: userEmail, role }, token, rememberMe);
      } else {
        setError('Invalid response from server.');
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } }; code?: string };
      if (!ax.response && (ax.code === 'ERR_NETWORK' || (ax as Error).message?.includes('Network'))) {
        setError('Cannot connect to server. Please ensure the backend is running (e.g. cd backend && npm run dev).');
      } else {
        const msg = ax.response?.data?.message;
        setError(msg || 'Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-3 sm:p-4 transition-colors duration-300 ${
      darkMode ? 'bg-[hsl(var(--background))]' : 'bg-[hsl(var(--muted))]/30'
    }`}>
      <div className="studio-panel-elevated w-full max-w-md p-5 sm:p-6 transition-all duration-300">
          <div className="flex justify-center mb-3">
            <div className={`rounded-lg p-2 ${darkMode ? 'bg-white/10' : 'bg-slate-100'}`}>
              <img src={logoIcon} alt="ResQ Meal" className="h-12 w-12 object-contain" />
            </div>
          </div>
          <h1 className={`text-xl font-bold text-center mb-0.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            ResQ Meal
          </h1>
          <p className={`text-center text-sm mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {t('signInWithEmailPassword')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div
                role="alert"
                className={`flex items-center gap-2 p-2.5 rounded-lg text-sm animate-in fade-in duration-200 ${
                  darkMode ? 'bg-red-900/30 text-red-300 border border-red-700/50' : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="login-email" className={`block text-sm font-medium mb-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {t('email')}
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
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
                  className={`w-full pl-10 pr-3 py-2 rounded-lg border text-sm transition ${
                    darkMode
                      ? 'bg-emerald-900/50 border-emerald-600/40 text-white placeholder-slate-400 focus:border-emerald-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-emerald-500'
                  } focus:outline-none`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className={`block text-sm font-medium mb-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {t('password')}
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
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
                  className={`w-full pl-10 pr-3 py-2 rounded-lg border text-sm transition ${
                    darkMode
                      ? 'bg-emerald-900/50 border-emerald-600/40 text-white placeholder-slate-400 focus:border-emerald-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-emerald-500'
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
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                aria-label="Remember me"
              />
              <label
                htmlFor="login-remember"
                className={`text-sm cursor-pointer select-none ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}
              >
                {t('rememberMe')}
              </label>
              <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                {rememberMe ? t('staySignedIn') : t('signOutWhenClose')}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed ${
                darkMode
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-[0.99]'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-[0.99]'
              }`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              {loading ? t('signingIn') : t('signIn')}
            </button>
          </form>

          {onBrowseWithoutSignIn && (
            <button
              type="button"
              onClick={onBrowseWithoutSignIn}
              className={`mt-3 w-full py-2 rounded-lg text-sm font-medium transition border ${
                darkMode
                  ? 'border-emerald-600/50 text-emerald-200 hover:bg-emerald-800/30'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t('browseSiteWithoutSignIn')}
            </button>
          )}
      </div>
    </div>
  );
};

export default LoginPage;
