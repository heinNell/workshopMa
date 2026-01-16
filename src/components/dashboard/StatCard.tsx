'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
  };
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: LucideIcon | React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  trend,
  icon: IconProp,
  variant = 'default',
  className,
}: StatCardProps) {
  const variants = {
    default: 'border-primary-500/10 hover:border-primary-500/25',
    primary: 'border-primary-500/20 bg-primary-500/5 hover:border-primary-500/40',
    success: 'border-success-500/20 bg-success-500/5 hover:border-success-500/40',
    warning: 'border-warning-500/20 bg-warning-500/5 hover:border-warning-500/40',
    danger: 'border-danger-500/20 bg-danger-500/5 hover:border-danger-500/40',
  };

  const iconBg = {
    default: 'bg-primary-500/10 text-primary-400',
    primary: 'bg-primary-500/15 text-primary-400',
    success: 'bg-success-500/15 text-success-500',
    warning: 'bg-warning-500/15 text-warning-500',
    danger: 'bg-danger-500/15 text-danger-500',
  };

  // Render icon - handle both LucideIcon components and ReactNode
  const renderIcon = () => {
    if (!IconProp) return null;
    // If it's already a valid React element, just return it
    if (React.isValidElement(IconProp)) {
      return IconProp;
    }
    // Otherwise, it's a component reference (LucideIcon or forwardRef component)
    const Icon = IconProp as LucideIcon;
    return <Icon className="w-5 h-5" />;
  };

  // Combine change and trend props for flexibility
  const displayChange = change || (trend ? { value: trend.value, trend: trend.isPositive ? 'up' as const : 'down' as const } : undefined);

  return (
    <div
      className={cn(
        'bg-dark-900/70 backdrop-blur-xl border rounded-xl p-5 transition-all duration-300',
        variants[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-dark-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {displayChange && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  'text-xs font-medium',
                  displayChange.trend === 'up' && 'text-success-500',
                  displayChange.trend === 'down' && 'text-danger-500',
                  displayChange.trend === 'neutral' && 'text-dark-400'
                )}
              >
                {displayChange.trend === 'up' && '+'}
                {displayChange.value}%
              </span>
              <span className="text-xs text-dark-500">vs last month</span>
            </div>
          )}
        </div>
        {IconProp && <div className={cn('p-3 rounded-lg', iconBg[variant])}>{renderIcon()}</div>}
      </div>
    </div>
  );
}
