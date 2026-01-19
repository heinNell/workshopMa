'use client';

import { Button, DatePicker, Input, Modal, Select, Textarea } from '@/components/ui';
import type { JobCard } from '@/types';
import { Wrench } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface JobCardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobCard: Partial<JobCard>) => void;
  jobCard?: JobCard | null;
  mode: 'create' | 'edit';
  fleetNumber: string;
  loading?: boolean;
}

const jobTypeOptions = [
  { value: 'repair', label: 'Repair' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'modification', label: 'Modification' },
];

const priorityOptions = [
  { value: 'low', label: 'Low - Not urgent' },
  { value: 'medium', label: 'Medium - Standard priority' },
  { value: 'high', label: 'High - Needs attention soon' },
  { value: 'urgent', label: 'Urgent - Immediate attention required' },
];

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'pending-parts', label: 'Pending Parts' },
  { value: 'completed', label: 'Completed' },
  { value: 'closed', label: 'Closed' },
];

interface FormData {
  title: string;
  description: string;
  jobType: 'repair' | 'maintenance' | 'inspection' | 'modification';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: JobCard['status'];
  assignedTechnicianName: string;
  estimatedHours: number;
  dueDate: string;
  notes: string;
}

export function JobCardFormModal({
  isOpen,
  onClose,
  onSubmit,
  jobCard,
  mode,
  fleetNumber,
  loading = false,
}: JobCardFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    jobType: 'repair',
    priority: 'medium',
    status: 'open',
    assignedTechnicianName: '',
    estimatedHours: 0,
    dueDate: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && jobCard) {
        setFormData({
          title: jobCard.title || '',
          description: jobCard.description || '',
          jobType: jobCard.jobType || 'repair',
          priority: jobCard.priority || 'medium',
          status: jobCard.status || 'open',
          assignedTechnicianName: jobCard.assignedTechnicianName || '',
          estimatedHours: jobCard.estimatedHours || 0,
          dueDate: jobCard.dueDate ? new Date(jobCard.dueDate).toISOString().split('T')[0] : '',
          notes: jobCard.notes || '',
        });
      } else {
        setFormData({
          title: '',
          description: '',
          jobType: 'repair',
          priority: 'medium',
          status: 'open',
          assignedTechnicianName: '',
          estimatedHours: 0,
          dueDate: '',
          notes: '',
        });
      }
    }
  }, [isOpen, mode, jobCard]);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
    });
  };

  const isValid = formData.title.trim() !== '' && formData.description.trim() !== '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary-500/20 rounded-lg">
            <Wrench className="w-4 h-4 text-primary-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">
              {mode === 'create' ? 'Create Job Card' : 'Edit Job Card'}
            </h2>
            <p className="text-xs text-dark-400">Fleet: {fleetNumber}</p>
          </div>
        </div>
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <Input
          label="Job Title *"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="e.g., Engine oil leak repair"
          error={!formData.title.trim() ? 'Title is required' : undefined}
        />

        <Textarea
          label="Description *"
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Describe the work to be done..."
          rows={2}
        />

        {/* Type, Priority, Status */}
        <div className="grid grid-cols-3 gap-3">
          <Select
            label="Job Type"
            options={jobTypeOptions}
            value={formData.jobType}
            onChange={(e) => updateField('jobType', e.target.value as FormData['jobType'])}
          />

          <Select
            label="Priority"
            options={priorityOptions}
            value={formData.priority}
            onChange={(e) => updateField('priority', e.target.value as FormData['priority'])}
          />

          {mode === 'edit' && (
            <Select
              label="Status"
              options={statusOptions}
              value={formData.status}
              onChange={(e) => updateField('status', e.target.value as FormData['status'])}
            />
          )}
        </div>

        {/* Assigned Technician and Estimated Hours */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Assigned Technician"
            value={formData.assignedTechnicianName}
            onChange={(e) => updateField('assignedTechnicianName', e.target.value)}
            placeholder="Technician name"
          />

          <Input
            label="Estimated Hours"
            type="number"
            value={formData.estimatedHours || ''}
            onChange={(e) => updateField('estimatedHours', parseFloat(e.target.value) || 0)}
            placeholder="0"
            min="0"
            step="0.5"
          />
        </div>

        {/* Due Date */}
        <DatePicker
          label="Due Date"
          value={formData.dueDate}
          onChange={(date) => updateField('dueDate', date)}
        />

        {/* Notes */}
        <Textarea
          label="Additional Notes"
          value={formData.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Any additional notes or instructions..."
          rows={2}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-dark-700">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isValid} loading={loading}>
            {mode === 'create' ? 'Create Job Card' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
