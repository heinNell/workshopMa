'use client';

import { InventoryList } from '@/components/inventory';
import { MainLayout } from '@/components/layout';
import { useInventory } from '@/hooks/useInventory';
import { transformInventoryItem } from '@/lib/transforms';
import type { InventoryItem } from '@/types';
import { useMemo } from 'react';

export default function InventoryPage() {
  const { data, loading, error } = useInventory();

  const items: InventoryItem[] = useMemo(
    () => data.map((row) => transformInventoryItem(row)),
    [data]
  );

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
            onItemClick={(item) => console.log('Clicked:', item)}
            onAddItem={() => console.log('Add item clicked')}
          />
        )}
      </div>
    </MainLayout>
  );
}
