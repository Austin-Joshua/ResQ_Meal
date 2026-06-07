import React from 'react';
import { Zap, Send, Target, Truck, BarChart3, Shield, Globe, Users } from 'lucide-react';

export function AboutPage( { darkMode, onBack, t }: { darkMode: boolean; onBack: () => void; t: any }) {
  const aboutFeatures = [
    { icon: Zap, title: 'Fresh Food Checker (AI)', desc: 'Upload a photo or enter storage conditions. Our ML models assess freshness and quality so only safe food gets redistributed.' },
    { icon: Send, title: 'One-Click Surplus Posting', desc: 'Donors and restaurants post surplus food in seconds. Add quantity, expiry, location, and optional freshness check.' },
    { icon: Target, title: 'Smart NGO Matching', desc: 'AI-powered matching connects your surplus with NGOs by need, distance, and capacity. Accept or decline matches easily.' },
    { icon: Truck, title: 'Live Delivery Tracking', desc: 'Volunteers pick up and deliver. Track status and route in real time with proof-of-delivery and impact updates.' },
    { icon: BarChart3, title: 'Impact & Reports', desc: 'See meals saved, food diverted, CO₂ and water saved. Weekly trends and exportable reports for your records.' },
    { icon: Shield, title: 'Food Quality Verification', desc: 'Optional AI verification (image or environment) helps ensure food safety before it reaches beneficiaries.' },
    { icon: Globe, title: 'Multi-Language Support', desc: 'Use the platform in English, Tamil, and Hindi. Language switcher available in the header.' },
    { icon: Users, title: 'Roles: Donor, NGO, Volunteer', desc: 'Separate flows for donors posting food, NGOs requesting matches, and volunteers completing deliveries.' },
  ];

  return (
    <div className={`w-full px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-8`}>
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
          darkMode
            ? 'hover:bg-yellow-900/40 text-yellow-300'
            : 'hover:bg-blue-200 text-blue-700'
        }`}
      >
        {t('backToDashboard')}
      </button>

      {/* Hero */}
      <div className={`rounded-2xl p-8 transition-all duration-300 border ${
        darkMode
          ? 'bg-gradient-to-br from-emerald-900/40 to-blue-900/50 border-emerald-600/30 shadow-xl'
          : 'bg-gradient-to-br from-blue-400/15 to-emerald-400/15 border-blue-300/50 shadow-lg'
      }`}>
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          {t('aboutResQMeal')}
        </h2>
        <p className={`text-lg font-medium ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
          {t('turningSurplus')}
        </p>
        <p className={`mt-2 ${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
          {t('fullStackPlatform')}
        </p>
      </div>

      {/* Mission & Vision */}
      <div className={`rounded-2xl p-6 transition-all duration-300 border ${
        darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          {t('ourMission')}
        </h3>
        <p className={`mb-4 ${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
          {t('missionText')}
        </p>
        <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          {t('ourVision')}
        </h3>
        <p className={darkMode ? 'text-blue-100' : 'text-slate-700'}>
          {t('visionText')}
        </p>
      </div>

      {/* How it works */}
      <div className={`rounded-2xl p-6 transition-all duration-300 border ${
        darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          {t('howItWorks')}
        </h3>
        <ul className="space-y-4">
          {[
            { step: 1, title: t('postSurplus'), body: t('postSurplusDesc') },
            { step: 2, title: t('getMatched'), body: t('getMatchedDesc') },
            { step: 3, title: t('confirmDeliver'), body: t('confirmDeliverDesc') },
            { step: 4, title: t('seeImpact'), body: t('seeImpactDesc') },
          ].map(({ step, title, body }) => (
            <li key={step} className={`flex gap-4 ${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
              <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                darkMode ? 'bg-amber-600/40 text-amber-300' : 'bg-blue-100 text-blue-700'
              }`}>
                {step}
              </span>
              <div>
                <span className="font-semibold">{title}</span> — {body}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Website features */}
      <div className={`rounded-2xl p-6 transition-all duration-300 border ${
        darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          {t('websiteFeatures')}
        </h3>
        <p className={`mb-6 text-sm ${darkMode ? 'text-blue-200' : 'text-slate-600'}`}>
          {t('websiteFeaturesDesc')}
        </p>
        <ul className="space-y-4">
          {aboutFeatures.map(({ icon: Icon, title, desc }) => (
            <li
              key={title}
              className={`flex gap-4 p-4 rounded-xl ${
                darkMode ? 'bg-emerald-900/25' : 'bg-slate-50'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${darkMode ? 'text-amber-400' : 'text-blue-600'}`} />
              <div>
                <h4 className={`font-semibold mb-1 ${darkMode ? 'text-yellow-200' : 'text-slate-900'}`}>{title}</h4>
                <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-slate-600'}`}>{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Technology */}
      <div className={`rounded-2xl p-6 transition-all duration-300 border ${
        darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          {t('technologyAI')}
        </h3>
        <p className={`mb-4 ${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
          {t('technologyAIText')}
        </p>
      </div>

      {/* Get involved */}
      <div className={`rounded-2xl p-6 transition-all duration-300 border ${
        darkMode ? 'bg-emerald-900/25 border-emerald-600/30' : 'bg-amber-50 border-amber-200'
      }`}>
        <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
          {t('getInvolved')}
        </h3>
        <p className={darkMode ? 'text-blue-100' : 'text-amber-900/90'}>
          {t('getInvolvedText')}
        </p>
      </div>
    </div>
  );
};