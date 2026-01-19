'use client';

import { Badge, Button, Card, StatusBadge } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { ScheduledMaintenance } from '@/types';
import { AlertTriangle, Calendar, CheckCircle, Clock, Edit2, Trash2 } from 'lucide-react';

interface MaintenanceListProps {
  maintenance: ScheduledMaintenance[];
  onMaintenanceEdit?: (item: ScheduledMaintenance) => void;
  onMaintenanceDelete?: (item: ScheduledMaintenance) => void;
  onMaintenanceComplete?: (item: ScheduledMaintenance) => void;
  showActions?: boolean;
  loading?: boolean;
}

export function MaintenanceList({
  maintenance,
  onMaintenanceEdit,
  onMaintenanceDelete,
  onMaintenanceComplete,
  showActions = false,
  loading = false,
}: MaintenanceListProps) {
  const getStatusStyles = (status: ScheduledMaintenance['status']) => {
    switch (status) {
      case 'overdue':
        return { bg: 'bg-red-500/20', border: 'border-red-500/30', icon: AlertTriangle, iconColor: 'text-red-400' };
      case 'due':
        return { bg: 'bg-orange-500/20', border: 'border-orange-500/30', icon: Clock, iconColor: 'text-orange-400' };
      case 'upcoming':
        return { bg: 'bg-primary-500/20', border: 'border-primary-500/30', icon: Calendar, iconColor: 'text-primary-400' };
      case 'completed':
        return { bg: 'bg-success-500/20', border: 'border-success-500/30', icon: CheckCircle, iconColor: 'text-success-400' };
      default:
        return { bg: 'bg-dark-700', border: 'border-dark-600', icon: Calendar, iconColor: 'text-dark-400' };
    }
  };

  const getFrequencyLabel = (item: ScheduledMaintenance) => {
    const parts = [];
    if (item.intervalKm) parts.push(`Every ${item.intervalKm.toLocaleString()} km`);
    if (item.intervalDays) parts.push(`Every ${item.intervalDays} days`);
    return parts.join(' or ');
  };

  if (loading) {
    return (
      <Card>
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  if (maintenance.length === 0) {
    return (
      <Card>
        <div className="text-center py-16">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-dark-600" />
          <h3 className="text-lg font-medium text-white mb-2">No Scheduled Maintenance</h3>
          <p className="text-dark-400">Schedule maintenance to keep your vehicle in top condition</p>
        </div>
      </Card>
    );
  }

  // Sort: overdue first, then due, upcoming, scheduled, completed last
  const statusOrder = { overdue: 0, due: 1, upcoming: 2, scheduled: 3, completed: 4 };
  const sortedMaintenance = [...maintenance].sort((a, b) => 
    (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5)
  );

  return (
    <div className="space-y-3">
      {sortedMaintenance.map((item) => {
        const styles = getStatusStyles(item.status);
        const Icon = styles.icon;

        return (
          <div
            key={item.id}
            className={`p-4 rounded-xl bg-dark-800/50 border ${styles.border} hover:bg-dark-800/70 transition-colors`}
          >
            <div className="flex items-start gap-4">
              {/* Status Icon */}
              <div className={`p-2.5 rounded-lg ${styles.bg} flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${styles.iconColor}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-white font-medium leading-tight">{item.maintenanceType}</p>
                    {item.description && (
                      <p className="text-sm text-dark-400 mt-1">{item.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {item.scheduledDate && (
                        <div className="flex items-center gap-1.5 text-sm text-dark-300">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Due: {formatDate(item.scheduledDate)}</span>
                        </div>
                      )}
                      {getFrequencyLabel(item) && (
                        <Badge variant="default" size="sm">
                          {getFrequencyLabel(item)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={item.status} />
                    {showActions && (
                      <div className="flex items-center gap-1 ml-2">
                        {item.status !== 'completed' && onMaintenanceComplete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMaintenanceComplete(item)}
                            className="text-success-400 hover:text-success-300"
                            title="Mark as complete"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMaintenanceEdit?.(item)}
                          title="Edit maintenance"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMaintenanceDelete?.(item)}
                          className="text-danger-400 hover:text-danger-300"
                          title="Delete maintenance"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Last Completed Info */}
                {item.lastCompletedDate && (
                  <div className="flex items-center gap-4 mt-3 p-2.5 rounded-lg bg-dark-700/50 border border-dark-600">
                    <div className="flex items-center gap-2 text-sm text-dark-300">
                      <CheckCircle className="w-4 h-4 text-success-400" />
                      <span>Last completed: {formatDate(item.lastCompletedDate)}</span>
                    </div>
                    {item.lastCompletedMileage && (
                      <span className="text-sm text-dark-400">
                        at {item.lastCompletedMileage.toLocaleString()} km
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
