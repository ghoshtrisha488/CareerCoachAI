import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Interview, Resume } from './types';

export function useUserData() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [intRes, resRes] = await Promise.all([
      supabase.from('interviews').select('*').order('created_at', { ascending: false }),
      supabase.from('resumes').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);
    setInterviews((intRes.data as Interview[]) || []);
    setResume((resRes.data as Resume) || null);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { interviews, resume, loading, refresh };
}
