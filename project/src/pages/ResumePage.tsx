import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  UploadCloud, FileText, Trash2, RefreshCw, Sparkles,
  CheckCircle2, AlertCircle, Briefcase, GraduationCap, Award, Code, FolderGit2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useUserData } from '@/lib/useUserData';
import { useToast } from '@/lib/toast';
import { extractTextFromFile } from '@/lib/fileParser';
import { analyzeResume } from '@/lib/ai';
import { Spinner } from '@/components/Spinner';
import type { ResumeAnalysis } from '@/lib/types';

type Stage = 'idle' | 'parsing' | 'analyzing' | 'saving' | 'done';

export function ResumePage() {
  const { user } = useAuth();
  const { resume, loading, refresh } = useUserData();
  const { notify } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!user) return;
    setError('');
    try {
      setStage('parsing');
      const text = await extractTextFromFile(file);
      if (!text.trim()) throw new Error('Could not extract any text from this file. Try a different file.');

      setStage('analyzing');
      const analysis = await analyzeResume(text);

      setStage('saving');
      const filePath = `${user.id}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const { error: upErr } = await supabase.storage.from('resumes').upload(filePath, file, { upsert: true });
      if (upErr) throw new Error(upErr.message);

      // delete old resume + file if exists
      if (resume) {
        await supabase.storage.from('resumes').remove([resume.storage_path]);
        await supabase.from('resumes').delete().eq('id', resume.id);
      }

      const { error: dbErr } = await supabase.from('resumes').insert({
        file_name: file.name,
        storage_path: filePath,
        raw_text: text,
        analysis,
      });
      if (dbErr) throw new Error(dbErr.message);

      await refresh();
      setStage('done');
      notify('Resume uploaded and analyzed successfully!', 'success');
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while processing your resume.');
      notify(err?.message || 'Resume processing failed', 'error');
      setStage('idle');
    }
  }, [user, resume, refresh, notify]);

  const handleDelete = async () => {
    if (!resume) return;
    try {
      await supabase.storage.from('resumes').remove([resume.storage_path]);
      await supabase.from('resumes').delete().eq('id', resume.id);
      await refresh();
      notify('Resume deleted.', 'info');
    } catch (err: any) {
      notify('Failed to delete resume: ' + err.message, 'error');
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const busy = stage !== 'idle' && stage !== 'done';

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-brand-600" /></div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Resume & AI Analysis</h1>
        <p className="text-sm text-ink-500 mt-1">Upload your resume and let AI extract your skills, projects, and experience to personalize interviews.</p>
      </div>

      {!resume ? (
        /* Upload zone */
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => !busy && fileInput.current?.click()}
            className={`card border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30' : 'border-ink-200 dark:border-ink-700 hover:border-brand-300 dark:hover:border-brand-700'
            }`}
          >
            <input ref={fileInput} type="file" accept=".pdf,.docx,.txt" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            {busy ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <Spinner className="h-10 w-10 text-brand-600" />
                <p className="text-sm font-medium text-ink-700 dark:text-ink-200">
                  {stage === 'parsing' && 'Reading your resume…'}
                  {stage === 'analyzing' && 'AI is analyzing your resume…'}
                  {stage === 'saving' && 'Saving your analysis…'}
                </p>
                <p className="text-xs text-ink-400">This may take a few seconds</p>
              </div>
            ) : (
              <>
                <div className="mx-auto h-16 w-16 rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center mb-4">
                  <UploadCloud className="h-8 w-8 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="font-semibold text-ink-900 dark:text-white mb-1">Drop your resume here</h3>
                <p className="text-sm text-ink-500">or click to browse — PDF, DOCX, or TXT up to 10MB</p>
              </>
            )}
          </div>
          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
            </div>
          )}
        </motion.div>
      ) : (
        /* Resume analysis display */
        <div className="space-y-6">
          {/* File card */}
          <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-12 w-12 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center shrink-0">
                <FileText className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-ink-900 dark:text-white truncate">{resume.file_name}</p>
                <p className="text-xs text-ink-400">Uploaded {new Date(resume.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => fileInput.current?.click()} className="btn-secondary text-sm">
                <RefreshCw className="h-4 w-4" /> Replace
              </button>
              <button onClick={handleDelete} className="btn-danger text-sm">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
              <input ref={fileInput} type="file" accept=".pdf,.docx,.txt" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
          </div>

          {busy && (
            <div className="card p-8 flex flex-col items-center gap-3">
              <Spinner className="h-8 w-8 text-brand-600" />
              <p className="text-sm text-ink-500">
                {stage === 'parsing' && 'Reading your resume…'}
                {stage === 'analyzing' && 'AI is analyzing…'}
                {stage === 'saving' && 'Saving…'}
              </p>
            </div>
          )}

          {resume.analysis && !busy && <AnalysisView analysis={resume.analysis} />}
        </div>
      )}
    </div>
  );
}

function AnalysisView({ analysis }: { analysis: ResumeAnalysis }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Summary */}
      <div className="card p-6 bg-gradient-to-br from-brand-50 to-white dark:from-brand-950/40 dark:to-ink-900">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-brand-500" />
          <h2 className="font-semibold text-ink-900 dark:text-white">AI Summary</h2>
        </div>
        <p className="text-sm text-ink-700 dark:text-ink-200 leading-relaxed">{analysis.summary}</p>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span className="text-ink-600 dark:text-ink-300">Candidate: <strong className="text-ink-900 dark:text-white">{analysis.name}</strong></span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Section icon={Code} title="Skills" items={analysis.skills} />
        <Section icon={Code} title="Programming Languages" items={analysis.programmingLanguages} />
        <Section icon={Briefcase} title="Frameworks" items={analysis.frameworks} />
        <Section icon={Award} title="Certifications" items={analysis.certifications} />
        <Section icon={GraduationCap} title="Education" items={analysis.education} />
        <Section icon={Briefcase} title="Experience" items={analysis.experience} />
      </div>

      {/* Projects */}
      {analysis.projects?.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <FolderGit2 className="h-5 w-5 text-brand-500" />
            <h2 className="font-semibold text-ink-900 dark:text-white">Projects</h2>
          </div>
          <div className="space-y-3">
            {analysis.projects.map((p, i) => (
              <div key={i} className="rounded-xl border border-ink-100 dark:border-ink-800 p-4">
                <p className="font-medium text-ink-900 dark:text-white">{p.name}</p>
                {p.description && <p className="text-sm text-ink-500 mt-1">{p.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Internships */}
      {analysis.internships?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-ink-900 dark:text-white mb-3">Internships</h2>
          <ul className="space-y-2">
            {analysis.internships.map((it, i) => (
              <li key={i} className="text-sm text-ink-700 dark:text-ink-200 flex items-start gap-2">
                <span className="text-brand-500 mt-1">•</span> {it}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

function Section({ icon: Icon, title, items }: { icon: any; title: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-brand-500" />
        <h3 className="font-semibold text-sm text-ink-900 dark:text-white">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((it, i) => (
          <span key={i} className="badge bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-100 dark:border-brand-900">
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}
