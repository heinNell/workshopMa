'use client';

import type { InventoryFormData } from '@/components/inventory';
import { InventoryFormModal, InventoryList } from '@/components/inventory';
import { MainLayout } from '@/components/layout';
import { Button, Modal } from '@/components/ui';
import
  {
    createInventoryItem,
    deleteInventoryItem,
    updateInventoryItem,
    useInventory
  } from '@/hooks/useInventory';
import { transformInventoryItem } from '@/lib/transforms';
import type { InventoryItem } from '@/types';
import { useMemo, useState } from 'react';

export default function InventoryPage() {
  const { data, loading, error, refetch } = useInventory();
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const items: InventoryItem[] = useMemo(
    () => data.map((row) => transformInventoryItem(row)),
    [data]
  );

  // Handle create
  const handleAddItem = () => {
    setSelectedItem(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  // Handle edit
  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  // Handle form submit
  const handleFormSubmit = async (formData: InventoryFormData) => {
    const input = {
      part_number: formData.partNumber,
      name: formData.name,
      description: formData.description || null,
      category: formData.category,
      quantity_in_stock: formData.quantityInStock,
      minimum_stock: formData.minimumStock,
      unit_price: formData.unitPrice,
      supplier: formData.supplier || null,
      location: formData.location || null,
    };

    if (formMode === 'create') {
      await createInventoryItem(input);
    } else if (selectedItem) {
      await updateInventoryItem(selectedItem.id, input);
    }
    refetch();
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (selectedItem) {
      await deleteInventoryItem(selectedItem.id);
      refetch();
    }
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
          <p className="text-dark-400 mt-1">Track parts, supplies, and stock levels</p>
        </div>

        {/* Inventory List now powered by Supabase real-time data */}
        {loading ? (
          <div className="text-dark-400 min-h-[400px] flex items-center justify-center">Loading inventory...</div>
        ) : error ? (
          <div className="text-danger-500 min-h-[400px] flex items-center justify-center">Failed to load inventory: {error.message}</div>
        ) : (
          <InventoryList
            items={items}
            onItemClick={(item) => handleEditItem(item)}
            onAddItem={handleAddItem}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteClick}
          />
        )}
      </div>

      {/* Form Modal */}
      <InventoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        item={selectedItem}
        mode={formMode}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Inventory Item"
      >
        <div className="space-y-4">
          <p className="text-dark-300">
            Are you sure you want to delete <span className="text-white font-medium">{selectedItem?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}
