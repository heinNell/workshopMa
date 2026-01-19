'use client';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
// Generic hook for fetching data with real-time updates
export function useSupabaseQuery<T>(
  table: string,
  options?: {
    select?: string;
    filter?: { column: string; value: string | number | boolean | null };
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    realtime?: boolean;
  }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = React.useMemo(() => createClient(), []);
  
  // Store options in a ref to avoid infinite loops
  const optionsRef = useRef(options);
  optionsRef.current = options;
  
  const fetchData = useCallback(async () => {
    const opts = optionsRef.current;
    try {
      setLoading(true);
      let query = supabase.from(table).select(opts?.select || '*');
      if (opts?.filter) {
        query = query.eq(opts.filter.column, opts.filter.value);
      }
      if (opts?.orderBy) {
        query = query.order(opts.orderBy.column, {
          ascending: opts.orderBy.ascending ?? true,
        });
      }
      if (opts?.limit) {
        query = query.limit(opts.limit);
      }
      const { data: result, error: err } = await query;
      if (err) throw err;
      setData(result as T[]);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [supabase, table]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Real-time subscription
  useEffect(() => {
    if (!options?.realtime) return;
    let channel: RealtimeChannel;
    const setupRealtime = () => {
      channel = supabase
        .channel(`${table}-changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
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
  }, [table, options?.realtime, fetchData, supabase]);
  
  return { data, loading, error, refetch: fetchData };
}
// Hook for a single record
export function useSupabaseRecord<T>(
  table: string,
  id: string | null,
  options?: {
    select?: string;
    realtime?: boolean;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = React.useMemo(() => createClient(), []);
  const fetchData = useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data: result, error: err } = await supabase
        .from(table)
        .select(options?.select || '*')
        .eq('id', id)
        .single();
      if (err) throw err;
      setData(result as T);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [supabase, table, id, options]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return { data, loading, error, refetch: fetchData };
}