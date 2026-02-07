import React, { useState } from 'react';
import { Mail, Lock, User, Phone, MapPin, LogIn, ArrowLeft, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { authApi } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';
import { AppLogo } from './AppLogo';

interface SignupModalProps {
  darkMode: boolean;
  onSignupSuccess: (user: { id: number; name: string; email: string; role: string }, token: string) => void;
  onCancel: () => void;
}

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone_number?: string;
  address?: string;
  role: 'volunteer' | 'restaurant' | 'ngo';
}

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone_number?: string;
  address?: string;
  submit?: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordMinLength = 8;

export const SignupModal: React.FC<SignupModalProps> = ({ darkMode, onSignupSuccess, onCancel }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    address: '',
    role: 'volunteer',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < passwordMinLength) {
      newErrors.password = `Password must be at least ${passwordMinLength} characters`;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.phone_number && !/^\d{10,15}$/.test(formData.phone_number.replace(/\D/g, ''))) {
      newErrors.phone_number = 'Please enter a valid phone number (10-15 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessMessage(null);

    try {
      const { data } = await authApi.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        phone_number: formData.phone_number || undefined,
        address: formData.address || undefined,
      });

      if (data.success && data.data) {
        const { token, id, name, email, role } = data.data;
        setSuccessMessage('Account created successfully! Redirecting...');
        
        setTimeout(() => {
          onSignupSuccess({ id, name, email, role }, token);
        }, 1500);
      } else {
        setErrors({ submit: 'Registration failed. Please try again.' });
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'An error occurred during registration. Please try again.';
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = formData.password ? 
    (formData.password.length >= 12 ? 'strong' : 
     formData.password.length >= passwordMinLength ? 'medium' : 'weak') : 'none';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-300 ${
      darkMode ? 'bg-black/60' : 'bg-black/40'
    }`}>
      <div className={`w-full max-w-md rounded-2xl border shadow-2xl transition-all duration-300 max-h-[90vh] overflow-y-auto ${
        darkMode
          ? 'bg-gradient-to-br from-blue-900/80 to-blue-950/80 border-[#D4AF37]/30'
          : 'bg-white border-blue-200'
      }`}>
        <div className="p-6 sm:p-8 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onCancel}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                darkMode
                  ? 'text-slate-300 hover:bg-blue-800/30'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className={`rounded-lg p-2 border-2 ${darkMode ? 'bg-white/10 border-white/30' : 'bg-blue-50 border-blue-200'}`}>
              <AppLogo size="login" placeholderVariant={darkMode ? 'dark' : 'light'} className="h-8 w-8" />
            </div>
          </div>

          {/* Title */}
          <h1 className={`text-2xl font-bold text-center ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Create Account
          </h1>
          <p className={`text-center text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Join ResQ Meal and make a difference
          </p>

          {/* Success Message */}
          {successMessage && (
            <div className={`p-3 rounded-lg border flex gap-2 ${
              darkMode
                ? 'bg-green-900/30 border-green-600/30 text-green-200'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}>
              <Check className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name */}
            <div>
              <label className={`block text-sm font-semibold mb-1.5 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                Full Name *
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-[#D4AF37]' : 'text-blue-600'}`} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  placeholder="Your full name"
                  disabled={loading}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm transition focus:ring-2 focus:ring-offset-1 ${
                    darkMode
                      ? 'bg-blue-900/40 border-[#D4AF37]/50 text-white placeholder-slate-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]/50'
                      : 'bg-white border-blue-200 text-slate-900 placeholder-slate-500 focus:border-[#D4AF37] focus:ring-[#D4AF37]/30'
                  } focus:outline-none`}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className={`block text-sm font-semibold mb-1.5 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                Email *
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-[#D4AF37]' : 'text-blue-600'}`} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  placeholder="your@email.com"
                  disabled={loading}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm transition focus:ring-2 focus:ring-offset-1 ${
                    darkMode
                      ? 'bg-blue-900/40 border-[#D4AF37]/50 text-white placeholder-slate-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]/50'
                      : 'bg-white border-blue-200 text-slate-900 placeholder-slate-500 focus:border-[#D4AF37] focus:ring-[#D4AF37]/30'
                  } focus:outline-none`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className={`block text-sm font-semibold mb-1.5 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                Password *
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-[#D4AF37]' : 'text-blue-600'}`} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  placeholder={`At least ${passwordMinLength} characters`}
                  disabled={loading}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm transition focus:ring-2 focus:ring-offset-1 ${
                    darkMode
                      ? 'bg-blue-900/40 border-[#D4AF37]/50 text-white placeholder-slate-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]/50'
                      : 'bg-white border-blue-200 text-slate-900 placeholder-slate-500 focus:border-[#D4AF37] focus:ring-[#D4AF37]/30'
                  } focus:outline-none`}
                />
              </div>
              {formData.password && (
                <div className="mt-2 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition ${
                        passwordStrength === 'strong' ? 'bg-green-500' :
                        passwordStrength === 'medium' && i < 2 ? 'bg-yellow-500' :
                        passwordStrength === 'weak' && i < 1 ? 'bg-red-500' :
                        darkMode ? 'bg-slate-700' : 'bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
              )}
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className={`block text-sm font-semibold mb-1.5 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-[#D4AF37]' : 'text-blue-600'}`} />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  placeholder="Confirm your password"
                  disabled={loading}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm transition focus:ring-2 focus:ring-offset-1 ${
                    darkMode
                      ? 'bg-blue-900/40 border-[#D4AF37]/50 text-white placeholder-slate-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]/50'
                      : 'bg-white border-blue-200 text-slate-900 placeholder-slate-500 focus:border-[#D4AF37] focus:ring-[#D4AF37]/30'
                  } focus:outline-none`}
                />
                {formData.confirmPassword && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {formData.password === formData.confirmPassword ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Phone Number (Optional) */}
            <div>
              <label className={`block text-sm font-semibold mb-1.5 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-[#D4AF37]' : 'text-blue-600'}`} />
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => {
                    setFormData({ ...formData, phone_number: e.target.value });
                    if (errors.phone_number) setErrors({ ...errors, phone_number: undefined });
                  }}
                  placeholder="+1 (555) 123-4567"
                  disabled={loading}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm transition focus:ring-2 focus:ring-offset-1 ${
                    darkMode
                      ? 'bg-blue-900/40 border-[#D4AF37]/50 text-white placeholder-slate-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]/50'
                      : 'bg-white border-blue-200 text-slate-900 placeholder-slate-500 focus:border-[#D4AF37] focus:ring-[#D4AF37]/30'
                  } focus:outline-none`}
                />
              </div>
              {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
            </div>

            {/* Role Selection */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                I want to join as *
              </label>
              <div className="space-y-2">
                {[
                  { value: 'volunteer' as const, label: 'Volunteer' },
                  { value: 'restaurant' as const, label: 'Restaurant / Food Donor' },
                  { value: 'ngo' as const, label: 'NGO / Organization' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={formData.role === option.value}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as typeof formData.role })}
                      disabled={loading}
                      className="w-4 h-4"
                    />
                    <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className={`p-3 rounded-lg border flex gap-2 ${
                darkMode
                  ? 'bg-red-900/30 border-red-600/30 text-red-200'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-xs">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !!successMessage}
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Terms */}
          <p className={`text-xs text-center ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};
