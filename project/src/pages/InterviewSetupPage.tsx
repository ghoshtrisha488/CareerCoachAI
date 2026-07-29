import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Briefcase, GraduationCap, ListChecks, Hash, Mic, Type, ArrowRight, Check } from 'lucide-react';
import { useUserData } from '@/lib/useUserData';
import { useToast } from '@/lib/toast';
import { Spinner } from '@/components/Spinner';
import { COMPANIES, JOB_ROLES, EXPERIENCE_LEVELS, INTERVIEW_TYPES, QUESTION_COUNTS } from '@/lib/constants';
import { generateQuestions } from '@/lib/ai';

export function InterviewSetupPage() {
  const navigate = useNavigate();
  const { resume } = useUserData();
  const { notify } = useToast();

  const [company, setCompany] = useState('General');
  const [jobRole, setJobRole] = useState('Software Engineer');
  const [experience, setExperience] = useState('Fresher');
  const [type, setType] = useState('Mixed');
  const [numQuestions, setNumQuestions] = useState(5);
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setLoading(true);
    try {
      const questions = await generateQuestions({
        company,
        jobRole,
        experienceLevel: experience,
        interviewType: type,
        numQuestions,
        resumeText: resume?.raw_text,
        resumeAnalysis: resume?.analysis,
      });
      if (!questions.length) throw new Error('No questions generated. Please try again.');
      navigate('/interview/session', {
        state: {
          questions,
          config: { company, jobRole, experienceLevel: experience, interviewType: type, numQuestions, mode },
          resumeId: resume?.id ?? null,
        },
      });
    } catch (err: any) {
      notify(err?.message || 'Failed to generate questions', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Set up your interview</h1>
        <p className="text-sm text-ink-500 mt-1">Configure your mock interview. AI generates questions based on your selections and resume.</p>
      </div>

      {/* Company */}
      <Section icon={Building2} title="Target company" desc="Company-specific question patterns">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <OptionCard active={company === 'General'} onClick={() => setCompany('General')} title="General" subtitle="No specific company" />
          {COMPANIES.map((c) => (
            <OptionCard key={c.name} active={company === c.name} onClick={() => setCompany(c.name)}
              title={c.name} subtitle={c.difficulty} gradient={c.color} />
          ))}
        </div>
      </Section>

      {/* Job role */}
      <Section icon={Briefcase} title="Job role" desc="The position you're targeting">
        <div className="flex flex-wrap gap-2">
          {JOB_ROLES.map((r) => (
            <button key={r} onClick={() => setJobRole(r)}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                jobRole === r ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                  : 'border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-300 hover:border-brand-300'
              }`}>
              {r}
            </button>
          ))}
        </div>
      </Section>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Experience */}
        <Section icon={GraduationCap} title="Experience level">
          <div className="flex flex-wrap gap-2">
            {EXPERIENCE_LEVELS.map((e) => (
              <button key={e} onClick={() => setExperience(e)}
                className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                  experience === e ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                    : 'border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-300 hover:border-brand-300'
                }`}>
                {e}
              </button>
            ))}
          </div>
        </Section>

        {/* Question count */}
        <Section icon={Hash} title="Number of questions">
          <div className="flex flex-wrap gap-2">
            {QUESTION_COUNTS.map((n) => (
              <button key={n} onClick={() => setNumQuestions(n)}
                className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                  numQuestions === n ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                    : 'border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-300 hover:border-brand-300'
                }`}>
                {n} questions
              </button>
            ))}
          </div>
        </Section>
      </div>

      {/* Interview type */}
      <Section icon={ListChecks} title="Interview type" desc="The kind of questions you'll be asked">
        <div className="grid sm:grid-cols-2 gap-2">
          {INTERVIEW_TYPES.map((t) => (
            <button key={t.value} onClick={() => setType(t.value)}
              className={`text-left rounded-xl border p-4 transition-colors ${
                type === t.value ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30' : 'border-ink-200 dark:border-ink-700 hover:border-brand-300'
              }`}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-ink-900 dark:text-white">{t.label}</span>
                {type === t.value && <Check className="h-4 w-4 text-brand-600" />}
              </div>
              <p className="text-xs text-ink-500 mt-1">{t.desc}</p>
            </button>
          ))}
        </div>
      </Section>

      {/* Mode */}
      <Section icon={mode === 'voice' ? Mic : Type} title="Interview mode" desc="How you'll answer the questions">
        <div className="grid sm:grid-cols-2 gap-2">
          <button onClick={() => setMode('text')}
            className={`flex items-center gap-3 rounded-xl border p-4 transition-colors ${mode === 'text' ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30' : 'border-ink-200 dark:border-ink-700 hover:border-brand-300'}`}>
            <Type className="h-5 w-5 text-brand-600" />
            <div><p className="font-medium text-sm text-ink-900 dark:text-white">Text interview</p><p className="text-xs text-ink-500">Type your answers</p></div>
          </button>
          <button onClick={() => setMode('voice')}
            className={`flex items-center gap-3 rounded-xl border p-4 transition-colors ${mode === 'voice' ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30' : 'border-ink-200 dark:border-ink-700 hover:border-brand-300'}`}>
            <Mic className="h-5 w-5 text-brand-600" />
            <div><p className="font-medium text-sm text-ink-900 dark:text-white">Voice interview</p><p className="text-xs text-ink-500">Speak your answers (requires microphone)</p></div>
          </button>
        </div>
      </Section>

      {/* Resume notice */}
      {!resume && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          Tip: Upload your resume first to get personalized, project-specific questions.
        </div>
      )}

      {/* Start */}
      <div className="flex justify-end">
        <button onClick={start} disabled={loading} className="btn-primary text-base px-6 py-3">
          {loading ? <><Spinner /> Generating questions…</> : <>Start interview <ArrowRight className="h-4 w-4" /></>}
        </button>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, desc, children }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-brand-50 dark:bg-brand-950 flex items-center justify-center">
          <Icon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h2 className="font-semibold text-ink-900 dark:text-white">{title}</h2>
          {desc && <p className="text-xs text-ink-500">{desc}</p>}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function OptionCard({ active, onClick, title, subtitle, gradient }: any) {
  return (
    <button onClick={onClick}
      className={`text-left rounded-xl border p-3 transition-all ${active ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-ink-200 dark:border-ink-700 hover:border-brand-300'}`}>
      <div className="flex items-center gap-3">
        {gradient ? (
          <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
            {title.charAt(0)}
          </div>
        ) : (
          <div className="h-9 w-9 rounded-lg bg-ink-100 dark:bg-ink-800 flex items-center justify-center text-ink-500 font-bold text-sm shrink-0">G</div>
        )}
        <div className="min-w-0">
          <p className="font-medium text-sm text-ink-900 dark:text-white truncate">{title}</p>
          <p className="text-xs text-ink-500">{subtitle}</p>
        </div>
      </div>
    </button>
  );
}
