import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic, FileText, Building2, BarChart3, Map, Sparkles,
  ArrowRight, Check, Brain, MessageSquare, TrendingUp,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { Moon, Sun } from 'lucide-react';

const FEATURES = [
  { icon: FileText, title: 'AI Resume Analysis', desc: 'Upload your resume and let AI extract skills, projects, and generate personalized questions.' },
  { icon: Building2, title: 'Company-Specific Prep', desc: 'Practice interviews tailored to Cognizant, TCS, Infosys, Accenture, Wipro, and more.' },
  { icon: Mic, title: 'Voice & Text Interviews', desc: 'Speak or type your answers. The AI interviewer asks questions and evaluates responses.' },
  { icon: BarChart3, title: 'Detailed Performance Reports', desc: 'Get scores, strengths, weaknesses, and AI-generated improvement suggestions.' },
  { icon: Map, title: '30-Day Preparation Roadmap', desc: 'Receive a personalized study plan based on your weak areas and target company.' },
  { icon: TrendingUp, title: 'Track Your Progress', desc: 'Monitor improvement across interviews with analytics and performance charts.' },
];

const STEPS = [
  { icon: FileText, title: 'Upload Resume', desc: 'Get AI analysis of your skills and projects' },
  { icon: Building2, title: 'Pick a Company', desc: 'Choose from 7 top tech employers' },
  { icon: MessageSquare, title: 'Practice Interview', desc: 'Voice or text, AI evaluates every answer' },
  { icon: Brain, title: 'Get Feedback', desc: 'Scores, strengths, and a study roadmap' },
];

export function LandingPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  if (session) {
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 dark:bg-ink-950/70 border-b border-ink-200 dark:border-ink-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 lg:px-8 py-4">
          <Logo />
          <div className="flex items-center gap-3">
            <button onClick={toggle} className="btn-ghost p-2" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link to="/login" className="btn-ghost">Sign in</Link>
            <Link to="/signup" className="btn-primary">Get started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-light dark:bg-grid-dark bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 h-72 w-[40rem] rounded-full bg-brand-500/20 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 pt-20 pb-24 text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800 mb-6">
              <Sparkles className="h-3.5 w-3.5" /> Powered by Google Gemini AI
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-ink-900 dark:text-white max-w-3xl mx-auto leading-[1.1]">
              Land your dream job with an <span className="text-brand-600 dark:text-brand-400">AI Interview Coach</span>
            </h1>
            <p className="mt-6 text-lg text-ink-500 dark:text-ink-400 max-w-2xl mx-auto">
              Upload your resume, practice company-specific mock interviews with voice or text,
              and get AI-powered feedback that actually helps you improve.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/signup" className="btn-primary text-base px-6 py-3">
                Start practicing free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn-secondary text-base px-6 py-3">Sign in</Link>
            </div>
            <p className="mt-4 text-xs text-ink-400">No credit card required. Free to start.</p>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <h2 className="text-center font-display text-3xl font-bold text-ink-900 dark:text-white mb-3">How it works</h2>
        <p className="text-center text-ink-500 mb-12">Four steps from resume to ready</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-6 relative"
            >
              <div className="absolute top-4 right-4 text-5xl font-display font-bold text-ink-100 dark:text-ink-800">{i + 1}</div>
              <div className="h-12 w-12 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center mb-4">
                <s.icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="font-semibold text-ink-900 dark:text-white mb-1">{s.title}</h3>
              <p className="text-sm text-ink-500">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white dark:bg-ink-900 border-y border-ink-200 dark:border-ink-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
          <h2 className="text-center font-display text-3xl font-bold text-ink-900 dark:text-white mb-3">Everything you need to ace interviews</h2>
          <p className="text-center text-ink-500 mb-12">A complete interview preparation platform</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.08 }}
                className="card p-6 hover:shadow-glow transition-shadow"
              >
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-ink-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Companies */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <h2 className="text-center font-display text-3xl font-bold text-ink-900 dark:text-white mb-3">Prepare for top companies</h2>
        <p className="text-center text-ink-500 mb-10">Company-specific interview patterns and question banks</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {['Cognizant', 'TCS', 'Infosys', 'Accenture', 'Wipro', 'Capgemini', 'HCL Technologies'].map((c) => (
            <div key={c} className="badge bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-200 px-4 py-2 text-sm font-medium shadow-soft">
              {c}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-10 md:p-16 text-center">
          <div className="absolute inset-0 bg-grid-dark bg-[size:32px_32px] opacity-20" />
          <div className="relative">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Ready to land your next offer?</h2>
            <p className="text-brand-100 max-w-xl mx-auto mb-8">Join thousands of candidates who practice with AI Interview Coach before the real thing.</p>
            <Link to="/signup" className="btn bg-white text-brand-700 hover:bg-brand-50 text-base px-6 py-3">
              Create your free account <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink-200 dark:border-ink-800 py-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-xs text-ink-400">Built with Gemini AI. For interview practice and educational purposes.</p>
        </div>
      </footer>
    </div>
  );
}
