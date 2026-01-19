'use client';

import { MainLayout } from '@/components/layout';
import { Badge, Button, Card, CardHeader, Tabs } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Tyre } from '@/types';
import { ArrowRight, Circle, ExternalLink, Filter, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Mock data - In production, this would come from Supabase
const mockTyres: Tyre[] = [
  {
    id: '1',
    serialNumber: 'TYR-2024-001',
    vehicleId: 'v1',
    fleetNumber: '21H',
    position: 'FL',
    brand: 'Michelin',
    model: 'X Multi D',
    size: '315/80R22.5',
    condition: 'good',
    treadDepth: 12.5,
    currentMileage: 45000,
    status: 'in-use',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    serialNumber: 'TYR-2024-002',
    vehicleId: 'v1',
    fleetNumber: '21H',
    position: 'FR',
    brand: 'Michelin',
    model: 'X Multi D',
    size: '315/80R22.5',
    condition: 'good',
    treadDepth: 11.8,
    currentMileage: 45000,
    status: 'in-use',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    serialNumber: 'TYR-2024-015',
    vehicleId: 'v2',
    fleetNumber: '32H',
    position: 'RLO',
    brand: 'Bridgestone',
    model: 'R168',
    size: '315/80R22.5',
    condition: 'worn',
    treadDepth: 4.2,
    currentMileage: 120000,
    status: 'in-use',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    serialNumber: 'TYR-2024-022',
    brand: 'Goodyear',
    model: 'KMAX S',
    size: '315/80R22.5',
    condition: 'new',
    treadDepth: 18.0,
    status: 'in-stock',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    serialNumber: 'TYR-2023-089',
    brand: 'Continental',
    model: 'HDL2',
    size: '315/80R22.5',
    condition: 'fair',
    treadDepth: 8.5,
    status: 'retreading',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    serialNumber: 'TYR-2024-030',
    brand: 'Michelin',
    model: 'X Multi D',
    size: '315/80R22.5',
    condition: 'new',
    treadDepth: 18.0,
    status: 'in-stock',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

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

// Helper to determine fleet category from fleet number
function getFleetCategory(fleetNumber: string): string {
  if (fleetNumber.endsWith('H')) return 'horses';
  if (fleetNumber.endsWith('R')) return 'reefers';
  if (fleetNumber.endsWith('I')) return 'interlinks';
  if (fleetNumber.endsWith('D')) return 'ridgets';
  if (fleetNumber.endsWith('B')) return 'bakkies';
  return 'horses'; // default
}

export default function TyresPage() {
  const [activeTab, setActiveTab] = useState('all');
  const tyres = mockTyres;

  const tabs = [
    { id: 'all', label: 'All Tyres', count: tyres.length },
    { id: 'in-use', label: 'In Use', count: tyres.filter(t => t.status === 'in-use').length },
    { id: 'in-stock', label: 'In Stock', count: tyres.filter(t => t.status === 'in-stock').length },
    { id: 'retreading', label: 'Retreading', count: tyres.filter(t => t.status === 'retreading').length },
  ];

  const filteredTyres = activeTab === 'all' 
    ? tyres 
    : tyres.filter(t => t.status === activeTab);

  const needsAttention = tyres.filter(t => t.condition === 'worn' || t.condition === 'replace').length;

  // Group tyres by fleet for summary
  const tyresByFleet = tyres.reduce((acc, tyre) => {
    const fleet = tyre.fleetNumber || 'Unallocated';
    if (!acc[fleet]) acc[fleet] = [];
    acc[fleet].push(tyre);
    return acc;
  }, {} as Record<string, Tyre[]>);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Tyre Management Overview</h1>
            <p className="text-dark-400 mt-1">Fleet-wide tyre tracking and status</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary">
              <RotateCcw className="w-4 h-4" />
              Rotate Tyres
            </Button>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="border-primary-500/30 bg-primary-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary-500/20">
              <Circle className="w-6 h-6 text-primary-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Tyre allocation is managed per fleet</p>
              <p className="text-dark-400 text-sm mt-1">
                Click on a tyre or fleet card below to navigate to that fleet&apos;s page where you can allocate, edit, and manage tyres for specific positions.
              </p>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-500/10">
                <Circle className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Total Tyres</p>
                <p className="text-xl font-bold text-white">{tyres.length}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success-500/10">
                <Circle className="w-5 h-5 text-success-500" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Good Condition</p>
                <p className="text-xl font-bold text-white">
                  {tyres.filter(t => t.condition === 'new' || t.condition === 'good').length}
                </p>
              </div>
            </div>
          </Card>
          <Card className={needsAttention > 0 ? 'border-warning-500/20' : ''}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning-500/10">
                <Circle className="w-5 h-5 text-warning-500" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Needs Attention</p>
                <p className="text-xl font-bold text-warning-500">{needsAttention}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent-500/10">
                <RotateCcw className="w-5 h-5 text-accent-400" />
              </div>
              <div>
                <p className="text-sm text-dark-400">At Retreader</p>
                <p className="text-xl font-bold text-white">
                  {tyres.filter(t => t.status === 'retreading').length}
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-500/10">
                <Circle className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-dark-400">In Stock</p>
                <p className="text-xl font-bold text-white">
                  {tyres.filter(t => t.status === 'in-stock').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Fleet Summary Cards */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Tyres by Fleet</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(tyresByFleet).map(([fleet, fleetTyres]) => {
              const goodCount = fleetTyres.filter(t => t.condition === 'new' || t.condition === 'good').length;
              const warnCount = fleetTyres.filter(t => t.condition === 'fair' || t.condition === 'worn').length;
              const dangerCount = fleetTyres.filter(t => t.condition === 'replace').length;
              const category = fleet !== 'Unallocated' ? getFleetCategory(fleet) : null;

              return (
                <Card 
                  key={fleet} 
                  className={cn(
                    'hover:border-primary-500/30 transition-all',
                    dangerCount > 0 && 'border-danger-500/20'
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white">{fleet}</span>
                      <Badge variant="default">{fleetTyres.length} tyres</Badge>
                    </div>
                    {category && (
                      <Link 
                        href={`/fleet/${category}/${fleet.toLowerCase()}`}
                        className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300"
                      >
                        Manage <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {goodCount > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-success-500" />
                        <span className="text-sm text-dark-400">{goodCount} good</span>
                      </div>
                    )}
                    {warnCount > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-warning-500" />
                        <span className="text-sm text-dark-400">{warnCount} fair/worn</span>
                      </div>
                    )}
                    {dangerCount > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-danger-500" />
                        <span className="text-sm text-danger-400">{dangerCount} replace</span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Tabs and List */}
        <Card>
          <CardHeader>
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </CardHeader>

          {/* Tyre Overview List */}
          <div className="space-y-3">
            {filteredTyres.length === 0 ? (
              <div className="text-center py-12">
                <Circle className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Tyres Found</h3>
                <p className="text-dark-400">No tyres match your criteria</p>
              </div>
            ) : (
              filteredTyres.map((tyre) => {
                const condition = tyre.condition ? conditionConfig[tyre.condition] : conditionConfig.good;
                const status = tyre.status ? statusConfig[tyre.status] : statusConfig['in-stock'];
                const category = tyre.fleetNumber ? getFleetCategory(tyre.fleetNumber) : null;
                const fleetLink = category && tyre.fleetNumber 
                  ? `/fleet/${category}/${tyre.fleetNumber.toLowerCase()}` 
                  : null;

                return (
                  <div
                    key={tyre.id}
                    className={cn(
                      'bg-dark-900/70 backdrop-blur-xl border rounded-xl p-4',
                      'hover:border-primary-500/25 transition-all duration-200',
                      tyre.condition === 'replace' || tyre.condition === 'worn'
                        ? 'border-warning-500/20'
                        : 'border-primary-500/10'
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
                              <span className="text-primary-400 font-medium">{tyre.fleetNumber}</span>
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

                      {/* Navigate to Fleet Button */}
                      {fleetLink ? (
                        <Link
                          href={fleetLink}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-colors text-sm"
                        >
                          View in {tyre.fleetNumber}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      ) : (
                        <span className="text-xs text-dark-500 px-3 py-2">Unallocated</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
