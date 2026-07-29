import { useState } from 'react';
import { motion } from 'framer-motion';
import { Map, Sparkles, Building2, Briefcase, AlertTriangle, ArrowRight, Calendar } from 'lucide-react';
import { useUserData } from '@/lib/useUserData';
import { useToast } from '@/lib/toast';
import { generateRoadmap } from '@/lib/ai';
import { supabase } from '@/lib/supabase';
import { COMPANIES, JOB_ROLES } from '@/lib/constants';
import { Spinner } from '@/components/Spinner';
import type { RoadmapDay } from '@/lib/types';

export function RoadmapPage() {
  const { interviews } = useUserData();
  const { notify } = useToast();
  const [company, setCompany] = useState('Cognizant');
  const [jobRole, setJobRole] = useState('Software Engineer');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<RoadmapDay[] | null>(null);

  const weakAreas = Array.from(new Set(interviews.flatMap((i) => i.weaknesses || []))).slice(0, 5);
  const previousScores = interviews.slice(0, 5).map((i) => ({
    overall: i.overall_score, technical: i.technical_score, communication: i.communication_score,
  }));

  const generate = async () => {
    setLoading(true);
    try {
      const result = await generateRoadmap(company, jobRole, weakAreas, previousScores);
      setPlan(result.plan);

      await supabase.from('roadmaps').insert({
        company, job_role: jobRole, weak_areas: weakAreas, plan: result.plan,
      });
      notify('Your 30-day roadmap is ready!', 'success');
    } catch (err: any) {
      notify(err?.message || 'Failed to generate roadmap', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Placement Preparation Roadmap</h1>
        <p className="text-sm text-ink-500 mt-1">Get a personalized 30-day study plan based on your target company, role, and weak areas.</p>
      </div>

      {/* Config */}
      <div className="card p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label flex items-center gap-1.5"><Building2 className="h-4 w-4 text-brand-500" /> Target company</label>
            <select value={company} onChange={(e) => setCompany(e.target.value)} className="input">
              {COMPANIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-brand-500" /> Job role</label>
            <select value={jobRole} onChange={(e) => setJobRole(e.target.value)} className="input">
              {JOB_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {weakAreas.length > 0 && (
          <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-1.5 mb-2">
              <AlertTriangle className="h-4 w-4" /> Weak areas from your interviews
            </p>
            <div className="flex flex-wrap gap-1.5">
              {weakAreas.map((w) => (
                <span key={w} className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">{w}</span>
              ))}
            </div>
          </div>
        )}

        <button onClick={generate} disabled={loading} className="btn-primary mt-4">
          {loading ? <><Spinner /> Generating roadmap…</> : <><Sparkles className="h-4 w-4" /> Generate 30-day roadmap</>}
        </button>
      </div>

      {/* Plan */}
      {plan && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center gap-2">
            <Map className="h-5 w-5 text-brand-500" />
            <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white">Your 30-Day Plan</h2>
            <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 ml-2">{company} · {jobRole}</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {plan.map((day, i) => (
              <motion.div key={day.day}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.6) }}
                className="card p-4 hover:shadow-glow transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-brand-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {day.day}
                  </div>
                  <Calendar className="h-3.5 w-3.5 text-ink-400" />
                  <span className="text-xs text-ink-400">Day {day.day}</span>
                </div>
                <h3 className="font-medium text-sm text-ink-900 dark:text-white mb-2">{day.title}</h3>
                {day.topics?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {day.topics.map((t, j) => (
                      <span key={j} className="badge bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 text-[10px]">{t}</span>
                    ))}
                  </div>
                )}
                <ul className="space-y-1">
                  {day.tasks?.map((t, j) => (
                    <li key={j} className="text-xs text-ink-500 flex items-start gap-1.5">
                      <ArrowRight className="h-3 w-3 mt-0.5 text-brand-400 shrink-0" /> {t}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
