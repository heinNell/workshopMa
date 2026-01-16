'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, Badge, StatusBadge } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import { ChevronRight, AlertTriangle, CheckCircle, Clock, Wrench } from 'lucide-react';

interface Activity {
  id: string;
  type: 'inspection' | 'job-card' | 'fault' | 'maintenance';
  title: string;
  description: string;
  fleetNumber: string;
  status: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: Activity[];
  className?: string;
}

const activityIcons = {
  inspection: CheckCircle,
  'job-card': Wrench,
  fault: AlertTriangle,
  maintenance: Clock,
};

const activityColors = {
  inspection: 'text-success-500 bg-success-500/15',
  'job-card': 'text-primary-400 bg-primary-500/15',
  fault: 'text-warning-500 bg-warning-500/15',
  maintenance: 'text-accent-400 bg-accent-500/15',
};

export function RecentActivity({ activities, className }: RecentActivityProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <Link
          href="/activity"
          className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </Link>
      </CardHeader>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-center text-dark-400 py-8">No recent activity</p>
        ) : (
          activities.map((activity) => {
            const Icon = activityIcons[activity.type];
            const colorClass = activityColors[activity.type];

            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/3 transition-colors cursor-pointer"
              >
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white text-sm truncate">
                      {activity.title}
                    </span>
                    <Badge size="sm">{activity.fleetNumber}</Badge>
                  </div>
                  <p className="text-sm text-dark-400 truncate">{activity.description}</p>
                  <p className="text-xs text-dark-500 mt-1">
                    {formatDateTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
