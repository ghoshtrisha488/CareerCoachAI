export interface ResumeAnalysis {
  name: string;
  skills: string[];
  programmingLanguages: string[];
  frameworks: string[];
  projects: { name: string; description: string }[];
  internships: string[];
  education: string[];
  certifications: string[];
  experience: string[];
  summary: string;
}

export interface Resume {
  id: string;
  user_id: string;
  file_name: string;
  storage_path: string;
  raw_text: string;
  analysis: ResumeAnalysis;
  created_at: string;
}

export interface InterviewConfig {
  company: string;
  jobRole: string;
  experienceLevel: string;
  interviewType: string;
  numQuestions: number;
  mode: 'text' | 'voice';
}

export interface QnA {
  question: string;
  answer: string;
  score: number;
  feedback: string;
}

export interface Interview {
  id: string;
  user_id: string;
  resume_id: string | null;
  company: string;
  job_role: string;
  experience_level: string;
  interview_type: string;
  mode: string;
  num_questions: number;
  questions: QnA[];
  overall_score: number;
  technical_score: number;
  communication_score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  summary: string;
  created_at: string;
}

export interface RoadmapDay {
  day: number;
  title: string;
  topics: string[];
  tasks: string[];
}

export interface Roadmap {
  id: string;
  user_id: string;
  company: string;
  job_role: string;
  weak_areas: string[];
  plan: RoadmapDay[];
  created_at: string;
}

export interface EvalResult {
  overall_score: number;
  technical_score: number;
  communication_score: number;
  questions: QnA[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  summary: string;
}
