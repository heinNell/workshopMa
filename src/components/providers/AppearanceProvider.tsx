'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AppearanceSettings {
  theme: 'dark' | 'light' | 'system';
  accentColor: 'blue' | 'green' | 'purple' | 'orange';
  sidebarCollapsed: boolean;
  animationsEnabled: boolean;
  compactMode: boolean;
}

const defaultSettings: AppearanceSettings = {
  theme: 'dark',
  accentColor: 'blue',
  sidebarCollapsed: false,
  animationsEnabled: true,
  compactMode: false,
};

interface AppearanceContextType {
  settings: AppearanceSettings;
  updateSettings: (newSettings: Partial<AppearanceSettings>) => void;
  resetSettings: () => void;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

const STORAGE_KEY = 'workshop-appearance-settings';

// Accent color CSS variable mappings
const accentColors = {
  blue: {
    primary: '51, 116, 255',
    primaryHex: '#3374ff',
  },
  green: {
    primary: '16, 185, 129',
    primaryHex: '#10b981',
  },
  purple: {
    primary: '139, 92, 246',
    primaryHex: '#8b5cf6',
  },
  orange: {
    primary: '249, 115, 22',
    primaryHex: '#f97316',
  },
};

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppearanceSettings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {
        console.error('Failed to parse appearance settings:', e);
      }
    }
    setMounted(true);
  }, []);

  // Apply settings to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const body = document.body;

    // Apply theme
    if (settings.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('light-theme', !prefersDark);
      root.classList.toggle('dark-theme', prefersDark);
    } else {
      root.classList.toggle('light-theme', settings.theme === 'light');
      root.classList.toggle('dark-theme', settings.theme === 'dark');
    }

    // Apply accent color
    const accent = accentColors[settings.accentColor];
    root.style.setProperty('--primary-rgb', accent.primary);
    root.style.setProperty('--primary-color', accent.primaryHex);

    // Apply compact mode
    body.classList.toggle('compact-mode', settings.compactMode);

    // Apply animations
    body.classList.toggle('no-animations', !settings.animationsEnabled);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (settings.theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('light-theme', !e.matches);
      document.documentElement.classList.toggle('dark-theme', e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  const updateSettings = (newSettings: Partial<AppearanceSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return null;
  }

  return (
    <AppearanceContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (context === undefined) {
    throw new Error('useAppearance must be used within an AppearanceProvider');
  }
  return context;
}
