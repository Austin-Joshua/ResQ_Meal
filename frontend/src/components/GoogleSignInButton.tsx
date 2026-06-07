import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { authApi } from '@/services/api';
import { isFirebaseConfigured, signInWithGooglePopup } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';

export interface GoogleAuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface GoogleSignInButtonProps {
  darkMode: boolean;
  role?: 'restaurant' | 'ngo' | 'volunteer';
  disabled?: boolean;
  onSuccess: (user: GoogleAuthUser, token: string) => void;
  onError?: (message: string) => void;
}

export function GoogleSignInButton({
  darkMode,
  role = 'volunteer',
  disabled = false,
  onSuccess,
  onError,
}: GoogleSignInButtonProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  if (!isFirebaseConfigured()) {
    return null;
  }

  const handleClick = async () => {
    setLoading(true);
    onError?.('');
    try {
      const idToken = await signInWithGooglePopup();
      const { data } = await authApi.loginWithGoogle(idToken, role);
      if (data?.token) {
        const { token, id, name, email, role: userRole } = data;
        onSuccess({ id, name, email, role: userRole }, token);
      } else {
        onError?.(t('googleSignInFailed') || 'Google sign-in failed. Please try again.');
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } }; code?: string; message?: string };
      const firebaseCancelled = ax.code === 'auth/popup-closed-by-user' || ax.code === 'auth/cancelled-popup-request';
      if (firebaseCancelled) {
        return;
      }
      const msg =
        ax.response?.data?.message ||
        (err instanceof Error ? err.message : null) ||
        t('googleSignInFailed') ||
        'Google sign-in failed. Please try again.';
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={disabled || loading}
      className={`w-full flex items-center justify-center gap-3 py-3 rounded-lg font-semibold text-sm transition-all duration-200 border touch-manipulation min-h-[44px] disabled:opacity-70 disabled:cursor-not-allowed ${
        darkMode
          ? 'bg-white/10 border-white/25 text-white hover:bg-white/15'
          : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm'
      }`}
      aria-label={t('signInWithGoogle') || 'Continue with Google'}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      {loading ? t('signingIn') : t('signInWithGoogle')}
    </button>
  );
}

export function AuthDivider({ darkMode }: { darkMode: boolean }) {
  const { t } = useLanguage();
  return (
    <div className="relative my-4">
      <div className={`absolute inset-0 flex items-center ${darkMode ? 'opacity-40' : ''}`}>
        <div className={`w-full border-t ${darkMode ? 'border-white/20' : 'border-slate-200'}`} />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-wide">
        <span className={`px-2 ${darkMode ? 'bg-transparent text-slate-400' : 'bg-white text-slate-500'}`}>
          {t('orContinueWith')}
        </span>
      </div>
    </div>
  );
}
