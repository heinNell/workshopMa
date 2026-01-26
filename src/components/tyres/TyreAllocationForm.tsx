'use client';

import { Button, DatePicker, Input, Modal, Select, Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { TyreAllocationFormData } from '@/types';
import { Circle, Plus, Save, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface TyreAllocationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TyreAllocationFormData) => void;
  position: string;
  positionLabel?: string;
  fleetNumber?: string;
  vehicleType?: 'horse' | 'truck' | 'trailer' | 'interlink' | 'ridget' | 'ridget30H' | 'bakkie';
  initialData?: Partial<TyreAllocationFormData>;
  loading?: boolean;
  existingTyrePositions?: string[]; // Positions that already have tyres allocated
}

// Position configurations for each vehicle type
const positionConfigs: Record<string, Array<{ position: string; label: string }>> = {
  horse: [
    { position: 'FL', label: 'Front Left' },
    { position: 'FR', label: 'Front Right' },
    { position: 'RLO', label: 'Rear Left Outer' },
    { position: 'RLI', label: 'Rear Left Inner' },
    { position: 'RRI', label: 'Rear Right Inner' },
    { position: 'RRO', label: 'Rear Right Outer' },
    { position: 'RLO2', label: 'Rear Left Outer 2' },
    { position: 'RLI2', label: 'Rear Left Inner 2' },
    { position: 'RRI2', label: 'Rear Right Inner 2' },
    { position: 'RRO2', label: 'Rear Right Outer 2' },
  ],
  truck: [
    { position: 'FL', label: 'Front Left' },
    { position: 'FR', label: 'Front Right' },
    { position: 'RLO', label: 'Rear Left Outer' },
    { position: 'RLI', label: 'Rear Left Inner' },
    { position: 'RRI', label: 'Rear Right Inner' },
    { position: 'RRO', label: 'Rear Right Outer' },
    { position: 'RLO2', label: 'Rear Left Outer 2' },
    { position: 'RLI2', label: 'Rear Left Inner 2' },
    { position: 'RRI2', label: 'Rear Right Inner 2' },
    { position: 'RRO2', label: 'Rear Right Outer 2' },
  ],
  trailer: [
    { position: 'A1LO', label: 'Axle 1 Left Outer' },
    { position: 'A1LI', label: 'Axle 1 Left Inner' },
    { position: 'A1RI', label: 'Axle 1 Right Inner' },
    { position: 'A1RO', label: 'Axle 1 Right Outer' },
    { position: 'A2LO', label: 'Axle 2 Left Outer' },
    { position: 'A2LI', label: 'Axle 2 Left Inner' },
    { position: 'A2RI', label: 'Axle 2 Right Inner' },
    { position: 'A2RO', label: 'Axle 2 Right Outer' },
    { position: 'A3LO', label: 'Axle 3 Left Outer' },
    { position: 'A3LI', label: 'Axle 3 Left Inner' },
    { position: 'A3RI', label: 'Axle 3 Right Inner' },
    { position: 'A3RO', label: 'Axle 3 Right Outer' },
  ],
  ridget: [
    { position: 'FL', label: 'Front Left Steering' },
    { position: 'FR', label: 'Front Right Steering' },
    { position: 'RLO', label: 'Rear Left Outer' },
    { position: 'RLI', label: 'Rear Left Inner' },
    { position: 'RRI', label: 'Rear Right Inner' },
    { position: 'RRO', label: 'Rear Right Outer' },
  ],
  ridget30H: [
    { position: 'FL', label: 'Front Left Steering' },
    { position: 'FR', label: 'Front Right Steering' },
    { position: 'RLO', label: 'Rear Left Outer' },
    { position: 'RLI', label: 'Rear Left Inner' },
    { position: 'RRI', label: 'Rear Right Inner' },
    { position: 'RRO', label: 'Rear Right Outer' },
    { position: 'RLO2', label: 'Rear Left Outer 2' },
    { position: 'RLI2', label: 'Rear Left Inner 2' },
    { position: 'RRI2', label: 'Rear Right Inner 2' },
    { position: 'RRO2', label: 'Rear Right Outer 2' },
  ],
  bakkie: [
    { position: 'FL', label: 'Front Left Steering' },
    { position: 'FR', label: 'Front Right Steering' },
    { position: 'RL', label: 'Rear Left Drive' },
    { position: 'RR', label: 'Rear Right Drive' },
  ],
  interlink: [
    // Trailer 1
    { position: 'T1-A1LO', label: 'T1 Axle 1 Left Outer' },
    { position: 'T1-A1LI', label: 'T1 Axle 1 Left Inner' },
    { position: 'T1-A1RI', label: 'T1 Axle 1 Right Inner' },
    { position: 'T1-A1RO', label: 'T1 Axle 1 Right Outer' },
    { position: 'T1-A2LO', label: 'T1 Axle 2 Left Outer' },
    { position: 'T1-A2LI', label: 'T1 Axle 2 Left Inner' },
    { position: 'T1-A2RI', label: 'T1 Axle 2 Right Inner' },
    { position: 'T1-A2RO', label: 'T1 Axle 2 Right Outer' },
    { position: 'T1-A3LO', label: 'T1 Axle 3 Left Outer' },
    { position: 'T1-A3LI', label: 'T1 Axle 3 Left Inner' },
    { position: 'T1-A3RI', label: 'T1 Axle 3 Right Inner' },
    { position: 'T1-A3RO', label: 'T1 Axle 3 Right Outer' },
    { position: 'T1-A4LO', label: 'T1 Axle 4 Left Outer' },
    { position: 'T1-A4LI', label: 'T1 Axle 4 Left Inner' },
    { position: 'T1-A4RI', label: 'T1 Axle 4 Right Inner' },
    { position: 'T1-A4RO', label: 'T1 Axle 4 Right Outer' },
    { position: 'T1-SP', label: 'T1 Spare' },
    // Trailer 2
    { position: 'T2-A1LO', label: 'T2 Axle 1 Left Outer' },
    { position: 'T2-A1LI', label: 'T2 Axle 1 Left Inner' },
    { position: 'T2-A1RI', label: 'T2 Axle 1 Right Inner' },
    { position: 'T2-A1RO', label: 'T2 Axle 1 Right Outer' },
    { position: 'T2-A2LO', label: 'T2 Axle 2 Left Outer' },
    { position: 'T2-A2LI', label: 'T2 Axle 2 Left Inner' },
    { position: 'T2-A2RI', label: 'T2 Axle 2 Right Inner' },
    { position: 'T2-A2RO', label: 'T2 Axle 2 Right Outer' },
    { position: 'T2-A3LO', label: 'T2 Axle 3 Left Outer' },
    { position: 'T2-A3LI', label: 'T2 Axle 3 Left Inner' },
    { position: 'T2-A3RI', label: 'T2 Axle 3 Right Inner' },
    { position: 'T2-A3RO', label: 'T2 Axle 3 Right Outer' },
    { position: 'T2-A4LO', label: 'T2 Axle 4 Left Outer' },
    { position: 'T2-A4LI', label: 'T2 Axle 4 Left Inner' },
    { position: 'T2-A4RI', label: 'T2 Axle 4 Right Inner' },
    { position: 'T2-A4RO', label: 'T2 Axle 4 Right Outer' },
    { position: 'T2-SP', label: 'T2 Spare' },
  ],
};

