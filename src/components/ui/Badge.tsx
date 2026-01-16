'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'error' | 'info' | 'default';
  size?: 'sm' | 'md';
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = 'default', size = 'md', className, children }: BadgeProps) {
  const variants = {
    success: 'bg-success-500/15 text-success-500 border-success-500/30',
    warning: 'bg-warning-500/15 text-warning-500 border-warning-500/30',
    danger: 'bg-danger-500/15 text-danger-500 border-danger-500/30',
    error: 'bg-danger-500/15 text-danger-500 border-danger-500/30',
    info: 'bg-primary-500/15 text-primary-400 border-primary-500/30',
    default: 'bg-dark-700/50 text-dark-300 border-dark-600/50',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// Status badge with dot indicator
interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' }> = {
    active: { label: 'Active', variant: 'success' },
    inactive: { label: 'Inactive', variant: 'default' },
    maintenance: { label: 'Maintenance', variant: 'warning' },
    pending: { label: 'Pending', variant: 'info' },
    completed: { label: 'Completed', variant: 'success' },
    overdue: { label: 'Overdue', variant: 'danger' },
    scheduled: { label: 'Scheduled', variant: 'info' },
    'in-progress': { label: 'In Progress', variant: 'warning' },
    open: { label: 'Open', variant: 'info' },
    closed: { label: 'Closed', variant: 'default' },
    'pending-parts': { label: 'Pending Parts', variant: 'warning' },
    assigned: { label: 'Assigned', variant: 'info' },
    resolved: { label: 'Resolved', variant: 'success' },
    upcoming: { label: 'Upcoming', variant: 'info' },
    due: { label: 'Due', variant: 'warning' },
  };

  const config = statusConfig[status] || { label: status, variant: 'default' as const };

  return (
    <Badge variant={config.variant} className={className}>
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full mr-1.5',
          config.variant === 'success' && 'bg-success-500',
          config.variant === 'warning' && 'bg-warning-500',
          config.variant === 'danger' && 'bg-danger-500',
          config.variant === 'info' && 'bg-primary-400',
          config.variant === 'default' && 'bg-dark-400'
        )}
      />
      {config.label}
    </Badge>
  );
}

// Priority badge
interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const priorityConfig = {
    low: { label: 'Low', variant: 'default' as const },
    medium: { label: 'Medium', variant: 'info' as const },
    high: { label: 'High', variant: 'warning' as const },
    urgent: { label: 'Urgent', variant: 'danger' as const },
    critical: { label: 'Critical', variant: 'danger' as const },
  };

  const config = priorityConfig[priority];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
