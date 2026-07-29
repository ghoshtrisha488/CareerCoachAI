import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Target, Layers, Gauge } from 'lucide-react';
import { COMPANIES } from '@/lib/constants';

export function CompaniesPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Company-specific preparation</h1>
        <p className="text-sm text-ink-500 mt-1">Choose a target company to practice with their specific interview patterns and topics.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COMPANIES.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-6 hover:shadow-glow transition-shadow group"
          >
            <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white font-bold text-xl mb-4 shadow-soft`}>
              {c.name.charAt(0)}
            </div>
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">{c.name}</h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-start gap-2 text-ink-600 dark:text-ink-300">
                <Layers className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
                <span><strong className="text-ink-800 dark:text-ink-100">Pattern:</strong> {c.pattern}</span>
              </div>
              <div className="flex items-start gap-2 text-ink-600 dark:text-ink-300">
                <Gauge className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
                <span><strong className="text-ink-800 dark:text-ink-100">Difficulty:</strong> {c.difficulty}</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-ink-500 mb-2 flex items-center gap-1"><Target className="h-3.5 w-3.5" /> Common topics</p>
              <div className="flex flex-wrap gap-1.5">
                {c.topics.map((t) => (
                  <span key={t} className="badge bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 text-[11px]">{t}</span>
                ))}
              </div>
            </div>
            <button
              onClick={() => navigate('/interview/setup')}
              className="btn-secondary w-full mt-5 text-sm group-hover:bg-brand-50 dark:group-hover:bg-brand-950"
            >
              Practice {c.name} interview <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
