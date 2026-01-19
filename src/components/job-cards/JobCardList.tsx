'use client';

import { Badge, Button, Card, PriorityBadge } from '@/components/ui';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import type { JobCard } from '@/types';
import { ChevronRight, Clock, Edit2, FileText, Trash2, User, Wrench } from 'lucide-react';

interface JobCardListProps {
  jobCards: JobCard[];
  fleetNumber?: string;
  showVehicle?: boolean;
  showActions?: boolean;
  onJobCardClick?: (jobCard: JobCard) => void;
  onJobCardEdit?: (jobCard: JobCard) => void;
  onJobCardDelete?: (jobCard: JobCard) => void;
  onStatusChange?: (jobCard: JobCard, newStatus: JobCard['status']) => void;
  className?: string;
}

export function JobCardList({
  jobCards,
  fleetNumber,
  showVehicle = true,
  showActions = false,
  onJobCardClick,
  onJobCardEdit,
  onJobCardDelete,
  onStatusChange,
  className,
}: JobCardListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'info';
      case 'in-progress':
        return 'warning';
      case 'pending-parts':
        return 'warning';
      case 'completed':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (jobCards.length === 0) {
    return (
      <Card className={cn('text-center py-12', className)}>
        <FileText className="w-12 h-12 text-dark-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No Job Cards Found</h3>
        <p className="text-dark-400">
          {fleetNumber
            ? `No job cards recorded for ${fleetNumber}`
            : 'No job cards match your criteria'}
        </p>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {jobCards.map((jobCard) => (
        <div
          key={jobCard.id}
          onClick={() => onJobCardClick?.(jobCard)}
          className={cn(
            'bg-dark-900/70 backdrop-blur-xl border rounded-xl p-4',
            'hover:border-primary-500/25 transition-all duration-200',
            jobCard.priority === 'urgent' || jobCard.priority === 'high'
              ? 'border-warning-500/20'
              : 'border-primary-500/10',
            onJobCardClick && 'cursor-pointer'
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'p-3 rounded-lg',
                  jobCard.status === 'completed' || jobCard.status === 'closed'
                    ? 'bg-success-500/10'
                    : jobCard.status === 'in-progress'
                    ? 'bg-warning-500/10'
                    : 'bg-primary-500/10'
                )}
              >
                <Wrench
                  className={cn(
                    'w-5 h-5',
                    jobCard.status === 'completed' || jobCard.status === 'closed'
                      ? 'text-success-500'
                      : jobCard.status === 'in-progress'
                      ? 'text-warning-500'
                      : 'text-primary-400'
                  )}
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-mono text-dark-400">
                    {jobCard.jobNumber}
                  </span>
                  <Badge variant={getStatusColor(jobCard.status) as 'default' | 'success' | 'warning' | 'danger' | 'info'}>
                    {formatStatus(jobCard.status)}
                  </Badge>
                  <PriorityBadge priority={jobCard.priority} />
                  
                  {showActions && (
                    <div className="flex items-center gap-1 ml-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onJobCardEdit?.(jobCard);
                        }}
                        title="Edit job card"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onJobCardDelete?.(jobCard);
                        }}
                        className="text-danger-400 hover:text-danger-300"
                        title="Delete job card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <h4 className="font-medium text-white">{jobCard.title}</h4>

                {showVehicle && (
                  <p className="text-sm text-primary-400 mt-0.5">
                    {jobCard.fleetNumber}
                  </p>
                )}

                <p className="text-sm text-dark-400 mt-1 line-clamp-2">
                  {jobCard.description}
                </p>

                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  {jobCard.assignedTechnicianName && (
                    <div className="flex items-center gap-1.5 text-xs text-dark-400">
                      <User className="w-3.5 h-3.5" />
                      <span>{jobCard.assignedTechnicianName}</span>
                    </div>
                  )}

                  {jobCard.dueDate && (
                    <div className="flex items-center gap-1.5 text-xs text-dark-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Due {formatDate(jobCard.dueDate)}</span>
                    </div>
                  )}

                  {jobCard.totalCost !== undefined && jobCard.totalCost > 0 && (
                    <span className="text-xs font-medium text-accent-400">
                      {formatCurrency(jobCard.totalCost)}
                    </span>
                  )}
                  
                  {showActions && onStatusChange && jobCard.status !== 'completed' && jobCard.status !== 'closed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextStatus = jobCard.status === 'open' ? 'in-progress' : 'completed';
                        onStatusChange(jobCard, nextStatus);
                      }}
                      className="ml-auto text-xs"
                    >
                      {jobCard.status === 'open' ? 'Start Work' : 'Mark Complete'}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-dark-500 flex-shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}
