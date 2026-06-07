import React from 'react';

export type ImpactStatId = 'mealsSaved' | 'foodDiverted' | 'co2Prevented' | 'waterSaved';
export function ImpactPage( { darkMode, onBack, onStatClick, t }: { darkMode: boolean; onBack: () => void; onStatClick?: (statId: ImpactStatId) => void; t: any }) {
  const impactStats: { id: ImpactStatId; icon: string; label: string; value: string; color: string; border: string }[] = [
    { id: 'mealsSaved', icon: '🍽️', label: t('mealsSaved'), value: '3,450', color: 'from-emerald-500/30 to-emerald-600/30', border: 'emerald' },
    { id: 'foodDiverted', icon: '⚖️', label: t('foodDiverted'), value: '8,625 kg', color: 'from-blue-500/30 to-blue-600/30', border: 'blue' },
    { id: 'co2Prevented', icon: '💨', label: t('co2Prevented'), value: '21.5 tons', color: 'from-yellow-500/30 to-yellow-600/30', border: 'yellow' },
    { id: 'waterSaved', icon: '💧', label: t('waterSaved'), value: '8.6M L', color: 'from-cyan-500/30 to-cyan-600/30', border: 'cyan' },
  ];
  return (
    <div className={`w-full px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn`}>
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg mb-8 transition-all duration-200 font-semibold ${
          darkMode
            ? 'hover:bg-yellow-900/40 text-yellow-300'
            : 'hover:bg-blue-200 text-blue-700'
        }`}
      >
        {t('backToDashboard')}
      </button>

      <div className={`rounded-2xl p-8 mb-8 transition-all duration-300 border ${
        darkMode
          ? 'bg-gradient-to-br from-emerald-900/40 to-blue-900/50 border-emerald-600/30 shadow-xl'
          : 'bg-gradient-to-br from-blue-400/15 to-emerald-400/15 border-blue-300/50 shadow-lg'
      }`}>
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          📊 {t('yourImpact')}
        </h2>
        <p className={darkMode ? 'text-blue-200' : 'text-blue-700'}>
          {t('seeHowMuch')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {impactStats.map((stat) => (
          <button
            key={stat.id}
            type="button"
            onClick={() => {
              if (onStatClick) {
                onStatClick(stat.id);
              }
            }}
            className={`group rounded-2xl p-8 transition-all duration-300 border-2 text-left w-full cursor-pointer hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 touch-manipulation ${
              darkMode
                ? `bg-gradient-to-br ${stat.color} border-[#D4AF37]/30 shadow-lg hover:border-[#D4AF37] hover:shadow-[#D4AF37]/20 focus:ring-[#D4AF37]`
                : `bg-gradient-to-br ${stat.color} border-blue-300/50 shadow-md hover:border-blue-500 hover:shadow-blue-500/20 focus:ring-blue-500`
            }`}
            aria-label={`View detailed report for ${stat.label}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-sm font-semibold mb-1 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                  {stat.label}
                </p>
                <p className={`text-4xl font-bold mt-3 ${darkMode ? 'text-[#D4AF37]' : 'text-blue-700'}`}>
                  {stat.value}
                </p>
                <p className={`text-xs mt-4 opacity-70 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                  Click to view detailed report →
                </p>
              </div>
              <span className="text-5xl opacity-40 group-hover:opacity-60 transition-opacity">{stat.icon}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};