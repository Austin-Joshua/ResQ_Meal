import React, { useState } from 'react';
import { CheckCircle, Utensils, Users, Leaf, Shield, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { AppLogo } from './AppLogo';

export type UserMode = 'volunteer' | 'restaurant' | 'ngo' | 'admin';

interface ModeSelectionModalProps {
  userName: string;
  userEmail: string;
  darkMode: boolean;
  onModeSelected: (mode: UserMode) => void;
}

interface Question {
  id: string;
  text: string;
  hint: string;
  icon: React.ReactNode;
}

interface ModeOption {
  mode: UserMode;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export const ModeSelectionModal: React.FC<ModeSelectionModalProps> = ({
  userName,
  userEmail,
  darkMode,
  onModeSelected,
}) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<'welcome' | 'mode'>('welcome');
  const [responses, setResponses] = useState<Record<string, 'yes' | 'no'>>({});
  const [selectedMode, setSelectedMode] = useState<UserMode | null>(null);

  const questions: Question[] = [
    {
      id: 'donor',
      text: 'Are you a food donor or restaurant owner with surplus food to share?',
      hint: 'You want to post surplus food from your restaurant/kitchen',
      icon: <Utensils className="w-5 h-5" />,
    },
    {
      id: 'volunteer',
      text: 'Are you interested in volunteering to deliver food to those in need?',
      hint: 'You can help distribute food to communities and track deliveries',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'ngo',
      text: 'Are you part of an NGO or community organization receiving food?',
      hint: 'Your organization distributes received food to beneficiaries',
      icon: <Leaf className="w-5 h-5" />,
    },
    {
      id: 'admin',
      text: 'Do you manage operations or need admin/reporting features?',
      hint: 'View comprehensive impact reports and manage donation matching',
      icon: <Shield className="w-5 h-5" />,
    },
  ];

  const modeOptions: ModeOption[] = [
    {
      mode: 'volunteer',
      label: 'Volunteer Mode',
      description: 'Deliver food, track impact, connect with NGOs. Perfect for individuals helping their community.',
      icon: <Users className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      mode: 'restaurant',
      label: 'Restaurant/Donor Mode',
      description: 'Post surplus food, track donors, manage postings. Designed for restaurants and food businesses.',
      icon: <Utensils className="w-6 h-6" />,
      color: 'from-amber-500 to-orange-500',
    },
    {
      mode: 'ngo',
      label: 'NGO/Organization Mode',
      description: 'Manage food distribution, coordinate volunteers, view impact metrics. For organizations and shelters.',
      icon: <Leaf className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
    },
    {
      mode: 'admin',
      label: 'Admin/Management Mode',
      description: 'Comprehensive reporting, impact tracking, operations management. For coordinators and managers.',
      icon: <Shield className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const determineModeFromAnswers = (): UserMode | null => {
    const yesCount = Object.values(responses).filter(v => v === 'yes').length;
    
    // If primary donor answer is yes, suggest restaurant mode
    if (responses.donor === 'yes') return 'restaurant';
    
    // If primary volunteer answer is yes, suggest volunteer mode
    if (responses.volunteer === 'yes') return 'volunteer';
    
    // If primary ngo answer is yes, suggest ngo mode
    if (responses.ngo === 'yes') return 'ngo';
    
    // If admin answer is yes, suggest admin mode
    if (responses.admin === 'yes') return 'admin';
    
    // Default to volunteer if unclear
    return 'volunteer';
  };

  const handleModeSelect = (mode: UserMode) => {
    setSelectedMode(mode);
    onModeSelected(mode);
  };

  const handleQuestionnaireComplete = () => {
    const determinedMode = determineModeFromAnswers();
    if (determinedMode) {
      handleModeSelect(determinedMode);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-300 ${
      darkMode ? 'bg-black/60' : 'bg-black/40'
    }`}>
      <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl transition-all duration-300 max-h-[90vh] overflow-y-auto ${
        darkMode
          ? 'bg-gradient-to-br from-blue-900/80 to-blue-950/80 border-[#D4AF37]/30'
          : 'bg-white border-blue-200'
      }`}>
        {step === 'welcome' ? (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Logo */}
            <div className="flex justify-center">
              <div className={`rounded-lg p-3 border-2 ${darkMode ? 'bg-white/10 border-white/30' : 'bg-blue-50 border-blue-200'}`}>
                <AppLogo size="login" placeholderVariant={darkMode ? 'dark' : 'light'} className="h-12 w-12" />
              </div>
            </div>

            {/* Welcome Message */}
            <div className="text-center space-y-2">
              <h1 className={`text-3xl sm:text-4xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Welcome, {userName}!
              </h1>
              <p className={`text-sm sm:text-base ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {userEmail}
              </p>
            </div>

            {/* Info Section */}
            <div className={`p-4 rounded-lg border ${
              darkMode
                ? 'bg-blue-800/30 border-blue-600/30 text-blue-200'
                : 'bg-blue-50/80 border-blue-200 text-blue-700'
            }`}>
              <p className="text-sm font-medium leading-relaxed">
                ResQ Meal works differently for different roles. To give you the best experience, let's determine which mode suits you best. 
                Answer a few quick questions and we'll set everything up!
              </p>
            </div>

            {/* Mode Preview Cards */}
            <div className="space-y-3">
              <p className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Available modes:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {modeOptions.map((opt) => (
                  <div
                    key={opt.mode}
                    className={`p-3 rounded-lg border transition ${
                      darkMode
                        ? 'bg-white/5 border-white/10 hover:border-white/20'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`bg-gradient-to-br ${opt.color} p-2 rounded-lg text-white shrink-0`}>
                        {opt.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {opt.label}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          {opt.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep('mode')}
                className={`flex-1 py-3 rounded-lg font-semibold transition touch-manipulation min-h-[44px] ${
                  darkMode
                    ? 'bg-[#D4AF37] text-[#1e3a5f] hover:bg-[#FFD700] active:scale-[0.98]'
                    : 'bg-[#D4AF37] text-[#1e3a5f] hover:bg-[#FFD700] active:scale-[0.98]'
                }`}
              >
                Answer Questions
              </button>
              <button
                onClick={() => {
                  // Default to volunteer mode if user skips
                  handleModeSelect('volunteer');
                }}
                className={`flex-1 py-3 rounded-lg font-semibold transition border-2 touch-manipulation min-h-[44px] ${
                  darkMode
                    ? 'border-[#D4AF37]/50 text-[#D4AF37] hover:bg-blue-800/30'
                    : 'border-[#D4AF37] text-[#1e3a5f] hover:bg-blue-50'
                }`}
              >
                Skip & Continue
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Let's Find Your Mode
              </h1>
              <button
                onClick={() => setStep('welcome')}
                className={`text-sm font-medium px-3 py-2 rounded-lg transition ${
                  darkMode
                    ? 'text-slate-300 hover:bg-blue-800/30'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Back
              </button>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className={`p-4 rounded-lg border transition ${
                    darkMode
                      ? 'bg-blue-800/20 border-blue-600/30'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className={darkMode ? 'text-blue-300' : 'text-blue-600'}>
                      {q.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {q.text}
                      </p>
                      <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {q.hint}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 ml-8">
                    <button
                      onClick={() => setResponses({ ...responses, [q.id]: 'yes' })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        responses[q.id] === 'yes'
                          ? darkMode
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-600 text-white'
                          : darkMode
                          ? 'bg-blue-900/40 text-blue-200 hover:bg-blue-900/60'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      ✓ Yes
                    </button>
                    <button
                      onClick={() => setResponses({ ...responses, [q.id]: 'no' })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        responses[q.id] === 'no'
                          ? darkMode
                            ? 'bg-slate-600 text-white'
                            : 'bg-slate-600 text-white'
                          : darkMode
                          ? 'bg-slate-700/40 text-slate-300 hover:bg-slate-700/60'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      ✗ No
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Info Alert */}
            {Object.keys(responses).length > 0 && (
              <div className={`p-3 rounded-lg border flex gap-2 ${
                darkMode
                  ? 'bg-blue-900/30 border-blue-600/30 text-blue-200'
                  : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">
                  Based on your answers, we'll recommend the best mode. You can always switch modes later!
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep('welcome')}
                className={`flex-1 py-3 rounded-lg font-semibold transition border-2 touch-manipulation min-h-[44px] ${
                  darkMode
                    ? 'border-[#D4AF37]/50 text-[#D4AF37] hover:bg-blue-800/30'
                    : 'border-[#D4AF37] text-[#1e3a5f] hover:bg-blue-50'
                }`}
              >
                Back
              </button>
              <button
                onClick={handleQuestionnaireComplete}
                disabled={Object.keys(responses).length === 0}
                className={`flex-1 py-3 rounded-lg font-semibold transition touch-manipulation min-h-[44px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  darkMode
                    ? 'bg-[#D4AF37] text-[#1e3a5f] hover:bg-[#FFD700] active:scale-[0.98]'
                    : 'bg-[#D4AF37] text-[#1e3a5f] hover:bg-[#FFD700] active:scale-[0.98]'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
