import React, { useState } from 'react';
import { Lock, Mail, User, LogIn, ArrowLeft, Loader2, AlertCircle, Check, X } from 'lucide-react';
import { authApi } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';
import { AppLogo } from '@/components/AppLogo';
import { BackendStatus } from '@/components/BackendStatus';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordMinLength = 8;

export interface SignupSuccessUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface SignupPageProps {
  darkMode: boolean;
  onSuccess: (user: SignupSuccessUser, token: string) => void;
  onBackToSignIn: () => void;
  onChangeLanguage?: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ darkMode, onSuccess, onBackToSignIn, onChangeLanguage }) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    if (!name.trim()) {
      setError(t('fullNameRequired') || 'Full name is required');
      return false;
    }
    if (name.trim().length < 2) {
      setError(t('fullNameMinLength') || 'Name must be at least 2 characters');
      return false;
    }
    if (!email.trim()) {
      setError(t('emailRequired') || 'Email is required');
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setError(t('invalidEmail') || 'Please enter a valid email address');
      return false;
    }
    if (!password) {
      setError(t('passwordRequired') || 'Password is required');
      return false;
    }
    if (password.length < passwordMinLength) {
      setError((t('passwordMinLength') || 'Password must be at least 8 characters').replace('8', String(passwordMinLength)));
      return false;
    }
    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch') || 'Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        password,
        role: 'volunteer',
      });
      if (data.success && data.data) {
        const { token, id, name: n, email: em, role } = data.data;
        onSuccess({ id, name: n, email: em, role }, token);
      } else {
        setError(t('registrationFailed') || 'Registration failed. Please try again.');
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
      const msg = ax.response?.data?.message;
      const detail = ax.response?.data?.error;
      const fallback = t('registrationFailed') || 'Registration failed. Please try again.';
      setError(detail ? `${msg || 'Registration failed'}. ${detail}` : (msg || fallback));
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = password
    ? password.length >= 12
      ? 'strong'
      : password.length >= passwordMinLength
        ? 'medium'
        : 'weak'
    : 'none';

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-3 sm:p-4 transition-colors duration-300 ${
        darkMode ? 'bg-[hsl(var(--background))]' : 'bg-blue-50/40'
      }`}
    >
      <div
        className={`w-full max-w-md p-5 sm:p-6 transition-all duration-300 rounded-2xl border shadow-lg ${
          darkMode
            ? 'bg-gradient-to-br from-blue-900/50 to-blue-950/50 border-[#D4AF37]/30'
            : 'bg-white border-blue-200 shadow-blue-900/5'
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={onBackToSignIn}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition ${
              darkMode ? 'text-slate-300 hover:bg-blue-800/30' : 'text-slate-600 hover:bg-slate-100'
            }`}
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{t('backToSignIn') || 'Back to Sign in'}</span>
          </button>
        </div>
        <div className="flex justify-center mb-4">
          <div
            className={`rounded-lg p-2 border-2 ${darkMode ? 'bg-white/10 border-white/30' : 'bg-blue-50 border-blue-200'}`}
          >
            <AppLogo size="login" placeholderVariant={darkMode ? 'dark' : 'light'} className="h-12 w-12 object-contain" />
          </div>
        </div>
        <h1 className={`text-2xl sm:text-3xl font-bold text-center mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          ResQ Meal
        </h1>
        <p className={`text-center text-sm mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          {t('createAccountSubtitle') || t('createAccount') || 'Create your account to get started'}
        </p>

        <div className="mb-4">
          <BackendStatus showDetails={true} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div
              role="alert"
              className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                darkMode ? 'bg-red-900/40 text-red-200 border border-red-700/50' : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="flex-1">{error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="signup-name"
              className={`block text-sm font-semibold mb-1.5 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}
            >
              {t('name')}
            </label>
            <div className="relative">
              <User
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-[#D4AF37]' : 'text-blue-600'}`}
              />
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder={t('enterYourName') || 'Your full name'}
                required
                autoComplete="name"
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
            <label
              htmlFor="signup-email"
              className={`block text-sm font-semibold mb-1.5 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}
            >
              {t('email')}
            </label>
            <div className="relative">
              <Mail
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-[#D4AF37]' : 'text-blue-600'}`}
              />
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
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
            <label
              htmlFor="signup-password"
              className={`block text-sm font-semibold mb-1.5 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}
            >
              {t('password')}
            </label>
            <div className="relative">
              <Lock
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-[#D4AF37]' : 'text-blue-600'}`}
              />
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder={t('enterYourPassword')}
                required
                autoComplete="new-password"
                disabled={loading}
                className={`w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm transition focus:ring-2 focus:ring-offset-1 ${
                  darkMode
                    ? 'bg-blue-900/40 border-[#D4AF37]/50 text-white placeholder-slate-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]/50'
                    : 'bg-white border-blue-200 text-slate-900 placeholder-slate-500 focus:border-[#D4AF37] focus:ring-[#D4AF37]/30'
                } focus:outline-none`}
              />
            </div>
            {password && (
              <div className="mt-2 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition ${
                      passwordStrength === 'strong'
                        ? 'bg-green-500'
                        : passwordStrength === 'medium' && i < 2
                          ? 'bg-yellow-500'
                          : passwordStrength === 'weak' && i < 1
                            ? 'bg-red-500'
                            : darkMode
                              ? 'bg-slate-700'
                              : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="signup-confirm"
              className={`block text-sm font-semibold mb-1.5 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}
            >
              {t('confirmPassword') || 'Confirm Password'}
            </label>
            <div className="relative">
              <Lock
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-[#D4AF37]' : 'text-blue-600'}`}
              />
              <input
                id="signup-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError(null);
                }}
                placeholder={t('confirmPassword') || 'Confirm your password'}
                required
                autoComplete="new-password"
                disabled={loading}
                className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm transition focus:ring-2 focus:ring-offset-1 ${
                  darkMode
                    ? 'bg-blue-900/40 border-[#D4AF37]/50 text-white placeholder-slate-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]/50'
                    : 'bg-white border-blue-200 text-slate-900 placeholder-slate-500 focus:border-[#D4AF37] focus:ring-[#D4AF37]/30'
                } focus:outline-none`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {confirmPassword ? (
                  password === confirmPassword ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )
                ) : null}
              </div>
            </div>
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
            {loading ? (t('creatingAccount') || 'Creating account...') : (t('createAccount') || 'Create account')}
          </button>
        </form>

        <p className={`mt-4 text-center text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          {t('alreadyHaveAccount') || 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={onBackToSignIn}
            className={`font-semibold underline ${darkMode ? 'text-[#D4AF37]' : 'text-blue-600'}`}
          >
            {t('signIn')}
          </button>
        </p>

        {onChangeLanguage && (
          <p className={`mt-3 text-center text-sm ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
            <button type="button" onClick={onChangeLanguage} className="underline hover:no-underline">
              {t('changeLanguage')}
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
