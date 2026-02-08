import React, { useState } from 'react';
import { Phone, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { userApi } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';
import { AppLogo } from './AppLogo';

interface PersonalDetailsFormProps {
  darkMode: boolean;
  onComplete: () => void;
}

export const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({
  darkMode,
  onComplete,
}) => {
  const { t } = useLanguage();
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await userApi.updateMe({
        ...(phone.trim() && { phone_number: phone.trim() }),
        ...(address.trim() && { address: address.trim() }),
      });
      onComplete();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string; error?: string } } };
      const msg = ax.response?.data?.message;
      const detail = ax.response?.data?.error;
      const fallback = t('saveFailed') || 'Failed to save. Please try again.';
      setError(detail ? `${msg || 'Failed to update'}. ${detail}` : (msg || fallback));
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className={`w-full max-w-md rounded-2xl border shadow-2xl transition-all duration-300 ${
      darkMode
        ? 'bg-gradient-to-br from-blue-900/80 to-blue-950/80 border-[#D4AF37]/30'
        : 'bg-white border-blue-200'
    }`}>
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex justify-center">
          <div className={`rounded-lg p-2 border-2 ${darkMode ? 'bg-white/10 border-white/30' : 'bg-blue-50 border-blue-200'}`}>
            <AppLogo size="login" placeholderVariant={darkMode ? 'dark' : 'light'} className="h-10 w-10" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {t('personalDetails') || 'Personal details'}
          </h1>
          <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {t('personalDetailsSubtitle') || 'Add your contact details so organisations can reach you (optional).'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                darkMode ? 'bg-red-900/30 text-red-200 border border-red-700/50' : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className={`block text-sm font-semibold mb-1.5 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
              {t('phone')} ({t('optional') || 'Optional'})
            </label>
            <div className="relative">
              <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-[#D4AF37]' : 'text-blue-600'}`} />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('enterPhone') || 'e.g. +91 98765 43210'}
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
            <label className={`block text-sm font-semibold mb-1.5 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
              {t('address')} ({t('optional') || 'Optional'})
            </label>
            <div className="relative">
              <MapPin className={`absolute left-3 top-3 w-4 h-4 ${darkMode ? 'text-[#D4AF37]' : 'text-blue-600'}`} />
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t('enterAddress') || 'City, area, or full address'}
                rows={2}
                disabled={loading}
                className={`w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm transition focus:ring-2 focus:ring-offset-1 resize-none ${
                  darkMode
                    ? 'bg-blue-900/40 border-[#D4AF37]/50 text-white placeholder-slate-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]/50'
                    : 'bg-white border-blue-200 text-slate-900 placeholder-slate-500 focus:border-[#D4AF37] focus:ring-[#D4AF37]/30'
                } focus:outline-none`}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSkip}
              className={`flex-1 py-3 rounded-lg font-semibold transition border-2 touch-manipulation min-h-[44px] ${
                darkMode
                  ? 'border-[#D4AF37]/50 text-[#D4AF37] hover:bg-blue-800/30'
                  : 'border-[#D4AF37] text-[#1e3a5f] hover:bg-blue-50'
              }`}
            >
              {t('skip') || 'Skip'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 rounded-lg font-semibold transition touch-manipulation min-h-[44px] flex items-center justify-center gap-2 disabled:opacity-70 ${
                darkMode
                  ? 'bg-[#D4AF37] text-[#1e3a5f] hover:bg-[#FFD700] active:scale-[0.98]'
                  : 'bg-[#D4AF37] text-[#1e3a5f] hover:bg-[#FFD700] active:scale-[0.98]'
              }`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading ? (t('saving') || 'Saving...') : (t('saveAndContinue') || 'Save & Continue')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
