'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui';
import { FLEET_CATEGORIES, type FleetCategory } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Car, ChevronRight, Container, Thermometer, Truck } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface FleetStats {
  category: FleetCategory;
  total: number;
  active: number;
  inMaintenance: number;
  openIssues: number;
}

interface FleetOverviewCardProps {
  fleetStats: FleetStats[];
  className?: string;
}

const categoryIcons: Record<FleetCategory, React.ElementType> = {
  horses: Truck,
  reefers: Thermometer,
  interlinks: Container,
  ridgets: Truck,
  bakkies: Car,
};

export function FleetOverviewCard({ fleetStats, className }: FleetOverviewCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Fleet Overview</CardTitle>
        <Link
          href="/fleet"
          className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
        >
          Manage fleet
          <ChevronRight className="w-4 h-4" />
        </Link>
      </CardHeader>

      <div className="grid gap-3">
        {fleetStats.map((stat) => {
          const categoryConfig = FLEET_CATEGORIES.find((c) => c.id === stat.category);
          const Icon = categoryIcons[stat.category];
          const healthPercentage = stat.total > 0 ? (stat.active / stat.total) * 100 : 0;

          return (
            <Link
              key={stat.category}
              href={`/fleet/${stat.category}`}
              className="flex items-center gap-4 p-3 rounded-lg border border-primary-500/10 hover:border-primary-500/25 hover:bg-white/3 transition-all duration-200 group"
            >
              <div className="p-2 rounded-lg bg-primary-500/10 text-primary-400 group-hover:bg-primary-500/15 transition-colors">
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-white text-sm">
                    {categoryConfig?.label}
                  </span>
                  <span className="text-xs text-dark-400">
                    {stat.active}/{stat.total} active
                  </span>
                </div>

                {/* Health bar */}
                <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      healthPercentage >= 80
                        ? 'bg-success-500'
                        : healthPercentage >= 50
                        ? 'bg-warning-500'
                        : 'bg-danger-500'
                    )}
                    style={{ width: `${healthPercentage}%` }}
                  />
                </div>

                <div className="flex items-center gap-3 mt-1">
                  {stat.inMaintenance > 0 && (
                    <span className="text-xs text-warning-500">
                      {stat.inMaintenance} in maintenance
                    </span>
                  )}
                  {stat.openIssues > 0 && (
                    <span className="text-xs text-danger-500">
                      {stat.openIssues} issues
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-dark-500 group-hover:text-dark-300 transition-colors" />
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