const defaultBrandOptions = [
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

const CUSTOM_BRANDS_KEY = 'workshopma_custom_tyre_brands';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  positionLabel,
  fleetNumber,
  vehicleType,
  initialData,
  loading = false,
  existingTyrePositions = [],
}: TyreAllocationFormProps) {
  const [formData, setFormData] = useState<TyreAllocationFormData>({
    ...defaultFormData,
    position,
    ...initialData,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TyreAllocationFormData, string>>>({});
  
  // Quick-add brand state
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [customBrands, setCustomBrands] = useState<Array<{ value: string; label: string }>>([]);

  // Get position options based on vehicle type
  const positionOptions = useMemo(() => {
    const effectiveType = vehicleType === 'truck' ? 'horse' : vehicleType;
    const positions = positionConfigs[effectiveType || 'horse'] || positionConfigs.horse;
    
    return [
      { value: '', label: 'Select Position' },
      ...positions.map(p => ({
        value: p.position,
        label: `${p.position} - ${p.label}${existingTyrePositions.includes(p.position) ? ' (Occupied)' : ''}`,
        disabled: existingTyrePositions.includes(p.position),
      })),
    ];
  }, [vehicleType, existingTyrePositions]);

  // Update form data when position prop changes
  useEffect(() => {
    if (position) {
      setFormData(prev => ({ ...prev, position }));
    }
  }, [position]);

  // Load custom brands from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CUSTOM_BRANDS_KEY);
      if (stored) {
        try {
          setCustomBrands(JSON.parse(stored));
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, []);

  // Combined brand options
  const brandOptions = [
    ...defaultBrandOptions.slice(0, -1), // All default brands except 'Other'
    ...customBrands,
    defaultBrandOptions[defaultBrandOptions.length - 1], // 'Other' at the end
  ];

  const handleAddBrand = () => {
    if (!newBrandName.trim()) return;
    
    const newBrand = { value: newBrandName.trim(), label: newBrandName.trim() };
    const updatedCustomBrands = [...customBrands, newBrand];
    setCustomBrands(updatedCustomBrands);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(CUSTOM_BRANDS_KEY, JSON.stringify(updatedCustomBrands));
    }
    
    // Set the new brand as selected
    setFormData(prev => ({ ...prev, brand: newBrand.value }));
    setNewBrandName('');
    setShowAddBrand(false);
  };

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

    if (!formData.position) {
      newErrors.position = 'Position is required';
    }
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

  // Get the label for the currently selected position
  const selectedPositionLabel = useMemo(() => {
    const effectiveType = vehicleType === 'truck' ? 'horse' : vehicleType;
    const positions = positionConfigs[effectiveType || 'horse'] || positionConfigs.horse;
    const found = positions.find(p => p.position === formData.position);
    return found ? found.label : formData.position;
  }, [vehicleType, formData.position]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Allocate Tyre to Position"
      description={`Assign a tyre to ${fleetNumber || 'vehicle'}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Position selector */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-dark-300 border-b border-primary-500/10 pb-2">
            Tyre Position
          </h3>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary-500/20 mt-6">
              <Circle className="w-5 h-5 text-primary-400" />
            </div>
            <div className="flex-1">
              <Select
                label="Position *"
                name="position"
                value={formData.position}
                onChange={handleChange}
                options={positionOptions}
                error={errors.position}
              />
              {formData.position && (
                <p className="text-xs text-dark-400 mt-1">
                  {selectedPositionLabel}
                  {vehicleType && <span className="ml-1">({vehicleType === 'truck' ? 'horse' : vehicleType})</span>}
                </p>
              )}
            </div>
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
            <div className="space-y-2">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Select
                    label="Brand *"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    options={brandOptions}
                    error={errors.brand}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddBrand(!showAddBrand)}
                  className={cn(
                    "p-2 rounded-lg border transition-colors mb-0.5",
                    showAddBrand 
                      ? "bg-primary-500/20 border-primary-500/40 text-primary-400" 
                      : "bg-dark-800 border-dark-600 text-dark-400 hover:border-primary-500/40 hover:text-primary-400"
                  )}
                  title="Add new brand"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {/* Quick Add Brand inline form */}
              {showAddBrand && (
                <div className="flex gap-2 p-3 bg-dark-800/50 rounded-lg border border-primary-500/20 animate-in slide-in-from-top-1">
                  <Input
                    placeholder="New brand name..."
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddBrand();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddBrand}
                    disabled={!newBrandName.trim()}
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAddBrand(false);
                      setNewBrandName('');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
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
