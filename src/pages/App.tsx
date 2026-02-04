import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import SettingsPage from './SettingsPage';

export const ResQMealApp = () => {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'settings'>('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  });
  const [language, setLanguage] = useState<'en' | 'ta' | 'hi'>('en');

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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900' : 'bg-gradient-to-br from-emerald-50 via-white to-blue-50'
    }`}>
      {currentPage === 'dashboard' && (
        <Dashboard 
          onSettingsClick={() => setCurrentPage('settings')}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          language={language}
          setLanguage={setLanguage}
        />
      )}
      {currentPage === 'settings' && (
        <div>
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`fixed top-4 left-4 z-50 px-4 py-2 rounded-lg font-semibold transition ${
              darkMode
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900'
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white'
            }`}
          >
            ← Back to Dashboard
          </button>
          <SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} language={language} setLanguage={setLanguage} />
        </div>
      )}
    </div>
  );
};

export default ResQMealApp;
