/**
 * AI Studio–style app shell: sidebar + top bar (theme, language, profile) + main content.
 * Blends with ResQ Meal dark/light mode and existing features.
 * Use for Dashboard, Organisation Report, Volunteer Mode, and any authenticated view.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Sun, Moon, Globe, ChevronDown, User, Settings, LogOut, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/NotificationBell';

export interface AppShellNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface AppShellUser {
  name: string;
  email: string;
  role: string;
}

export interface AppShellProps {
  /** Page title (e.g. "Dashboard", "Organisation Report") */
  title: string;
  /** Optional subtitle (e.g. user name · role) */
  subtitle?: string;
  /** Optional logo node (e.g. <img src={logoFull} />) */
  logo?: React.ReactNode;
  /** When set, the logo is clickable and navigates to dashboard/home (e.g. scroll to top or route) */
  onLogoClick?: () => void;
  /** Sidebar nav items; omit for no sidebar */
  sidebarItems?: AppShellNavItem[];
  /** Currently active nav id */
  activeId?: string;
  /** Called when user selects a nav item (or settings) */
  onNavigate?: (id: string) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  language: 'en' | 'ta' | 'hi';
  setLanguage: (v: 'en' | 'ta' | 'hi') => void;
  /** e.g. { en: 'English', ta: 'Tamil', hi: 'Hindi' } */
  languageLabels: Record<'en' | 'ta' | 'hi', string>;
  /** Current user; if absent, show Sign in when onSignIn provided */
  user?: AppShellUser | null;
  onLogout?: () => void;
  onSettingsClick?: () => void;
  onSignIn?: () => void;
  /** Main content */
  children: React.ReactNode;
  /** Optional class for main content wrapper */
  contentClassName?: string;
}


