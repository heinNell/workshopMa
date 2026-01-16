'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Badge, StatusBadge, DataTable } from '@/components/ui';
import { formatDate, formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ClipboardCheck, AlertTriangle, ChevronRight } from 'lucide-react';
import type { Inspection } from '@/types';

interface InspectionListProps {
  inspections: Inspection[];
  fleetNumber?: string;
  showVehicle?: boolean;
  onInspectionClick?: (inspection: Inspection) => void;
  className?: string;
}

export function InspectionList({
  inspections,
  fleetNumber,
  showVehicle = true,
  onInspectionClick,
  className,
}: InspectionListProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'scheduled':
        return 'info';
      case 'overdue':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (inspections.length === 0) {
    return (
      <Card className={cn('text-center py-12', className)}>
        <ClipboardCheck className="w-12 h-12 text-dark-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No Inspections Found</h3>
        <p className="text-dark-400">
          {fleetNumber
            ? `No inspections recorded for ${fleetNumber}`
            : 'No inspections match your criteria'}
        </p>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {inspections.map((inspection) => (
        <div
          key={inspection.id}
          onClick={() => onInspectionClick?.(inspection)}
          className={cn(
            'bg-dark-900/70 backdrop-blur-xl border border-primary-500/10 rounded-xl p-4',
            'hover:border-primary-500/25 transition-all duration-200',
            onInspectionClick && 'cursor-pointer'
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'p-3 rounded-lg',
                  inspection.status === 'completed'
                    ? 'bg-success-500/10'
                    : inspection.status === 'overdue'
                    ? 'bg-danger-500/10'
                    : 'bg-primary-500/10'
                )}
              >
                <ClipboardCheck
                  className={cn(
                    'w-5 h-5',
                    inspection.status === 'completed'
                      ? 'text-success-500'
                      : inspection.status === 'overdue'
                      ? 'text-danger-500'
                      : 'text-primary-400'
                  )}
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-white">
                    {getTypeLabel(inspection.inspectionType)} Inspection
                  </h4>
                  <Badge variant={getStatusVariant(inspection.status) as any}>
                    {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
                  </Badge>
                </div>

                {showVehicle && (
                  <p className="text-sm text-primary-400 mb-1">
                    {inspection.fleetNumber}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-dark-400">
                  <span>
                    {inspection.status === 'completed'
                      ? `Completed ${formatDateTime(inspection.completedDate!)}`
                      : `Scheduled ${formatDate(inspection.scheduledDate)}`}
                  </span>
                  {inspection.inspectorName && (
                    <>
                      <span className="text-dark-600">|</span>
                      <span>By {inspection.inspectorName}</span>
                    </>
                  )}
                  {inspection.odometerReading && (
                    <>
                      <span className="text-dark-600">|</span>
                      <span>{inspection.odometerReading.toLocaleString()} km</span>
                    </>
                  )}
                </div>

                {(inspection.faultsFound ?? 0) > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <AlertTriangle className="w-4 h-4 text-warning-500" />
                    <span className="text-sm text-warning-500">
                      {inspection.faultsFound} fault{inspection.faultsFound !== 1 ? 's' : ''} found
                    </span>
                  </div>
                )}
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-dark-500" />
          </div>
        </div>
      ))}
    </div>
  );
}
