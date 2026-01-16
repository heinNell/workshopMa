'use client';

import { useSupabaseQuery } from './useSupabase';
import { createClient } from '@/lib/supabase/client';
import { useCallback, useEffect, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Database row types
export interface TyreRow {
  id: string;
  serial_number: string;
  vehicle_id: string | null;
  fleet_number: string | null;
  position: string | null;
  brand: string;
  model: string;
  size: string;
  condition: 'new' | 'good' | 'fair' | 'worn' | 'replace';
  tread_depth: number | null;
  purchase_date: string | null;
  purchase_price: number | null;
  mileage_at_install: number | null;
  current_mileage: number | null;
  status: 'in-use' | 'in-stock' | 'retreading' | 'disposed';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TyreHistoryRow {
  id: string;
  tyre_id: string;
  action: 'install' | 'rotate' | 'remove' | 'inspect' | 'retread' | 'dispose';
  vehicle_id: string | null;
  fleet_number: string | null;
  position: string | null;
  odometer_reading: number | null;
  tread_depth: number | null;
  notes: string | null;
  performed_by: string;
  performed_date: string;
  created_at: string;
}

// Hook to fetch all tyres
export function useTyres(vehicleId?: string) {
  const filter = vehicleId ? { column: 'vehicle_id', value: vehicleId } : undefined;
  
  return useSupabaseQuery<TyreRow>('tyres', {
    filter,
    orderBy: { column: 'position', ascending: true },
    realtime: true,
  });
}

// Hook to fetch tyres by fleet number
export function useTyresByFleetNumber(fleetNumber: string | null) {
  const [data, setData] = useState<TyreRow[]>([]);
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
        .from('tyres')
        .select('*')
        .eq('fleet_number', fleetNumber.toUpperCase())
        .order('position', { ascending: true });

      if (err) throw err;
      setData(result as TyreRow[]);
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
        .channel(`tyres-${fleetNumber}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tyres',
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

// Hook to fetch tyre history by fleet number
export function useTyreHistoryByFleetNumber(fleetNumber: string | null) {
  const [data, setData] = useState<TyreHistoryRow[]>([]);
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
        .from('tyre_history')
        .select('*')
        .eq('fleet_number', fleetNumber.toUpperCase())
        .order('performed_date', { ascending: false });

      if (err) throw err;
      setData(result as TyreHistoryRow[]);
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

  return { data, loading, error, refetch: fetchData };
}

// Hook to get tyre statistics
export function useTyreStats() {
  const [data, setData] = useState({
    total: 0,
    inUse: 0,
    inStock: 0,
    needsReplacement: 0,
    retreading: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: tyres, error: err } = await supabase
        .from('tyres')
        .select('status, condition');

      if (err) throw err;

      const stats = {
        total: tyres?.length || 0,
        inUse: tyres?.filter((t: { status: string }) => t.status === 'in-use').length || 0,
        inStock: tyres?.filter((t: { status: string }) => t.status === 'in-stock').length || 0,
        needsReplacement: tyres?.filter((t: { condition: string }) => t.condition === 'replace' || t.condition === 'worn').length || 0,
        retreading: tyres?.filter((t: { status: string }) => t.status === 'retreading').length || 0,
      };

      setData(stats);
    } catch (err) {
      console.error('Error fetching tyre stats:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}
