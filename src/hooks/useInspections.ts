'use client';

import { useSupabaseQuery } from './useSupabase';
import { createClient } from '@/lib/supabase/client';
import { useCallback, useEffect, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Database row types
export interface InspectionRow {
  id: string;
  vehicle_id: string;
  fleet_number: string;
  inspection_type: 'daily' | 'weekly' | 'monthly' | 'annual';
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue';
  scheduled_date: string;
  completed_date: string | null;
  inspector_name: string | null;
  odometer_reading: number | null;
  notes: string | null;
  faults_found: number;
  created_at: string;
  updated_at: string;
}

// Hook to fetch all inspections
export function useInspections(vehicleId?: string) {
  const filter = vehicleId ? { column: 'vehicle_id', value: vehicleId } : undefined;
  
  return useSupabaseQuery<InspectionRow>('inspections', {
    filter,
    orderBy: { column: 'scheduled_date', ascending: false },
    realtime: true,
  });
}

// Hook to fetch inspections by fleet number
export function useInspectionsByFleetNumber(fleetNumber: string | null) {
  const [data, setData] = useState<InspectionRow[]>([]);
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
        .from('inspections')
        .select('*')
        .eq('fleet_number', fleetNumber.toUpperCase())
        .order('scheduled_date', { ascending: false });

      if (err) throw err;
      setData(result as InspectionRow[]);
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
        .channel(`inspections-${fleetNumber}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'inspections',
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

// Hook to get inspection statistics
export function useInspectionStats() {
  const [data, setData] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: inspections, error: err } = await supabase
        .from('inspections')
        .select('status');

      if (err) throw err;

      const stats = {
        total: inspections?.length || 0,
        scheduled: inspections?.filter((i: { status: string }) => i.status === 'scheduled').length || 0,
        completed: inspections?.filter((i: { status: string }) => i.status === 'completed').length || 0,
        overdue: inspections?.filter((i: { status: string }) => i.status === 'overdue').length || 0,
      };

      setData(stats);
    } catch (err) {
      console.error('Error fetching inspection stats:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}
