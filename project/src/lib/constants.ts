export const COMPANIES = [
  { name: 'Cognizant', pattern: 'Aptitude → Technical → HR', difficulty: 'Medium', topics: ['Programming fundamentals', 'Java/Python', 'SQL & DBMS', 'OOP', 'Networks', 'OS'], color: 'from-blue-500 to-cyan-500' },
  { name: 'TCS', pattern: 'NQT → Technical → HR', difficulty: 'Medium', topics: ['Coding basics', 'Problem solving', 'Data Structures', 'OOP', 'SDLC'], color: 'from-indigo-500 to-blue-500' },
  { name: 'Infosys', pattern: 'Aptitude → Technical → HR', difficulty: 'Medium-Hard', topics: ['Programming concepts', 'Logical thinking', 'Technical fundamentals', 'Behavioral'], color: 'from-sky-500 to-teal-500' },
  { name: 'Accenture', pattern: 'Aptitude → Coding → Technical → HR', difficulty: 'Medium', topics: ['Aptitude', 'Programming basics', 'Data structures', 'Communication', 'Cloud'], color: 'from-purple-500 to-pink-500' },
  { name: 'Wipro', pattern: 'Online Assessment → Technical → HR', difficulty: 'Medium', topics: ['C programming', 'OOP', 'DBMS', 'Operating systems', 'Verbal'], color: 'from-emerald-500 to-green-500' },
  { name: 'Capgemini', pattern: 'Aptitude → Pseudo Code → Technical → HR', difficulty: 'Medium-Hard', topics: ['Pseudo code', 'Data structures', 'Algorithms', 'Cloud computing', 'Behavioral'], color: 'from-amber-500 to-orange-500' },
  { name: 'HCL Technologies', pattern: 'Aptitude → Technical → HR', difficulty: 'Medium', topics: ['Programming', 'Networking', 'OS fundamentals', 'Database', 'HR'], color: 'from-rose-500 to-red-500' },
];

export const JOB_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'Software Engineer',
];

export const EXPERIENCE_LEVELS = ['Fresher', 'Intermediate', 'Experienced'];

export const INTERVIEW_TYPES = [
  { value: 'Technical', label: 'Technical Interview', desc: 'Coding, DSA, and domain-specific questions' },
  { value: 'HR', label: 'HR Interview', desc: 'Behavioral, situational, and culture-fit questions' },
  { value: 'Project Discussion', label: 'Project Discussion', desc: 'Deep dive into your projects and decisions' },
  { value: 'Mixed', label: 'Mixed Interview', desc: 'A blend of technical and HR questions' },
];

export const QUESTION_COUNTS = [5, 10, 15];

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400';
  if (score >= 40) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

export function scoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  if (score >= 60) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  if (score >= 40) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}
