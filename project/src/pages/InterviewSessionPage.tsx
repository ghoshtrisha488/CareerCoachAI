import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Send, ArrowRight, ArrowLeft, Volume2, VolumeX,
  RefreshCw, Check, AlertCircle, Bot, User as UserIcon, Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { evaluateInterview } from '@/lib/ai';
import { Spinner } from '@/components/Spinner';

interface SessionState {
  questions: string[];
  config: { company: string; jobRole: string; experienceLevel: string; interviewType: string; numQuestions: number; mode: 'text' | 'voice' };
  resumeId: string | null;
}

export function InterviewSessionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notify } = useToast();
  const state = location.state as SessionState | null;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<HTMLTextAreaElement>(null);

  // Redirect if no session state (e.g. direct nav)
  useEffect(() => {
    if (!state?.questions?.length) {
      notify('No interview in progress. Set up a new interview to begin.', 'error');
      navigate('/interview/setup', { replace: true });
    } else {
      setAnswers(new Array(state.questions.length).fill(''));
    }
  }, [state]);

  // Speak current question on mount / change
  useEffect(() => {
    if (state?.questions && !muted) {
      speak(state.questions[currentIdx]);
    }
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx]);

  if (!state?.questions?.length) {
    return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-brand-600" /></div>;
  }

  const { questions, config, resumeId } = state;
  const total = questions.length;
  const question = questions[currentIdx];
  const progress = ((currentIdx + 1) / total) * 100;

  function speak(text: string) {
    if (muted || !('speechSynthesis' in window)) return;
    stopSpeaking();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  }
  function stopSpeaking() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  function startListening() {
    setVoiceError('');
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setVoiceError('Speech recognition is not supported in this browser. Try Chrome or Edge, or switch to text mode.');
      return;
    }
    stopSpeaking();
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    let finalText = currentAnswer;
    rec.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += transcript + ' ';
        else interim += transcript;
      }
      setCurrentAnswer((finalText + interim).trim());
    };
    rec.onerror = (e: any) => {
      if (e.error === 'not-allowed') setVoiceError('Microphone permission denied. Please allow microphone access.');
      else setVoiceError('Voice capture error: ' + e.error);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  }
  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  function handleNext() {
    stopSpeaking();
    stopListening();
    const updated = [...answers];
    updated[currentIdx] = currentAnswer.trim();
    setAnswers(updated);

    if (currentIdx < total - 1) {
      setCurrentIdx(currentIdx + 1);
      setCurrentAnswer(updated[currentIdx + 1] || '');
    } else {
      submitInterview(updated);
    }
  }
  function handlePrev() {
    stopSpeaking();
    stopListening();
    if (currentIdx === 0) return;
    const updated = [...answers];
    updated[currentIdx] = currentAnswer.trim();
    setAnswers(updated);
    setCurrentIdx(currentIdx - 1);
    setCurrentAnswer(updated[currentIdx - 1] || '');
  }

  async function submitInterview(finalAnswers: string[]) {
    setSubmitting(true);
    try {
      const qa = questions.map((q, i) => ({ question: q, answer: finalAnswers[i] || '' }));
      const result = await evaluateInterview(config, qa);

      const { data, error } = await supabase.from('interviews').insert({
        resume_id: resumeId,
        company: config.company,
        job_role: config.jobRole,
        experience_level: config.experienceLevel,
        interview_type: config.interviewType,
        mode: config.mode,
        num_questions: config.numQuestions,
        questions: result.questions,
        overall_score: result.overall_score,
        technical_score: result.technical_score,
        communication_score: result.communication_score,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        suggestions: result.suggestions,
        summary: result.summary,
      }).select('id').single();

      if (error) throw new Error(error.message);
      notify('Interview evaluated! View your report.', 'success');
      navigate(`/interview/${data.id}/report`, { replace: true });
    } catch (err: any) {
      notify(err?.message || 'Failed to evaluate interview', 'error');
      setSubmitting(false);
    }
  }

  const isLast = currentIdx === total - 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header / progress */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-ink-500">{config.company} · {config.jobRole} · {config.interviewType}</p>
            <h1 className="font-display text-lg font-bold text-ink-900 dark:text-white">Mock Interview</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              Question {currentIdx + 1} of {total}
            </span>
            <button onClick={() => { setMuted(!muted); if (!muted) stopSpeaking(); }}
              className="btn-ghost p-2" title={muted ? 'Unmute AI voice' : 'Mute AI voice'}>
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-brand-500 to-brand-700 rounded-full"
            initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      {/* AI interviewer + question */}
      <motion.div key={currentIdx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center ${speaking ? 'animate-pulse' : ''}`}>
              <Bot className="h-6 w-6 text-white" />
            </div>
            {speaking && <span className="absolute inset-0 rounded-2xl border-2 border-brand-400 animate-pulse-ring" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-ink-900 dark:text-white">AI Interviewer</span>
              {speaking && <span className="badge bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 text-[10px]">speaking…</span>}
            </div>
            <p className="text-base text-ink-700 dark:text-ink-200 leading-relaxed">{question}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => speak(question)} disabled={muted}
                className="btn-ghost text-xs py-1.5 px-3"><Volume2 className="h-3.5 w-3.5" /> Replay question</button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Answer area */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-3">
          <UserIcon className="h-5 w-5 text-accent-600 dark:text-accent-400" />
          <h2 className="font-semibold text-ink-900 dark:text-white text-sm">Your answer</h2>
        </div>

        {config.mode === 'voice' && (
          <div className="mb-4 flex flex-col items-center">
            <button
              onClick={listening ? stopListening : startListening}
              className={`relative h-20 w-20 rounded-full flex items-center justify-center transition-all ${
                listening ? 'bg-red-500 text-white' : 'bg-brand-600 text-white hover:bg-brand-700'
              }`}
            >
              {listening ? (
                <>
                  <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-pulse-ring" />
                  <MicOff className="h-8 w-8 relative" />
                </>
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </button>
            <p className="mt-3 text-sm font-medium text-ink-600 dark:text-ink-300">
              {listening ? 'Listening… speak your answer' : 'Tap to speak your answer'}
            </p>
            {voiceError && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-3.5 w-3.5" /> {voiceError}
              </p>
            )}
          </div>
        )}

        <textarea
          ref={transcriptRef}
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          rows={6}
          placeholder={config.mode === 'voice' ? 'Your spoken answer will appear here. You can edit it before continuing.' : 'Type your answer here…'}
          className="input resize-none"
        />
        <p className="mt-1 text-xs text-ink-400">{currentAnswer.trim().split(/\s+/).filter(Boolean).length} words</p>

        {voiceError && config.mode === 'voice' && (
          <p className="mt-2 text-xs text-ink-500">You can still type your answer above.</p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={handlePrev} disabled={currentIdx === 0 || submitting}
          className="btn-secondary"><ArrowLeft className="h-4 w-4" /> Previous</button>

        <div className="flex items-center gap-1.5">
          {questions.map((_, i) => (
            <span key={i} className={`h-2 rounded-full transition-all ${i === currentIdx ? 'w-6 bg-brand-600' : i < currentIdx ? 'w-2 bg-brand-400' : 'w-2 bg-ink-200 dark:bg-ink-700'}`} />
          ))}
        </div>

        <button onClick={handleNext} disabled={submitting} className="btn-primary">
          {submitting ? <><Spinner /> Evaluating…</>
            : isLast ? <><Check className="h-4 w-4" /> Finish & evaluate</>
            : <>Next <ArrowRight className="h-4 w-4" /></>}
        </button>
      </div>

      {submitting && (
        <div className="card p-6 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-brand-500 animate-pulse" />
          <p className="text-sm text-ink-600 dark:text-ink-300">AI is evaluating your answers. This takes a few seconds…</p>
        </div>
      )}
    </div>
  );
}
