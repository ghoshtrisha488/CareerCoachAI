import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Spinner } from '@/components/Spinner';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';

export function SignupPage() {
  const { signUp } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) {
      setError(error);
      notify('Sign up failed: ' + error, 'error');
    } else {
      notify('Account created. Welcome to Interview Coach!', 'success');
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-ink-50 dark:bg-ink-950">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-12 flex-col justify-between">
        <div className="absolute inset-0 bg-grid-dark bg-[size:32px_32px] opacity-20" />
        <div className="relative">
          <Link to="/landing"><div className="flex items-center gap-2.5 text-white">
            <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur">
              <svg viewBox="0 0 32 32" className="h-1/2 w-1/2" fill="none">
                <path d="M8 10h16M8 16h10M8 22h16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="24" cy="22" r="3" fill="#5eead4" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="text-lg font-display font-bold">InterviewCoach</span>
          </div></Link>
        </div>
        <div className="relative text-white">
          <h2 className="font-display text-4xl font-bold leading-tight mb-4">Your AI interview partner</h2>
          <ul className="space-y-3 text-brand-100">
            {['AI resume analysis & question generation', 'Company-specific mock interviews', 'Voice & text interview modes', 'Detailed scores and improvement plans'].map((t) => (
              <li key={t} className="flex items-center gap-2"><Check className="h-4 w-4 text-accent-300" /> {t}</li>
            ))}
          </ul>
        </div>
        <div className="relative flex items-center gap-6 text-brand-100 text-sm">
          <div><span className="block text-2xl font-bold text-white">7</span>Companies</div>
          <div><span className="block text-2xl font-bold text-white">5</span>Job roles</div>
          <div><span className="block text-2xl font-bold text-white">AI</span>Powered</div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="lg:hidden mb-8"><Logo /></div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white mb-1">Create your account</h1>
          <p className="text-sm text-ink-500 mb-6">Start practicing interviews in minutes</p>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3.5 py-3 text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="input pl-10" placeholder="Jane Doe" />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10" placeholder="At least 6 characters" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3">
              {loading ? <Spinner /> : <>Create account <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
