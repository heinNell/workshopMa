'use client';

import { Button, Input, Modal, Select } from '@/components/ui';
import type { InventoryItem } from '@/types';
import { useEffect, useState } from 'react';

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InventoryFormData) => Promise<void>;
  item?: InventoryItem | null;
  mode: 'create' | 'edit';
}

export interface InventoryFormData {
  partNumber: string;
  name: string;
  description: string;
  category: string;
  quantityInStock: number;
  minimumStock: number;
  unitPrice: number;
  supplier: string;
  location: string;
}

const CATEGORY_OPTIONS = [
  { value: 'Filters', label: 'Filters' },
  { value: 'Brakes', label: 'Brakes' },
  { value: 'Engine', label: 'Engine' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'Suspension', label: 'Suspension' },
  { value: 'Transmission', label: 'Transmission' },
  { value: 'Cooling', label: 'Cooling' },
  { value: 'Tyres', label: 'Tyres' },
  { value: 'Lubricants', label: 'Lubricants' },
  { value: 'Body Parts', label: 'Body Parts' },
  { value: 'Consumables', label: 'Consumables' },
  { value: 'Other', label: 'Other' },
];

export function InventoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  item,
  mode,
}: InventoryFormModalProps) {
  const [formData, setFormData] = useState<InventoryFormData>({
    partNumber: '',
    name: '',
    description: '',
    category: 'Other',
    quantityInStock: 0,
    minimumStock: 5,
    unitPrice: 0,
    supplier: '',
    location: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or item changes
  useEffect(() => {
    if (isOpen && item && mode === 'edit') {
      setFormData({
        partNumber: item.partNumber,
        name: item.name,
        description: item.description || '',
        category: item.category,
        quantityInStock: item.quantityInStock,
        minimumStock: item.minimumStock,
        unitPrice: item.unitPrice,
        supplier: item.supplier || '',
        location: item.location || '',
      });
    } else if (isOpen && mode === 'create') {
      setFormData({
        partNumber: '',
        name: '',
        description: '',
        category: 'Other',
        quantityInStock: 0,
        minimumStock: 5,
        unitPrice: 0,
        supplier: '',
        location: '',
      });
    }
  }, [isOpen, item, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting inventory item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add Inventory Item' : 'Edit Inventory Item'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Part Number"
            value={formData.partNumber}
            onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
            placeholder="e.g., FLT-OIL-001"
            required
          />
          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={CATEGORY_OPTIONS}
          />
        </div>

        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Item name"
          required
        />

        <Input
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Optional description"
        />

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Quantity in Stock"
            type="number"
            min="0"
            value={formData.quantityInStock}
            onChange={(e) => setFormData({ ...formData, quantityInStock: parseInt(e.target.value) || 0 })}
            required
          />
          <Input
            label="Minimum Stock"
            type="number"
            min="0"
            value={formData.minimumStock}
            onChange={(e) => setFormData({ ...formData, minimumStock: parseInt(e.target.value) || 0 })}
            required
          />
          <Input
            label="Unit Price (R)"
            type="number"
            min="0"
            step="0.01"
            value={formData.unitPrice}
            onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Supplier"
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            placeholder="Supplier name"
          />
          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Shelf A-12"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Add Item' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
