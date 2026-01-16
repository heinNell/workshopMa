'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSidebarStore } from '@/store';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-50" />
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div
        className={cn(
          'transition-all duration-300',
          isCollapsed ? 'ml-16' : 'ml-72'
        )}
      >
        <Header />
        <main className="p-6 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
