'use client';

import { FLEET_CATEGORIES, MAIN_NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/store';
import { ChevronDown, ChevronRight, HelpCircle, PanelLeft, PanelLeftClose, Search, Settings, Truck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { NavIcon } from './SidebarIcons';

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, expandedCategories, toggleCollapsed, toggleCategory } = useSidebarStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFleetCategories = React.useMemo(
    () =>
      FLEET_CATEGORIES.map((cat) => ({
        ...cat,
        fleetNumbers: cat.fleetNumbers.filter((num) =>
          num.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter((cat) => cat.fleetNumbers.length > 0 || searchQuery === ''),
    [searchQuery]
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-dark-950/95 backdrop-blur-xl border-r border-primary-500/10',
        'flex flex-col transition-all duration-300 z-40',
        isCollapsed ? 'w-16' : 'w-72'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-primary-500/10">
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm">Workshop</h1>
              <p className="text-[10px] text-dark-400 uppercase tracking-wider">Fleet Manager</p>
            </div>
          </Link>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Truck className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-3 border-b border-primary-500/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              placeholder="Search fleet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-900/50 border border-primary-500/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-dark-500 focus:outline-none focus:border-primary-500/30"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {/* Main Navigation */}
        <div className="mb-6">
          {!isCollapsed && (
            <h2 className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-dark-500">
              Navigation
            </h2>
          )}
          <ul className="space-y-1">
            {MAIN_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-primary-500/15 text-primary-400 shadow-sm'
                        : 'text-dark-300 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <NavIcon name={item.icon} className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Fleet Categories */}
        <div>
          {!isCollapsed && (
            <h2 className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-dark-500">
              Fleet
            </h2>
          )}
          <ul className="space-y-1">
            {filteredFleetCategories.map((category) => {
              const isExpanded = expandedCategories.includes(category.id);
              const categoryPath = `/fleet/${category.id}`;
              const isCategoryActive = pathname.startsWith(categoryPath);

              return (
                <li key={category.id}>
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200',
                      isCategoryActive
                        ? 'bg-primary-500/10 text-primary-400'
                        : 'text-dark-300 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <NavIcon name={category.icon} className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="text-sm font-medium">{category.label}</span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-dark-500">{category.fleetNumbers.length}</span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    )}
                  </button>

                  {/* Fleet numbers dropdown */}
                  {isExpanded && !isCollapsed && (
                    <ul className="mt-1 ml-4 pl-4 border-l border-primary-500/10 space-y-0.5">
                      {category.fleetNumbers.map((fleetNum) => {
                        const fleetPath = `/fleet/${category.id}/${fleetNum.toLowerCase()}`;
                        const isFleetActive = pathname === fleetPath;

                        return (
                          <li key={fleetNum}>
                            <Link
                              href={fleetPath}
                              className={cn(
                                'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-200',
                                isFleetActive
                                  ? 'bg-primary-500/15 text-primary-400'
                                  : 'text-dark-400 hover:text-white hover:bg-white/5'
                              )}
                            >
                              <span
                                className={cn(
                                  'w-1.5 h-1.5 rounded-full',
                                  isFleetActive ? 'bg-primary-400' : 'bg-dark-600'
                                )}
                              />
                              {fleetNum}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-primary-500/10 p-3">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex gap-1">
              <Link
                href="/settings"
                className="p-2 text-dark-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <Link
                href="/help"
                className="p-2 text-dark-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <HelpCircle className="w-5 h-5" />
              </Link>
            </div>
          )}
          <button
            onClick={toggleCollapsed}
            className="p-2 text-dark-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            {isCollapsed ? (
              <PanelLeft className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
