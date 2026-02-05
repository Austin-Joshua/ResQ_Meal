/**
 * AI Studio–style app shell: sidebar + top bar (theme, language, profile) + main content.
 * Blends with ResQ Meal dark/light mode and existing features.
 * Use for Dashboard, Organisation Report, Volunteer Mode, and any authenticated view.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Sun, Moon, Globe, ChevronDown, User, Settings, LogOut, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        'min-h-screen w-full transition-colors duration-300',
        isDark ? 'bg-[hsl(var(--background))]' : 'bg-[hsl(var(--muted))]/30'
      )}
    >
      {/* Top bar – AI Studio style: compact, blurred, border-b */}
      <header
        className={cn(
          'sticky top-0 z-40 flex h-14 items-center border-b transition-colors duration-200',
          'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80',
          'border-border'
        )}
      >
        <div className="flex w-full items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {hasSidebar && (
              <button
                type="button"
                onClick={() => setSidebarOpen((o) => !o)}
                className="shrink-0 rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
            {logo && !sidebarOpen && (
              <div className="flex items-center justify-center min-h-[40px]">
                {logo}
              </div>
            )}
            {!logo && (
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold text-foreground">{title}</h1>
                {subtitle && (
                  <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Language */}
            <div className="relative" ref={languageRef}>
              <button
                type="button"
                onClick={() => setLanguageMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Language"
              >
                <Globe className="h-4 w-4" />
                <span>{languageLabels[language]}</span>
                <ChevronDown className={cn('h-4 w-4 transition-transform', languageMenuOpen && 'rotate-180')} />
              </button>
              {languageMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-lg border border-border bg-popover py-1 shadow-lg">
                  {(['en', 'ta', 'hi'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        setLanguage(lang);
                        setLanguageMenuOpen(false);
                      }}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm font-medium transition-colors',
                        language === lang
                          ? 'bg-primary/10 text-primary'
                          : 'text-popover-foreground hover:bg-muted'
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
              className="rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Profile or Sign in */}
            <div className="relative" ref={profileRef}>
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen((o) => !o)}
                    className="flex items-center gap-2 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Profile"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {getInitials(user.name)}
                    </span>
                  </button>
                  {profileMenuOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-border bg-popover py-2 shadow-lg">
                      <div className="border-b border-border px-4 py-3">
                        <p className="truncate text-sm font-medium text-popover-foreground">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        <p className="mt-1 text-xs capitalize text-primary">{user.role}</p>
                      </div>
                      {onSettingsClick && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            onSettingsClick();
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-popover-foreground transition-colors hover:bg-muted"
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
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
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
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <User className="h-4 w-4" />
                  Sign in
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar – opens from hamburger; when closed only the menu icon shows */}
        {hasSidebar && (
          <aside
            className={cn(
              'fixed left-0 top-14 z-30 h-[calc(100vh-3.5rem)] w-[var(--studio-sidebar-width)] overflow-y-auto border-r border-border bg-card transition-transform duration-300 ease-in-out',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            {/* Logo (BG remove.png) inside sidebar when open – wider size */}
            <div className="p-4 border-b border-border flex flex-col items-center gap-1">
              <img
                src="/BG%20remove.png"
                alt="ResQ Meal"
                className="h-14 w-20 object-contain"
              />
              <span className="text-sm font-semibold text-foreground">ResQ Meal</span>
              <span className="text-xs text-muted-foreground">Nourishing The Needy</span>
            </div>
            <nav className="flex flex-col gap-0.5 p-3" aria-label="Main navigation">
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
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
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
            'min-w-0 flex-1 transition-[margin] duration-300 ease-in-out',
            hasSidebar && sidebarOpen && 'md:ml-[var(--studio-sidebar-width)]'
          )}
        >
          <div className={cn('mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8', contentClassName)}>
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
