'use client';

import { StatCard } from '@/components/dashboard';
import { FaultForm, FaultList } from '@/components/faults';
import { InspectionFormModal, InspectionList } from '@/components/inspections';
import { JobCardFormModal, JobCardList } from '@/components/job-cards';
import { MainLayout } from '@/components/layout';
import { MaintenanceForm, MaintenanceList } from '@/components/maintenance';
import { TyreAllocationForm, TyreDiagram, TyreEditForm, TyreHistoryList, TyreList } from '@/components/tyres';
import { Badge, Button, Card, CardHeader, CardTitle, ConfirmModal, StatusBadge, TabPanel, Tabs } from '@/components/ui';
import { useFaultMutations, useFaultsByFleetNumber } from '@/hooks/useFaults';
import { useInspectionMutations, useInspectionsByFleetNumber } from '@/hooks/useInspections';
import { useJobCardMutations, useJobCardsByFleetNumber } from '@/hooks/useJobCards';
import { useMaintenanceMutations, useScheduledMaintenanceByFleetNumber } from '@/hooks/useScheduledMaintenance';
import { useTyreHistoryByFleetNumber, useTyresByFleetNumber } from '@/hooks/useTyres';
import { useVehicleByFleetNumber } from '@/hooks/useVehicles';
import { getCategoryConfig, type FleetCategory } from '@/lib/constants';
import
  {
    transformFault,
    transformInspection,
    transformJobCard,
    transformScheduledMaintenance,
    transformTyre,
    transformTyreHistory,
  } from '@/lib/transforms';
import { formatDate } from '@/lib/utils';
import type { Fault, Inspection, JobCard, ScheduledMaintenance, Tyre, TyreAllocationFormData } from '@/types';
import
  {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    Circle,
    ClipboardCheck,
    Clock,
    FileText,
    History,
    Loader2,
    Plus,
    Settings,
    TrendingUp,
    Truck,
    Wrench,
  } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';

