'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardDescription, Button, Tabs, TabPanel, Select } from '@/components/ui';
import { FLEET_CATEGORIES } from '@/lib/constants';
import {
  BarChart3,
  Download,
  Calendar,
  Truck,
  ClipboardCheck,
  Wrench,
  Circle,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileText,
} from 'lucide-react';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  // Mock summary data
  const summaryData = {
    totalInspections: 156,
    inspectionTrend: 12,
    completedJobCards: 89,
    jobCardTrend: -5,
    tyresReplaced: 24,
    tyreTrend: 8,
    partsUsed: 342,
    partsTrend: 15,
    totalCost: 245890,
    costTrend: -8,
    avgRepairTime: 4.2,
    repairTimeTrend: -12,
  };

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
            <p className="text-2xl font-bold text-white mt-1">{summaryData.totalInspections}</p>
            <div className={`flex items-center gap-1 text-sm mt-1 ${summaryData.inspectionTrend >= 0 ? 'text-success-500' : 'text-error-500'}`}>
              {summaryData.inspectionTrend >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(summaryData.inspectionTrend)}%
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 text-dark-400 text-sm">
              <Wrench className="w-4 h-4" />
              Job Cards
            </div>
            <p className="text-2xl font-bold text-white mt-1">{summaryData.completedJobCards}</p>
            <div className={`flex items-center gap-1 text-sm mt-1 ${summaryData.jobCardTrend >= 0 ? 'text-success-500' : 'text-error-500'}`}>
              {summaryData.jobCardTrend >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(summaryData.jobCardTrend)}%
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 text-dark-400 text-sm">
              <Circle className="w-4 h-4" />
              Tyres Replaced
            </div>
            <p className="text-2xl font-bold text-white mt-1">{summaryData.tyresReplaced}</p>
            <div className={`flex items-center gap-1 text-sm mt-1 ${summaryData.tyreTrend >= 0 ? 'text-success-500' : 'text-error-500'}`}>
              {summaryData.tyreTrend >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(summaryData.tyreTrend)}%
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 text-dark-400 text-sm">
              <Package className="w-4 h-4" />
              Parts Used
            </div>
            <p className="text-2xl font-bold text-white mt-1">{summaryData.partsUsed}</p>
            <div className={`flex items-center gap-1 text-sm mt-1 ${summaryData.partsTrend >= 0 ? 'text-success-500' : 'text-error-500'}`}>
              {summaryData.partsTrend >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(summaryData.partsTrend)}%
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 text-dark-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              Total Cost
            </div>
            <p className="text-2xl font-bold text-white mt-1">R{(summaryData.totalCost / 1000).toFixed(0)}k</p>
            <div className={`flex items-center gap-1 text-sm mt-1 ${summaryData.costTrend <= 0 ? 'text-success-500' : 'text-error-500'}`}>
              {summaryData.costTrend <= 0 ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <TrendingUp className="w-3 h-3" />
              )}
              {Math.abs(summaryData.costTrend)}%
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 text-dark-400 text-sm">
              <Calendar className="w-4 h-4" />
              Avg Repair Time
            </div>
            <p className="text-2xl font-bold text-white mt-1">{summaryData.avgRepairTime}h</p>
            <div className={`flex items-center gap-1 text-sm mt-1 ${summaryData.repairTimeTrend <= 0 ? 'text-success-500' : 'text-error-500'}`}>
              {summaryData.repairTimeTrend <= 0 ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <TrendingUp className="w-3 h-3" />
              )}
              {Math.abs(summaryData.repairTimeTrend)}%
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
                <CardDescription>Last 30 days activity breakdown</CardDescription>
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
                      <p className="text-white font-semibold">142</p>
                    </div>
                    <div>
                      <p className="text-dark-400">Overdue</p>
                      <p className="text-warning-500 font-semibold">3</p>
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
                      <p className="text-white font-semibold">89</p>
                    </div>
                    <div>
                      <p className="text-dark-400">In Progress</p>
                      <p className="text-primary-400 font-semibold">12</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-dark-800/50 border border-primary-500/10">
                  <div className="flex items-center gap-2 text-dark-400 text-sm mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    Faults
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-dark-400">Reported</p>
                      <p className="text-white font-semibold">28</p>
                    </div>
                    <div>
                      <p className="text-dark-400">Resolved</p>
                      <p className="text-success-500 font-semibold">25</p>
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
                      <p className="text-dark-400">Items Used</p>
                      <p className="text-white font-semibold">342</p>
                    </div>
                    <div>
                      <p className="text-dark-400">Low Stock</p>
                      <p className="text-warning-500 font-semibold">5</p>
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
