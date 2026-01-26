'use client';

import { Button, DatePicker, Input, Modal, Select, Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Tyre } from '@/types';
import { Plus, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TyreEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tyre: Tyre) => void;
  tyre: Tyre | null;
  loading?: boolean;
  mode?: 'edit' | 'create';
}

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

const conditionOptions = [
  { value: 'new', label: 'New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'worn', label: 'Worn' },
  { value: 'replace', label: 'Needs Replacement' },
];

const statusOptions = [
  { value: 'in-use', label: 'In Use' },
  { value: 'in-stock', label: 'In Stock' },
  { value: 'retreading', label: 'Retreading' },
  { value: 'disposed', label: 'Disposed' },
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

// Supplier options available for future use
// const supplierOptions = [
//   { value: '', label: 'Select Supplier' },
//   { value: 'Tyre Corp SA', label: 'Tyre Corp SA' },
//   { value: 'Fleet Tyres', label: 'Fleet Tyres' },
//   { value: 'Truck Tyre Warehouse', label: 'Truck Tyre Warehouse' },
//   { value: 'National Tyres', label: 'National Tyres' },
//   { value: 'Direct Supplier', label: 'Direct Supplier' },
//   { value: 'Other', label: 'Other' },
// ];

const getDefaultTyre = (): Partial<Tyre> => ({
  serialNumber: '',
  brand: '',
  model: '',
  size: '315/80R22.5',
  condition: 'new',
  status: 'in-stock',
  treadDepth: 18,
  currentMileage: 0,
});

export function TyreEditForm({
  isOpen,
  onClose,
  onSubmit,
  tyre,
  loading = false,
  mode = 'edit',
}: TyreEditFormProps) {
  const [formData, setFormData] = useState<Partial<Tyre>>(getDefaultTyre());
  const [errors, setErrors] = useState<Partial<Record<keyof Tyre, string>>>({}); 
  
  // Quick-add brand state
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [customBrands, setCustomBrands] = useState<Array<{ value: string; label: string }>>([]);

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

  useEffect(() => {
    if (tyre && mode === 'edit') {
      setFormData(tyre);
    } else if (mode === 'create') {
      setFormData(getDefaultTyre());
    }
  }, [tyre, mode, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : parseFloat(value)) : value,
    }));
    if (errors[name as keyof Tyre]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof Tyre, string>> = {};

    if (!formData.serialNumber?.trim()) {
      newErrors.serialNumber = 'Serial number is required';
    }
    if (!formData.brand) {
      newErrors.brand = 'Brand is required';
    }
    if (!formData.model?.trim()) {
      newErrors.model = 'Model/Pattern is required';
    }
    if (!formData.size) {
      newErrors.size = 'Size is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const now = new Date();
      const completeTyre: Tyre = {
        id: tyre?.id || `tyre-${Date.now()}`,
        serialNumber: formData.serialNumber || '',
        brand: formData.brand || '',
        model: formData.model || '',
        size: formData.size || '',
        condition: formData.condition || 'new',
        status: formData.status || 'in-stock',
        vehicleId: formData.vehicleId,
        fleetNumber: formData.fleetNumber,
        position: formData.position,
        treadDepth: formData.treadDepth,
        currentPressure: formData.currentPressure,
        purchaseDate: formData.purchaseDate,
        purchasePrice: formData.purchasePrice,
        installedDate: formData.installedDate,
        installedMileage: formData.installedMileage,
        currentMileage: formData.currentMileage,
        notes: formData.notes,
        createdAt: tyre?.createdAt || now,
        updatedAt: now,
      };
      onSubmit(completeTyre);
    }
  };

  const handleReset = () => {
    if (tyre && mode === 'edit') {
      setFormData(tyre);
    } else {
      setFormData(getDefaultTyre());
    }
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Tyre' : 'Add New Tyre'}
      description={mode === 'edit' ? `Editing tyre ${tyre?.serialNumber}` : 'Add a new tyre to inventory'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tyre identification */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-dark-300 border-b border-primary-500/10 pb-2">
            Tyre Identification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Serial Number / Tyre Code *"
              name="serialNumber"
              value={formData.serialNumber || ''}
              onChange={handleChange}
              placeholder="e.g., TYR-2024-001"
              error={errors.serialNumber}
            />
            <div className="space-y-2">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Select
                    label="Brand *"
                    name="brand"
                    value={formData.brand || ''}
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
              label="Model / Pattern *"
              name="model"
              value={formData.model || ''}
              onChange={handleChange}
              placeholder="e.g., X Multi D, R168"
              error={errors.model}
            />
            <Select
              label="Size *"
              name="size"
              value={formData.size || ''}
              onChange={handleChange}
              options={sizeOptions}
              error={errors.size}
            />
          </div>
        </div>

        {/* Status & Condition */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-dark-300 border-b border-primary-500/10 pb-2">
            Status & Condition
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Status"
              name="status"
              value={formData.status || 'in-stock'}
              onChange={handleChange}
              options={statusOptions}
            />
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
              value={formData.treadDepth ?? ''}
              onChange={handleChange}
              placeholder="e.g., 18.0"
            />
          </div>
        </div>

        {/* Allocation Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-dark-300 border-b border-primary-500/10 pb-2">
            Allocation Details (if in use)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Fleet Number"
              name="fleetNumber"
              value={formData.fleetNumber || ''}
              onChange={handleChange}
              placeholder="e.g., 21H"
            />
            <Input
              label="Position"
              name="position"
              value={formData.position || ''}
              onChange={handleChange}
              placeholder="e.g., FL, RLO"
            />
            <Input
              label="Current Kilometers"
              name="currentMileage"
              type="number"
              min="0"
              value={formData.currentMileage ?? ''}
              onChange={handleChange}
              placeholder="e.g., 45000"
            />
          </div>
        </div>

        {/* Purchase Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-dark-300 border-b border-primary-500/10 pb-2">
            Purchase Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Purchase Price (R)"
              name="purchasePrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.purchasePrice ?? ''}
              onChange={handleChange}
              placeholder="e.g., 5500.00"
            />
            <DatePicker
              label="Purchase Date"
              value={formData.purchaseDate ? new Date(formData.purchaseDate).toISOString().split('T')[0] : ''}
              onChange={(date) => setFormData((prev) => ({
                ...prev,
                purchaseDate: date ? new Date(date) : undefined,
              }))}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <DatePicker
              label="Installed Date"
              value={formData.installedDate ? new Date(formData.installedDate).toISOString().split('T')[0] : ''}
              onChange={(date) => setFormData((prev) => ({
                ...prev,
                installedDate: date ? new Date(date) : undefined,
              }))}
            />
            <Input
              label="Installed Mileage"
              name="installedMileage"
              type="number"
              min="0"
              value={formData.installedMileage ?? ''}
              onChange={handleChange}
              placeholder="e.g., 45000"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-dark-300 border-b border-primary-500/10 pb-2">
            Notes
          </h3>
          <Textarea
            label="Additional Notes"
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            rows={3}
            placeholder="Any additional notes about this tyre..."
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
              {mode === 'edit' ? 'Save Changes' : 'Add Tyre'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
