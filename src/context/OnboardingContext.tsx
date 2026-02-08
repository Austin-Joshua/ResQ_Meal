import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'resqmeal_onboarding_done';

export interface OnboardingStep {
  id: string;
  title: string;
  body: string;
  icon?: string;
}

const STEPS_BY_ROLE: Record<string, OnboardingStep[]> = {
  volunteer: [
    { id: 'welcome', title: 'Welcome to ResQ Meal', body: "You're in Volunteer mode. Browse surplus food, claim from organisations, and help deliver meals to those in need.", icon: '👋' },
    { id: 'dashboard', title: 'Your Dashboard', body: "Use the sidebar to open Dashboard, Post Food, Matches, Impact, and Settings. Today's Available Food shows surplus you can claim.", icon: '📋' },
    { id: 'map', title: 'Map View', body: "Switch to Map view to see pickup locations. Tap a marker to view details and claim food.", icon: '🗺️' },
    { id: 'notifications', title: 'Stay Updated', body: "Click the bell icon for real-time alerts when new food is posted or match status changes.", icon: '🔔' },
    { id: 'done', title: "You're all set!", body: 'Start by browsing available food or posting surplus from your organisation. Every rescue counts.', icon: '✅' },
  ],
  restaurant: [
    { id: 'welcome', title: 'Welcome, Donor', body: "Post surplus food in one click. NGOs nearby will see your listing and request a match. You'll get real-time notifications.", icon: '👋' },
    { id: 'post', title: 'Post Surplus', body: "Use 'Post Food' or the quick action to add food name, type, quantity, and safety window. Optional: add a photo for freshness check.", icon: '📤' },
    { id: 'matches', title: 'Matches & Notifications', body: "When an NGO requests your food, you'll see it in Matches and get a notification. Accept and coordinate pickup.", icon: '🎯' },
    { id: 'impact', title: 'Your Impact', body: "Check the Impact report to see meals saved, CO₂ prevented, and food diverted from waste.", icon: '🌍' },
    { id: 'done', title: "You're all set!", body: 'Post your first surplus when ready. Thank you for fighting food waste.', icon: '✅' },
  ],
  ngo: [
    { id: 'welcome', title: 'Welcome, NGO', body: "Browse available surplus food from restaurants and donors. Request matches and assign volunteers for pickup and delivery.", icon: '👋' },
    { id: 'available', title: 'Available Food', body: "View today's surplus on the Dashboard. Use List or Map view. Request a match to claim food for your beneficiaries.", icon: '🥗' },
    { id: 'matches', title: 'Manage Matches', body: "Track match status: Matched → Accepted → Picked up → Delivered. Assign volunteers and update status as food moves.", icon: '🎯' },
    { id: 'notifications', title: 'Real-time Alerts', body: "The notification bell keeps you updated on new surplus and match status changes.", icon: '🔔' },
    { id: 'done', title: "You're all set!", body: 'Start by browsing available food and requesting your first match.', icon: '✅' },
  ],
};

const DEFAULT_STEPS: OnboardingStep[] = [
  { id: 'welcome', title: 'Welcome to ResQ Meal', body: 'Connect surplus food with people in need. Browse the dashboard, post food, or accept matches.', icon: '👋' },
  { id: 'done', title: "You're all set!", body: 'Use the menu to explore. Enable notifications to get real-time updates.', icon: '✅' },
];

interface OnboardingContextValue {
  shouldShow: boolean;
  complete: () => void;
  reset: () => void;
  getSteps: (role: string) => OnboardingStep[];
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY);
      setShouldShow(done !== 'true');
    } catch {
      setShouldShow(true);
    }
  }, []);

  const complete = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
      setShouldShow(false);
    } catch {}
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setShouldShow(true);
    } catch {}
  }, []);

  const getSteps = useCallback((role: string) => {
    const r = (role || 'volunteer').toLowerCase();
    return STEPS_BY_ROLE[r] ?? DEFAULT_STEPS;
  }, []);

  const value: OnboardingContextValue = {
    shouldShow,
    complete,
    reset,
    getSteps,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    return {
      shouldShow: false,
      complete: () => {},
      reset: () => {},
      getSteps: () => DEFAULT_STEPS,
    };
  }
  return ctx;
}
