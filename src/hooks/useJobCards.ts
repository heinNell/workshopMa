'use client';

import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { useSupabaseQuery } from './useSupabase';

// Database row types
export interface JobCardRow {
  id: string;
  job_number: string;
  vehicle_id: string;
  fleet_number: string;
  title: string;
  description: string;
  job_type: 'repair' | 'maintenance' | 'inspection' | 'modification';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'pending-parts' | 'completed' | 'closed';
  assigned_to: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  labor_cost: number | null;
  parts_cost: number | null;
  total_cost: number | null;
  start_date: string | null;
  due_date: string | null;
  completed_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Hook to fetch all job cards
export function useJobCards(vehicleId?: string) {
  const filter = vehicleId ? { column: 'vehicle_id', value: vehicleId } : undefined;
  
  return useSupabaseQuery<JobCardRow>('job_cards', {
    filter,
    orderBy: { column: 'created_at', ascending: false },
    realtime: false,
  });
}

// Hook to fetch job cards by fleet number
export function useJobCardsByFleetNumber(fleetNumber: string | null) {
  const [data, setData] = useState<JobCardRow[]>([]);
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
        .from('job_cards')
        .select('*')
        .eq('fleet_number', fleetNumber.toUpperCase())
        .order('created_at', { ascending: false });

      if (err) throw err;
      setData(result as JobCardRow[]);
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
        .channel(`jobcards-${fleetNumber}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'job_cards',
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

// Hook to get job card statistics
export function useJobCardStats() {
  const [data, setData] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    pendingParts: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: jobCards, error: err } = await supabase
        .from('job_cards')
        .select('status');

      if (err) throw err;

      const stats = {
        total: jobCards?.length || 0,
        open: jobCards?.filter((j: { status: string }) => j.status === 'open').length || 0,
        inProgress: jobCards?.filter((j: { status: string }) => j.status === 'in-progress').length || 0,
        pendingParts: jobCards?.filter((j: { status: string }) => j.status === 'pending-parts').length || 0,
        completed: jobCards?.filter((j: { status: string }) => j.status === 'completed' || j.status === 'closed').length || 0,
      };

      setData(stats);
    } catch (err) {
      console.error('Error fetching job card stats:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}

// Hook for Job Card CRUD mutations
export function useJobCardMutations() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const createJobCard = useCallback(async (jobCard: Partial<JobCardRow>) => {
    setLoading(true);
    try {
      // Generate job number if not provided
      if (!jobCard.job_number) {
        const timestamp = Date.now().toString(36).toUpperCase();
        jobCard.job_number = `JC-${timestamp}`;
      }
      
      const { data, error } = await supabase
        .from('job_cards')
        .insert(jobCard)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating job card:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const updateJobCard = useCallback(async (id: string, updates: Partial<JobCardRow>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_cards')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating job card:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const deleteJobCard = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('job_cards')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting job card:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const updateJobCardStatus = useCallback(async (id: string, status: JobCardRow['status']) => {
    return updateJobCard(id, { status });
  }, [updateJobCard]);

  return {
    createJobCard,
    updateJobCard,
    deleteJobCard,
    updateJobCardStatus,
    loading,
  };
}