function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function AppShell({
  title,
  subtitle,
  logo,
  onLogoClick,
  sidebarItems = [],
  activeId,
  onNavigate,
  darkMode,
  setDarkMode,
  language,
  setLanguage,
  languageLabels,
  user = null,
  onLogout,
  onSettingsClick,
  onSignIn,
  children,
  contentClassName,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (languageRef.current && !languageRef.current.contains(target)) setLanguageMenuOpen(false);
      if (profileRef.current && !profileRef.current.contains(target)) setProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasSidebar = sidebarItems.length > 0;
  const isDark = darkMode;

  return (
    <div
      className={cn(
        'fixed inset-0 w-full h-full overflow-hidden transition-colors duration-300',
        isDark ? 'bg-[hsl(var(--background))]' : 'bg-blue-50/40'
      )}
    >
      {/* Top bar – dark blue with majestic gold accents; logo + title always visible */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 flex h-[4.5rem] md:h-20 items-center border-b border-blue-900/50 transition-colors duration-200',
          'bg-[#1e3a5f] text-white'
        )}
      >
        <div className="flex w-full items-center justify-between gap-3 sm:gap-4 px-3 sm:px-4 md:px-6 py-2">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            {hasSidebar && (
              <button
                type="button"
                onClick={() => setSidebarOpen((o) => !o)}
                className="shrink-0 p-2.5 sm:p-3 text-white/90 transition-colors hover:text-white"
                aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            )}
            {/* Logo + brand name in top bar – always visible, larger size */}
            {logo ? (
              onLogoClick ? (
                <button
                  type="button"
                  onClick={onLogoClick}
                  className="flex items-center gap-3 sm:gap-4 shrink-0 min-w-0 rounded-lg py-1.5 pr-2 text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                  aria-label="Go to dashboard (home)"
                >
                  <div className="shrink-0 [&_img]:h-8 [&_img]:w-8 sm:[&_img]:h-9 sm:[&_img]:w-9 md:[&_img]:h-10 md:[&_img]:w-10 [&_img]:object-contain">
                    {logo}
                  </div>
                  <span className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">ResQ Meal</span>
                </button>
              ) : (
                <div className="flex items-center gap-3 sm:gap-4 shrink-0 min-w-0 py-1.5">
                  <div className="shrink-0 [&_img]:h-8 [&_img]:w-8 sm:[&_img]:h-9 sm:[&_img]:w-9 md:[&_img]:h-10 md:[&_img]:w-10 [&_img]:object-contain">
                    {logo}
                  </div>
                  <span className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">ResQ Meal</span>
                </div>
              )
            ) : (
              <div className="min-w-0">
                <h1 className="truncate text-lg sm:text-xl md:text-2xl font-bold text-white">{title}</h1>
                {subtitle && (
                  <p className="truncate text-xs sm:text-sm text-white/80">{subtitle}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            {/* Language */}
            <div className="relative" ref={languageRef}>
              <button
                type="button"
                onClick={() => setLanguageMenuOpen((o) => !o)}
                className="flex items-center gap-1.5 sm:gap-2 rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                title="Language"
              >
                <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">{languageLabels[language]}</span>
                <ChevronDown className={cn('h-3 w-3 sm:h-4 sm:w-4 transition-transform', languageMenuOpen && 'rotate-180')} />
              </button>
              {languageMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-lg border border-blue-800/50 bg-[#1e3a5f] py-1 shadow-lg">
                  {(['en', 'ta', 'hi'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        setLanguage(lang);
                        setLanguageMenuOpen(false);
                      }}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm font-medium transition-colors text-white',
                        language === lang
                          ? 'bg-[#D4AF37] text-[#1e3a5f]'
                          : 'hover:bg-white/10'
                      )}
                    >
                      {languageLabels[lang]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-lg p-2 sm:p-2.5 text-white/90 transition-colors hover:bg-white/10 hover:text-white"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <Sun className="h-5 w-5 sm:h-6 sm:w-6" /> : <Moon className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>

            {/* Notifications (when logged in) */}
            {user && <NotificationBell />}

            {/* Profile or Sign in */}
            <div className="relative" ref={profileRef}>
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen((o) => !o)}
                    className="flex items-center gap-2 rounded-lg p-1.5 sm:p-2 text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                    title="Profile"
                  >
                    <span className="flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-[#D4AF37]/20 text-xs sm:text-sm md:text-base font-semibold text-[#D4AF37] border border-[#D4AF37]/30">
                      {getInitials(user.name)}
                    </span>
                  </button>
                  {profileMenuOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-blue-800/50 bg-[#1e3a5f] py-2 shadow-lg">
                      <div className="border-b border-blue-800/30 px-4 py-3">
                        <p className="truncate text-sm font-medium text-white">{user.name}</p>
                        <p className="truncate text-xs text-white/70">{user.email}</p>
                        <p className="mt-1 text-xs capitalize text-[#D4AF37]">{user.role}</p>
                      </div>
                      {onSettingsClick && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            onSettingsClick();
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </button>
                      )}
                      {onLogout && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            onLogout();
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20"
                        >
                          <LogOut className="h-4 w-4" />
                          Log out
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : onSignIn ? (
                <button
                  type="button"
                  onClick={onSignIn}
                  className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-white/20 border border-white/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-white/30"
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Sign in</span>
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-[4.5rem] md:pt-20">
        {/* Sidebar – opens from hamburger; when closed only the menu icon shows */}
        {hasSidebar && (
          <aside
            className={cn(
              'fixed left-0 top-[4.5rem] md:top-20 z-30 h-[calc(100vh-4.5rem)] md:h-[calc(100vh-5rem)] w-[var(--studio-sidebar-width)] overflow-y-auto transition-transform duration-300 ease-in-out',
              'bg-[#1e3a5f]', // Dark blue background
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            {/* Navigation items only – logo/title live in top bar */}
            <nav className="flex flex-col pt-0 pb-2 px-2" aria-label="Main navigation">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.id === 'settings' && onSettingsClick) {
                        onSettingsClick();
                        setSidebarOpen(false);
                      } else if (onNavigate) {
                        onNavigate(item.id);
                        setSidebarOpen(false);
                      }
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-3 mx-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-[#D4AF37] text-[#1e3a5f] border border-[#D4AF37]/50 shadow-md'
                        : 'text-blue-200 hover:text-[#D4AF37] hover:bg-blue-900/20'
                    )}
                  >
                    <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-[#1e3a5f]' : 'text-[#D4AF37]')} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main content – full width when sidebar closed; margin when sidebar open */}
        <main
          className={cn(
            'min-w-0 flex-1 transition-[margin] duration-300 ease-in-out overflow-y-auto',
            isDark ? '' : 'bg-blue-50/30',
            hasSidebar && sidebarOpen && 'md:ml-[var(--studio-sidebar-width)]',
            'h-[calc(100vh-4.5rem)] md:h-[calc(100vh-5rem)]'
          )}
        >
          <div className={cn('mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8', contentClassName)}>
            {children}
          </div>
        </main>
      </div>

      {/* Overlay when sidebar open – click to close (minimize) so only the icon shows */}
      {hasSidebar && sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-20 bg-black/20"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
