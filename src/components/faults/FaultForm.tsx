'use client';

import { Button, Input, Modal, Select, Textarea } from '@/components/ui';
import type { Fault } from '@/types';
import { AlertTriangle } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface FaultFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (fault: Partial<Fault>) => void;
  fault?: Fault | null;
  mode: 'create' | 'edit';
  fleetNumber: string;
  loading?: boolean;
}

const severityOptions = [
  { value: 'low', label: 'Low - Minor issue, no immediate action needed' },
  { value: 'medium', label: 'Medium - Should be addressed soon' },
  { value: 'high', label: 'High - Requires prompt attention' },
  { value: 'critical', label: 'Critical - Immediate action required' },
];

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

const categoryOptions = [
  { value: 'engine', label: 'Engine' },
  { value: 'transmission', label: 'Transmission' },
  { value: 'brakes', label: 'Brakes' },
  { value: 'suspension', label: 'Suspension' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'body', label: 'Body/Frame' },
  { value: 'tyres', label: 'Tyres' },
  { value: 'lights', label: 'Lights' },
  { value: 'cooling', label: 'Cooling System' },
  { value: 'fuel', label: 'Fuel System' },
  { value: 'exhaust', label: 'Exhaust' },
  { value: 'hydraulics', label: 'Hydraulics' },
  { value: 'trailer', label: 'Trailer Specific' },
  { value: 'safety', label: 'Safety Equipment' },
  { value: 'other', label: 'Other' },
];

export function FaultForm({
  isOpen,
  onClose,
  onSubmit,
  fault,
  mode,
  fleetNumber,
  loading = false,
}: FaultFormProps) {
  const [formData, setFormData] = useState({
    description: '',
    severity: 'medium' as Fault['severity'],
    status: 'open' as Fault['status'],
    category: '',
    reportedBy: '',
    resolutionNotes: '',
  });

  useEffect(() => {
    if (fault && mode === 'edit') {
      setFormData({
        description: fault.description || '',
        severity: fault.severity || 'medium',
        status: fault.status || 'open',
        category: fault.category || '',
        reportedBy: fault.reportedBy || '',
        resolutionNotes: fault.resolutionNotes || '',
      });
    } else {
      setFormData({
        description: '',
        severity: 'medium',
        status: 'open',
        category: '',
        reportedBy: '',
        resolutionNotes: '',
      });
    }
  }, [fault, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const faultData: Partial<Fault> = {
      ...fault,
      ...formData,
      fleetNumber,
      reportedDate: fault?.reportedDate || new Date(),
      resolvedDate: formData.status === 'resolved' ? new Date() : undefined,
    };

    onSubmit(faultData);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-dark-400';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Report New Fault' : 'Edit Fault'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Info */}
        <div className="flex items-center gap-3 p-4 bg-dark-800/50 rounded-lg border border-dark-700">
          <div className={`p-3 rounded-lg ${
            formData.severity === 'critical' ? 'bg-red-500/20' :
            formData.severity === 'high' ? 'bg-orange-500/20' :
            formData.severity === 'medium' ? 'bg-yellow-500/20' :
            'bg-blue-500/20'
          }`}>
            <AlertTriangle className={`w-6 h-6 ${getSeverityColor(formData.severity)}`} />
          </div>
          <div>
            <h3 className="text-white font-medium">Fleet: {fleetNumber}</h3>
            <p className="text-sm text-dark-400">
              {mode === 'create' ? 'Report a new fault for this vehicle' : 'Update fault details'}
            </p>
          </div>
        </div>

        {/* Fault Description */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-dark-300 border-b border-dark-700 pb-2">
            Fault Details
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Description <span className="text-danger-400">*</span>
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the fault in detail..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Category
              </label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                options={categoryOptions}
                placeholder="Select category"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Reported By
              </label>
              <Input
                value={formData.reportedBy}
                onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                placeholder="Name of reporter"
              />
            </div>
          </div>
        </div>

        {/* Severity & Status */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-dark-300 border-b border-dark-700 pb-2">
            Classification
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Severity <span className="text-danger-400">*</span>
              </label>
              <Select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as Fault['severity'] })}
                options={severityOptions}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Status <span className="text-danger-400">*</span>
              </label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Fault['status'] })}
                options={statusOptions}
                required
              />
            </div>
          </div>
        </div>

        {/* Resolution Notes (only show if resolved or in edit mode) */}
        {(formData.status === 'resolved' || mode === 'edit') && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-dark-300 border-b border-dark-700 pb-2">
              Resolution
            </h4>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Resolution Notes
              </label>
              <Textarea
                value={formData.resolutionNotes}
                onChange={(e) => setFormData({ ...formData, resolutionNotes: e.target.value })}
                placeholder="Describe how the fault was resolved..."
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading || !formData.description}>
            {loading ? 'Saving...' : mode === 'create' ? 'Report Fault' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
