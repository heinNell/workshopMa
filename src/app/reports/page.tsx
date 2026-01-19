'use client';

import { MainLayout } from '@/components/layout';
import { Button, Card, CardDescription, CardHeader, CardTitle, Select, TabPanel, Tabs } from '@/components/ui';
import { useInspectionStats } from '@/hooks/useInspections';
import { useInventoryStats } from '@/hooks/useInventory';
import { useJobCardStats } from '@/hooks/useJobCards';
import { useTyreStats } from '@/hooks/useTyres';
import { FLEET_CATEGORIES } from '@/lib/constants';
import
  {
    AlertTriangle,
    BarChart3,
    Circle,
    ClipboardCheck,
    Download, Loader2, Package,
    TrendingUp,
    Wrench
  } from 'lucide-react';
import { useState } from 'react';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch real stats from Supabase
  const { data: inspectionStats, loading: inspectionsLoading } = useInspectionStats();
  const { data: jobCardStats, loading: jobCardsLoading } = useJobCardStats();
  const { data: tyreStats, loading: tyresLoading } = useTyreStats();
  const { data: inventoryStats, loading: inventoryLoading } = useInventoryStats();

  const isLoading = inspectionsLoading || jobCardsLoading || tyresLoading || inventoryLoading;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'inspections', label: 'Inspections', icon: ClipboardCheck },
    { id: 'job-cards', label: 'Job Cards', icon: Wrench },
    { id: 'tyres', label: 'Tyres', icon: Circle },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'costs', label: 'Costs', icon: TrendingUp },
  ];

  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...FLEET_CATEGORIES.map((c) => ({ value: c.id, label: c.label })),
  ];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
            <p className="text-dark-400 mt-1">Comprehensive fleet performance insights</p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              options={dateRangeOptions}
            />
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={categoryOptions}
            />
            <Button variant="secondary">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <div className="flex items-center gap-2 text-dark-400 text-sm">
              <ClipboardCheck className="w-4 h-4" />
              Inspections
            </div>
            <p className="text-2xl font-bold text-white mt-1">{inspectionStats.total}</p>
            <div className="flex items-center gap-1 text-sm mt-1 text-dark-400">
              <span>{inspectionStats.completed} completed</span>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 text-dark-400 text-sm">
              <Wrench className="w-4 h-4" />
              Job Cards
            </div>
            <p className="text-2xl font-bold text-white mt-1">{jobCardStats.total}</p>
            <div className="flex items-center gap-1 text-sm mt-1 text-dark-400">
              <span>{jobCardStats.completed} completed</span>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 text-dark-400 text-sm">
              <Circle className="w-4 h-4" />
              Tyres
            </div>
            <p className="text-2xl font-bold text-white mt-1">{tyreStats.total}</p>
            <div className={`flex items-center gap-1 text-sm mt-1 ${tyreStats.needsReplacement > 0 ? 'text-warning-500' : 'text-dark-400'}`}>
              <span>{tyreStats.needsReplacement} need replacement</span>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 text-dark-400 text-sm">
              <Package className="w-4 h-4" />
              Inventory Items
            </div>
            <p className="text-2xl font-bold text-white mt-1">{inventoryStats.totalItems}</p>
            <div className={`flex items-center gap-1 text-sm mt-1 ${inventoryStats.lowStock > 0 ? 'text-warning-500' : 'text-dark-400'}`}>
              <span>{inventoryStats.lowStock} low stock</span>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 text-dark-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              Inventory Value
            </div>
            <p className="text-2xl font-bold text-white mt-1">R{(inventoryStats.totalValue / 1000).toFixed(0)}k</p>
            <div className="flex items-center gap-1 text-sm mt-1 text-dark-400">
              <span>{inventoryStats.categories} categories</span>
            </div>
          </Card>

          <Card className={inspectionStats.overdue > 0 ? 'border-warning-500/20' : ''}>
            <div className="flex items-center gap-2 text-dark-400 text-sm">
              <AlertTriangle className="w-4 h-4" />
              Overdue
            </div>
            <p className={`text-2xl font-bold mt-1 ${inspectionStats.overdue > 0 ? 'text-warning-500' : 'text-white'}`}>
              {inspectionStats.overdue}
            </p>
            <div className="flex items-center gap-1 text-sm mt-1 text-dark-400">
              <span>inspections overdue</span>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <TabPanel activeTab={activeTab} tabId="overview">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Fleet Health Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Fleet Health Overview</CardTitle>
                <CardDescription>Vehicle status distribution</CardDescription>
              </CardHeader>
              <div className="space-y-4">
                {FLEET_CATEGORIES.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-dark-300">{category.label}</span>
                      <span className="text-white">{category.fleetNumbers.length} vehicles</span>
                    </div>
                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-success-500 to-success-400 rounded-full"
                        style={{ width: `${85 + Math.random() * 15}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Maintenance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Trends</CardTitle>
                <CardDescription>Monthly maintenance activities</CardDescription>
              </CardHeader>
              <div className="h-64 flex items-center justify-center text-dark-400">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Chart visualization would render here</p>
                  <p className="text-sm mt-1">Using Recharts library</p>
                </div>
              </div>
            </Card>

            {/* Top Issues */}
            <Card>
              <CardHeader>
                <CardTitle>Top Issues This Month</CardTitle>
                <CardDescription>Most common fault categories</CardDescription>
              </CardHeader>
              <div className="space-y-3">
                {[
                  { category: 'Brakes', count: 12, percentage: 28 },
                  { category: 'Tyres', count: 9, percentage: 21 },
                  { category: 'Engine', count: 7, percentage: 16 },
                  { category: 'Electrical', count: 6, percentage: 14 },
                  { category: 'Suspension', count: 5, percentage: 12 },
                ].map((issue) => (
                  <div key={issue.category} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-dark-300">{issue.category}</div>
                    <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                        style={{ width: `${issue.percentage}%` }}
                      />
                    </div>
                    <div className="w-16 text-right text-sm text-white">{issue.count} issues</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Summary</CardTitle>
                <CardDescription>Current status breakdown</CardDescription>
              </CardHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-dark-800/50 border border-primary-500/10">
                  <div className="flex items-center gap-2 text-dark-400 text-sm mb-2">
                    <ClipboardCheck className="w-4 h-4" />
                    Inspections
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-dark-400">Completed</p>
                      <p className="text-white font-semibold">{inspectionStats.completed}</p>
                    </div>
                    <div>
                      <p className="text-dark-400">Overdue</p>
                      <p className={`font-semibold ${inspectionStats.overdue > 0 ? 'text-warning-500' : 'text-success-500'}`}>{inspectionStats.overdue}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-dark-800/50 border border-primary-500/10">
                  <div className="flex items-center gap-2 text-dark-400 text-sm mb-2">
                    <Wrench className="w-4 h-4" />
                    Job Cards
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-dark-400">Completed</p>
                      <p className="text-white font-semibold">{jobCardStats.completed}</p>
                    </div>
                    <div>
                      <p className="text-dark-400">In Progress</p>
                      <p className="text-primary-400 font-semibold">{jobCardStats.inProgress}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-dark-800/50 border border-primary-500/10">
                  <div className="flex items-center gap-2 text-dark-400 text-sm mb-2">
                    <Circle className="w-4 h-4" />
                    Tyres
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-dark-400">In Use</p>
                      <p className="text-white font-semibold">{tyreStats.inUse}</p>
                    </div>
                    <div>
                      <p className="text-dark-400">In Stock</p>
                      <p className="text-success-500 font-semibold">{tyreStats.inStock}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-dark-800/50 border border-primary-500/10">
                  <div className="flex items-center gap-2 text-dark-400 text-sm mb-2">
                    <Package className="w-4 h-4" />
                    Inventory
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-dark-400">Total Items</p>
                      <p className="text-white font-semibold">{inventoryStats.totalItems}</p>
                    </div>
                    <div>
                      <p className="text-dark-400">Low Stock</p>
                      <p className={`font-semibold ${inventoryStats.lowStock > 0 ? 'text-warning-500' : 'text-success-500'}`}>{inventoryStats.lowStock}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="inspections">
          <Card>
            <CardHeader>
              <CardTitle>Inspection Reports</CardTitle>
              <CardDescription>Detailed inspection analytics and history</CardDescription>
            </CardHeader>
            <div className="py-12 text-center text-dark-400">
              <ClipboardCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Inspection reports and analytics will be displayed here</p>
              <p className="text-sm mt-2">Including completion rates, common issues, and trends</p>
            </div>
          </Card>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="job-cards">
          <Card>
            <CardHeader>
              <CardTitle>Job Card Reports</CardTitle>
              <CardDescription>Work order analytics and technician performance</CardDescription>
            </CardHeader>
            <div className="py-12 text-center text-dark-400">
              <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Job card reports and analytics will be displayed here</p>
              <p className="text-sm mt-2">Including turnaround times, cost analysis, and technician metrics</p>
            </div>
          </Card>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="tyres">
          <Card>
            <CardHeader>
              <CardTitle>Tyre Reports</CardTitle>
              <CardDescription>Tyre lifecycle and performance analytics</CardDescription>
            </CardHeader>
            <div className="py-12 text-center text-dark-400">
              <Circle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Tyre reports and analytics will be displayed here</p>
              <p className="text-sm mt-2">Including wear patterns, brand comparison, and replacement forecasts</p>
            </div>
          </Card>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Reports</CardTitle>
              <CardDescription>Stock levels and usage analytics</CardDescription>
            </CardHeader>
            <div className="py-12 text-center text-dark-400">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Inventory reports and analytics will be displayed here</p>
              <p className="text-sm mt-2">Including usage trends, reorder recommendations, and cost analysis</p>
            </div>
          </Card>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="costs">
          <Card>
            <CardHeader>
              <CardTitle>Cost Analysis</CardTitle>
              <CardDescription>Maintenance and operational cost breakdown</CardDescription>
            </CardHeader>
            <div className="py-12 text-center text-dark-400">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Cost analysis reports will be displayed here</p>
              <p className="text-sm mt-2">Including per-vehicle costs, category breakdowns, and budget tracking</p>
            </div>
          </Card>
        </TabPanel>
      </div>
    </MainLayout>
  );
}
