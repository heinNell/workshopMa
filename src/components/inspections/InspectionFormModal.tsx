import { Button, DatePicker, Input, Modal, Select, Textarea } from '@/components/ui';
import type { Inspection } from '@/types';
import { ClipboardCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface InspectionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (inspection: Partial<Inspection>) => void;
  inspection?: Inspection | null;
  mode: 'create' | 'edit';
  fleetNumber: string;
  loading?: boolean;
  // Optional: for creating inspections from main page with vehicle selection
  vehicleOptions?: { value: string; label: string }[];
  onFleetNumberChange?: (fleetNumber: string) => void;
  showVehicleSelect?: boolean;
}

const inspectionTypeOptions = [
  { value: 'daily', label: 'Daily Inspection' },
  { value: 'weekly', label: 'Weekly Inspection' },
  { value: 'monthly', label: 'Monthly Inspection' },
  { value: 'annual', label: 'Annual Inspection' },
];

const statusOptions = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
];

interface FormData {
  inspectionType: 'daily' | 'weekly' | 'monthly' | 'annual';
  status: Inspection['status'];
  scheduledDate: string;
  inspectorName: string;
  odometerReading: number;
  notes: string;
}

export function InspectionFormModal({
  isOpen,
  onClose,
  onSubmit,
  inspection,
  mode,
  fleetNumber,
  loading = false,
  vehicleOptions = [],
  onFleetNumberChange,
  showVehicleSelect = false,
}: InspectionFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    inspectionType: 'daily',
    status: 'scheduled',
    scheduledDate: new Date().toISOString().split('T')[0],
    inspectorName: '',
    odometerReading: 0,
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && inspection) {
        setFormData({
          inspectionType: inspection.inspectionType || 'daily',
          status: inspection.status || 'scheduled',
          scheduledDate: inspection.scheduledDate
            ? new Date(inspection.scheduledDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          inspectorName: inspection.inspectorName || '',
          odometerReading: inspection.odometerReading || 0,
          notes: inspection.notes || '',
        });
      } else {
        setFormData({
          inspectionType: 'daily',
          status: 'scheduled',
          scheduledDate: new Date().toISOString().split('T')[0],
          inspectorName: '',
          odometerReading: 0,
          notes: '',
        });
      }
    }
  }, [isOpen, mode, inspection]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      scheduledDate: new Date(formData.scheduledDate),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/20 rounded-lg">
            <ClipboardCheck className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {mode === 'create' ? 'Schedule Inspection' : 'Edit Inspection'}
            </h2>
            {!showVehicleSelect && (
              <p className="text-sm text-dark-400">Fleet: {fleetNumber}</p>
            )}
          </div>
        </div>
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vehicle Selection (only shown when creating from main page) */}
        {showVehicleSelect && vehicleOptions.length > 0 && (
          <Select
            label="Select Vehicle *"
            options={vehicleOptions}
            value={fleetNumber}
            onChange={(e) => onFleetNumberChange?.(e.target.value)}
          />
        )}

        <div className="space-y-3">
          <h3 className="text-xs font-medium text-dark-300 uppercase tracking-wider">
            Inspection Details
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Inspection Type"
              value={formData.inspectionType}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  inspectionType: e.target.value as FormData['inspectionType'],
                }))
              }
              options={inspectionTypeOptions}
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value as FormData['status'],
                }))
              }
              options={statusOptions}
            />
          </div>

          <DatePicker
            label="Scheduled Date"
            value={formData.scheduledDate}
            onChange={(date) =>
              setFormData((prev) => ({ ...prev, scheduledDate: date }))
            }
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-medium text-dark-300 uppercase tracking-wider">
            Inspector Information
          </h3>

          <Input
            label="Inspector Name"
            value={formData.inspectorName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, inspectorName: e.target.value }))
            }
            placeholder="Name of the inspector"
          />

          <Input
            label="Odometer Reading (km)"
            type="number"
            min={0}
            value={formData.odometerReading}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                odometerReading: parseInt(e.target.value) || 0,
              }))
            }
            placeholder="Current vehicle mileage"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-dark-300 uppercase tracking-wider">
            Notes
          </h3>

          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional notes or observations..."
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? 'Saving...'
              : mode === 'create'
              ? 'Schedule Inspection'
              : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}