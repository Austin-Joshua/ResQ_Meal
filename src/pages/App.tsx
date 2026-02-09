import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import SettingsPage from './SettingsPage';
import { useLanguage } from '@/context/LanguageContext';

export interface BaseAuthUser {
  id?: number;
  name: string;
  email: string;
  role: string;
}

const PATH_TO_PAGE: Record<string, string> = {
  '/Dashboard': 'dashboard',
  '/Freshness': 'freshness',
  '/NGO': 'matches',
  '/Elite': 'elite',
  '/Report': 'impact',
  '/Report/meals-saved': 'mealsSaved',
  '/Report/food-diverted': 'foodDiverted',
  '/Report/co2-prevented': 'co2Prevented',
  '/Report/water-saved': 'waterSaved',
  '/About': 'about',
  '/Settings': 'settings',
};

const PAGE_TO_PATH: Record<string, string> = {
  dashboard: '/Dashboard',
  freshness: '/Freshness',
  matches: '/NGO',
  elite: '/Elite',
  impact: '/Report',
  mealsSaved: '/Report/meals-saved',
  foodDiverted: '/Report/food-diverted',
  co2Prevented: '/Report/co2-prevented',
  waterSaved: '/Report/water-saved',
  about: '/About',
  settings: '/Settings',
};

interface ResQMealAppProps {
  auth?: BaseAuthUser | null;
  loginKey?: number;
  onOpenSignIn?: () => void;
  onLogout?: () => void;
  language?: 'en' | 'ta' | 'hi';
  setLanguage?: (lang: 'en' | 'ta' | 'hi') => void;
  currentPath?: string;
  routes?: { DASHBOARD: string; SETTINGS: string; [key: string]: string };
}

const ROUTES_DEFAULT: { DASHBOARD: string; SETTINGS: string } = {
  DASHBOARD: '/Dashboard',
  SETTINGS: '/Settings',
};

export const ResQMealApp: React.FC<ResQMealAppProps> = ({
  auth = null,
  loginKey = 0,
  onOpenSignIn,
  onLogout,
  language: propLanguage = 'en',
  setLanguage: propSetLanguage,
  currentPath = '/Dashboard',
  routes = ROUTES_DEFAULT,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const appPage = PATH_TO_PAGE[currentPath] || 'dashboard';
  const isSettings = appPage === 'settings';
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'settings'>(isSettings ? 'settings' : 'dashboard');

  useEffect(() => {
    setCurrentPage(isSettings ? 'settings' : 'dashboard');
  }, [isSettings]);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  });
  const language = propLanguage;
  const setLanguage = propSetLanguage ?? (() => {});

  useEffect(() => {
    try {
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error('Error updating dark mode:', e);
    }
  }, [darkMode]);

  const handleSettingsClick = () => {
    navigate(routes.SETTINGS || '/Settings');
  };

  const handleBackToDashboard = () => {
    navigate(routes.DASHBOARD || '/Dashboard');
  };

  return (
    <div className={`min-h-screen w-full max-w-full transition-colors duration-300 ${
      darkMode ? 'bg-gradient-to-br from-emerald-950 via-blue-950 to-slate-900' : 'bg-white'
    }`}>
      {currentPage === 'dashboard' && (
        <Dashboard
          onSettingsClick={handleSettingsClick}
          auth={auth}
          loginKey={loginKey}
          onOpenSignIn={onOpenSignIn}
          onLogout={onLogout}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          language={language}
          setLanguage={setLanguage}
          currentPageFromPath={appPage}
          onNavigateToPath={(path) => navigate(path)}
        />
      )}
      {currentPage === 'settings' && (
        <div>
          <button
            onClick={handleBackToDashboard}
            className={`fixed top-4 left-4 z-50 px-4 py-2 rounded-lg font-semibold transition ${
              darkMode
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900'
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white'
            }`}
          >
            ← {t('backToDashboard')}
          </button>
          <SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} language={language} setLanguage={setLanguage} />
        </div>
      )}
    </div>
  );
};

export default ResQMealApp;
