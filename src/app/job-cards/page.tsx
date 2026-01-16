'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, Button, Tabs, Badge } from '@/components/ui';
import { JobCardList } from '@/components/job-cards';
import { Plus, Filter, Download } from 'lucide-react';
import type { JobCard } from '@/types';

// Mock data
const mockJobCards: JobCard[] = [
  {
    id: '1',
    jobNumber: '2026-00001',
    vehicleId: 'v1',
    fleetNumber: '21H',
    title: 'Brake Pad Replacement',
    description: 'Front brake pads worn, replacement required. Also inspect brake discs for wear.',
    jobType: 'repair',
    priority: 'high',
    status: 'in-progress',
    assignedTechnicianName: 'Mike Johnson',
    estimatedHours: 4,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    jobNumber: '2026-00002',
    vehicleId: 'v2',
    fleetNumber: '32H',
    title: '45,000km Full Service',
    description: 'Scheduled major service including all filters, fluids, and comprehensive inspection.',
    jobType: 'maintenance',
    priority: 'medium',
    status: 'open',
    assignedTechnicianName: 'John Smith',
    estimatedHours: 8,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    jobNumber: '2026-00003',
    vehicleId: 'v3',
    fleetNumber: '4F',
    title: 'Reefer Unit Repair',
    description: 'Refrigeration unit not maintaining temperature. Suspected compressor issue.',
    jobType: 'repair',
    priority: 'urgent',
    status: 'pending-parts',
    assignedTechnicianName: 'David Lee',
    estimatedHours: 6,
    partsCost: 12500,
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    jobNumber: '2026-00004',
    vehicleId: 'v4',
    fleetNumber: '23H',
    title: 'Annual COF Preparation',
    description: 'Prepare vehicle for annual Certificate of Fitness inspection.',
    jobType: 'inspection',
    priority: 'high',
    status: 'open',
    estimatedHours: 3,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    jobNumber: '2025-00089',
    vehicleId: 'v5',
    fleetNumber: '26H',
    title: 'Oil Leak Repair',
    description: 'Engine oil leak detected during inspection. Sump gasket replacement.',
    jobType: 'repair',
    priority: 'medium',
    status: 'completed',
    assignedTechnicianName: 'Mike Johnson',
    estimatedHours: 5,
    actualHours: 4.5,
    laborCost: 1800,
    partsCost: 450,
    totalCost: 2250,
    completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function JobCardsPage() {
  const [activeTab, setActiveTab] = useState('active');

  const activeJobCards = mockJobCards.filter(j => !['completed', 'closed'].includes(j.status));
  const completedJobCards = mockJobCards.filter(j => ['completed', 'closed'].includes(j.status));

  const tabs = [
    { id: 'active', label: 'Active', count: activeJobCards.length },
    { id: 'completed', label: 'Completed', count: completedJobCards.length },
    { id: 'all', label: 'All', count: mockJobCards.length },
  ];

  const filteredJobCards = activeTab === 'active' 
    ? activeJobCards 
    : activeTab === 'completed'
    ? completedJobCards
    : mockJobCards;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Job Cards</h1>
            <p className="text-dark-400 mt-1">Manage work orders and repairs</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button>
              <Plus className="w-4 h-4" />
              New Job Card
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <p className="text-sm text-dark-400">Open</p>
            <p className="text-2xl font-bold text-white mt-1">
              {mockJobCards.filter(j => j.status === 'open').length}
            </p>
          </Card>
          <Card className="border-warning-500/20">
            <p className="text-sm text-dark-400">In Progress</p>
            <p className="text-2xl font-bold text-warning-500 mt-1">
              {mockJobCards.filter(j => j.status === 'in-progress').length}
            </p>
          </Card>
          <Card className="border-warning-500/20">
            <p className="text-sm text-dark-400">Pending Parts</p>
            <p className="text-2xl font-bold text-warning-500 mt-1">
              {mockJobCards.filter(j => j.status === 'pending-parts').length}
            </p>
          </Card>
          <Card className="border-success-500/20">
            <p className="text-sm text-dark-400">Completed (30d)</p>
            <p className="text-2xl font-bold text-success-500 mt-1">23</p>
          </Card>
          <Card>
            <p className="text-sm text-dark-400">Avg. Completion</p>
            <p className="text-2xl font-bold text-white mt-1">2.4 days</p>
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

          <JobCardList 
            jobCards={filteredJobCards}
            onJobCardClick={(jobCard) => console.log('Clicked:', jobCard)}
          />
        </Card>
      </div>
    </MainLayout>
  );
}
