import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, ArrowRight, Filter } from 'lucide-react';
import { useUserData } from '@/lib/useUserData';
import { Spinner } from '@/components/Spinner';
import { COMPANIES, scoreColor, formatDate } from '@/lib/constants';

export function InterviewHistoryPage() {
  const { interviews, loading } = useUserData();
  const [filterCompany, setFilterCompany] = useState('All');

  const filtered = useMemo(() =>
    filterCompany === 'All' ? interviews : interviews.filter((i) => i.company === filterCompany),
    [interviews, filterCompany]);

  if (loading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-brand-600" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Interview History</h1>
          <p className="text-sm text-ink-500 mt-1">{interviews.length} interview{interviews.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/interview/setup" className="btn-primary">New interview</Link>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-ink-400" />
        <button onClick={() => setFilterCompany('All')}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${filterCompany === 'All' ? 'bg-brand-600 text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300'}`}>
          All
        </button>
        {COMPANIES.map((c) => (
          <button key={c.name} onClick={() => setFilterCompany(c.name)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${filterCompany === c.name ? 'bg-brand-600 text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300'}`}>
            {c.name}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((iv, i) => (
            <motion.div key={iv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.4) }}>
              <Link to={`/interview/${iv.id}/report`}
                className="card p-4 flex items-center justify-between hover:shadow-glow transition-shadow group">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-11 w-11 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-ink-900 dark:text-white truncate">{iv.company} · {iv.job_role}</p>
                    <p className="text-xs text-ink-400">{formatDate(iv.created_at)} · {iv.interview_type} · {iv.mode} mode · {iv.num_questions} questions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${scoreColor(iv.overall_score)}`}>{iv.overall_score}</p>
                    <p className="text-[10px] text-ink-400">overall</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-ink-400 group-hover:text-brand-500 transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Building2 className="h-10 w-10 text-ink-300 mx-auto mb-3" />
          <p className="text-sm text-ink-500 mb-4">No interviews {filterCompany !== 'All' ? `for ${filterCompany}` : 'yet'}.</p>
          <Link to="/interview/setup" className="btn-primary">Start your first interview</Link>
        </div>
      )}
    </div>
  );
}
