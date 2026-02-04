import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Heart, Gift, TrendingUp } from 'lucide-react';

interface Notification {
  id: string;
  type: 'thank_you' | 'waste_prevention' | 'milestone' | 'impact' | 'urgency' | 'success';
  title: string;
  message: string;
  icon: React.ReactNode;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface DonationNotificationSystemProps {
  darkMode: boolean;
  userName: string;
  donationCount?: number;
  mealsSaved?: number;
}

const DonationNotificationSystem: React.FC<DonationNotificationSystemProps> = ({
  darkMode,
  userName,
  donationCount = 1,
  mealsSaved = 25,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Generate notifications based on donation
  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications: Notification[] = [];

      // 1. Immediate Thank You Message
      newNotifications.push({
        id: `thank_you_${Date.now()}`,
        type: 'thank_you',
        title: '🙏 Thank You for Your Donation!',
        message: `Thank you, ${userName}! Your generous food donation of ${mealsSaved} servings will help feed people in need. Your compassion makes a real difference!`,
        icon: <Heart className="w-6 h-6 text-red-500" />,
        timestamp: new Date(),
        isRead: false,
        priority: 'high',
      });

      // 2. Waste Prevention Message
      newNotifications.push({
        id: `waste_${Date.now()}`,
        type: 'waste_prevention',
        title: '♻️ Food Waste Prevention Impact',
        message: `By donating this food, you're preventing ${(mealsSaved * 0.5).toFixed(1)}kg of food waste from going to landfills. Every donation counts!`,
        icon: <AlertCircle className="w-6 h-6 text-green-500" />,
        timestamp: new Date(Date.now() + 1000),
        isRead: false,
        priority: 'medium',
      });

      // 3. Impact Statistics
      if (donationCount === 1) {
        newNotifications.push({
          id: `impact_${Date.now()}`,
          type: 'impact',
          title: '📊 Your Impact Today',
          message: `You've donated ${mealsSaved} meals today! This food will reach families and communities that need it most.`,
          icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
          timestamp: new Date(Date.now() + 2000),
          isRead: false,
          priority: 'medium',
        });
      }

      // 4. Milestone Notifications
      if (donationCount === 5) {
        newNotifications.push({
          id: `milestone_5_${Date.now()}`,
          type: 'milestone',
          title: '⭐ 5 Donations Milestone!',
          message: `Congratulations, ${userName}! You've made 5 donations. You're making a real difference in the community! 🎉`,
          icon: <Gift className="w-6 h-6 text-yellow-500" />,
          timestamp: new Date(Date.now() + 3000),
          isRead: false,
          priority: 'high',
        });
      }

      if (donationCount === 10) {
        newNotifications.push({
          id: `milestone_10_${Date.now()}`,
          type: 'milestone',
          title: '🏆 10 Donations Achievement!',
          message: `Amazing, ${userName}! You're now a Food Hero with 10 donations. Your consistent generosity is saving thousands of meals!`,
          icon: <Gift className="w-6 h-6 text-purple-500" />,
          timestamp: new Date(Date.now() + 3000),
          isRead: false,
          priority: 'high',
        });
      }

      if (donationCount === 20) {
        newNotifications.push({
          id: `milestone_20_${Date.now()}`,
          type: 'milestone',
          title: '👑 Legend Donor Status!',
          message: `${userName}, you've reached 20 donations! You're a community champion making an extraordinary impact on food security. Thank you!`,
          icon: <Gift className="w-6 h-6 text-blue-600" />,
          timestamp: new Date(Date.now() + 3000),
          isRead: false,
          priority: 'high',
        });
      }

      // 5. Urgency Reminder (for undeclared surplus)
      if (donationCount === 1 || donationCount % 3 === 0) {
        newNotifications.push({
          id: `urgency_${Date.now()}`,
          type: 'urgency',
          title: '⏰ Food Freshness Reminder',
          message: `Remember: Fresh food reaches beneficiaries faster and saves more meals. Post your surplus immediately after preparation for maximum impact!`,
          icon: <AlertCircle className="w-6 h-6 text-orange-500" />,
          timestamp: new Date(Date.now() + 4000),
          isRead: false,
          priority: 'medium',
        });
      }

      // 6. Success Message with CO2 Impact
      const co2Saved = (mealsSaved * 2.5).toFixed(2); // kg CO2 saved
      const waterSaved = (mealsSaved * 50).toFixed(0); // liters of water saved
      newNotifications.push({
        id: `success_${Date.now()}`,
        type: 'success',
        title: '✅ Delivery Confirmed & Verified',
        message: `Your food donation was successfully received! Impact: ${co2Saved}kg CO2 saved, ${waterSaved}L water saved, and ${mealsSaved} people fed. 🌍`,
        icon: <CheckCircle className="w-6 h-6 text-green-600" />,
        timestamp: new Date(Date.now() + 5000),
        isRead: false,
        priority: 'high',
      });

      setNotifications(prev => [...newNotifications, ...prev]);
      setUnreadCount(newNotifications.filter(n => !n.isRead).length);
    };

    generateNotifications();
  }, [donationCount, userName, mealsSaved]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    setUnreadCount(0);
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'thank_you':
        return darkMode ? 'bg-red-900/20 border-red-700/50' : 'bg-red-50 border-red-200';
      case 'waste_prevention':
        return darkMode ? 'bg-green-900/20 border-green-700/50' : 'bg-green-50 border-green-200';
      case 'milestone':
        return darkMode ? 'bg-yellow-900/20 border-yellow-700/50' : 'bg-yellow-50 border-yellow-200';
      case 'impact':
        return darkMode ? 'bg-blue-900/20 border-blue-700/50' : 'bg-blue-50 border-blue-200';
      case 'urgency':
        return darkMode ? 'bg-orange-900/20 border-orange-700/50' : 'bg-orange-50 border-orange-200';
      case 'success':
        return darkMode ? 'bg-green-900/20 border-green-700/50' : 'bg-green-50 border-green-200';
      default:
        return darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    }
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  return (
    <div>
      {/* Notification Bell Icon */}
      <div className="relative">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className={`relative p-3 rounded-lg transition ${
            darkMode
              ? 'hover:bg-gray-700 text-gray-300'
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notification Panel */}
      {showPanel && (
        <div className={`fixed right-0 top-16 w-96 max-h-96 overflow-y-auto rounded-lg shadow-2xl z-50 border ${
          darkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          {/* Header */}
          <div className={`sticky top-0 p-4 border-b flex justify-between items-center ${
            darkMode
              ? 'bg-gray-750 border-gray-700'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Notifications
            </h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className={`text-xs font-semibold px-2 py-1 rounded transition ${
                    darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setShowPanel(false)}
                className={`p-1 rounded transition ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="divide-y" style={{
            divideColor: darkMode ? 'rgba(107, 114, 128, 0.3)' : 'rgba(229, 231, 235, 1)'
          }}>
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className={`w-12 h-12 mx-auto mb-2 ${
                  darkMode ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-4 border-l-4 cursor-pointer transition ${
                    notif.isRead
                      ? darkMode ? 'bg-gray-800' : 'bg-white'
                      : darkMode ? 'bg-gray-750' : 'bg-blue-50'
                  } ${getNotificationColor(notif.type)}`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {notif.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <p className={`font-semibold text-sm flex items-center gap-2 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {notif.title}
                          {!notif.isRead && (
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className={`text-xs ${
                            darkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          ✕
                        </button>
                      </div>
                      <p className={`text-sm mt-1 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {notif.message}
                      </p>
                      {notif.action && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            notif.action?.onClick();
                          }}
                          className={`mt-2 text-xs font-semibold px-3 py-1 rounded transition ${
                            darkMode
                              ? 'bg-gray-700 text-blue-400 hover:bg-gray-600'
                              : 'bg-gray-200 text-blue-600 hover:bg-gray-300'
                          }`}
                        >
                          {notif.action.label}
                        </button>
                      )}
                      <p className={`text-xs mt-2 ${
                        darkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {notif.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className={`p-3 border-t text-center ${
              darkMode
                ? 'bg-gray-750 border-gray-700'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <button
                onClick={clearAllNotifications}
                className={`text-xs font-semibold transition ${
                  darkMode
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-600 hover:text-gray-700'
                }`}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DonationNotificationSystem;
