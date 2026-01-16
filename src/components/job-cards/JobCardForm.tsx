'use client';

import React, { useState } from 'react';
import { Card, Button, Input, Textarea, Select, Badge, PriorityBadge } from '@/components/ui';
import { cn, formatDate } from '@/lib/utils';
import { Plus, Trash2, Package, Clock } from 'lucide-react';

interface JobCardFormProps {
  fleetNumber: string;
  category: string;
  onSubmit: (data: JobCardFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  initialData?: Partial<JobCardFormData>;
}

interface JobCardFormData {
  title: string;
  description: string;
  jobType: 'repair' | 'maintenance' | 'inspection' | 'modification';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  estimatedHours: number;
  dueDate: string;
  parts: Array<{ partNumber: string; partName: string; quantity: number; unitPrice: number }>;
  notes: string;
}

const jobTypeOptions = [
  { value: 'repair', label: 'Repair' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'modification', label: 'Modification' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export function JobCardForm({
  fleetNumber,
  category,
  onSubmit,
  onCancel,
  loading = false,
  initialData,
}: JobCardFormProps) {
  const [formData, setFormData] = useState<JobCardFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    jobType: initialData?.jobType || 'repair',
    priority: initialData?.priority || 'medium',
    assignedTo: initialData?.assignedTo || '',
    estimatedHours: initialData?.estimatedHours || 0,
    dueDate: initialData?.dueDate || '',
    parts: initialData?.parts || [],
    notes: initialData?.notes || '',
  });

  const updateField = <K extends keyof JobCardFormData>(
    field: K,
    value: JobCardFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addPart = () => {
    setFormData((prev) => ({
      ...prev,
      parts: [...prev.parts, { partNumber: '', partName: '', quantity: 1, unitPrice: 0 }],
    }));
  };

  const updatePart = (index: number, field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      parts: prev.parts.map((part, i) =>
        i === index ? { ...part, [field]: value } : part
      ),
    }));
  };

  const removePart = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      parts: prev.parts.filter((_, i) => i !== index),
    }));
  };

  const getTotalPartsCost = () => {
    return formData.parts.reduce((sum, part) => sum + part.quantity * part.unitPrice, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isValid = formData.title.trim() !== '' && formData.description.trim() !== '';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Info */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">New Job Card</h2>
            <p className="text-dark-400 mt-1">Fleet: {fleetNumber}</p>
          </div>
          <div className="flex items-center gap-3">
            <PriorityBadge priority={formData.priority} />
            <Badge>{formData.jobType}</Badge>
          </div>
        </div>
      </Card>

      {/* Basic Information */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Job Details</h3>
        <div className="grid gap-4">
          <Input
            label="Job Title"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Enter a descriptive title for this job"
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Describe the work to be performed..."
            rows={4}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Job Type"
              options={jobTypeOptions}
              value={formData.jobType}
              onChange={(e) => updateField('jobType', e.target.value as any)}
            />

            <Select
              label="Priority"
              options={priorityOptions}
              value={formData.priority}
              onChange={(e) => updateField('priority', e.target.value as any)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Assigned To"
              value={formData.assignedTo}
              onChange={(e) => updateField('assignedTo', e.target.value)}
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

          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => updateField('dueDate', e.target.value)}
          />
        </div>
      </Card>

      {/* Parts Required */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Parts Required</h3>
            <p className="text-sm text-dark-400 mt-0.5">
              Add parts needed for this job
            </p>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={addPart}>
            <Plus className="w-4 h-4" />
            Add Part
          </Button>
        </div>

        {formData.parts.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-primary-500/20 rounded-lg">
            <Package className="w-10 h-10 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">No parts added yet</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addPart}
              className="mt-2"
            >
              Add first part
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {formData.parts.map((part, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-3 p-3 bg-dark-800/50 rounded-lg items-end"
              >
                <div className="col-span-3">
                  <Input
                    label={index === 0 ? 'Part Number' : undefined}
                    value={part.partNumber}
                    onChange={(e) => updatePart(index, 'partNumber', e.target.value)}
                    placeholder="Part #"
                  />
                </div>
                <div className="col-span-4">
                  <Input
                    label={index === 0 ? 'Part Name' : undefined}
                    value={part.partName}
                    onChange={(e) => updatePart(index, 'partName', e.target.value)}
                    placeholder="Part name"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    label={index === 0 ? 'Qty' : undefined}
                    type="number"
                    value={part.quantity}
                    onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 1)}
                    min="1"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    label={index === 0 ? 'Unit Price' : undefined}
                    type="number"
                    value={part.unitPrice || ''}
                    onChange={(e) => updatePart(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    placeholder="R 0.00"
                  />
                </div>
                <div className="col-span-1">
                  <button
                    type="button"
                    onClick={() => removePart(index)}
                    className="p-2.5 text-dark-400 hover:text-danger-500 hover:bg-danger-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="flex justify-end pt-3 border-t border-primary-500/10">
              <div className="text-right">
                <p className="text-sm text-dark-400">Estimated Parts Cost</p>
                <p className="text-lg font-semibold text-white">
                  R {getTotalPartsCost().toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Additional Notes */}
      <Card>
        <Textarea
          label="Additional Notes"
          value={formData.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Any additional notes or instructions..."
          rows={3}
        />
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isValid} loading={loading}>
          Create Job Card
        </Button>
      </div>
    </form>
  );
}
