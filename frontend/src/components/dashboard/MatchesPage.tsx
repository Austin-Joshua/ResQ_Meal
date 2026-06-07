import React, { useState } from 'react';
import { MatchCard } from '@/components/MatchCard';
import { MATCH_STATUS } from '@/constants';
import {
  INITIAL_MATCHES,
  MATCH_TAB_STATUSES,
  type MatchItem,
  type MatchTab,
} from '@/components/dashboard/matchConstants';

export function MatchesPage( { darkMode, onBack, t }: { darkMode: boolean; onBack: () => void; t: any }) {
  const [activeTab, setActiveTab] = useState<MatchTab>('all');
  const [matches, setMatches] = useState<MatchItem[]>(INITIAL_MATCHES);

  const openMapsWithDirections = (address: string) => {
    const encoded = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const handleAccept = (match: MatchItem | import('@/components/MatchCard').MatchCardData) => {
    setMatches((prev) => prev.map((m) => (m.id === match.id ? { ...m, status: MATCH_STATUS.ACCEPTED } : m)));
  };

  const handleDecline = (matchId: number) => {
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
  };

  const tabLabels: { id: MatchTab; label: string }[] = [
    { id: 'all', label: t('allMatches') },
    { id: 'pending', label: t('matchPending') },
    { id: 'accepted', label: t('matchAccepted') },
    { id: 'in_delivery', label: t('matchInDelivery') },
    { id: 'completed', label: t('matchCompleted') },
  ];

  const filteredMatches = activeTab === 'all'
    ? matches
    : matches.filter((m) => MATCH_TAB_STATUSES[activeTab].includes(m.status));

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

      <div className={`rounded-2xl p-8 mb-6 transition-all duration-300 border ${
        darkMode
          ? 'bg-gradient-to-br from-emerald-900/40 to-blue-900/50 border-emerald-600/30 shadow-xl'
          : 'bg-gradient-to-br from-blue-400/15 to-emerald-400/15 border-blue-300/50 shadow-lg'
      }`}>
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          🎯 {t('yourMatches')}
        </h2>
        <p className={darkMode ? 'text-blue-200' : 'text-blue-700'}>
          {t('seeWhichNGOs')}
        </p>
      </div>

      <div className={`flex flex-wrap gap-2 mb-4 sm:mb-6 rounded-xl p-2 border ${
        darkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-slate-100 border-slate-200'
      }`}>
        {tabLabels.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition touch-manipulation min-h-[36px] sm:min-h-[40px] ${
              activeTab === tab.id
                ? darkMode
                  ? 'bg-amber-600/50 text-amber-200'
                  : 'bg-amber-200 text-amber-900'
                : darkMode
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700 active:bg-slate-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200 active:bg-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 sm:space-y-6">
        {filteredMatches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            darkMode={darkMode}
            t={t}
            onAccept={handleAccept}
            onDecline={handleDecline}
            onDirections={openMapsWithDirections}
          />
        ))}
      </div>
    </div>
  );
}
