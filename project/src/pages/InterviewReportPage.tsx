import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Download, Building2, Briefcase, GraduationCap,
  Calendar, FileText, Mic, Type, ThumbsUp, AlertTriangle, Lightbulb, Sparkles,
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { ScoreRing } from '@/components/ScoreRing';
import { Spinner } from '@/components/Spinner';
import { scoreColor, scoreBg, formatDateTime } from '@/lib/constants';
import type { Interview } from '@/lib/types';

export function InterviewReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notify } = useToast();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data, error } = await supabase.from('interviews').select('*').eq('id', id).maybeSingle();
      if (error || !data) {
        notify('Interview report not found.', 'error');
        navigate('/dashboard', { replace: true });
        return;
      }
      setInterview(data as Interview);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-brand-600" /></div>;
  if (!interview) return null;

  const userName = (user?.user_metadata as any)?.name || 'Candidate';
  const radarData = [
    { subject: 'Technical', score: interview.technical_score },
    { subject: 'Communication', score: interview.communication_score },
    { subject: 'Overall', score: interview.overall_score },
  ];
  const barData = interview.questions.map((q, i) => ({ name: `Q${i + 1}`, score: q.score * 10 }));

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top bar */}
      <div className="flex items-center justify-between print:hidden">
        <Link to="/dashboard" className="btn-ghost text-sm"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link>
        <button onClick={handleDownload} className="btn-primary text-sm"><Download className="h-4 w-4" /> Download report</button>
      </div>

      {/* Report header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Interview Report</h1>
            <p className="text-sm text-ink-500 mt-1">{userName}</p>
          </div>
          <ScoreRing score={interview.overall_score} size={110} />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <InfoChip icon={Building2} label="Company" value={interview.company} />
          <InfoChip icon={Briefcase} label="Job role" value={interview.job_role} />
          <InfoChip icon={GraduationCap} label="Experience" value={interview.experience_level} />
          <InfoChip icon={Calendar} label="Date" value={formatDateTime(interview.created_at)} />
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          <InfoChip icon={FileText} label="Type" value={interview.interview_type} />
          <InfoChip icon={interview.mode === 'voice' ? Mic : Type} label="Mode" value={interview.mode === 'voice' ? 'Voice' : 'Text'} />
          <InfoChip icon={FileText} label="Questions" value={String(interview.num_questions)} />
        </div>
      </motion.div>

      {/* AI summary */}
      <div className="card p-6 bg-gradient-to-br from-brand-50 to-white dark:from-brand-950/40 dark:to-ink-900">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-brand-500" />
          <h2 className="font-semibold text-ink-900 dark:text-white">AI Feedback Summary</h2>
        </div>
        <p className="text-sm text-ink-700 dark:text-ink-200 leading-relaxed">{interview.summary}</p>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold text-ink-900 dark:text-white mb-4">Score breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid className="stroke-ink-200 dark:stroke-ink-700" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} angle={90} />
              <Radar dataKey="score" stroke="#1c66f5" fill="#1c66f5" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-ink-900 dark:text-white mb-4">Question-wise scores</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-ink-100 dark:stroke-ink-800" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="score" fill="#1c66f5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strengths / Weaknesses / Suggestions */}
      <div className="grid lg:grid-cols-3 gap-4">
        <FeedbackList icon={ThumbsUp} title="Strengths" items={interview.strengths} color="emerald" />
        <FeedbackList icon={AlertTriangle} title="Weak areas" items={interview.weaknesses} color="amber" />
        <FeedbackList icon={Lightbulb} title="Suggestions" items={interview.suggestions} color="brand" />
      </div>

      {/* Question-by-question */}
      <div className="card p-6">
        <h2 className="font-semibold text-ink-900 dark:text-white mb-4">Question-wise evaluation</h2>
        <div className="space-y-4">
          {interview.questions.map((q, i) => (
            <div key={i} className="rounded-xl border border-ink-100 dark:border-ink-800 p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-sm font-medium text-ink-900 dark:text-white flex-1">
                  <span className="text-ink-400 mr-1.5">Q{i + 1}.</span>{q.question}
                </p>
                <span className={`badge ${scoreBg(q.score * 10)} shrink-0`}>{q.score}/10</span>
              </div>
              <div className="mt-2 rounded-lg bg-ink-50 dark:bg-ink-800/50 p-3">
                <p className="text-xs text-ink-400 mb-1">Your answer:</p>
                <p className="text-sm text-ink-700 dark:text-ink-200 whitespace-pre-wrap">{q.answer || '(no answer provided)'}</p>
              </div>
              <div className="mt-2 flex items-start gap-2">
                <Sparkles className="h-3.5 w-3.5 text-brand-500 mt-0.5 shrink-0" />
                <p className="text-sm text-ink-600 dark:text-ink-300">{q.feedback}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 print:hidden">
        <Link to="/interview/setup" className="btn-primary flex-1">Take another interview</Link>
        <Link to="/roadmap" className="btn-secondary flex-1">Generate study roadmap</Link>
      </div>
    </div>
  );
}

function InfoChip({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-ink-50 dark:bg-ink-800/50 p-3">
      <Icon className="h-4 w-4 text-brand-500 shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] text-ink-400">{label}</p>
        <p className="text-sm font-medium text-ink-900 dark:text-white truncate">{value}</p>
      </div>
    </div>
  );
}

function FeedbackList({ icon: Icon, title, items, color }: any) {
  const colors: Record<string, string> = {
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30',
    brand: 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/30',
  };
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="font-semibold text-sm text-ink-900 dark:text-white">{title}</h3>
      </div>
      {items?.length > 0 ? (
        <ul className="space-y-2">
          {items.map((it: string, i: number) => (
            <li key={i} className="text-sm text-ink-600 dark:text-ink-300 flex items-start gap-2">
              <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${color === 'emerald' ? 'bg-emerald-500' : color === 'amber' ? 'bg-amber-500' : 'bg-brand-500'}`} />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-400">No data available.</p>
      )}
    </div>
  );
}
