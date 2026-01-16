'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, StatusBadge, PriorityBadge } from '@/components/ui';
import { ChevronRight, Clock } from 'lucide-react';
import { formatDate, calculateDaysUntil } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ScheduledItem {
  id: string;
  type: 'inspection' | 'maintenance' | 'service';
  title: string;
  fleetNumber: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface UpcomingScheduleProps {
  items: ScheduledItem[];
  className?: string;
}

export function UpcomingSchedule({ items, className }: UpcomingScheduleProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Upcoming Schedule</CardTitle>
        <Link
          href="/schedule"
          className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
        >
          View calendar
          <ChevronRight className="w-4 h-4" />
        </Link>
      </CardHeader>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-center text-dark-400 py-8">No upcoming items</p>
        ) : (
          items.map((item) => {
            const daysUntil = calculateDaysUntil(item.dueDate);
            const isOverdue = daysUntil < 0;
            const isDueSoon = daysUntil <= 3 && daysUntil >= 0;

            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border transition-colors',
                  isOverdue
                    ? 'border-danger-500/30 bg-danger-500/5'
                    : isDueSoon
                    ? 'border-warning-500/30 bg-warning-500/5'
                    : 'border-primary-500/10 hover:border-primary-500/25'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'p-2 rounded-lg',
                      isOverdue
                        ? 'bg-danger-500/15 text-danger-500'
                        : isDueSoon
                        ? 'bg-warning-500/15 text-warning-500'
                        : 'bg-primary-500/15 text-primary-400'
                    )}
                  >
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-dark-400">{item.fleetNumber}</span>
                      <span className="text-dark-600">|</span>
                      <span
                        className={cn(
                          'text-xs',
                          isOverdue
                            ? 'text-danger-500'
                            : isDueSoon
                            ? 'text-warning-500'
                            : 'text-dark-400'
                        )}
                      >
                        {isOverdue
                          ? `${Math.abs(daysUntil)} days overdue`
                          : daysUntil === 0
                          ? 'Due today'
                          : `In ${daysUntil} days`}
                      </span>
                    </div>
                  </div>
                </div>
                <PriorityBadge priority={item.priority} />
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
