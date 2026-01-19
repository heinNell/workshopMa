'use client';

import { JobCardFormModal, JobCardList } from '@/components/job-cards';
import { MainLayout } from '@/components/layout';
import { Button, Card, CardHeader, ConfirmModal, Tabs } from '@/components/ui';
import { useJobCardMutations, useJobCards, type JobCardRow } from '@/hooks/useJobCards';
import { useVehicles, type VehicleRow } from '@/hooks/useVehicles';
import { transformJobCard } from '@/lib/transforms';
import type { JobCard } from '@/types';
import { Download, Filter, Loader2, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function JobCardsPage() {
  const [activeTab, setActiveTab] = useState('active');
  
  // CRUD state
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedFleetNumber, setSelectedFleetNumber] = useState<string>('');

  // Fetch all job cards from Supabase
  const { data: jobCardRows, loading, error, refetch } = useJobCards();
  const { data: vehicleRows } = useVehicles();
  const { deleteJobCard, createJobCard, updateJobCard, updateJobCardStatus, loading: mutationLoading } = useJobCardMutations();

  // Transform database rows to frontend types
  const jobCards = useMemo(() => 
    (jobCardRows as JobCardRow[]).map(transformJobCard), 
    [jobCardRows]
  );
  
  // Get unique fleet numbers for the vehicle dropdown
  const vehicleOptions = useMemo(() => 
    (vehicleRows as VehicleRow[]).map(v => ({
      value: v.fleet_number,
      label: `${v.fleet_number} - ${v.make || ''} ${v.model || ''}`.trim(),
    })),
    [vehicleRows]
  );

  const activeJobCards = useMemo(() => 
    jobCards.filter(j => !['completed', 'closed'].includes(j.status)),
    [jobCards]
  );
  
  const completedJobCards = useMemo(() => 
    jobCards.filter(j => ['completed', 'closed'].includes(j.status)),
    [jobCards]
  );

  const tabs = [
    { id: 'active', label: 'Active', count: activeJobCards.length },
    { id: 'completed', label: 'Completed', count: completedJobCards.length },
    { id: 'all', label: 'All', count: jobCards.length },
  ];

  const filteredJobCards = activeTab === 'active' 
    ? activeJobCards 
    : activeTab === 'completed'
    ? completedJobCards
    : jobCards;

  // Stats
  const openCount = jobCards.filter(j => j.status === 'open').length;
  const inProgressCount = jobCards.filter(j => j.status === 'in-progress').length;
  const pendingPartsCount = jobCards.filter(j => j.status === 'pending-parts').length;
  const completedCount = completedJobCards.length;

  // Handlers
  const handleCreate = () => {
    setSelectedJobCard(null);
    setFormMode('create');
    setSelectedFleetNumber(vehicleOptions[0]?.value || '');
    setFormOpen(true);
  };

  const handleEdit = (jobCard: JobCard) => {
    setSelectedJobCard(jobCard);
    setFormMode('edit');
    setSelectedFleetNumber(jobCard.fleetNumber);
    setFormOpen(true);
  };

  const handleDelete = (jobCard: JobCard) => {
    setSelectedJobCard(jobCard);
    setDeleteOpen(true);
  };

  const handleStatusChange = async (jobCard: JobCard, newStatus: JobCard['status']) => {
    const { error } = await updateJobCardStatus(jobCard.id, newStatus);
    if (error) {
      console.error('Error updating status:', error);
    } else {
      refetch();
    }
  };

  const handleFormSubmit = async (data: Partial<JobCard>) => {
    if (formMode === 'create') {
      const { error } = await createJobCard({
        fleet_number: selectedFleetNumber,
        vehicle_id: vehicleRows?.find((v: VehicleRow) => v.fleet_number === selectedFleetNumber)?.id || '',
        title: data.title || '',
        description: data.description || '',
        job_type: data.jobType || 'repair',
        priority: data.priority || 'medium',
        status: data.status || 'open',
        assigned_to: data.assignedTechnicianName || null,
        estimated_hours: data.estimatedHours || null,
        due_date: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        notes: data.notes || null,
      });
      if (error) {
        console.error('Error creating job card:', error);
      } else {
        refetch();
        setFormOpen(false);
      }
    } else if (selectedJobCard) {
      const { error } = await updateJobCard(selectedJobCard.id, {
        title: data.title,
        description: data.description,
        job_type: data.jobType,
        priority: data.priority,
        status: data.status,
        assigned_to: data.assignedTechnicianName || null,
        estimated_hours: data.estimatedHours || null,
        due_date: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        notes: data.notes || null,
      });
      if (error) {
        console.error('Error updating job card:', error);
      } else {
        refetch();
        setFormOpen(false);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedJobCard?.id) {
      const { error } = await deleteJobCard(selectedJobCard.id);
      if (error) {
        console.error('Error deleting job card:', error);
      } else {
        refetch();
      }
    }
    setDeleteOpen(false);
    setSelectedJobCard(null);
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
          <p className="text-danger-400">Error loading job cards: {error.message}</p>
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
            <h1 className="text-2xl font-bold text-white">Job Cards</h1>
            <p className="text-dark-400 mt-1">Manage work orders and repairs across all fleets</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4" />
              New Job Card
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <p className="text-sm text-dark-400">Open</p>
            <p className="text-2xl font-bold text-white mt-1">{openCount}</p>
          </Card>
          <Card className="border-warning-500/20">
            <p className="text-sm text-dark-400">In Progress</p>
            <p className="text-2xl font-bold text-warning-500 mt-1">{inProgressCount}</p>
          </Card>
          <Card className="border-warning-500/20">
            <p className="text-sm text-dark-400">Pending Parts</p>
            <p className="text-2xl font-bold text-warning-500 mt-1">{pendingPartsCount}</p>
          </Card>
          <Card className="border-success-500/20">
            <p className="text-sm text-dark-400">Completed</p>
            <p className="text-2xl font-bold text-success-500 mt-1">{completedCount}</p>
          </Card>
          <Card>
            <p className="text-sm text-dark-400">Total</p>
            <p className="text-2xl font-bold text-white mt-1">{jobCards.length}</p>
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
            showVehicle={true}
            showActions={true}
            onJobCardClick={handleEdit}
            onJobCardEdit={handleEdit}
            onJobCardDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        </Card>

        {/* Job Card Form Modal */}
        <JobCardFormModal
          isOpen={formOpen}
          onClose={() => {
            setFormOpen(false);
            setSelectedJobCard(null);
          }}
          onSubmit={handleFormSubmit}
          jobCard={selectedJobCard}
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
            setSelectedJobCard(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Job Card"
          message={`Are you sure you want to delete job card "${selectedJobCard?.jobNumber}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
          loading={mutationLoading}
        />
      </div>
    </MainLayout>
  );
}
