'use client';

import { Badge, Card } from '@/components/ui';
import { cn, formatDate } from '@/lib/utils';
import type { Tyre, TyreHistory } from '@/types';
import { ArrowRightLeft, ChevronRight, Circle, Plus, RotateCcw, Trash2 } from 'lucide-react';

interface TyreListProps {
  tyres: Tyre[];
  onTyreClick?: (tyre: Tyre) => void;
  className?: string;
}

const conditionConfig = {
  new: { label: 'New', variant: 'success' as const },
  good: { label: 'Good', variant: 'success' as const },
  fair: { label: 'Fair', variant: 'warning' as const },
  worn: { label: 'Worn', variant: 'warning' as const },
  replace: { label: 'Replace', variant: 'danger' as const },
};

const statusConfig = {
  'in-use': { label: 'In Use', variant: 'success' as const },
  'in-stock': { label: 'In Stock', variant: 'info' as const },
  retreading: { label: 'Retreading', variant: 'warning' as const },
  disposed: { label: 'Disposed', variant: 'default' as const },
};

export function TyreList({ tyres, onTyreClick, className }: TyreListProps) {
  if (tyres.length === 0) {
    return (
      <Card className={cn('text-center py-12', className)}>
        <Circle className="w-12 h-12 text-dark-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No Tyres Found</h3>
        <p className="text-dark-400">No tyres match your criteria</p>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {tyres.map((tyre) => {
        const condition = tyre.condition ? conditionConfig[tyre.condition] : conditionConfig.good;
        const status = tyre.status ? statusConfig[tyre.status] : statusConfig['in-stock'];

        return (
          <div
            key={tyre.id}
            onClick={() => onTyreClick?.(tyre)}
            className={cn(
              'bg-dark-900/70 backdrop-blur-xl border rounded-xl p-4',
              'hover:border-primary-500/25 transition-all duration-200',
              tyre.condition === 'replace' || tyre.condition === 'worn'
                ? 'border-warning-500/20'
                : 'border-primary-500/10',
              onTyreClick && 'cursor-pointer'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'p-3 rounded-lg',
                    tyre.condition === 'new' || tyre.condition === 'good'
                      ? 'bg-success-500/10'
                      : tyre.condition === 'fair'
                      ? 'bg-warning-500/10'
                      : 'bg-danger-500/10'
                  )}
                >
                  <Circle
                    className={cn(
                      'w-5 h-5',
                      tyre.condition === 'new' || tyre.condition === 'good'
                        ? 'text-success-500'
                        : tyre.condition === 'fair'
                        ? 'text-warning-500'
                        : 'text-danger-500'
                    )}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-sm text-dark-300">
                      {tyre.serialNumber}
                    </span>
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <Badge variant={condition.variant}>{condition.label}</Badge>
                  </div>

                  <h4 className="font-medium text-white">
                    {tyre.brand} {tyre.model}
                  </h4>

                  <p className="text-sm text-dark-400 mt-0.5">{tyre.size}</p>

                  <div className="flex items-center gap-4 mt-2 flex-wrap text-xs text-dark-400">
                    {tyre.fleetNumber && (
                      <span className="text-primary-400">{tyre.fleetNumber}</span>
                    )}
                    {tyre.position && <span>Position: {tyre.position}</span>}
                    {tyre.treadDepth !== undefined && (
                      <span>Tread: {tyre.treadDepth}mm</span>
                    )}
                    {tyre.currentMileage !== undefined && (
                      <span>{tyre.currentMileage.toLocaleString()} km</span>
                    )}
                  </div>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-dark-500 flex-shrink-0" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface TyreHistoryListProps {
  history: TyreHistory[];
  className?: string;
}

const actionIcons = {
  install: Plus,
  rotate: RotateCcw,
  remove: ArrowRightLeft,
  inspect: Circle,
  retread: RotateCcw,
  dispose: Trash2,
};

const actionLabels = {
  install: 'Installed',
  rotate: 'Rotated',
  remove: 'Removed',
  inspect: 'Inspected',
  retread: 'Sent for Retread',
  dispose: 'Disposed',
};

export function TyreHistoryList({ history, className }: TyreHistoryListProps) {
  if (history.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-dark-400">No history records</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {history.map((record) => {
        const Icon = actionIcons[record.action] || Circle;

        return (
          <div
            key={record.id}
            className="flex items-start gap-4 p-3 bg-dark-800/30 rounded-lg"
          >
            <div className="p-2 rounded-lg bg-primary-500/10">
              <Icon className="w-4 h-4 text-primary-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-white text-sm">
                  {actionLabels[record.action] || record.action}
                </span>
                {record.fleetNumber && (
                  <Badge size="sm">{record.fleetNumber}</Badge>
                )}
              </div>
              <div className="text-sm text-dark-400">
                {record.position && <span>Position: {record.position}</span>}
                {record.odometerReading && (
                  <span className="ml-3">
                    Odometer: {record.odometerReading.toLocaleString()} km
                  </span>
                )}
                {record.treadDepth !== undefined && (
                  <span className="ml-3">Tread: {record.treadDepth}mm</span>
                )}
              </div>
              {record.notes && (
                <p className="text-sm text-dark-500 mt-1">{record.notes}</p>
              )}
              <p className="text-xs text-dark-500 mt-2">
                {formatDate(record.performedDate)} by {record.performedBy}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
