'use client';

import { Button, DatePicker, Input, Modal, Select, Textarea } from '@/components/ui';
import type { ScheduledMaintenance } from '@/types';
import { Wrench } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface MaintenanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (maintenance: Partial<ScheduledMaintenance>) => void;
  maintenance?: ScheduledMaintenance | null;
  mode: 'create' | 'edit';
  fleetNumber: string;
  loading?: boolean;
}

const maintenanceTypeOptions = [
  { value: 'oil-change', label: 'Oil Change' },
  { value: 'service-a', label: 'Service A (Minor)' },
  { value: 'service-b', label: 'Service B (Major)' },
  { value: 'brake-inspection', label: 'Brake Inspection' },
  { value: 'tyre-rotation', label: 'Tyre Rotation' },
  { value: 'transmission-service', label: 'Transmission Service' },
  { value: 'coolant-flush', label: 'Coolant Flush' },
  { value: 'air-filter', label: 'Air Filter Replacement' },
  { value: 'fuel-filter', label: 'Fuel Filter Replacement' },
  { value: 'belt-inspection', label: 'Belt Inspection' },
  { value: 'battery-check', label: 'Battery Check' },
  { value: 'wheel-alignment', label: 'Wheel Alignment' },
  { value: 'cof', label: 'Certificate of Fitness (COF)' },
  { value: 'annual-inspection', label: 'Annual Inspection' },
  { value: 'custom', label: 'Custom Maintenance' },
];

const frequencyTypeOptions = [
  { value: 'mileage', label: 'By Mileage' },
  { value: 'time', label: 'By Time Interval' },
  { value: 'both', label: 'Both (whichever comes first)' },
];

const statusOptions = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'due', label: 'Due Now' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'completed', label: 'Completed' },
];

