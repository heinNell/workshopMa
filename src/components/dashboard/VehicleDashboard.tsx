'use client';

import { Card, StatusBadge } from '@/components/ui';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import
  {
    AlertTriangle,
    Calendar,
    Circle,
    FileText,
    Gauge,
    Truck,
    Wrench,
  } from 'lucide-react';
import Link from 'next/link';

interface VehicleDashboardProps {
  fleetNumber: string;
  category: string;
  vehicleData: {
    make?: string;
    model?: string;
    year?: number;
    registration?: string;
    status: 'active' | 'maintenance' | 'inactive';
    currentOdometer?: number;
    lastServiceDate?: string;
    nextServiceDue?: string;
  };
  stats: {
    activeJobCards: number;
    openFaults: number;
    upcomingInspections: number;
    totalSpentThisMonth: number;
    tyreConditions: { good: number; fair: number; worn: number; replace: number };
  };
  className?: string;
}

export function VehicleDashboard({
  fleetNumber,
  category,
  vehicleData,
  stats,
  className,
}: VehicleDashboardProps) {
  const totalTyres =
    stats.tyreConditions.good +
    stats.tyreConditions.fair +
    stats.tyreConditions.worn +
    stats.tyreConditions.replace;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Vehicle Header */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-accent-500/5" />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/20">
              <Truck className="w-8 h-8 text-primary-400" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-white">{fleetNumber}</h2>
                <StatusBadge status={vehicleData.status} />
              </div>
              <p className="text-dark-400">
                {vehicleData.make} {vehicleData.model}{' '}
                {vehicleData.year && `(${vehicleData.year})`}
              </p>
              {vehicleData.registration && (
                <p className="text-sm text-dark-500 mt-1">
                  Reg: {vehicleData.registration}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/fleet/${category}/${fleetNumber.toLowerCase()}/inspections`}
              className="px-4 py-2 text-sm font-medium bg-primary-500/10 text-primary-400 border border-primary-500/30 rounded-lg hover:bg-primary-500/20 transition-colors"
            >
              New Inspection
            </Link>
            <Link
              href={`/fleet/${category}/${fleetNumber.toLowerCase()}/job-cards/new`}
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:from-primary-500 hover:to-primary-400 shadow-glow transition-all"
            >
              New Job Card
            </Link>
          </div>
        </div>

        {/* Vehicle Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-primary-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-500/10">
              <Gauge className="w-4 h-4 text-primary-400" />
            </div>
            <div>
              <p className="text-xs text-dark-400">Odometer</p>
              <p className="text-sm font-medium text-white">
                {vehicleData.currentOdometer?.toLocaleString() || 'N/A'} km
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success-500/10">
              <Calendar className="w-4 h-4 text-success-500" />
            </div>
            <div>
              <p className="text-xs text-dark-400">Last Service</p>
              <p className="text-sm font-medium text-white">
                {vehicleData.lastServiceDate
                  ? formatDate(vehicleData.lastServiceDate)
                  : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning-500/10">
              <Calendar className="w-4 h-4 text-warning-500" />
            </div>
            <div>
              <p className="text-xs text-dark-400">Next Service Due</p>
              <p className="text-sm font-medium text-white">
                {vehicleData.nextServiceDue
                  ? formatDate(vehicleData.nextServiceDue)
                  : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-500/10">
              <Wrench className="w-4 h-4 text-accent-400" />
            </div>
            <div>
              <p className="text-xs text-dark-400">Monthly Spend</p>
              <p className="text-sm font-medium text-white">
                {formatCurrency(stats.totalSpentThisMonth)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href={`/fleet/${category}/${fleetNumber.toLowerCase()}/job-cards`}
          className="block"
        >
          <Card className="hover:border-primary-500/30 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-400">Active Job Cards</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.activeJobCards}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary-500/10">
                <FileText className="w-5 h-5 text-primary-400" />
              </div>
            </div>
          </Card>
        </Link>

        <Link
          href={`/fleet/${category}/${fleetNumber.toLowerCase()}/faults`}
          className="block"
        >
          <Card
            className={cn(
              'hover:border-primary-500/30 transition-colors',
              stats.openFaults > 0 && 'border-danger-500/20'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-400">Open Faults</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.openFaults}</p>
              </div>
              <div
                className={cn(
                  'p-3 rounded-lg',
                  stats.openFaults > 0
                    ? 'bg-danger-500/10'
                    : 'bg-success-500/10'
                )}
              >
                <AlertTriangle
                  className={cn(
                    'w-5 h-5',
                    stats.openFaults > 0 ? 'text-danger-500' : 'text-success-500'
                  )}
                />
              </div>
            </div>
          </Card>
        </Link>

        <Link
          href={`/fleet/${category}/${fleetNumber.toLowerCase()}/inspections`}
          className="block"
        >
          <Card className="hover:border-primary-500/30 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-400">Upcoming Inspections</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.upcomingInspections}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-accent-500/10">
                <Calendar className="w-5 h-5 text-accent-400" />
              </div>
            </div>
          </Card>
        </Link>

        <Link
          href={`/fleet/${category}/${fleetNumber.toLowerCase()}/tyres`}
          className="block"
        >
          <Card className="hover:border-primary-500/30 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-dark-400">Tyre Status</p>
                <div className="flex items-center gap-2 mt-2">
                  {totalTyres > 0 ? (
                    <>
                      <div className="flex -space-x-1">
                        {stats.tyreConditions.good > 0 && (
                          <span
                            className="w-3 h-3 rounded-full bg-success-500 border-2 border-dark-900"
                            title={`${stats.tyreConditions.good} good`}
                          />
                        )}
                        {stats.tyreConditions.fair > 0 && (
                          <span
                            className="w-3 h-3 rounded-full bg-warning-500 border-2 border-dark-900"
                            title={`${stats.tyreConditions.fair} fair`}
                          />
                        )}
                        {(stats.tyreConditions.worn > 0 ||
                          stats.tyreConditions.replace > 0) && (
                          <span
                            className="w-3 h-3 rounded-full bg-danger-500 border-2 border-dark-900"
                            title={`${stats.tyreConditions.worn + stats.tyreConditions.replace} need attention`}
                          />
                        )}
                      </div>
                      <span className="text-sm text-white">{totalTyres} tyres</span>
                    </>
                  ) : (
                    <span className="text-sm text-dark-400">No data</span>
                  )}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-primary-500/10">
                <Circle className="w-5 h-5 text-primary-400" />
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
