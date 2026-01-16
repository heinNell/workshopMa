'use client';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import React, { useCallback, useEffect, useState } from 'react';
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
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from(table).select(options?.select || '*');
      if (options?.filter) {
        query = query.eq(options.filter.column, options.filter.value);
      }
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }
      if (options?.limit) {
        query = query.limit(options.limit);
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
  }, [supabase, table, options]);
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