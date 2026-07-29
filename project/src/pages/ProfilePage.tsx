import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, FileText, Award, TrendingUp, BarChart3, Building2, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/lib/auth';
import { useUserData } from '@/lib/useUserData';
import { ScoreRing } from '@/components/ScoreRing';
import { Spinner } from '@/components/Spinner';
import { scoreColor, formatDate } from '@/lib/constants';

export function ProfilePage() {
  const { user } = useAuth();
  const { interviews, resume, loading } = useUserData();

  const userName = (user?.user_metadata as any)?.name || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';

  const stats = useMemo(() => {
    const total = interviews.length;
    const avg = total ? Math.round(interviews.reduce((s, i) => s + i.overall_score, 0) / total) : 0;
    const best = total ? Math.max(...interviews.map((i) => i.overall_score)) : 0;
    return { total, avg, best };
  }, [interviews]);

  const chartData = useMemo(() =>
    [...interviews].reverse().map((i, idx) => ({ name: `#${idx + 1}`, score: i.overall_score })), [interviews]);

  if (loading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-brand-600" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Profile</h1>

      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white">{userName}</h2>
            <div className="mt-1 space-y-1 text-sm text-ink-500">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {email}</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <ScoreRing score={stats.avg} size={100} />
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatBox icon={BarChart3} label="Interviews" value={stats.total} />
        <StatBox icon={Award} label="Average" value={`${stats.avg}/100`} />
        <StatBox icon={TrendingUp} label="Best score" value={`${stats.best}/100`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Resume */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink-900 dark:text-white flex items-center gap-2"><FileText className="h-5 w-5 text-brand-500" /> Resume</h2>
            <Link to="/resume" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">{resume ? 'Manage' : 'Upload'}</Link>
          </div>
          {resume ? (
            <div>
              <div className="flex items-center gap-3 rounded-xl bg-ink-50 dark:bg-ink-800/50 p-3">
                <FileText className="h-5 w-5 text-brand-500" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-900 dark:text-white truncate">{resume.file_name}</p>
                  <p className="text-xs text-ink-400">Uploaded {formatDate(resume.created_at)}</p>
                </div>
              </div>
              {resume.analysis?.skills?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-ink-500 mb-2">AI-extracted skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {resume.analysis.skills.slice(0, 12).map((s: string) => (
                      <span key={s} className="badge bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <FileText className="h-8 w-8 text-ink-300 mx-auto mb-2" />
              <p className="text-sm text-ink-500 mb-3">No resume uploaded yet.</p>
              <Link to="/resume" className="btn-secondary text-sm">Upload resume</Link>
            </div>
          )}
        </div>

        {/* Progress chart */}
        <div className="card p-6">
          <h2 className="font-semibold text-ink-900 dark:text-white mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-brand-500" /> Improvement tracking</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-ink-100 dark:stroke-ink-800" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="score" stroke="#1c66f5" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center">
              <BarChart3 className="h-8 w-8 text-ink-300 mb-2" />
              <p className="text-sm text-ink-500">No interview data yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Interview history */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-ink-900 dark:text-white flex items-center gap-2"><Calendar className="h-5 w-5 text-brand-500" /> Interview history</h2>
          {interviews.length > 0 && <Link to="/interviews" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">View all</Link>}
        </div>
        {interviews.length > 0 ? (
          <div className="space-y-2">
            {interviews.slice(0, 6).map((iv) => (
              <Link key={iv.id} to={`/interview/${iv.id}/report`}
                className="flex items-center justify-between rounded-xl border border-ink-100 dark:border-ink-800 p-3 hover:border-brand-200 dark:hover:border-brand-800 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <Building2 className="h-5 w-5 text-brand-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-900 dark:text-white truncate">{iv.company} · {iv.job_role}</p>
                    <p className="text-xs text-ink-400">{formatDate(iv.created_at)} · {iv.interview_type}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${scoreColor(iv.overall_score)}`}>{iv.overall_score}/100</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-ink-500 mb-3">No interviews yet.</p>
            <Link to="/interview/setup" className="btn-primary text-sm">Start an interview</Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value }: any) {
  return (
    <div className="card p-4 text-center">
      <Icon className="h-5 w-5 text-brand-500 mx-auto mb-2" />
      <p className="text-xl font-bold font-display text-ink-900 dark:text-white">{value}</p>
      <p className="text-xs text-ink-500">{label}</p>
    </div>
  );
}
