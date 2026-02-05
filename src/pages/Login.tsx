import React, { useState } from 'react';
import { Lock, Mail, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { authApi } from '@/services/api';
import logoMark from '@/assets/logo-mark.png';

export interface LoginSuccessUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface LoginPageProps {
  darkMode: boolean;
  onSuccess: (user: LoginSuccessUser, token: string) => void;
  onBrowseWithoutSignIn?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ darkMode, onSuccess, onBrowseWithoutSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clearError = () => setError(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await authApi.login(email, password);
      if (data.success && data.data) {
        const { token, id, name, email: userEmail, role } = data.data;
        onSuccess({ id, name, email: userEmail, role }, token);
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
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      darkMode ? 'bg-[hsl(var(--background))]' : 'bg-[hsl(var(--muted))]/30'
    }`}>
      <div className="studio-panel-elevated w-full max-w-md p-8 transition-all duration-300">
          <div className="flex justify-center mb-6">
            <img src={logoMark} alt="" className="h-16 w-16 object-contain opacity-90" />
          </div>
          <h1 className={`text-2xl font-bold text-center mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            ResQ Meal
          </h1>
          <p className={`text-center text-sm mb-6 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Sign in with your account (passwords are encrypted)
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                role="alert"
                className={`flex items-center gap-2 p-3 rounded-lg text-sm animate-in fade-in duration-200 ${
                  darkMode ? 'bg-red-900/30 text-red-300 border border-red-700/50' : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="login-email" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Email
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  disabled={loading}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition ${
                    darkMode
                      ? 'bg-emerald-900/50 border-emerald-600/40 text-white placeholder-slate-400 focus:border-emerald-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-emerald-500'
                  } focus:outline-none`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition ${
                    darkMode
                      ? 'bg-emerald-900/50 border-emerald-600/40 text-white placeholder-slate-400 focus:border-emerald-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-emerald-500'
                  } focus:outline-none`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed ${
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
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {onBrowseWithoutSignIn && (
            <button
              type="button"
              onClick={onBrowseWithoutSignIn}
              className={`mt-4 w-full py-2.5 rounded-lg text-sm font-medium transition border ${
                darkMode
                  ? 'border-emerald-600/50 text-emerald-200 hover:bg-emerald-800/30'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Browse site without signing in
            </button>
          )}
      </div>
    </div>
  );
};

export default LoginPage;