export function MaintenanceForm({
  isOpen,
  onClose,
  onSubmit,
  maintenance,
  mode,
  fleetNumber,
  loading = false,
}: MaintenanceFormProps) {
  const [formData, setFormData] = useState({
    maintenanceType: '',
    customType: '',
    description: '',
    frequencyType: 'both' as ScheduledMaintenance['frequencyType'],
    intervalKm: '',
    intervalDays: '',
    scheduledDate: '',
    status: 'upcoming' as ScheduledMaintenance['status'],
    lastCompletedDate: '',
    lastCompletedMileage: '',
  });

  useEffect(() => {
    if (maintenance && mode === 'edit') {
      setFormData({
        maintenanceType: maintenance.maintenanceType || '',
        customType: '',
        description: maintenance.description || '',
        frequencyType: maintenance.frequencyType || 'both',
        intervalKm: maintenance.intervalKm?.toString() || '',
        intervalDays: maintenance.intervalDays?.toString() || '',
        scheduledDate: maintenance.scheduledDate 
          ? new Date(maintenance.scheduledDate).toISOString().split('T')[0] 
          : '',
        status: maintenance.status || 'upcoming',
        lastCompletedDate: maintenance.lastCompletedDate 
          ? new Date(maintenance.lastCompletedDate).toISOString().split('T')[0] 
          : '',
        lastCompletedMileage: maintenance.lastCompletedMileage?.toString() || '',
      });
    } else {
      setFormData({
        maintenanceType: '',
        customType: '',
        description: '',
        frequencyType: 'both',
        intervalKm: '',
        intervalDays: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        status: 'upcoming',
        lastCompletedDate: '',
        lastCompletedMileage: '',
      });
    }
  }, [maintenance, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const maintenanceData: Partial<ScheduledMaintenance> = {
      ...maintenance,
      fleetNumber,
      maintenanceType: formData.maintenanceType === 'custom' ? formData.customType : formData.maintenanceType,
      description: formData.description,
      frequencyType: formData.frequencyType,
      intervalKm: formData.intervalKm ? parseInt(formData.intervalKm) : undefined,
      intervalDays: formData.intervalDays ? parseInt(formData.intervalDays) : undefined,
      scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : undefined,
      status: formData.status,
      lastCompletedDate: formData.lastCompletedDate ? new Date(formData.lastCompletedDate) : undefined,
      lastCompletedMileage: formData.lastCompletedMileage ? parseInt(formData.lastCompletedMileage) : undefined,
    };

    onSubmit(maintenanceData);
  };

  const getDisplayType = () => {
    if (formData.maintenanceType === 'custom') return formData.customType || 'Custom Maintenance';
    const option = maintenanceTypeOptions.find(o => o.value === formData.maintenanceType);
    return option?.label || 'New Maintenance Schedule';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Schedule Maintenance' : 'Edit Maintenance Schedule'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Info */}
        <div className="flex items-center gap-3 p-4 bg-dark-800/50 rounded-lg border border-dark-700">
          <div className="p-3 rounded-lg bg-primary-500/20">
            <Wrench className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">Fleet: {fleetNumber}</h3>
            <p className="text-sm text-dark-400">{getDisplayType()}</p>
          </div>
        </div>

        {/* Maintenance Type */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-dark-300 border-b border-dark-700 pb-2">
            Maintenance Type
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Type <span className="text-danger-400">*</span>
              </label>
              <Select
                value={formData.maintenanceType}
                onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
                options={maintenanceTypeOptions}
                placeholder="Select maintenance type"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Status
              </label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ScheduledMaintenance['status'] })}
                options={statusOptions}
              />
            </div>
          </div>

          {formData.maintenanceType === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Custom Type Name <span className="text-danger-400">*</span>
              </label>
              <Input
                value={formData.customType}
                onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
                placeholder="Enter custom maintenance type"
                required={formData.maintenanceType === 'custom'}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details about this maintenance..."
              rows={2}
            />
          </div>
        </div>

        {/* Schedule Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-dark-300 border-b border-dark-700 pb-2">
            Schedule Details
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <DatePicker
              label="Scheduled Date"
              value={formData.scheduledDate}
              onChange={(date) => setFormData({ ...formData, scheduledDate: date })}
            />
            <Select
              label="Frequency Based On"
              value={formData.frequencyType}
              onChange={(e) => setFormData({ ...formData, frequencyType: e.target.value as ScheduledMaintenance['frequencyType'] })}
              options={frequencyTypeOptions}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {(formData.frequencyType === 'mileage' || formData.frequencyType === 'both') && (
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Interval (km)
                </label>
                <Input
                  type="number"
                  value={formData.intervalKm}
                  onChange={(e) => setFormData({ ...formData, intervalKm: e.target.value })}
                  placeholder="e.g., 10000"
                  min="0"
                  step="1000"
                />
                <p className="text-xs text-dark-500 mt-1">Repeat every X kilometers</p>
              </div>
            )}
            {(formData.frequencyType === 'time' || formData.frequencyType === 'both') && (
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Interval (days)
                </label>
                <Input
                  type="number"
                  value={formData.intervalDays}
                  onChange={(e) => setFormData({ ...formData, intervalDays: e.target.value })}
                  placeholder="e.g., 90"
                  min="0"
                />
                <p className="text-xs text-dark-500 mt-1">Repeat every X days</p>
              </div>
            )}
          </div>
        </div>

        {/* Last Completed (for tracking) */}
        <div className="space-y-4">
          <h4 className="text-xs font-medium text-dark-300 border-b border-dark-700 pb-2">
            Last Completed (Optional)
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <DatePicker
              label="Last Completed Date"
              value={formData.lastCompletedDate}
              onChange={(date) => setFormData({ ...formData, lastCompletedDate: date })}
            />
            <Input
              label="Last Completed Mileage"
              type="number"
              value={formData.lastCompletedMileage}
              onChange={(e) => setFormData({ ...formData, lastCompletedMileage: e.target.value })}
              placeholder="Odometer reading"
              min="0"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-dark-700">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading || !formData.maintenanceType || (formData.maintenanceType === 'custom' && !formData.customType)}
          >
            {loading ? 'Saving...' : mode === 'create' ? 'Schedule Maintenance' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
