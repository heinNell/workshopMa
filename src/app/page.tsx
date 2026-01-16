'use client';

import { FleetOverviewCard, RecentActivity, StatCard, UpcomingSchedule } from '@/components/dashboard';
import { MainLayout } from '@/components/layout';
import { Button, Card, CardHeader, CardTitle } from '@/components/ui';
import { useFaultStats } from '@/hooks/useFaults';
import { useInspectionStats } from '@/hooks/useInspections';
import { useInventoryStats } from '@/hooks/useInventory';
import { useJobCardStats } from '@/hooks/useJobCards';
import { useOverdueMaintenance } from '@/hooks/useScheduledMaintenance';
import { useFleetSummary } from '@/hooks/useVehicles';
import
  {
    AlertTriangle,
    Calendar,
    Circle,
    ClipboardCheck,
    FileText,
    Package,
    TrendingUp,
    Truck
  } from 'lucide-react';
import { useMemo } from 'react';

export default function DashboardPage() {
  // Fetch real data from Supabase
  const { data: fleetSummary, loading: fleetLoading } = useFleetSummary();
  const { data: inspectionStats, loading: inspectionsLoading } = useInspectionStats();
  const { data: jobCardStats, loading: jobCardsLoading } = useJobCardStats();
  const { data: faultStats, loading: faultsLoading } = useFaultStats();
  const { data: inventoryStats, loading: inventoryLoading } = useInventoryStats();
  const { data: overdueMaintenance } = useOverdueMaintenance();

  const isLoading = fleetLoading || inspectionsLoading || jobCardsLoading || faultsLoading || inventoryLoading;

  // Use a deterministic timestamp to avoid server/client render mismatches during hydration
  const fallbackTimestamp = '2024-01-01T00:00:00.000Z';
  const referenceNow = useMemo(() => new Date(fallbackTimestamp), [fallbackTimestamp]);

  // Calculate totals from fleet summary
  const totalFleet = useMemo(() => {
    return fleetSummary.reduce((sum, cat) => sum + cat.total, 0);
  }, [fleetSummary]);

  const totalActive = useMemo(() => {
    return fleetSummary.reduce((sum, cat) => sum + cat.active, 0);
  }, [fleetSummary]);

  // Calculate active job cards (open + in-progress)
  const activeJobCards = (jobCardStats?.open || 0) + (jobCardStats?.inProgress || 0);

  // Calculate pending inspections
  const pendingInspections = inspectionStats?.scheduled || 0;

  // Calculate open faults
  const openFaults = (faultStats?.open || 0) + (faultStats?.inProgress || 0);

  // Mock activities - in a real app, you'd create a hook for this
  const mockActivities = [
    {
      id: '1',
      type: 'inspection' as const,
      title: 'System Ready',
      description: 'Connected to Supabase database',
      fleetNumber: '-',
      status: 'completed',
      timestamp: fallbackTimestamp,
    },
  ];

  // Convert overdue maintenance to schedule items
  const scheduleItems = useMemo(() => {
    return overdueMaintenance.slice(0, 5).map(item => ({
      id: item.id,
      type: 'maintenance' as const,
      title: item.maintenance_type,
      fleetNumber: item.fleet_number || '-',
      dueDate: item.next_due_date || fallbackTimestamp,
      priority:
        item.next_due_date && new Date(item.next_due_date) < referenceNow
          ? ('urgent' as const)
          : ('medium' as const),
    }));
  }, [overdueMaintenance, fallbackTimestamp, referenceNow]);

  // Map fleet summary to expected format
  const fleetStats = useMemo(() => {
    return fleetSummary.map(cat => ({
      category: cat.category as 'horses' | 'reefers' | 'interlinks' | 'ridgets' | 'bakkies',
      total: cat.total,
      active: cat.active,
      inMaintenance: cat.maintenance,
      openIssues: 0, // Would need a separate query for this
    }));
  }, [fleetSummary]);
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-dark-400 mt-1">Welcome to Workshop Fleet Manager</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary">
              <Calendar className="w-4 h-4" />
              Schedule
            </Button>
            <Button>
              <FileText className="w-4 h-4" />
              New Job Card
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Fleet"
            value={isLoading ? '-' : totalFleet.toString()}
            icon={<Truck className="w-5 h-5" />}
            variant="primary"
            change={totalActive > 0 ? { value: Math.round((totalActive / totalFleet) * 100), trend: 'up' } : undefined}
          />
          <StatCard
            title="Active Job Cards"
            value={isLoading ? '-' : activeJobCards.toString()}
            icon={<FileText className="w-5 h-5" />}
            variant="warning"
          />
          <StatCard
            title="Pending Inspections"
            value={isLoading ? '-' : pendingInspections.toString()}
            icon={<ClipboardCheck className="w-5 h-5" />}
            variant="default"
          />
          <StatCard
            title="Open Faults"
            value={isLoading ? '-' : openFaults.toString()}
            icon={<AlertTriangle className="w-5 h-5" />}
            variant="danger"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Fleet Overview - Takes 1 column */}
          <FleetOverviewCard fleetStats={fleetStats.length > 0 ? fleetStats : []} />

          {/* Recent Activity - Takes 1 column */}
          <RecentActivity activities={mockActivities} />

          {/* Upcoming Schedule - Takes 1 column */}
          <UpcomingSchedule items={scheduleItems.length > 0 ? scheduleItems : []} />
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Inventory Items"
            value={isLoading ? '-' : (inventoryStats?.totalItems || 0).toString()}
            icon={<Circle className="w-5 h-5" />}
            variant="default"
          />
          <StatCard
            title="Low Stock Items"
            value={isLoading ? '-' : (inventoryStats?.lowStock || 0).toString()}
            icon={<Package className="w-5 h-5" />}
            variant="warning"
          />
          <StatCard
            title="Completed Inspections"
            value={isLoading ? '-' : (inspectionStats?.completed || 0).toString()}
            icon={<ClipboardCheck className="w-5 h-5" />}
            variant="success"
          />
          <StatCard
            title="Inventory Value"
            value={isLoading ? '-' : `R ${((inventoryStats?.totalValue || 0) / 1000).toFixed(0)}K`}
            icon={<TrendingUp className="w-5 h-5" />}
            variant="default"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="secondary" className="h-auto py-4 flex-col gap-2">
              <ClipboardCheck className="w-6 h-6" />
              <span>New Inspection</span>
            </Button>
            <Button variant="secondary" className="h-auto py-4 flex-col gap-2">
              <FileText className="w-6 h-6" />
              <span>Create Job Card</span>
            </Button>
            <Button variant="secondary" className="h-auto py-4 flex-col gap-2">
              <AlertTriangle className="w-6 h-6" />
              <span>Report Fault</span>
            </Button>
            <Button variant="secondary" className="h-auto py-4 flex-col gap-2">
              <Package className="w-6 h-6" />
              <span>Add Inventory</span>
            </Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
