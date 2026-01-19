'use client';

import { Button, DatePicker, Input, Modal, Select, Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { TyreAllocationFormData } from '@/types';
import { Circle, Save, X } from 'lucide-react';
import { useState } from 'react';

interface TyreAllocationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TyreAllocationFormData) => void;
  position: string;
  positionLabel?: string;
  fleetNumber?: string;
  vehicleType?: 'horse' | 'truck' | 'trailer' | 'interlink';
  initialData?: Partial<TyreAllocationFormData>;
  loading?: boolean;
}

const brandOptions = [
  { value: '', label: 'Select Brand' },
  { value: 'Michelin', label: 'Michelin' },
  { value: 'Bridgestone', label: 'Bridgestone' },
  { value: 'Goodyear', label: 'Goodyear' },
  { value: 'Continental', label: 'Continental' },
  { value: 'Dunlop', label: 'Dunlop' },
  { value: 'Pirelli', label: 'Pirelli' },
  { value: 'Hankook', label: 'Hankook' },
  { value: 'Yokohama', label: 'Yokohama' },
  { value: 'Firestone', label: 'Firestone' },
  { value: 'Other', label: 'Other' },
];

const supplierOptions = [
  { value: '', label: 'Select Supplier' },
  { value: 'Tyre Corp SA', label: 'Tyre Corp SA' },
  { value: 'Fleet Tyres', label: 'Fleet Tyres' },
  { value: 'Truck Tyre Warehouse', label: 'Truck Tyre Warehouse' },
  { value: 'National Tyres', label: 'National Tyres' },
  { value: 'Direct Supplier', label: 'Direct Supplier' },
  { value: 'Other', label: 'Other' },
];

