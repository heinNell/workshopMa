'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface TabsProps {
  tabs: Array<{ id: string; label: string; count?: number; icon?: LucideIcon }>;
  activeTab: string;
  onChange?: (tabId: string) => void;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, onTabChange, className }: TabsProps) {
  const handleChange = onChange || onTabChange || (() => {});
  
  return (
    <div className={cn('flex gap-1 p-1 bg-dark-900/50 rounded-lg border border-primary-500/10 overflow-x-auto', className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-primary-500/20 text-primary-400 shadow-sm'
                : 'text-dark-400 hover:text-white hover:bg-white/5'
            )}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.5 text-xs rounded-full',
                  activeTab === tab.id
                    ? 'bg-primary-500/30 text-primary-300'
                    : 'bg-dark-700 text-dark-400'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

interface TabPanelProps {
  id?: string;
  tabId?: string;
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ id, tabId, activeTab, children, className }: TabPanelProps) {
  const panelId = id || tabId;
  if (panelId !== activeTab) return null;
  return <div className={cn('animate-in', className)}>{children}</div>;
}
