'use client';

import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { useSupabaseQuery } from './useSupabase';

// Database row types
export interface InventoryItemRow {
  id: string;
  part_number: string;
  name: string;
  description: string | null;
  category: string;
  quantity_in_stock: number;
  minimum_stock: number;
  unit_price: number;
  supplier: string | null;
  location: string | null;
  last_ordered: string | null;
  last_used: string | null;
  created_at: string;
  updated_at: string;
}

// Input type for creating/updating inventory items
export interface InventoryItemInput {
  part_number: string;
  name: string;
  description?: string | null;
  category: string;
  quantity_in_stock: number;
  minimum_stock: number;
  unit_price: number;
  supplier?: string | null;
  location?: string | null;
}

// Hook to fetch all inventory items
export function useInventory(category?: string) {
  const filter = category ? { column: 'category', value: category } : undefined;
  
  return useSupabaseQuery<InventoryItemRow>('inventory_items', {
    filter,
    orderBy: { column: 'name', ascending: true },
    realtime: true,
  });
}

// Hook to fetch low stock items
export function useLowStockItems() {
  const [data, setData] = useState<InventoryItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Use raw SQL query to compare columns
      const { data: result, error: err } = await supabase
        .from('inventory_items')
        .select('*')
        .order('quantity_in_stock', { ascending: true });

      if (err) throw err;
      
      // Filter for low stock items (quantity <= minimum)
      const lowStock = (result as InventoryItemRow[]).filter(
        item => item.quantity_in_stock <= item.minimum_stock
      );
      
      setData(lowStock);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time subscription
  useEffect(() => {
    let channel: RealtimeChannel;

    const setupRealtime = () => {
      channel = supabase
        .channel('low-stock-items')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'inventory_items',
          },
          () => {
            fetchData();
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchData, supabase]);

  return { data, loading, refetch: fetchData };
}

// Hook to get inventory statistics
export function useInventoryStats() {
  const [data, setData] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStock: 0,
    outOfStock: 0,
    categories: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: items, error: err } = await supabase
        .from('inventory_items')
        .select('*');

      if (err) throw err;

      const typedItems = items as InventoryItemRow[];
      const categories = new Set(typedItems.map(i => i.category));

      const stats = {
        totalItems: typedItems.length,
        totalValue: typedItems.reduce((sum, i) => sum + (i.quantity_in_stock * i.unit_price), 0),
        lowStock: typedItems.filter(i => i.quantity_in_stock <= i.minimum_stock && i.quantity_in_stock > 0).length,
        outOfStock: typedItems.filter(i => i.quantity_in_stock === 0).length,
        categories: categories.size,
      };

      setData(stats);
    } catch (err) {
      console.error('Error fetching inventory stats:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}

// Create a new inventory item
export async function createInventoryItem(input: InventoryItemInput): Promise<InventoryItemRow> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('inventory_items')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as InventoryItemRow;
}

// Update an existing inventory item
export async function updateInventoryItem(id: string, input: Partial<InventoryItemInput>): Promise<InventoryItemRow> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('inventory_items')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as InventoryItemRow;
}

// Delete an inventory item
export async function deleteInventoryItem(id: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}