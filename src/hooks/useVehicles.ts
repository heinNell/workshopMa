'use client';

import { useSupabaseQuery } from './useSupabase';
import { createClient } from '@/lib/supabase/client';
import { useCallback, useEffect, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Database row types (snake_case from PostgreSQL)
export interface VehicleRow {
  id: string;
  fleet_number: string;
  category: 'horses' | 'reefers' | 'interlinks' | 'ridgets' | 'bakkies';
  make: string | null;
  model: string | null;
  year: number | null;
  vin: string | null;
  registration_number: string | null;
  status: 'active' | 'maintenance' | 'inactive';
  current_odometer: number | null;
  last_service_date: string | null;
  next_service_due: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Hook to fetch all vehicles
export function useVehicles(category?: string) {
  const filter = category ? { column: 'category', value: category } : undefined;
  
  return useSupabaseQuery<VehicleRow>('vehicles', {
    filter,
    orderBy: { column: 'fleet_number', ascending: true },
    realtime: true,
  });
}

// Hook to fetch a single vehicle by fleet number
export function useVehicleByFleetNumber(fleetNumber: string | null) {
  const [data, setData] = useState<VehicleRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    if (!fleetNumber) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: result, error: err } = await supabase
        .from('vehicles')
        .select('*')
        .eq('fleet_number', fleetNumber.toUpperCase())
        .single();

      if (err) throw err;
      setData(result as VehicleRow);
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
        .channel(`vehicle-${fleetNumber}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'vehicles',
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

// Hook to fetch vehicles by category with count
export function useFleetSummary() {
  const [data, setData] = useState<{
    category: string;
    total: number;
    active: number;
    maintenance: number;
    inactive: number;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: vehicles, error: err } = await supabase
        .from('vehicles')
        .select('category, status');

      if (err) throw err;

      // Group by category
      const summary: Record<string, { total: number; active: number; maintenance: number; inactive: number }> = {};
      
      vehicles?.forEach((v: { category: string; status: string }) => {
        if (!summary[v.category]) {
          summary[v.category] = { total: 0, active: 0, maintenance: 0, inactive: 0 };
        }
        summary[v.category].total++;
        if (v.status === 'active') summary[v.category].active++;
        if (v.status === 'maintenance') summary[v.category].maintenance++;
        if (v.status === 'inactive') summary[v.category].inactive++;
      });

      const result = Object.entries(summary).map(([category, counts]) => ({
        category,
        ...counts,
      }));

      setData(result);
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
        .channel('fleet-summary')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'vehicles',
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

  return { data, loading, error, refetch: fetchData };
}
