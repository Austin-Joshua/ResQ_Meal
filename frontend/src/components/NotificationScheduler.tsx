import React, { useState, useEffect } from 'react';
import { Bell, Clock, CheckCircle, AlertCircle, Heart } from 'lucide-react';

interface NotificationReminder {
  id: string;
  time: string; // HH:MM format
  message: string;
  type: 'daily' | 'weekly' | 'donation_based';
  enabled: boolean;
  icon: React.ReactNode;
}

interface NotificationSchedulerProps {
  darkMode: boolean;
  userName: string;
}

const NotificationScheduler: React.FC<NotificationSchedulerProps> = ({
  darkMode,
  userName,
}) => {
  const [reminders, setReminders] = useState<NotificationReminder[]>([
    {
      id: 'morning_waste_prevention',
      time: '08:00',
      message: '🌅 Good Morning! Remember: Food donation prevents waste. Do you have surplus food today?',
      type: 'daily',
      enabled: true,
      icon: <AlertCircle className="w-4 h-4" />,
    },
    {
      id: 'noon_donation_reminder',
      time: '12:00',
      message: '🍽️ Lunch time reminder: Help families in need. Post any surplus food now!',
      type: 'daily',
      enabled: true,
      icon: <Heart className="w-4 h-4" />,
    },
    {
      id: 'evening_gratitude',
      time: '17:00',
      message: `🙏 Thank you, ${userName}, for considering food donation today. Every meal matters!`,
      type: 'daily',
      enabled: true,
      icon: <Heart className="w-4 h-4" />,
    },
    {
      id: 'weekly_impact_report',
      time: '19:00',
      message: '📊 Weekly Impact Report: See how much food waste you\'ve prevented this week!',
      type: 'weekly',
      enabled: true,
      icon: <CheckCircle className="w-4 h-4" />,
    },
    {
      id: 'donation_thank_you',
      time: 'on_donation',
      message: '✨ Thank you for your generous donation! You\'re making a real difference.',
      type: 'donation_based',
      enabled: true,
      icon: <Heart className="w-4 h-4" />,
    },
  ]);

  const [showSettings, setShowSettings] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simulate notifications at scheduled times
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

      reminders.forEach(reminder => {
        if (reminder.enabled && reminder.time === currentTime) {
          showToastNotification(reminder.message);
        }
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [reminders]);

  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const toggleReminder = (id: string) => {
    setReminders(prev =>
      prev.map(reminder =>
        reminder.id === id ? { ...reminder, enabled: !reminder.enabled } : reminder
      )
    );
  };

  const updateReminderTime = (id: string, newTime: string) => {
    setReminders(prev =>
      prev.map(reminder =>
        reminder.id === id ? { ...reminder, time: newTime } : reminder
      )
    );
  };

  const enabledCount = reminders.filter(r => r.enabled).length;

  return (
    <div>
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm animate-bounce ${
          darkMode
            ? 'bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-700'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 border border-blue-400'
        }`}>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-white" />
            <p className="text-white text-sm font-medium">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className={`p-3 rounded-lg transition flex items-center gap-2 ${
          darkMode
            ? 'hover:bg-gray-700 text-gray-300'
            : 'hover:bg-gray-100 text-gray-600'
        }`}
      >
        <Clock className="w-5 h-5" />
        <span className="text-sm font-medium">Reminders</span>
        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
          darkMode
            ? 'bg-blue-900/50 text-blue-300'
            : 'bg-blue-100 text-blue-700'
        }`}>
          {enabledCount}
        </span>
      </button>

      {showSettings && (
        <div className={`fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4`}>
          <div className={`rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Header */}
            <div className={`sticky top-0 p-6 border-b ${
              darkMode
                ? 'bg-gray-750 border-gray-700'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-2xl font-bold flex items-center gap-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <Clock className="w-6 h-6" />
                  Donation Reminders
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className={`p-1 rounded transition ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  ✕
                </button>
              </div>
              <p className={`text-sm mt-2 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Set up regular reminders to donate food and prevent waste
              </p>
            </div>

            {/* Reminders List */}
            <div className="p-6 space-y-4">
              {reminders.map(reminder => (
                <div
                  key={reminder.id}
                  className={`p-4 rounded-lg border transition ${
                    reminder.enabled
                      ? darkMode
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-blue-50 border-blue-200'
                      : darkMode
                        ? 'bg-gray-800 border-gray-700 opacity-50'
                        : 'bg-gray-100 border-gray-200 opacity-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 mt-1 ${
                      reminder.enabled
                        ? 'text-blue-500'
                        : darkMode ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {reminder.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <p className={`font-semibold mb-1 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {reminder.message}
                      </p>
                      <p className={`text-sm mb-3 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Type: {reminder.type === 'daily' ? '📅 Daily' : reminder.type === 'weekly' ? '📆 Weekly' : '🎁 On Donation'}
                      </p>

                      {/* Time Input */}
                      {reminder.time !== 'on_donation' && (
                        <div className="flex items-center gap-2 mb-3">
                          <label
                            htmlFor={`reminder-time-${reminder.id}`}
                            className={`text-sm font-medium ${
                              darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            Time:
                          </label>
                          <input
                            id={`reminder-time-${reminder.id}`}
                            type="time"
                            value={reminder.time}
                            onChange={(e) => updateReminderTime(reminder.id, e.target.value)}
                            disabled={!reminder.enabled}
                            className={`px-3 py-1 rounded text-sm ${
                              darkMode
                                ? 'bg-gray-600 text-white border border-gray-500'
                                : 'bg-white text-gray-900 border border-gray-300'
                            } disabled:opacity-50`}
                          />
                        </div>
                      )}

                      {/* Toggle */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleReminder(reminder.id)}
                          className={`relative w-12 h-6 rounded-full transition ${
                            reminder.enabled
                              ? 'bg-green-500'
                              : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                          }`}
                          aria-label={reminder.enabled ? 'Disable reminder' : 'Enable reminder'}
                        >
                          <div
                            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                              reminder.enabled ? 'translate-x-6' : ''
                            }`}
                          />
                        </button>
                        <span className={`text-sm font-medium ${
                          reminder.enabled
                            ? 'text-green-600'
                            : darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {reminder.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className={`p-6 border-t text-center ${
              darkMode
                ? 'bg-gray-750 border-gray-700'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                ✅ You have {enabledCount} active reminder{enabledCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationScheduler;
