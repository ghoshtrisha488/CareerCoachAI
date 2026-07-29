import { AI_FUNCTION_URL } from './supabase';

async function callAI<T>(action: string, body: unknown): Promise<T> {
  const res = await fetch(`${AI_FUNCTION_URL}?action=${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${res.status})`);
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data as T;
}

export async function analyzeResume(resumeText: string) {
  return callAI<{ analysis: any }>('analyze-resume', { resumeText }).then((r) => r.analysis);
}

export async function generateQuestions(config: any) {
  return callAI<string[]>('generate-questions', config);
}

export async function evaluateInterview(config: any, questions: { question: string; answer: string }[]) {
  return callAI<any>('evaluate-interview', { config, questions });
}

export async function generateRoadmap(company: string, jobRole: string, weakAreas: string[], previousScores?: any[]) {
  return callAI<{ plan: any[] }>('generate-roadmap', { company, jobRole, weakAreas, previousScores });
}
