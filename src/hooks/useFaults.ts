'use client';

import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { useSupabaseQuery } from './useSupabase';

// Database row types
export interface FaultRow {
  id: string;
  vehicle_id: string;
  fleet_number: string;
  inspection_id: string | null;
  job_card_id: string | null;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'assigned' | 'in-progress' | 'resolved';
  reported_by: string;
  reported_date: string;
  resolved_date: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

// Hook to fetch all faults
export function useFaults(vehicleId?: string) {
  const filter = vehicleId ? { column: 'vehicle_id', value: vehicleId } : undefined;
  
  return useSupabaseQuery<FaultRow>('faults', {
    filter,
    orderBy: { column: 'created_at', ascending: false },
    realtime: false,
  });
}

// Hook to fetch faults by fleet number
export function useFaultsByFleetNumber(fleetNumber: string | null) {
  const [data, setData] = useState<FaultRow[]>([]);
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
        .from('faults')
        .select('*')
        .eq('fleet_number', fleetNumber.toUpperCase())
        .order('created_at', { ascending: false });

      if (err) throw err;
      setData(result as FaultRow[]);
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
        .channel(`faults-${fleetNumber}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'faults',
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

// Hook to get fault statistics
export function useFaultStats() {
  const [data, setData] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    critical: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: faults, error: err } = await supabase
        .from('faults')
        .select('status, severity');

      if (err) throw err;

      const stats = {
        total: faults?.length || 0,
        open: faults?.filter((f: { status: string }) => f.status === 'open').length || 0,
        inProgress: faults?.filter((f: { status: string }) => f.status === 'in-progress').length || 0,
        critical: faults?.filter((f: { severity: string; status: string }) => f.severity === 'critical' && f.status !== 'resolved').length || 0,
        resolved: faults?.filter((f: { status: string }) => f.status === 'resolved').length || 0,
      };

      setData(stats);
    } catch (err) {
      console.error('Error fetching fault stats:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}

// Mutation hooks for faults
export function useFaultMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  const createFault = useCallback(async (fault: Partial<FaultRow>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('faults')
        .insert([fault])
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

  const updateFault = useCallback(async (id: string, updates: Partial<FaultRow>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('faults')
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

  const deleteFault = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from('faults')
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
    createFault,
    updateFault,
    deleteFault,
    loading,
    error,
  };
}
