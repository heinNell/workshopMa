'use client';

import { InspectionList } from '@/components/inspections';
import { MainLayout } from '@/components/layout';
import { Badge, Button, Card, CardHeader, Tabs } from '@/components/ui';
import type { Inspection } from '@/types';
import { Calendar, Filter, Plus } from 'lucide-react';
import { useState } from 'react';

// Mock data
const mockInspections: Inspection[] = [
  {
    id: '1',
    vehicleId: 'v1',
    fleetNumber: '21H',
    inspectionType: 'daily',
    status: 'completed',
    scheduledDate: new Date(),
    completedDate: new Date(),
    inspectorName: 'John Smith',
    odometerReading: 245000,
    faultsFound: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    vehicleId: 'v2',
    fleetNumber: '32H',
    inspectionType: 'weekly',
    status: 'completed',
    scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    inspectorName: 'Mike Johnson',
    odometerReading: 189500,
    faultsFound: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    vehicleId: 'v3',
    fleetNumber: '4F',
    inspectionType: 'monthly',
    status: 'scheduled',
    scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    faultsFound: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    vehicleId: 'v4',
    fleetNumber: '1T',
    inspectionType: 'annual',
    status: 'overdue',
    scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    faultsFound: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function InspectionsPage() {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All', count: mockInspections.length },
    { id: 'scheduled', label: 'Scheduled', count: mockInspections.filter(i => i.status === 'scheduled').length },
    { id: 'overdue', label: 'Overdue', count: mockInspections.filter(i => i.status === 'overdue').length },
    { id: 'completed', label: 'Completed', count: mockInspections.filter(i => i.status === 'completed').length },
  ];

  const filteredInspections = activeTab === 'all' 
    ? mockInspections 
    : mockInspections.filter(i => i.status === activeTab);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Inspections</h1>
            <p className="text-dark-400 mt-1">Manage vehicle inspections and schedules</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary">
              <Calendar className="w-4 h-4" />
              Schedule
            </Button>
            <Button>
              <Plus className="w-4 h-4" />
              New Inspection
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-400">Today</p>
                <p className="text-2xl font-bold text-white mt-1">5</p>
              </div>
              <Badge variant="info">Scheduled</Badge>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-400">This Week</p>
                <p className="text-2xl font-bold text-white mt-1">18</p>
              </div>
              <Badge variant="success">On Track</Badge>
            </div>
          </Card>
          <Card className="border-warning-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-400">Overdue</p>
                <p className="text-2xl font-bold text-warning-500 mt-1">3</p>
              </div>
              <Badge variant="warning">Action Required</Badge>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-400">Completed (30d)</p>
                <p className="text-2xl font-bold text-white mt-1">47</p>
              </div>
              <Badge variant="success">94%</Badge>
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

          <InspectionList 
            inspections={filteredInspections}
            onInspectionClick={(inspection) => console.log('Clicked:', inspection)}
          />
        </Card>
      </div>
    </MainLayout>
  );
}
