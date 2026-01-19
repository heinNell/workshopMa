'use client';

import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

// Database row types
export interface ScheduledMaintenanceRow {
  id: string;
  vehicle_id: string;
  fleet_number: string;
  maintenance_type: string;
  description: string | null;
  interval_days: number | null;
  interval_km: number | null;
  last_completed_date: string | null;
  last_completed_mileage: number | null;
  next_due_date: string | null;
  next_due_mileage: number | null;
  status: 'upcoming' | 'due' | 'overdue' | 'completed';
  created_at: string;
  updated_at: string;
}

// Hook to fetch scheduled maintenance by fleet number
export function useScheduledMaintenanceByFleetNumber(fleetNumber: string | null) {
  const [data, setData] = useState<ScheduledMaintenanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    if (!fleetNumber) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: result, error: err } = await supabase
        .from('scheduled_maintenance')
        .select('*')
        .eq('fleet_number', fleetNumber.toUpperCase())
        .order('next_due_date', { ascending: true });

      if (err) throw err;
      setData(result as ScheduledMaintenanceRow[]);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fleetNumber, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time subscription
  useEffect(() => {
    if (!fleetNumber) return;

    let channel: RealtimeChannel;

    const setupRealtime = () => {
      channel = supabase
        .channel(`maintenance-${fleetNumber}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'scheduled_maintenance',
            filter: `fleet_number=eq.${fleetNumber.toUpperCase()}`,
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
  }, [fleetNumber, fetchData, supabase]);

  return { data, loading, error, refetch: fetchData };
}

// Hook to get overdue maintenance items
export function useOverdueMaintenance() {
  const [data, setData] = useState<ScheduledMaintenanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: result, error: err } = await supabase
        .from('scheduled_maintenance')
        .select('*')
        .in('status', ['due', 'overdue'])
        .order('next_due_date', { ascending: true });

      if (err) throw err;
      setData(result as ScheduledMaintenanceRow[]);
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

  return { data, loading, error, refetch: fetchData };
}

// Mutation hooks for scheduled maintenance
export function useMaintenanceMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  const createMaintenance = useCallback(async (maintenance: Partial<ScheduledMaintenanceRow>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('scheduled_maintenance')
        .insert([maintenance])
        .select()
        .single();

      if (err) throw err;
      return { data, error: null };
    } catch (err) {
      setError(err as Error);
      return { data: null, error: err as Error };
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const updateMaintenance = useCallback(async (id: string, updates: Partial<ScheduledMaintenanceRow>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('scheduled_maintenance')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;
      return { data, error: null };
    } catch (err) {
      setError(err as Error);
      return { data: null, error: err as Error };
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const deleteMaintenance = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from('scheduled_maintenance')
        .delete()
        .eq('id', id);

      if (err) throw err;
      return { success: true, error: null };
    } catch (err) {
      setError(err as Error);
      return { success: false, error: err as Error };
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return {
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
    loading,
    error,
  };
}
