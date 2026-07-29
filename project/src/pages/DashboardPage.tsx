import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic, FileText, TrendingUp, Award, ArrowRight, BarChart3,
  Target, Clock, Sparkles, Building2,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useUserData } from '@/lib/useUserData';
import { useAuth } from '@/lib/auth';
import { ScoreRing } from '@/components/ScoreRing';
import { Spinner } from '@/components/Spinner';
import { COMPANIES, scoreColor, formatDate } from '@/lib/constants';

export function DashboardPage() {
  const { user } = useAuth();
  const { interviews, resume, loading } = useUserData();
  const userName = (user?.user_metadata as any)?.name || user?.email?.split('@')[0] || 'there';

  const stats = useMemo(() => {
    const total = interviews.length;
    const avg = total ? Math.round(interviews.reduce((s, i) => s + i.overall_score, 0) / total) : 0;
    const best = total ? Math.max(...interviews.map((i) => i.overall_score)) : 0;
    const avgTech = total ? Math.round(interviews.reduce((s, i) => s + i.technical_score, 0) / total) : 0;
    const avgComm = total ? Math.round(interviews.reduce((s, i) => s + i.communication_score, 0) / total) : 0;
    return { total, avg, best, avgTech, avgComm };
  }, [interviews]);

  const chartData = useMemo(() =>
    [...interviews].reverse().map((i, idx) => ({
      name: `#${idx + 1}`,
      Overall: i.overall_score,
      Technical: i.technical_score,
      Communication: i.communication_score,
    })), [interviews]);

  const recommendedTopics = useMemo(() => {
    const allWeak = new Set<string>();
    interviews.forEach((i) => (i.weaknesses || []).forEach((w) => allWeak.add(w)));
    return Array.from(allWeak).slice(0, 6);
  }, [interviews]);

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-brand-600" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">
            Welcome back, {userName.charAt(0).toUpperCase() + userName.slice(1)} 👋
          </h1>
          <p className="text-sm text-ink-500 mt-1">Here's your interview preparation overview.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/interview/setup" className="btn-primary"><Mic className="h-4 w-4" /> New Interview</Link>
          <Link to="/resume" className="btn-secondary"><FileText className="h-4 w-4" /> Resume</Link>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BarChart3} label="Interviews taken" value={stats.total} color="brand" />
        <StatCard icon={Award} label="Average score" value={stats.avg} suffix="/100" color="accent" />
        <StatCard icon={TrendingUp} label="Best score" value={stats.best} suffix="/100" color="emerald" />
        <StatCard icon={Target} label="Resume status" value={resume ? 'Uploaded' : 'None'} color="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-ink-900 dark:text-white">Performance trend</h2>
              <p className="text-xs text-ink-500">Score progression across your interviews</p>
            </div>
            <BarChart3 className="h-5 w-5 text-ink-400" />
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gOverall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1c66f5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1c66f5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-ink-100 dark:stroke-ink-800" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-ink-400" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Area type="monotone" dataKey="Overall" stroke="#1c66f5" strokeWidth={2.5} fill="url(#gOverall)" />
                <Line type="monotone" dataKey="Technical" stroke="#14b8a6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Communication" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <BarChart3 className="h-10 w-10 text-ink-300 mb-3" />
              <p className="text-sm text-ink-500">No interviews yet. Take your first mock interview to see your progress.</p>
              <Link to="/interview/setup" className="btn-primary mt-4">Start an interview <ArrowRight className="h-4 w-4" /></Link>
            </div>
          )}
        </div>

        {/* Average score ring */}
        <div className="card p-6 flex flex-col items-center justify-center">
          <h2 className="font-semibold text-ink-900 dark:text-white mb-1">Average score</h2>
          <p className="text-xs text-ink-500 mb-4">Across {stats.total} interview{stats.total !== 1 ? 's' : ''}</p>
          <ScoreRing score={stats.avg} size={140} />
          <div className="mt-4 w-full space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink-500">Technical</span>
              <span className={`font-semibold ${scoreColor(stats.avgTech)}`}>{stats.avgTech}/100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-500">Communication</span>
              <span className={`font-semibold ${scoreColor(stats.avgComm)}`}>{stats.avgComm}/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent interviews + recommended topics */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink-900 dark:text-white">Recent interviews</h2>
            {interviews.length > 0 && <Link to="/interviews" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">View all</Link>}
          </div>
          {interviews.length > 0 ? (
            <div className="space-y-2">
              {interviews.slice(0, 5).map((iv) => (
                <Link key={iv.id} to={`/interview/${iv.id}/report`}
                  className="flex items-center justify-between rounded-xl border border-ink-100 dark:border-ink-800 p-3 hover:border-brand-200 dark:hover:border-brand-800 hover:bg-brand-50/30 dark:hover:bg-brand-950/20 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-950 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-900 dark:text-white truncate">{iv.company} · {iv.job_role}</p>
                      <p className="text-xs text-ink-400">{formatDate(iv.created_at)} · {iv.interview_type} · {iv.mode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`badge ${scoreColor(iv.overall_score)} bg-transparent`}>{iv.overall_score}</span>
                    <ArrowRight className="h-4 w-4 text-ink-400" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Mic className="h-10 w-10 text-ink-300 mb-3" />
              <p className="text-sm text-ink-500 mb-3">No interviews yet.</p>
              <Link to="/interview/setup" className="btn-primary">Start your first interview</Link>
            </div>
          )}
        </div>

        {/* Recommended topics */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-brand-500" />
            <h2 className="font-semibold text-ink-900 dark:text-white">Recommended topics</h2>
          </div>
          {recommendedTopics.length > 0 ? (
            <div className="space-y-2">
              {recommendedTopics.map((t, i) => (
                <div key={i} className="flex items-start gap-2 rounded-xl bg-ink-50 dark:bg-ink-800/50 p-3 text-sm text-ink-700 dark:text-ink-200">
                  <Target className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-ink-500 mb-3">Based on top company patterns, start with these:</p>
              {COMPANIES[0].topics.map((t) => (
                <div key={t} className="flex items-start gap-2 rounded-xl bg-ink-50 dark:bg-ink-800/50 p-3 text-sm text-ink-700 dark:text-ink-200">
                  <Target className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          )}
          <Link to="/roadmap" className="btn-secondary w-full mt-4 text-sm">
            <Clock className="h-4 w-4" /> Generate a study roadmap
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, suffix, color }: any) {
  const colors: Record<string, string> = {
    brand: 'from-brand-500 to-brand-700',
    accent: 'from-accent-500 to-accent-700',
    emerald: 'from-emerald-500 to-emerald-700',
    amber: 'from-amber-500 to-amber-600',
  };
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <p className="text-2xl font-bold font-display text-ink-900 dark:text-white">{value}{suffix}</p>
      <p className="text-xs text-ink-500 mt-0.5">{label}</p>
    </motion.div>
  );
}
