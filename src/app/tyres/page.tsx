'use client';

import { MainLayout } from '@/components/layout';
import { TyreList } from '@/components/tyres';
import { Button, Card, CardHeader, Tabs } from '@/components/ui';
import type { Tyre } from '@/types';
import { Circle, Filter, Plus, RotateCcw } from 'lucide-react';
import { useState } from 'react';

// Mock data
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

export default function TyresPage() {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All Tyres', count: mockTyres.length },
    { id: 'in-use', label: 'In Use', count: mockTyres.filter(t => t.status === 'in-use').length },
    { id: 'in-stock', label: 'In Stock', count: mockTyres.filter(t => t.status === 'in-stock').length },
    { id: 'retreading', label: 'Retreading', count: mockTyres.filter(t => t.status === 'retreading').length },
  ];

  const filteredTyres = activeTab === 'all' 
    ? mockTyres 
    : mockTyres.filter(t => t.status === activeTab);

  const needsAttention = mockTyres.filter(t => t.condition === 'worn' || t.condition === 'replace').length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Tyre Management</h1>
            <p className="text-dark-400 mt-1">Track and manage fleet tyres</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary">
              <RotateCcw className="w-4 h-4" />
              Rotate Tyres
            </Button>
            <Button>
              <Plus className="w-4 h-4" />
              Add Tyre
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-500/10">
                <Circle className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Total Tyres</p>
                <p className="text-xl font-bold text-white">{mockTyres.length}</p>
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
                  {mockTyres.filter(t => t.condition === 'new' || t.condition === 'good').length}
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
                  {mockTyres.filter(t => t.status === 'retreading').length}
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
                  {mockTyres.filter(t => t.status === 'in-stock').length}
                </p>
              </div>
            </div>
          </Card>
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

          <TyreList 
            tyres={filteredTyres}
            onTyreClick={(tyre) => console.log('Clicked:', tyre)}
          />
        </Card>
      </div>
    </MainLayout>
  );
}
