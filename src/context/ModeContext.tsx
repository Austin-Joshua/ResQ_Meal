import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserMode = 'volunteer' | 'restaurant' | 'ngo' | 'admin';

export interface ModeAnalytics {
  mode: UserMode;
  timestamp: number;
  duration: number; // Duration in seconds user spent in mode
}

interface ModeContextType {
  currentMode: UserMode | null;
  setMode: (mode: UserMode) => void;
  modeHistory: ModeAnalytics[];
  switchMode: (mode: UserMode) => void;
  getModePreference: () => UserMode | null;
  saveModePreference: (mode: UserMode) => void;
  clearModeHistory: () => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

const MODE_PREFERENCE_KEY = 'resqmeal_mode_preference';
const MODE_ANALYTICS_KEY = 'resqmeal_mode_analytics';

export const ModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentMode, setCurrentMode] = useState<UserMode | null>(null);
  const [modeHistory, setModeHistory] = useState<ModeAnalytics[]>([]);
  const [modeStartTime, setModeStartTime] = useState<number>(Date.now());

  // Load saved mode preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(MODE_PREFERENCE_KEY) as UserMode | null;
      if (saved && ['volunteer', 'restaurant', 'ngo', 'admin'].includes(saved)) {
        setCurrentMode(saved);
      }
    } catch (_) {}

    // Load analytics history
    try {
      const analytics = localStorage.getItem(MODE_ANALYTICS_KEY);
      if (analytics) {
        setModeHistory(JSON.parse(analytics));
      }
    } catch (_) {}
  }, []);

  // Track mode duration when switching modes
  const setMode = (mode: UserMode) => {
    if (currentMode && currentMode !== mode) {
      // Save previous mode duration
      const duration = Math.floor((Date.now() - modeStartTime) / 1000);
      const analytics: ModeAnalytics = {
        mode: currentMode,
        timestamp: modeStartTime,
        duration,
      };

      setModeHistory((prev) => {
        const updated = [...prev, analytics];
        // Keep last 100 entries
        const trimmed = updated.slice(-100);
        try {
          localStorage.setItem(MODE_ANALYTICS_KEY, JSON.stringify(trimmed));
        } catch (_) {}
        return trimmed;
      });
    }

    setCurrentMode(mode);
    setModeStartTime(Date.now());
    saveModePreference(mode);
  };

  const switchMode = (mode: UserMode) => {
    setMode(mode);
  };

  const getModePreference = (): UserMode | null => {
    try {
      return localStorage.getItem(MODE_PREFERENCE_KEY) as UserMode | null;
    } catch (_) {
      return null;
    }
  };

  const saveModePreference = (mode: UserMode) => {
    try {
      localStorage.setItem(MODE_PREFERENCE_KEY, mode);
    } catch (_) {}
  };

  const clearModeHistory = () => {
    setModeHistory([]);
    try {
      localStorage.removeItem(MODE_ANALYTICS_KEY);
    } catch (_) {}
  };

  const value: ModeContextType = {
    currentMode,
    setMode,
    modeHistory,
    switchMode,
    getModePreference,
    saveModePreference,
    clearModeHistory,
  };

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
};

export const useMode = (): ModeContextType => {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};

// Export mode metadata for UI
export const MODE_METADATA = {
  volunteer: {
    label: '🟦 Volunteer',
    color: 'from-blue-600 to-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    darkBgColor: 'bg-blue-900/20',
    darkBorderColor: 'border-blue-700',
    icon: '🚗',
    description: 'Deliver food, track impact',
    features: [
      'View available food pickups',
      'Track deliveries in real-time',
      'Monitor impact metrics',
      'View delivery history',
      'Rate restaurants and NGOs',
    ],
  },
  restaurant: {
    label: '🟧 Restaurant/Donor',
    color: 'from-orange-600 to-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    darkBgColor: 'bg-orange-900/20',
    darkBorderColor: 'border-orange-700',
    icon: '🍽️',
    description: 'Post surplus, manage donations',
    features: [
      'Post surplus food items',
      'Manage donation requests',
      'View pickup history',
      'Track donation impact',
      'Manage team members',
    ],
  },
  ngo: {
    label: '🟩 NGO/Organization',
    color: 'from-green-600 to-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    darkBgColor: 'bg-green-900/20',
    darkBorderColor: 'border-green-700',
    icon: '🤝',
    description: 'Receive & distribute food',
    features: [
      'Browse available food',
      'Request food donations',
      'Track incoming donations',
      'Manage distribution',
      'View beneficiary impact',
    ],
  },
  admin: {
    label: '🟪 Admin/Management',
    color: 'from-purple-600 to-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    darkBgColor: 'bg-purple-900/20',
    darkBorderColor: 'border-purple-700',
    icon: '⚙️',
    description: 'Operations & reporting',
    features: [
      'System analytics',
      'User management',
      'Generate reports',
      'Monitor platform health',
      'Manage configurations',
    ],
  },
} as const;
