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
      darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      {currentPage === 'dashboard' && (
        <Dashboard 
          onSettingsClick={() => setCurrentPage('settings')}
          darkMode={darkMode}
        />
      )}
      {currentPage === 'settings' && (
        <div>
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`fixed top-4 left-4 z-50 px-4 py-2 rounded-lg font-semibold transition ${
              darkMode
                ? 'bg-green-700 hover:bg-green-600 text-white'
                : 'bg-primary-avocado text-white hover:bg-primary-avocado-dark'
            }`}
          >
            ← Back to Dashboard
          </button>
          <SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} />
        </div>
      )}
    </div>
  );
};

export default ResQMealApp;