const conditionOptions = [
  { value: 'new', label: 'New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'worn', label: 'Worn' },
  { value: 'replace', label: 'Needs Replacement' },
];

const sizeOptions = [
  { value: '', label: 'Select Size' },
  { value: '315/80R22.5', label: '315/80R22.5' },
  { value: '295/80R22.5', label: '295/80R22.5' },
  { value: '385/65R22.5', label: '385/65R22.5' },
  { value: '12R22.5', label: '12R22.5' },
  { value: '11R22.5', label: '11R22.5' },
  { value: '275/70R22.5', label: '275/70R22.5' },
  { value: '245/70R19.5', label: '245/70R19.5' },
  { value: 'Other', label: 'Other' },
];

const defaultFormData: TyreAllocationFormData = {
  tyreCode: '',
  brand: '',
  pattern: '',
  supplier: '',
  cost: 0,
  currentKilometers: 0,
  mountedDate: new Date().toISOString().split('T')[0],
  position: '',
  size: '',
  condition: 'new',
  treadDepth: undefined,
  notes: '',
};

export function TyreAllocationForm({
  isOpen,
  onClose,
  onSubmit,
  position,
  positionLabel,
  fleetNumber,
  vehicleType,
  initialData,
  loading = false,
}: TyreAllocationFormProps) {
  const [formData, setFormData] = useState<TyreAllocationFormData>({
    ...defaultFormData,
    position,
    ...initialData,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TyreAllocationFormData, string>>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value,
    }));
    // Clear error when field is modified
    if (errors[name as keyof TyreAllocationFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TyreAllocationFormData, string>> = {};

    if (!formData.tyreCode.trim()) {
      newErrors.tyreCode = 'Tyre code is required';
    }
    if (!formData.brand) {
      newErrors.brand = 'Brand is required';
    }
    if (!formData.pattern.trim()) {
      newErrors.pattern = 'Tyre pattern is required';
    }
    if (!formData.supplier) {
      newErrors.supplier = 'Supplier is required';
    }
    if (formData.cost <= 0) {
      newErrors.cost = 'Cost must be greater than 0';
    }
    if (formData.currentKilometers < 0) {
      newErrors.currentKilometers = 'Kilometers cannot be negative';
    }
    if (!formData.mountedDate) {
      newErrors.mountedDate = 'Mounted date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleReset = () => {
    setFormData({
      ...defaultFormData,
      position,
      ...initialData,
    });
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Allocate Tyre to Position"
      description={`Assign a tyre to position ${positionLabel || position}${fleetNumber ? ` on ${fleetNumber}` : ''}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Position indicator */}
        <div className="flex items-center gap-3 p-4 bg-primary-500/10 rounded-lg border border-primary-500/20">
          <div className="p-2 rounded-lg bg-primary-500/20">
            <Circle className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <p className="text-sm text-dark-400">Position</p>
            <p className="font-medium text-white">
              {positionLabel || position}
              {vehicleType && <span className="text-dark-400 ml-2">({vehicleType})</span>}
            </p>
          </div>
        </div>

        {/* Tyre identification */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-dark-300 border-b border-primary-500/10 pb-2">
            Tyre Identification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tyre Code *"
              name="tyreCode"
              value={formData.tyreCode}
              onChange={handleChange}
              placeholder="e.g., TYR-2024-001"
              error={errors.tyreCode}
            />
            <Select
              label="Brand *"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              options={brandOptions}
              error={errors.brand}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tyre Pattern *"
              name="pattern"
              value={formData.pattern}
              onChange={handleChange}
              placeholder="e.g., X Multi D, R168"
              error={errors.pattern}
            />
            <Select
              label="Size"
              name="size"
              value={formData.size || ''}
              onChange={handleChange}
              options={sizeOptions}
            />
          </div>
        </div>

        {/* Purchase details */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-dark-300 border-b border-primary-500/10 pb-2">
            Purchase Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Supplier *"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              options={supplierOptions}
              error={errors.supplier}
            />
            <Input
              label="Cost (R) *"
              name="cost"
              type="number"
              min="0"
              step="0.01"
              value={formData.cost || ''}
              onChange={handleChange}
              placeholder="e.g., 5500.00"
              error={errors.cost}
            />
          </div>
        </div>

        {/* Installation details */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-dark-300 border-b border-primary-500/10 pb-2">
            Installation Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <DatePicker
              label="Mounted Date *"
              value={formData.mountedDate}
              onChange={(date) => setFormData(prev => ({ ...prev, mountedDate: date }))}
              error={errors.mountedDate}
            />
            <Input
              label="Current Kilometers *"
              name="currentKilometers"
              type="number"
              min="0"
              value={formData.currentKilometers || ''}
              onChange={handleChange}
              placeholder="e.g., 45000"
              error={errors.currentKilometers}
              helperText="Vehicle odometer at installation"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select
              label="Condition"
              name="condition"
              value={formData.condition || 'new'}
              onChange={handleChange}
              options={conditionOptions}
            />
            <Input
              label="Tread Depth (mm)"
              name="treadDepth"
              type="number"
              min="0"
              max="30"
              step="0.1"
              value={formData.treadDepth || ''}
              onChange={handleChange}
              placeholder="e.g., 18.0"
              helperText="Optional - measure in mm"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-dark-300 border-b border-primary-500/10 pb-2">
            Additional Notes
          </h3>
          <Textarea
            label="Notes"
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            rows={3}
            placeholder="Any additional notes about this tyre allocation..."
          />
        </div>

        {/* Form actions */}
        <div className="flex items-center justify-between pt-4 border-t border-primary-500/10">
          <Button type="button" variant="ghost" onClick={handleReset} disabled={loading}>
            <X className="w-4 h-4" />
            Reset
          </Button>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              <Save className="w-4 h-4" />
              Allocate Tyre
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

// Tyre position summary card for quick view
interface TyrePositionSummaryProps {
  position: string;
  positionLabel: string;
  allocation?: {
    tyreCode: string;
    brand: string;
    pattern: string;
    condition?: 'new' | 'good' | 'fair' | 'worn' | 'replace';
    treadDepth?: number;
    currentKilometers?: number;
    mountedDate?: string;
  };
  onClick?: () => void;
  className?: string;
}

const conditionColors = {
  new: 'bg-success-500/10 border-success-500/30 text-success-400',
  good: 'bg-success-500/10 border-success-500/30 text-success-400',
  fair: 'bg-warning-500/10 border-warning-500/30 text-warning-400',
  worn: 'bg-warning-500/10 border-warning-500/30 text-warning-400',
  replace: 'bg-danger-500/10 border-danger-500/30 text-danger-400',
};

export function TyrePositionSummary({
  position,
  positionLabel,
  allocation,
  onClick,
  className,
}: TyrePositionSummaryProps) {
  const hasAllocation = !!allocation;
  const condition = allocation?.condition || 'new';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 rounded-lg border-2 transition-all duration-200 text-left',
        'hover:scale-[1.02] hover:shadow-lg',
        hasAllocation
          ? conditionColors[condition]
          : 'bg-dark-800/50 border-dark-600 border-dashed hover:border-primary-500/30',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold',
            hasAllocation ? conditionColors[condition] : 'bg-dark-700 text-dark-400'
          )}
          title={positionLabel}
        >
          {position}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {hasAllocation ? allocation.tyreCode : 'No tyre allocated'}
          </p>
          {hasAllocation ? (
            <p className="text-xs text-dark-400 truncate">
              {allocation.brand} {allocation.pattern}
            </p>
          ) : (
            <p className="text-xs text-dark-500">Click to allocate</p>
          )}
        </div>
        {hasAllocation && allocation.treadDepth !== undefined && (
          <div className="text-right">
            <p className="text-sm font-medium text-white">{allocation.treadDepth}mm</p>
            <p className="text-xs text-dark-400">tread</p>
          </div>
        )}
      </div>
    </button>
  );
}
