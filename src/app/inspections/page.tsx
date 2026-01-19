'use client';

import { InspectionFormModal, InspectionList } from '@/components/inspections';
import { MainLayout } from '@/components/layout';
import { Badge, Button, Card, CardHeader, ConfirmModal, Tabs } from '@/components/ui';
import { useInspectionMutations, useInspections, type InspectionRow } from '@/hooks/useInspections';
import { useVehicles, type VehicleRow } from '@/hooks/useVehicles';
import { transformInspection } from '@/lib/transforms';
import type { Inspection } from '@/types';
import { Calendar, Filter, Loader2, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function InspectionsPage() {
  const [activeTab, setActiveTab] = useState('all');
  
  // CRUD state
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedFleetNumber, setSelectedFleetNumber] = useState<string>('');

  // Fetch all inspections from Supabase
  const { data: inspectionRows, loading, error, refetch } = useInspections();
  const { data: vehicleRows } = useVehicles();
  const { deleteInspection, createInspection, updateInspection, startInspection, loading: mutationLoading } = useInspectionMutations();

  // Transform database rows to frontend types
  const inspections = useMemo(() => 
    (inspectionRows as InspectionRow[]).map(transformInspection), 
    [inspectionRows]
  );
  
  // Get unique fleet numbers for the vehicle dropdown
  const vehicleOptions = useMemo(() => 
    (vehicleRows as VehicleRow[]).map(v => ({
      value: v.fleet_number,
      label: `${v.fleet_number} - ${v.make || ''} ${v.model || ''}`.trim(),
    })),
    [vehicleRows]
  );

  const tabs = [
    { id: 'all', label: 'All', count: inspections.length },
    { id: 'scheduled', label: 'Scheduled', count: inspections.filter(i => i.status === 'scheduled').length },
    { id: 'overdue', label: 'Overdue', count: inspections.filter(i => i.status === 'overdue').length },
    { id: 'completed', label: 'Completed', count: inspections.filter(i => i.status === 'completed').length },
  ];

  const filteredInspections = activeTab === 'all' 
    ? inspections 
    : inspections.filter(i => i.status === activeTab);

  // Stats
  const scheduledToday = inspections.filter(i => {
    const today = new Date();
    const scheduled = new Date(i.scheduledDate);
    return i.status === 'scheduled' && 
      scheduled.getDate() === today.getDate() &&
      scheduled.getMonth() === today.getMonth() &&
      scheduled.getFullYear() === today.getFullYear();
  }).length;

  const overdueCount = inspections.filter(i => i.status === 'overdue').length;
  const completedCount = inspections.filter(i => i.status === 'completed').length;

  // Handlers
  const handleCreate = () => {
    setSelectedInspection(null);
    setFormMode('create');
    setSelectedFleetNumber(vehicleOptions[0]?.value || '');
    setFormOpen(true);
  };

  const handleEdit = (inspection: Inspection) => {
    setSelectedInspection(inspection);
    setFormMode('edit');
    setSelectedFleetNumber(inspection.fleetNumber);
    setFormOpen(true);
  };

  const handleDelete = (inspection: Inspection) => {
    setSelectedInspection(inspection);
    setDeleteOpen(true);
  };

  const handleStart = async (inspection: Inspection) => {
    const { error } = await startInspection(inspection.id);
    if (error) {
      console.error('Error starting inspection:', error);
    } else {
      refetch();
    }
  };

  const handleFormSubmit = async (data: Partial<Inspection>) => {
    if (formMode === 'create') {
      const { error } = await createInspection({
        fleet_number: selectedFleetNumber,
        vehicle_id: vehicleRows?.find((v: VehicleRow) => v.fleet_number === selectedFleetNumber)?.id || '',
        inspection_type: data.inspectionType || 'daily',
        status: data.status || 'scheduled',
        scheduled_date: data.scheduledDate ? new Date(data.scheduledDate).toISOString() : new Date().toISOString(),
        inspector_name: data.inspectorName || null,
        odometer_reading: data.odometerReading || null,
        notes: data.notes || null,
        faults_found: 0,
      });
      if (error) {
        console.error('Error creating inspection:', error);
      } else {
        refetch();
        setFormOpen(false);
      }
    } else if (selectedInspection) {
      const { error } = await updateInspection(selectedInspection.id, {
        inspection_type: data.inspectionType,
        status: data.status,
        scheduled_date: data.scheduledDate ? new Date(data.scheduledDate).toISOString() : undefined,
        inspector_name: data.inspectorName || null,
        odometer_reading: data.odometerReading || null,
        notes: data.notes || null,
      });
      if (error) {
        console.error('Error updating inspection:', error);
      } else {
        refetch();
        setFormOpen(false);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedInspection?.id) {
      const { error } = await deleteInspection(selectedInspection.id);
      if (error) {
        console.error('Error deleting inspection:', error);
      } else {
        refetch();
      }
    }
    setDeleteOpen(false);
    setSelectedInspection(null);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-danger-400">Error loading inspections: {error.message}</p>
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Inspections</h1>
            <p className="text-dark-400 mt-1">Manage vehicle inspections and schedules across all fleets</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary">
              <Calendar className="w-4 h-4" />
              Schedule
            </Button>
            <Button onClick={handleCreate}>
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
                <p className="text-2xl font-bold text-white mt-1">{scheduledToday}</p>
              </div>
              <Badge variant="info">Scheduled</Badge>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-400">Total Scheduled</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {inspections.filter(i => i.status === 'scheduled').length}
                </p>
              </div>
              <Badge variant="info">Pending</Badge>
            </div>
          </Card>
          <Card className={overdueCount > 0 ? 'border-warning-500/20' : ''}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-400">Overdue</p>
                <p className={`text-2xl font-bold mt-1 ${overdueCount > 0 ? 'text-warning-500' : 'text-white'}`}>
                  {overdueCount}
                </p>
              </div>
              {overdueCount > 0 && <Badge variant="warning">Action Required</Badge>}
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-400">Completed</p>
                <p className="text-2xl font-bold text-white mt-1">{completedCount}</p>
              </div>
              <Badge variant="success">Done</Badge>
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
            showVehicle={true}
            showActions={true}
            onInspectionClick={handleEdit}
            onInspectionEdit={handleEdit}
            onInspectionDelete={handleDelete}
            onInspectionStart={handleStart}
          />
        </Card>

        {/* Inspection Form Modal */}
        <InspectionFormModal
          isOpen={formOpen}
          onClose={() => {
            setFormOpen(false);
            setSelectedInspection(null);
          }}
          onSubmit={handleFormSubmit}
          inspection={selectedInspection}
          mode={formMode}
          fleetNumber={selectedFleetNumber}
          loading={mutationLoading}
          vehicleOptions={vehicleOptions}
          onFleetNumberChange={setSelectedFleetNumber}
          showVehicleSelect={formMode === 'create'}
        />

        {/* Delete Confirmation */}
        <ConfirmModal
          isOpen={deleteOpen}
          onClose={() => {
            setDeleteOpen(false);
            setSelectedInspection(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Inspection"
          message="Are you sure you want to delete this inspection? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
          loading={mutationLoading}
        />
      </div>
    </MainLayout>
  );
}
