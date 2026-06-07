import React from 'react';
import { MapPin, Thermometer, Clock, FileText } from 'lucide-react';

export interface MatchCardData {
  id: number;
  foodName: string;
  ngo: string;
  org: string;
  status: string;
  distance: string;
  meals: number | string;
  donation: string;
  address?: string;
  minTemp?: number;
  maxTemp?: number;
  availabilityHours?: number;
}

export interface MatchCardProps {
  match: MatchCardData;
  darkMode: boolean;
  t: (key: string) => string;
  onAccept?: (match: MatchCardData) => void;
  onDecline?: (matchId: number) => void;
  onDirections?: (address: string) => void;
}

function statusLabel(status: string, t: (key: string) => string): string {
  switch (status) {
    case 'MATCHED':
      return t('matchedStatus');
    case 'ACCEPTED':
      return t('acceptedStatus');
    case 'PICKED_UP':
      return t('pickedUpStatus');
    case 'DELIVERED':
      return t('deliveredStatus');
    default:
      return status;
  }
}

export const MatchCard = React.memo(function MatchCard({
  match,
  darkMode,
  t,
  onAccept,
  onDecline,
  onDirections,
}: MatchCardProps) {
  return (
    <div
      className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 border ${
        darkMode
          ? 'bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-blue-600/30 shadow-xl'
          : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-lg'
      }`}
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-3">
        <div className="flex-1 min-w-0">
          <h3
            className={`text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 ${
              darkMode ? 'text-blue-200' : 'text-blue-700'
            }`}
          >
            {match.foodName}
          </h3>
          <p
            className={`text-xs sm:text-sm font-semibold mb-1 ${
              darkMode ? 'text-blue-300' : 'text-blue-600'
            }`}
          >
            {t('organization')}: {match.ngo}
          </p>
          <div className="flex items-center gap-1.5">
            <FileText
              className={`w-3 h-3 shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`}
            />
            <p className={`text-xs truncate ${darkMode ? 'text-blue-300/80' : 'text-slate-600'}`}>
              {match.org}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span
            className={`inline-block px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-xs sm:text-sm ${
              match.status === 'MATCHED'
                ? darkMode
                  ? 'bg-blue-500/30 text-blue-200'
                  : 'bg-blue-100 text-blue-700'
                : darkMode
                  ? 'bg-emerald-500/30 text-emerald-200'
                  : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {statusLabel(match.status, t)}
          </span>
        </div>
      </div>

      <div
        className={`grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b ${
          darkMode ? 'border-blue-600/30' : 'border-blue-200'
        }`}
      >
        <div>
          <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
            <MapPin
              className={`w-3 h-3 sm:w-4 sm:h-4 shrink-0 ${darkMode ? 'text-red-400' : 'text-red-500'}`}
            />
            <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-slate-600'}`}>
              {t('distance')}
            </p>
          </div>
          <p className={`text-sm sm:text-base font-bold ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
            {match.distance}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
            <span className="text-base sm:text-lg">🍽️</span>
            <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-slate-600'}`}>{t('meals')}</p>
          </div>
          <p className={`text-sm sm:text-base font-bold ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
            {match.meals}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
            <span className="text-base sm:text-lg">💰</span>
            <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-slate-600'}`}>
              {t('donationValue')}
            </p>
          </div>
          <p
            className={`text-sm sm:text-base font-bold truncate ${
              darkMode ? 'text-blue-200' : 'text-blue-700'
            }`}
          >
            {match.donation}
          </p>
        </div>
      </div>

      {(match.minTemp !== undefined || match.maxTemp !== undefined || match.availabilityHours !== undefined) && (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b ${
            darkMode ? 'border-blue-600/30' : 'border-blue-200'
          }`}
        >
          {match.minTemp !== undefined && match.maxTemp !== undefined && (
            <div>
              <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
                <Thermometer
                  className={`w-3 h-3 sm:w-4 sm:h-4 shrink-0 ${
                    darkMode ? 'text-blue-400' : 'text-blue-500'
                  }`}
                />
                <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-slate-600'}`}>
                  {t('storageTemperature')}
                </p>
              </div>
              <p className={`text-sm sm:text-base font-bold ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                {match.minTemp}°C - {match.maxTemp}°C
              </p>
            </div>
          )}
          {match.availabilityHours !== undefined && (
            <div>
              <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
                <Clock
                  className={`w-3 h-3 sm:w-4 sm:h-4 shrink-0 ${
                    darkMode ? 'text-emerald-400' : 'text-emerald-500'
                  }`}
                />
                <p className={`text-xs ${darkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>
                  {t('availableFor')}
                </p>
              </div>
              <p className={`text-sm sm:text-base font-bold ${darkMode ? 'text-emerald-200' : 'text-emerald-700'}`}>
                {match.availabilityHours} {t('hours')}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        {match.status === 'MATCHED' && onAccept && onDecline && (
          <>
            <button
              type="button"
              onClick={() => onAccept(match)}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold py-3 sm:py-3.5 px-3 sm:px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation min-h-[44px]"
            >
              <span className="text-base sm:text-lg">✓</span>
              {t('accept')}
            </button>
            <button
              type="button"
              onClick={() => onDecline(match.id)}
              className={`flex-1 border-2 font-bold py-3 sm:py-3.5 px-3 sm:px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation min-h-[44px] ${
                darkMode
                  ? 'border-blue-400 bg-white/10 text-red-400 hover:bg-white/20 active:bg-white/30'
                  : 'border-blue-300 bg-white text-red-600 hover:bg-red-50 active:bg-red-100'
              }`}
            >
              <span className="text-base sm:text-lg">✕</span>
              {t('decline')}
            </button>
          </>
        )}
        {(match.status === 'ACCEPTED' || match.status === 'PICKED_UP') &&
          match.address &&
          onDirections && (
            <button
              type="button"
              onClick={() => onDirections(match.address!)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition text-sm sm:text-base min-h-[44px]"
            >
              {t('getDirections') ?? t('viewOnMap') ?? 'Get directions'}
            </button>
          )}
      </div>
    </div>
  );
});