export default function VehicleDashboardPage() {
  const params = useParams();
  const category = params.category as FleetCategory;
  const fleetNumber = (params.fleetNumber as string).toUpperCase();

  const [activeTab, setActiveTab] = useState('overview');
  const [tyreAllocationOpen, setTyreAllocationOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  
  // Tyre edit/delete state
  const [tyreEditOpen, setTyreEditOpen] = useState(false);
  const [tyreDeleteOpen, setTyreDeleteOpen] = useState(false);
  const [selectedTyre, setSelectedTyre] = useState<Tyre | null>(null);

  // Fault CRUD state
  const [faultFormOpen, setFaultFormOpen] = useState(false);
  const [faultDeleteOpen, setFaultDeleteOpen] = useState(false);
  const [selectedFault, setSelectedFault] = useState<Fault | null>(null);
  const [faultFormMode, setFaultFormMode] = useState<'create' | 'edit'>('create');

  // Maintenance CRUD state
  const [maintenanceFormOpen, setMaintenanceFormOpen] = useState(false);
  const [maintenanceDeleteOpen, setMaintenanceDeleteOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<ScheduledMaintenance | null>(null);
  const [maintenanceFormMode, setMaintenanceFormMode] = useState<'create' | 'edit'>('create');

  // Job Card CRUD state
  const [jobCardFormOpen, setJobCardFormOpen] = useState(false);
  const [jobCardDeleteOpen, setJobCardDeleteOpen] = useState(false);
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null);
  const [jobCardFormMode, setJobCardFormMode] = useState<'create' | 'edit'>('create');

  // Inspection CRUD state
  const [inspectionFormOpen, setInspectionFormOpen] = useState(false);
  const [inspectionDeleteOpen, setInspectionDeleteOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [inspectionFormMode, setInspectionFormMode] = useState<'create' | 'edit'>('create');

  // Fetch data from Supabase
  const { data: vehicleRow, loading: vehicleLoading, error: vehicleError } = useVehicleByFleetNumber(fleetNumber);
  const { data: inspectionRows, loading: inspectionsLoading } = useInspectionsByFleetNumber(fleetNumber);
  const { data: jobCardRows, loading: jobCardsLoading } = useJobCardsByFleetNumber(fleetNumber);
  const { data: faultRows, loading: faultsLoading } = useFaultsByFleetNumber(fleetNumber);
  const { data: tyreRows, loading: tyresLoading } = useTyresByFleetNumber(fleetNumber);
  const { data: tyreHistoryRows, loading: tyreHistoryLoading } = useTyreHistoryByFleetNumber(fleetNumber);
  const { data: maintenanceRows, loading: maintenanceLoading } = useScheduledMaintenanceByFleetNumber(fleetNumber);

  // Mutation hooks
  const { deleteFault, createFault, updateFault, loading: faultMutationLoading } = useFaultMutations();
  const { deleteMaintenance, createMaintenance, updateMaintenance, loading: maintenanceMutationLoading } = useMaintenanceMutations();
  const { deleteJobCard, createJobCard, updateJobCard, updateJobCardStatus, loading: jobCardMutationLoading } = useJobCardMutations();
  const { deleteInspection, createInspection, updateInspection, startInspection, loading: inspectionMutationLoading } = useInspectionMutations();

  const categoryConfig = getCategoryConfig(category);

  // Transform data from database rows to frontend types
  const inspections = useMemo(() => inspectionRows.map(transformInspection), [inspectionRows]);
  const jobCards = useMemo(() => jobCardRows.map(transformJobCard), [jobCardRows]);
  const faults = useMemo(() => faultRows.map(transformFault), [faultRows]);
  const tyres = useMemo(() => tyreRows.map(transformTyre), [tyreRows]);
  const tyreHistory = useMemo(() => tyreHistoryRows.map(transformTyreHistory), [tyreHistoryRows]);
  const scheduledMaintenance = useMemo(() => maintenanceRows.map(transformScheduledMaintenance), [maintenanceRows]);

  // Calculate stats
  const vehicleStats = useMemo(() => ({
    status: vehicleRow?.status || 'active',
    totalInspections: inspections.length,
    completedInspections: inspections.filter(i => i.status === 'completed').length,
    openJobCards: jobCards.filter(jc => jc.status !== 'completed' && jc.status !== 'closed').length,
    activeFaults: faults.filter(f => f.status !== 'resolved').length,
    lastInspection: inspections.find(i => i.status === 'completed')?.completedDate,
    nextMaintenance: scheduledMaintenance.find(m => m.status !== 'completed')?.scheduledDate,
    mileage: vehicleRow?.current_odometer || 0,
  }), [vehicleRow, inspections, jobCards, faults, scheduledMaintenance]);

  // Loading state
  if (vehicleLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
            <p className="text-dark-400">Loading vehicle data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (vehicleError || !vehicleRow) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Vehicle Not Found</h1>
            <p className="text-dark-400">The requested vehicle does not exist in the database.</p>
            <Link href={`/fleet/${category}`} className="mt-4 inline-block text-primary-400 hover:text-primary-300">
              Return to {categoryConfig?.label || 'Fleet'}
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'inspections', label: 'Inspections', icon: ClipboardCheck },
    { id: 'job-cards', label: 'Job Cards', icon: FileText },
    { id: 'faults', label: 'Faults', icon: AlertTriangle },
    { id: 'tyres', label: 'Tyres', icon: Circle },
    { id: 'maintenance', label: 'Maintenance', icon: Calendar },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Back Navigation & Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/fleet/${category}`}
              className="p-2 rounded-lg bg-dark-800/50 border border-primary-500/10 hover:border-primary-500/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-dark-400" />
            </Link>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/20">
                <Truck className="w-8 h-8 text-primary-400" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-white">{fleetNumber}</h1>
                  <StatusBadge status={vehicleStats.status} />
                </div>
                <p className="text-dark-400">
                  {vehicleRow.make} {vehicleRow.model} {vehicleRow.year && `(${vehicleRow.year})`} - {categoryConfig?.description}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
              Configure
            </Button>
            <Button 
              variant="secondary"
              onClick={() => {
                setSelectedInspection(null);
                setInspectionFormMode('create');
                setInspectionFormOpen(true);
              }}
            >
              <ClipboardCheck className="w-4 h-4" />
              New Inspection
            </Button>
            <Button
              onClick={() => {
                setSelectedJobCard(null);
                setJobCardFormMode('create');
                setJobCardFormOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              Create Job Card
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Inspections"
            value={vehicleStats.totalInspections}
            icon={ClipboardCheck}
            trend={vehicleStats.completedInspections > 0 ? { value: vehicleStats.completedInspections, isPositive: true } : undefined}
          />
          <StatCard
            title="Open Job Cards"
            value={vehicleStats.openJobCards}
            icon={Wrench}
          />
          <StatCard
            title="Active Faults"
            value={vehicleStats.activeFaults}
            icon={AlertTriangle}
            className={vehicleStats.activeFaults > 0 ? 'border-warning-500/20' : ''}
          />
          <StatCard
            title="Mileage (km)"
            value={vehicleStats.mileage.toLocaleString()}
            icon={TrendingUp}
          />
          <Card>
            <div className="flex items-center gap-2 text-dark-400 text-sm">
              <Clock className="w-4 h-4" />
              Last Inspection
            </div>
            <p className="text-white font-semibold mt-1">
              {vehicleStats.lastInspection ? formatDate(vehicleStats.lastInspection) : 'N/A'}
            </p>
          </Card>
          <Card>
            <div className="flex items-center gap-2 text-dark-400 text-sm">
              <Calendar className="w-4 h-4" />
              Next Maintenance
            </div>
            <p className="text-white font-semibold mt-1">
              {vehicleStats.nextMaintenance ? formatDate(vehicleStats.nextMaintenance) : 'N/A'}
            </p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <TabPanel activeTab={activeTab} tabId="overview">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Tyre Status */}
            <Card>
              <CardHeader>
                <CardTitle>Tyre Status</CardTitle>
              </CardHeader>
              <div className="flex justify-center py-4">
                {tyresLoading ? (
                  <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                ) : tyres.length > 0 ? (
                  <TyreDiagram
                    tyres={tyres}
                    vehicleType={category === 'horses' ? 'truck' : category === 'interlinks' ? 'interlink' : 'trailer'}
                    onTyreClick={(tyre) => console.log('Tyre clicked:', tyre)}
                  />
                ) : (
                  <p className="text-dark-400">No tyres recorded</p>
                )}
              </div>
            </Card>

            {/* Recent Faults */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Active Faults</CardTitle>
                  <Badge variant="warning">{faults.filter(f => f.status !== 'resolved').length}</Badge>
                </div>
              </CardHeader>
              {faultsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                </div>
              ) : faults.filter(f => f.status !== 'resolved').length === 0 ? (
                <div className="text-center py-8 text-dark-400">
                  No active faults
                </div>
              ) : (
                <div className="space-y-3">
                  {faults.filter(f => f.status !== 'resolved').slice(0, 3).map((fault) => (
                    <div
                      key={fault.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-dark-800/30 border border-primary-500/10"
                    >
                      <AlertTriangle className="w-5 h-5 text-warning-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-white text-sm">{fault.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant={fault.severity === 'critical' ? 'error' : fault.severity === 'high' ? 'warning' : 'default'}
                            size="sm"
                          >
                            {fault.severity}
                          </Badge>
                          <span className="text-xs text-dark-500">
                            {formatDate(fault.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Recent Inspections */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Inspections</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('inspections')}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              {inspectionsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                </div>
              ) : inspections.length === 0 ? (
                <div className="text-center py-8 text-dark-400">
                  No inspections recorded
                </div>
              ) : (
                <div className="space-y-3">
                  {inspections.slice(0, 3).map((inspection) => (
                    <div
                      key={inspection.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-dark-800/30 border border-primary-500/10"
                    >
                      <div className="flex items-center gap-3">
                        <ClipboardCheck className="w-5 h-5 text-primary-400" />
                        <div>
                          <p className="text-white text-sm capitalize">{inspection.inspectionType} Inspection</p>
                          <p className="text-xs text-dark-400">{formatDate(inspection.scheduledDate)}</p>
                        </div>
                      </div>
                      <StatusBadge status={inspection.status} />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Active Job Cards */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Active Job Cards</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('job-cards')}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              {jobCardsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                </div>
              ) : jobCards.filter(jc => jc.status !== 'completed' && jc.status !== 'closed').length === 0 ? (
                <div className="text-center py-8 text-dark-400">
                  No active job cards
                </div>
              ) : (
                <div className="space-y-3">
                  {jobCards.filter(jc => jc.status !== 'completed' && jc.status !== 'closed').slice(0, 3).map((jobCard) => (
                    <div
                      key={jobCard.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-dark-800/30 border border-primary-500/10"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary-400" />
                        <div>
                          <p className="text-white text-sm">{jobCard.title}</p>
                          <p className="text-xs text-dark-400">{jobCard.jobNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={jobCard.priority === 'urgent' ? 'error' : jobCard.priority === 'high' ? 'warning' : 'default'}
                          size="sm"
                        >
                          {jobCard.priority}
                        </Badge>
                        <StatusBadge status={jobCard.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="inspections">
          <div className="space-y-8">
            {/* Section Header with Action Button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Inspection Management</h2>
                <p className="text-sm text-dark-400 mt-1">
                  Schedule and track inspections for {fleetNumber}
                </p>
              </div>
              <Button 
                variant="primary" 
                size="md"
                onClick={() => {
                  setSelectedInspection(null);
                  setInspectionFormMode('create');
                  setInspectionFormOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule Inspection
              </Button>
            </div>

            {/* Inspection Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-dark-800/50 rounded-xl border border-dark-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-500/20 rounded-lg">
                    <ClipboardCheck className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Total Inspections</p>
                    <p className="text-2xl font-bold text-white">{inspections.length}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-xl border border-accent-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent-500/20 rounded-lg">
                    <Calendar className="w-5 h-5 text-accent-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Scheduled</p>
                    <p className="text-2xl font-bold text-accent-400">
                      {inspections.filter(i => i.status === 'scheduled').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-xl border border-success-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success-500/20 rounded-lg">
                    <ClipboardCheck className="w-5 h-5 text-success-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Completed</p>
                    <p className="text-2xl font-bold text-success-400">
                      {inspections.filter(i => i.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-xl border border-danger-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-danger-500/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-danger-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Overdue</p>
                    <p className="text-2xl font-bold text-danger-400">
                      {inspections.filter(i => i.status === 'overdue').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Inspection List */}
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-dark-700">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-primary-400" />
                  <CardTitle>Inspection History</CardTitle>
                </div>
                <Badge variant="default">{inspections.length} inspections</Badge>
              </CardHeader>
              <div className="p-4">
                {inspectionsLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
                  </div>
                ) : inspections.length === 0 ? (
                  <div className="text-center py-16">
                    <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-dark-600" />
                    <h3 className="text-lg font-medium text-white mb-2">No Inspections Recorded</h3>
                    <p className="text-dark-400 mb-6">This vehicle has no inspection history</p>
                    <Button 
                      variant="secondary"
                      onClick={() => {
                        setSelectedInspection(null);
                        setInspectionFormMode('create');
                        setInspectionFormOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule First Inspection
                    </Button>
                  </div>
                ) : (
                  <InspectionList
                    inspections={inspections}
                    showVehicle={false}
                    showActions={true}
                    onInspectionClick={(inspection) => {
                      setSelectedInspection(inspection);
                      setInspectionFormMode('edit');
                      setInspectionFormOpen(true);
                    }}
                    onInspectionEdit={(inspection) => {
                      setSelectedInspection(inspection);
                      setInspectionFormMode('edit');
                      setInspectionFormOpen(true);
                    }}
                    onInspectionDelete={(inspection) => {
                      setSelectedInspection(inspection);
                      setInspectionDeleteOpen(true);
                    }}
                    onInspectionStart={async (inspection) => {
                      await startInspection(inspection.id);
                    }}
                  />
                )}
              </div>
            </Card>

            {/* Inspection Form Modal */}
            <InspectionFormModal
              isOpen={inspectionFormOpen}
              onClose={() => {
                setInspectionFormOpen(false);
                setSelectedInspection(null);
              }}
              onSubmit={async (inspectionData) => {
                const inspectionRow = {
                  vehicle_id: vehicleRow?.id,
                  fleet_number: fleetNumber,
                  inspection_type: inspectionData.inspectionType,
                  status: inspectionData.status || 'scheduled',
                  scheduled_date: inspectionData.scheduledDate instanceof Date
                    ? inspectionData.scheduledDate.toISOString()
                    : inspectionData.scheduledDate,
                  inspector_name: inspectionData.inspectorName,
                  odometer_reading: inspectionData.odometerReading,
                  notes: inspectionData.notes,
                };

                if (inspectionFormMode === 'edit' && selectedInspection?.id) {
                  const { error } = await updateInspection(selectedInspection.id, inspectionRow);
                  if (error) {
                    console.error('Error updating inspection:', error);
                    return;
                  }
                } else {
                  const { error } = await createInspection(inspectionRow);
                  if (error) {
                    console.error('Error creating inspection:', error);
                    return;
                  }
                }
                setInspectionFormOpen(false);
                setSelectedInspection(null);
              }}
              inspection={selectedInspection}
              mode={inspectionFormMode}
              fleetNumber={fleetNumber}
              loading={inspectionMutationLoading}
            />

            {/* Inspection Delete Confirmation */}
            <ConfirmModal
              isOpen={inspectionDeleteOpen}
              onClose={() => {
                setInspectionDeleteOpen(false);
                setSelectedInspection(null);
              }}
              onConfirm={async () => {
                if (selectedInspection?.id) {
                  const { error } = await deleteInspection(selectedInspection.id);
                  if (error) {
                    console.error('Error deleting inspection:', error);
                  }
                }
                setInspectionDeleteOpen(false);
                setSelectedInspection(null);
              }}
              title="Delete Inspection"
              message={`Are you sure you want to delete this inspection? This action cannot be undone.`}
              confirmText="Delete"
              variant="danger"
              loading={inspectionMutationLoading}
            />
          </div>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="job-cards">
          <div className="space-y-8">
            {/* Section Header with Action Button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Job Card Management</h2>
                <p className="text-sm text-dark-400 mt-1">
                  Create and manage work orders for {fleetNumber}
                </p>
              </div>
              <Button 
                variant="primary" 
                size="md"
                onClick={() => {
                  setSelectedJobCard(null);
                  setJobCardFormMode('create');
                  setJobCardFormOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Job Card
              </Button>
            </div>

            {/* Job Card Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 bg-dark-800/50 rounded-xl border border-dark-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-500/20 rounded-lg">
                    <FileText className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Total</p>
                    <p className="text-2xl font-bold text-white">{jobCards.length}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-xl border border-accent-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent-500/20 rounded-lg">
                    <Circle className="w-5 h-5 text-accent-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Open</p>
                    <p className="text-2xl font-bold text-accent-400">
                      {jobCards.filter(j => j.status === 'open').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-xl border border-warning-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning-500/20 rounded-lg">
                    <Wrench className="w-5 h-5 text-warning-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">In Progress</p>
                    <p className="text-2xl font-bold text-warning-400">
                      {jobCards.filter(j => j.status === 'in-progress').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-xl border border-orange-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Pending Parts</p>
                    <p className="text-2xl font-bold text-orange-400">
                      {jobCards.filter(j => j.status === 'pending-parts').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-xl border border-success-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success-500/20 rounded-lg">
                    <ClipboardCheck className="w-5 h-5 text-success-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Completed</p>
                    <p className="text-2xl font-bold text-success-400">
                      {jobCards.filter(j => j.status === 'completed' || j.status === 'closed').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Card List */}
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-dark-700">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-400" />
                  <CardTitle>Job Cards</CardTitle>
                </div>
                <Badge variant="default">{jobCards.length} job cards</Badge>
              </CardHeader>
              <div className="p-4">
                {jobCardsLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
                  </div>
                ) : jobCards.length === 0 ? (
                  <div className="text-center py-16">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-dark-600" />
                    <h3 className="text-lg font-medium text-white mb-2">No Job Cards</h3>
                    <p className="text-dark-400 mb-6">No work orders have been created for this vehicle</p>
                    <Button 
                      variant="secondary"
                      onClick={() => {
                        setSelectedJobCard(null);
                        setJobCardFormMode('create');
                        setJobCardFormOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Job Card
                    </Button>
                  </div>
                ) : (
                  <JobCardList
                    jobCards={jobCards}
                    showVehicle={false}
                    showActions={true}
                    onJobCardClick={(jobCard: JobCard) => {
                      setSelectedJobCard(jobCard);
                      setJobCardFormMode('edit');
                      setJobCardFormOpen(true);
                    }}
                    onJobCardEdit={(jobCard: JobCard) => {
                      setSelectedJobCard(jobCard);
                      setJobCardFormMode('edit');
                      setJobCardFormOpen(true);
                    }}
                    onJobCardDelete={(jobCard: JobCard) => {
                      setSelectedJobCard(jobCard);
                      setJobCardDeleteOpen(true);
                    }}
                    onStatusChange={async (jobCard: JobCard, newStatus: JobCard['status']) => {
                      await updateJobCardStatus(jobCard.id, newStatus);
                    }}
                  />
                )}
              </div>
            </Card>

            {/* Job Card Form Modal */}
            <JobCardFormModal
              isOpen={jobCardFormOpen}
              onClose={() => {
                setJobCardFormOpen(false);
                setSelectedJobCard(null);
              }}
              onSubmit={async (jobCardData: Partial<JobCard>) => {
                const jobCardRow = {
                  vehicle_id: vehicleRow?.id,
                  fleet_number: fleetNumber,
                  title: jobCardData.title,
                  description: jobCardData.description,
                  job_type: jobCardData.jobType,
                  priority: jobCardData.priority,
                  status: jobCardData.status || 'open',
                  assigned_to: jobCardData.assignedTechnicianName || null,
                  estimated_hours: jobCardData.estimatedHours || null,
                  due_date: jobCardData.dueDate 
                    ? (jobCardData.dueDate instanceof Date 
                        ? jobCardData.dueDate.toISOString() 
                        : jobCardData.dueDate)
                    : null,
                  notes: jobCardData.notes || null,
                };

                if (jobCardFormMode === 'edit' && selectedJobCard?.id) {
                  const { error } = await updateJobCard(selectedJobCard.id, jobCardRow);
                  if (error) {
                    console.error('Error updating job card:', error);
                    return;
                  }
                } else {
                  const { error } = await createJobCard(jobCardRow);
                  if (error) {
                    console.error('Error creating job card:', error);
                    return;
                  }
                }
                setJobCardFormOpen(false);
                setSelectedJobCard(null);
              }}
              jobCard={selectedJobCard}
              mode={jobCardFormMode}
              fleetNumber={fleetNumber}
              loading={jobCardMutationLoading}
            />

            {/* Job Card Delete Confirmation */}
            <ConfirmModal
              isOpen={jobCardDeleteOpen}
              onClose={() => {
                setJobCardDeleteOpen(false);
                setSelectedJobCard(null);
              }}
              onConfirm={async () => {
                if (selectedJobCard?.id) {
                  const { error } = await deleteJobCard(selectedJobCard.id);
                  if (error) {
                    console.error('Error deleting job card:', error);
                  }
                }
                setJobCardDeleteOpen(false);
                setSelectedJobCard(null);
              }}
              title="Delete Job Card"
              message={`Are you sure you want to delete job card "${selectedJobCard?.jobNumber}"? This action cannot be undone.`}
              confirmText="Delete"
              variant="danger"
              loading={jobCardMutationLoading}
            />
          </div>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="faults">
          <div className="space-y-8">
            {/* Section Header with Action Button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Fault Management</h2>
                <p className="text-sm text-dark-400 mt-1">
                  Track and manage faults reported for {fleetNumber}
                </p>
              </div>
              <Button 
                variant="primary" 
                size="md"
                onClick={() => {
                  setSelectedFault(null);
                  setFaultFormMode('create');
                  setFaultFormOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Report New Fault
              </Button>
            </div>

            {/* Fault Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-dark-800/50 rounded-xl border border-dark-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-500/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Total Faults</p>
                    <p className="text-2xl font-bold text-white">{faults.length}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-xl border border-warning-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning-500/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-warning-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Open</p>
                    <p className="text-2xl font-bold text-warning-400">
                      {faults.filter(f => f.status === 'open').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-xl border border-accent-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent-500/20 rounded-lg">
                    <Clock className="w-5 h-5 text-accent-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">In Progress</p>
                    <p className="text-2xl font-bold text-accent-400">
                      {faults.filter(f => f.status === 'in-progress' || f.status === 'assigned').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-xl border border-success-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success-500/20 rounded-lg">
                    <Circle className="w-5 h-5 text-success-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Resolved</p>
                    <p className="text-2xl font-bold text-success-400">
                      {faults.filter(f => f.status === 'resolved').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fault List Section */}
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-dark-700">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning-400" />
                  <CardTitle>Fault History</CardTitle>
                </div>
                <Badge variant="default">{faults.length} faults</Badge>
              </CardHeader>
              <div className="p-4">
                {faultsLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
                  </div>
                ) : faults.length === 0 ? (
                  <div className="text-center py-16">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-dark-600" />
                    <h3 className="text-lg font-medium text-white mb-2">No Faults Recorded</h3>
                    <p className="text-dark-400 mb-6">This vehicle has no reported faults</p>
                    <Button 
                      variant="secondary"
                      onClick={() => {
                        setSelectedFault(null);
                        setFaultFormMode('create');
                        setFaultFormOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Report First Fault
                    </Button>
                  </div>
                ) : (
                  <FaultList
                    faults={faults}
                    inspections={inspections}
                    jobCards={jobCards}
                    showActions={true}
                    onFaultEdit={(fault) => {
                      setSelectedFault(fault);
                      setFaultFormMode('edit');
                      setFaultFormOpen(true);
                    }}
                    onFaultDelete={(fault) => {
                      setSelectedFault(fault);
                      setFaultDeleteOpen(true);
                    }}
                    onCreateJobCard={(fault) => {
                      console.log('Create job card for fault:', fault);
                      // TODO: Implement job card creation from fault
                    }}
                  />
                )}
              </div>
            </Card>

            {/* Fault Form Modal */}
            <FaultForm
              isOpen={faultFormOpen}
              onClose={() => {
                setFaultFormOpen(false);
                setSelectedFault(null);
              }}
              onSubmit={async (faultData) => {
                const faultRow = {
                  vehicle_id: vehicleRow?.id,
                  fleet_number: fleetNumber,
                  description: faultData.description || '',
                  severity: faultData.severity,
                  status: faultData.status,
                  category: faultData.category,
                  reported_by: faultData.reportedBy || 'Unknown',
                  reported_date: new Date().toISOString(),
                  resolution_notes: faultData.resolutionNotes,
                  resolved_date: faultData.status === 'resolved' ? new Date().toISOString() : null,
                };

                if (faultFormMode === 'edit' && selectedFault?.id) {
                  const { error } = await updateFault(selectedFault.id, faultRow);
                  if (error) {
                    console.error('Error updating fault:', error);
                    return;
                  }
                } else {
                  const { error } = await createFault(faultRow);
                  if (error) {
                    console.error('Error creating fault:', error);
                    return;
                  }
                }
                setFaultFormOpen(false);
                setSelectedFault(null);
              }}
              fault={selectedFault}
              mode={faultFormMode}
              fleetNumber={fleetNumber}
              loading={faultMutationLoading}
            />

            {/* Fault Delete Confirmation */}
            <ConfirmModal
              isOpen={faultDeleteOpen}
              onClose={() => {
                setFaultDeleteOpen(false);
                setSelectedFault(null);
              }}
              onConfirm={async () => {
                if (selectedFault?.id) {
                  const { error } = await deleteFault(selectedFault.id);
                  if (error) {
                    console.error('Error deleting fault:', error);
                  }
                }
                setFaultDeleteOpen(false);
                setSelectedFault(null);
              }}
              title="Delete Fault"
              message={`Are you sure you want to delete this fault? This action cannot be undone.`}
              confirmText="Delete"
              variant="danger"
              loading={faultMutationLoading}
            />
          </div>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="tyres">
          <div className="space-y-8">
            {/* Section Header with Action Button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Tyre Management</h2>
                <p className="text-sm text-dark-400 mt-1">
                  Manage tyre allocations and track condition for {fleetNumber}
                </p>
              </div>
              <Button 
                variant="primary" 
                size="md"
                onClick={() => {
                  setSelectedPosition('');
                  setTyreAllocationOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Allocate New Tyre
              </Button>
            </div>

            {/* Allocated Tyres Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-dark-800/50 rounded-xl border border-dark-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-500/20 rounded-lg">
                    <Circle className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Total Allocated</p>
                    <p className="text-2xl font-bold text-white">{tyres.length}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-xl border border-success-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success-500/20 rounded-lg">
                    <Circle className="w-5 h-5 text-success-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Good Condition</p>
                    <p className="text-2xl font-bold text-success-400">
                      {tyres.filter(t => t.condition === 'new' || t.condition === 'good').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-xl border border-warning-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning-500/20 rounded-lg">
                    <Circle className="w-5 h-5 text-warning-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Fair/Worn</p>
                    <p className="text-2xl font-bold text-warning-400">
                      {tyres.filter(t => t.condition === 'fair' || t.condition === 'worn').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-xl border border-danger-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-danger-500/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-danger-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Needs Replacement</p>
                    <p className="text-2xl font-bold text-danger-400">
                      {tyres.filter(t => t.condition === 'replace').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tyre Positions Diagram Section */}
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-dark-700">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary-400" />
                  <CardTitle>Tyre Position Diagram</CardTitle>
                </div>
                <p className="text-sm text-dark-400">Click on a position to allocate or view tyre details</p>
              </CardHeader>
              <div className="p-6">
                {tyresLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
                  </div>
                ) : (
                  <div className={category === 'interlinks' ? 'max-w-5xl mx-auto' : 'max-w-md mx-auto'}>
                    <TyreDiagram
                      tyres={tyres}
                      vehicleType={category === 'horses' ? 'truck' : category === 'interlinks' ? 'interlink' : 'trailer'}
                      onTyreClick={(position) => {
                        const posStr = typeof position === 'string' ? position : position?.position || '';
                        setSelectedPosition(posStr);
                        setTyreAllocationOpen(true);
                      }}
                    />
                  </div>
                )}
              </div>
            </Card>

            {/* Tyre List Section */}
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-dark-700">
                <div className="flex items-center gap-2">
                  <Circle className="w-5 h-5 text-accent-400" />
                  <CardTitle>Allocated Tyres List</CardTitle>
                </div>
                <Badge variant="default">{tyres.length} tyres</Badge>
              </CardHeader>
              <div className="p-0">
                {tyresLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
                  </div>
                ) : tyres.length === 0 ? (
                  <div className="text-center py-16">
                    <Circle className="w-16 h-16 mx-auto mb-4 text-dark-600" />
                    <h3 className="text-lg font-medium text-white mb-2">No Tyres Allocated</h3>
                    <p className="text-dark-400 mb-6">Start by allocating tyres to this vehicle&apos;s positions</p>
                    <Button 
                      variant="secondary"
                      onClick={() => {
                        setSelectedPosition('');
                        setTyreAllocationOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Allocate First Tyre
                    </Button>
                  </div>
                ) : (
                  <TyreList
                    tyres={tyres}
                    showActions={true}
                    onTyreClick={(tyre) => {
                      setSelectedTyre(tyre);
                      setTyreEditOpen(true);
                    }}
                    onTyreEdit={(tyre) => {
                      setSelectedTyre(tyre);
                      setTyreEditOpen(true);
                    }}
                    onTyreDelete={(tyre) => {
                      setSelectedTyre(tyre);
                      setTyreDeleteOpen(true);
                    }}
                  />
                )}
              </div>
            </Card>

            {/* Tyre History Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tyre History</CardTitle>
                  <Badge variant="default">{tyreHistory.length} records</Badge>
                </div>
              </CardHeader>
              {tyreHistoryLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                </div>
              ) : (
                <TyreHistoryList history={tyreHistory} />
              )}
            </Card>

            {/* Tyre Allocation Modal */}
            <TyreAllocationForm
              isOpen={tyreAllocationOpen}
              onClose={() => {
                setTyreAllocationOpen(false);
                setSelectedPosition('');
              }}
              onSubmit={(data: TyreAllocationFormData) => {
                console.log('Allocating tyre:', data);
                // TODO: Integrate with Supabase to save tyre allocation
                setTyreAllocationOpen(false);
                setSelectedPosition('');
              }}
              position={selectedPosition}
              positionLabel={selectedPosition}
              fleetNumber={fleetNumber}
              vehicleType={category === 'horses' ? 'horse' : category === 'interlinks' ? 'interlink' : 'trailer'}
            />

            {/* Tyre Edit Modal */}
            <TyreEditForm
              isOpen={tyreEditOpen}
              onClose={() => {
                setTyreEditOpen(false);
                setSelectedTyre(null);
              }}
              onSubmit={(updatedTyre: Tyre) => {
                console.log('Saving tyre:', updatedTyre);
                // TODO: Integrate with Supabase to update tyre
                setTyreEditOpen(false);
                setSelectedTyre(null);
              }}
              tyre={selectedTyre}
              mode="edit"
            />

            {/* Tyre Delete Confirmation */}
            <ConfirmModal
              isOpen={tyreDeleteOpen}
              onClose={() => {
                setTyreDeleteOpen(false);
                setSelectedTyre(null);
              }}
              onConfirm={() => {
                console.log('Deleting tyre:', selectedTyre);
                // TODO: Integrate with Supabase to delete tyre
                setTyreDeleteOpen(false);
                setSelectedTyre(null);
              }}
              title="Remove Tyre"
              message={`Are you sure you want to remove tyre ${selectedTyre?.serialNumber} from ${fleetNumber}? This will unallocate the tyre from this vehicle.`}
              confirmText="Remove"
              variant="danger"
            />
          </div>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="maintenance">
          <div className="space-y-8">
            {/* Section Header with Action Button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Scheduled Maintenance</h2>
                <p className="text-sm text-dark-400 mt-1">
                  Manage maintenance schedules for {fleetNumber}
                </p>
              </div>
              <Button 
                variant="primary" 
                size="md"
                onClick={() => {
                  setSelectedMaintenance(null);
                  setMaintenanceFormMode('create');
                  setMaintenanceFormOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule Maintenance
              </Button>
            </div>

            {/* Maintenance Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-dark-800/50 rounded-xl border border-dark-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-500/20 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Total Scheduled</p>
                    <p className="text-2xl font-bold text-white">{scheduledMaintenance.length}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-xl border border-danger-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-danger-500/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-danger-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Overdue</p>
                    <p className="text-2xl font-bold text-danger-400">
                      {scheduledMaintenance.filter(m => m.status === 'overdue').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-xl border border-warning-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning-500/20 rounded-lg">
                    <Clock className="w-5 h-5 text-warning-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Due Soon</p>
                    <p className="text-2xl font-bold text-warning-400">
                      {scheduledMaintenance.filter(m => m.status === 'due' || m.status === 'upcoming').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-xl border border-success-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success-500/20 rounded-lg">
                    <Circle className="w-5 h-5 text-success-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Completed</p>
                    <p className="text-2xl font-bold text-success-400">
                      {scheduledMaintenance.filter(m => m.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Maintenance List Section */}
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-dark-700">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-primary-400" />
                  <CardTitle>Maintenance Schedule</CardTitle>
                </div>
                <Badge variant="default">{scheduledMaintenance.length} items</Badge>
              </CardHeader>
              <div className="p-4">
                {maintenanceLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
                  </div>
                ) : scheduledMaintenance.length === 0 ? (
                  <div className="text-center py-16">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-dark-600" />
                    <h3 className="text-lg font-medium text-white mb-2">No Scheduled Maintenance</h3>
                    <p className="text-dark-400 mb-6">Schedule maintenance to keep your vehicle in top condition</p>
                    <Button 
                      variant="secondary"
                      onClick={() => {
                        setSelectedMaintenance(null);
                        setMaintenanceFormMode('create');
                        setMaintenanceFormOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule First Maintenance
                    </Button>
                  </div>
                ) : (
                  <MaintenanceList
                    maintenance={scheduledMaintenance}
                    showActions={true}
                    onMaintenanceEdit={(item) => {
                      setSelectedMaintenance(item);
                      setMaintenanceFormMode('edit');
                      setMaintenanceFormOpen(true);
                    }}
                    onMaintenanceDelete={(item) => {
                      setSelectedMaintenance(item);
                      setMaintenanceDeleteOpen(true);
                    }}
                    onMaintenanceComplete={async (item) => {
                      const { error } = await updateMaintenance(item.id, {
                        status: 'completed',
                        last_completed_date: new Date().toISOString(),
                      });
                      if (error) {
                        console.error('Error completing maintenance:', error);
                      }
                    }}
                  />
                )}
              </div>
            </Card>

            {/* Maintenance Form Modal */}
            <MaintenanceForm
              isOpen={maintenanceFormOpen}
              onClose={() => {
                setMaintenanceFormOpen(false);
                setSelectedMaintenance(null);
              }}
              onSubmit={async (maintenanceData) => {
                const maintenanceRow = {
                  vehicle_id: vehicleRow?.id,
                  fleet_number: fleetNumber,
                  maintenance_type: maintenanceData.maintenanceType || '',
                  description: maintenanceData.description,
                  interval_days: maintenanceData.intervalDays,
                  interval_km: maintenanceData.intervalKm,
                  next_due_date: maintenanceData.scheduledDate?.toISOString(),
                  last_completed_date: maintenanceData.lastCompletedDate?.toISOString(),
                  last_completed_mileage: maintenanceData.lastCompletedMileage,
                  status: (maintenanceData.status || 'upcoming') as 'upcoming' | 'due' | 'overdue' | 'completed',
                };

                if (maintenanceFormMode === 'edit' && selectedMaintenance?.id) {
                  const { error } = await updateMaintenance(selectedMaintenance.id, maintenanceRow);
                  if (error) {
                    console.error('Error updating maintenance:', error);
                    return;
                  }
                } else {
                  const { error } = await createMaintenance(maintenanceRow);
                  if (error) {
                    console.error('Error creating maintenance:', error);
                    return;
                  }
                }
                setMaintenanceFormOpen(false);
                setSelectedMaintenance(null);
              }}
              maintenance={selectedMaintenance}
              mode={maintenanceFormMode}
              fleetNumber={fleetNumber}
              loading={maintenanceMutationLoading}
            />

            {/* Maintenance Delete Confirmation */}
            <ConfirmModal
              isOpen={maintenanceDeleteOpen}
              onClose={() => {
                setMaintenanceDeleteOpen(false);
                setSelectedMaintenance(null);
              }}
              onConfirm={async () => {
                if (selectedMaintenance?.id) {
                  const { error } = await deleteMaintenance(selectedMaintenance.id);
                  if (error) {
                    console.error('Error deleting maintenance:', error);
                  }
                }
                setMaintenanceDeleteOpen(false);
                setSelectedMaintenance(null);
              }}
              title="Delete Maintenance Schedule"
              message={`Are you sure you want to delete this maintenance schedule? This action cannot be undone.`}
              confirmText="Delete"
              variant="danger"
              loading={maintenanceMutationLoading}
            />
          </div>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="history">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle History</CardTitle>
            </CardHeader>
            <div className="py-12 text-center text-dark-400">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Complete vehicle history timeline will be displayed here</p>
              <p className="text-sm mt-2">Including all inspections, job cards, maintenance, and purchases</p>
            </div>
          </Card>
        </TabPanel>
      </div>
    </MainLayout>
  );
}
