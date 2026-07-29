import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

interface QnA {
  question: string;
  answer: string;
}

interface InterviewConfig {
  company: string;
  jobRole: string;
  experienceLevel: string;
  interviewType: string;
  numQuestions: number;
  resumeText?: string;
  resumeAnalysis?: ResumeAnalysis;
}

interface ResumeAnalysis {
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") ?? "";
    const body = await req.json();

    let result: unknown;

    if (action === "analyze-resume") {
      result = await analyzeResume(body.resumeText ?? "");
    } else if (action === "generate-questions") {
      result = await generateQuestions(body as InterviewConfig);
    } else if (action === "evaluate-interview") {
      result = await evaluateInterview(body);
    } else if (action === "generate-roadmap") {
      result = await generateRoadmap(body);
    } else {
      return json({ error: "Unknown action" }, 400);
    }

    return json(result);
  } catch (err) {
    return json({ error: err?.message ?? String(err) }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ─── Gemini call ───────────────────────────────────────────────────────────

async function callGemini(prompt: string): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;
  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === "string" ? text : null;
  } catch {
    return null;
  }
}

function extractJson<T>(raw: string): T | null {
  try {
    const cleaned = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

// ─── 1. Resume analysis ────────────────────────────────────────────────────

async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
  const fallback = localAnalyzeResume(resumeText);
  if (!resumeText.trim()) return fallback;

  const prompt = `You are an expert technical recruiter. Analyze the following resume text and extract structured information. Return ONLY valid JSON (no markdown) with this exact shape:
{
  "name": "full name",
  "skills": ["skill1", ...],
  "programmingLanguages": ["language1", ...],
  "frameworks": ["framework1", ...],
  "projects": [{"name": "project name", "description": "one line"}],
  "internships": ["internship descriptions"],
  "education": ["degree - institution"],
  "certifications": ["certification names"],
  "experience": ["role at company - duration"],
  "summary": "2-3 sentence professional summary"
}

Resume text:
${resumeText.slice(0, 8000)}`;

  const raw = await callGemini(prompt);
  if (!raw) return fallback;
  const parsed = extractJson<ResumeAnalysis>(raw);
  return parsed ?? fallback;
}

function localAnalyzeResume(text: string): ResumeAnalysis {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const name = lines[0]?.slice(0, 80) || "Candidate";

  const skillKeywords = [
    "javascript", "typescript", "python", "java", "c++", "c#", "go", "ruby", "php", "kotlin", "swift",
    "react", "angular", "vue", "node", "express", "next", "django", "flask", "spring", "tailwind",
    "mongodb", "mysql", "postgresql", "sqlite", "redis", "firebase", "supabase",
    "docker", "kubernetes", "aws", "azure", "gcp",
    "git", "rest", "graphql", "redux", "html", "css", "sass",
    "machine learning", "data science", "pandas", "numpy", "tensorflow", "pytorch",
  ];
  const lower = text.toLowerCase();
  const skills = [...new Set(skillKeywords.filter((k) => lower.includes(k)).map((k) => k.charAt(0).toUpperCase() + k.slice(1)))];
  const programmingLanguages = skills.filter((s) =>
    ["Javascript", "Typescript", "Python", "Java", "C++", "C#", "Go", "Ruby", "Php", "Kotlin", "Swift"].includes(s)
  );
  const frameworks = skills.filter((s) =>
    ["React", "Angular", "Vue", "Node", "Express", "Next", "Django", "Flask", "Spring", "Tailwind", "Redux"].includes(s)
  );

  const projects: { name: string; description: string }[] = [];
  lines.forEach((line, i) => {
    if (/project/i.test(line) && line.length < 120) {
      projects.push({ name: line.replace(/^[-•*\d.\s]+/, "").slice(0, 80), description: lines[i + 1]?.slice(0, 120) || "" });
    }
  });

  const education = lines.filter((l) => /b\.?tech|bachelor|master|m\.?tech|b\.?e\b|mba|degree|university|college/i.test(l)).slice(0, 5);
  const certifications = lines.filter((l) => /certif/i.test(l)).slice(0, 5);
  const internships = lines.filter((l) => /intern/i.test(l)).slice(0, 5);
  const experience = lines.filter((l) => /\b(20\d{2}|present|developer|engineer|analyst)\b/i.test(l) && l.length < 120).slice(0, 5);

  return {
    name,
    skills,
    programmingLanguages,
    frameworks,
    projects: projects.slice(0, 6),
    internships,
    education,
    certifications,
    experience,
    summary: `${name} is a candidate with ${skills.length || "various"} technical skills${frameworks.length ? ` including ${frameworks.slice(0, 3).join(", ")}` : ""}.`,
  };
}

// ─── 2. Question generation ────────────────────────────────────────────────

async function generateQuestions(cfg: InterviewConfig): Promise<string[]> {
  const fallback = localGenerateQuestions(cfg);
  if (!GEMINI_API_KEY) return fallback;

  const resumeContext = cfg.resumeAnalysis
    ? `\nCandidate skills: ${cfg.resumeAnalysis.skills.join(", ")}.\nProjects: ${cfg.resumeAnalysis.projects.map((p) => p.name).join(", ")}.`
    : cfg.resumeText
    ? `\nResume summary: ${cfg.resumeText.slice(0, 1500)}`
    : "";

  const prompt = `You are an expert interviewer at ${cfg.company}. Generate exactly ${cfg.numQuestions} interview questions for a ${cfg.experienceLevel} ${cfg.jobRole} candidate.
Interview type: ${cfg.interviewType}.
${resumeContext}

Return ONLY a JSON array of question strings, no markdown. Mix of ${cfg.interviewType} questions appropriate for ${cfg.company}. Make questions specific and realistic. If the candidate has projects, include project-specific questions.`;

  const raw = await callGemini(prompt);
  if (!raw) return fallback;
  try {
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    if (start === -1 || end === -1) return fallback;
    const arr = JSON.parse(cleaned.slice(start, end + 1));
    if (!Array.isArray(arr) || !arr.every((q) => typeof q === "string")) return fallback;
    return arr.slice(0, cfg.numQuestions);
  } catch {
    return fallback;
  }
}

const COMPANY_TOPICS: Record<string, string[]> = {
  Cognizant: ["Programming fundamentals", "Java/Python basics", "SQL & DBMS", "OOP Concepts", "Computer Networks", "Operating Systems", "Project explanation"],
  TCS: ["Coding basics", "Problem solving", "Data Structures", "OOP", "SDLC", "Database concepts"],
  Infosys: ["Programming concepts", "Logical thinking", "Technical fundamentals", "Behavioral questions", "Puzzles"],
  Accenture: ["Aptitude", "Programming basics", "Data structures", "Communication", "Cloud basics"],
  Wipro: ["C programming", "OOP", "DBMS", "Operating systems", "Verbal ability"],
  Capgemini: ["Pseudo code", "Data structures", "Algorithms", "Cloud computing", "Behavioral"],
  "HCL Technologies": ["Programming", "Networking", "OS fundamentals", "Database", "HR questions"],
};

const ROLE_TOPICS: Record<string, string[]> = {
  "Frontend Developer": ["HTML/CSS/JS", "React/Vue", "State management", "Performance", "Accessibility", "Responsive design"],
  "Backend Developer": ["APIs", "Databases", "Authentication", "Scalability", "System design", "Security"],
  "Full Stack Developer": ["Frontend + Backend", "API design", "Database modeling", "Deployment", "Authentication"],
  "Data Analyst": ["SQL", "Statistics", "Python/Pandas", "Data visualization", "Excel", "Business insights"],
  "Software Engineer": ["DSA", "OOP", "DBMS", "OS", "Networks", "System design"],
};

const HR_QUESTIONS = [
  "Tell me about yourself.",
  "Why do you want to join this company?",
  "What are your strengths and weaknesses?",
  "Where do you see yourself in 5 years?",
  "Describe a challenging situation and how you handled it.",
  "Why should we hire you?",
  "What are your salary expectations?",
  "Do you have any questions for us?",
];

const TECH_QUESTIONS = [
  "Explain the difference between SQL and NoSQL databases.",
  "What is the difference between let, const, and var in JavaScript?",
  "Explain Object-Oriented Programming principles.",
  "What is REST API and how does it differ from GraphQL?",
  "Describe the SDLC and which model you prefer.",
  "Explain the difference between processes and threads.",
  "What is normalization in databases?",
  "Explain time complexity with an example.",
  "What is the difference between authentication and authorization?",
  "Describe a design pattern you have used.",
];

const PROJECT_QUESTIONS = [
  "Walk me through your most challenging project.",
  "What technical decisions did you make and why?",
  "How did you handle the most difficult bug in your project?",
  "If you could rebuild your project, what would you change?",
  "How did you test your project?",
];

function localGenerateQuestions(cfg: InterviewConfig): string[] {
  const out: string[] = [];
  const companyTopics = COMPANY_TOPICS[cfg.company] || [];
  const roleTopics = ROLE_TOPICS[cfg.jobRole] || ROLE_TOPICS["Software Engineer"];

  if (cfg.resumeAnalysis?.projects?.length) {
    cfg.resumeAnalysis.projects.slice(0, 2).forEach((p) => {
      out.push(`Walk me through your ${p.name} project. What was your role and what did you build?`);
    });
  }

  if (cfg.interviewType === "HR" || cfg.interviewType === "Mixed") {
    HR_QUESTIONS.slice(0, Math.ceil(cfg.numQuestions / 3)).forEach((q) => {
      if (q.includes("this company")) q = `Why do you want to join ${cfg.company}?`;
      out.push(q);
    });
  }

  if (cfg.interviewType === "Technical" || cfg.interviewType === "Mixed") {
    const pool = [...TECH_QUESTIONS];
    const target = cfg.interviewType === "Mixed" ? Math.ceil(cfg.numQuestions / 2) : cfg.numQuestions;
    for (let i = 0; i < target && out.length < cfg.numQuestions; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      out.push(pool.splice(idx, 1)[0]);
    }
  }

  if (cfg.interviewType === "Project Discussion") {
    PROJECT_QUESTIONS.forEach((q) => out.push(q));
  }

  // company-specific topic questions
  companyTopics.slice(0, 3).forEach((topic) => {
    if (out.length < cfg.numQuestions) out.push(`Explain your understanding of ${topic}.`);
  });

  // fill remaining with role topics
  let ri = 0;
  while (out.length < cfg.numQuestions && ri < roleTopics.length * 2) {
    out.push(`What experience do you have with ${roleTopics[ri % roleTopics.length]}?`);
    ri++;
  }

  return out.slice(0, cfg.numQuestions);
}

// ─── 3. Interview evaluation ──────────────────────────────────────────────

interface EvalRequest {
  config: InterviewConfig;
  questions: QnA[];
}

async function evaluateInterview(req: EvalRequest) {
  const fallback = localEvaluate(req);
  if (!GEMINI_API_KEY) return fallback;

  const qaText = req.questions.map((q, i) => `Q${i + 1}: ${q.question}\nA: ${q.answer || "(no answer)"}`).join("\n\n");

  const prompt = `You are an expert interviewer evaluating a mock interview for a ${req.config.experienceLevel} ${req.config.jobRole} role at ${req.config.company}.
Interview type: ${req.config.interviewType}.

Questions and answers:
${qaText}

Evaluate the candidate. Return ONLY valid JSON (no markdown) with this exact shape:
{
  "overall_score": 0-100,
  "technical_score": 0-100,
  "communication_score": 0-100,
  "questions": [{"score": 0-10, "feedback": "specific feedback for this answer"}],
  "strengths": ["strength1", ...],
  "weaknesses": ["weakness1", ...],
  "suggestions": ["suggestion1", ...],
  "summary": "2-3 sentence overall feedback"
}
The questions array must have exactly ${req.questions.length} entries, one per question in order.`;

  const raw = await callGemini(prompt);
  if (!raw) return fallback;
  const parsed = extractJson<any>(raw);
  if (!parsed) return fallback;

  // merge per-question feedback onto the original QnA
  const questions = req.questions.map((q, i) => ({
    question: q.question,
    answer: q.answer,
    score: parsed.questions?.[i]?.score ?? 0,
    feedback: parsed.questions?.[i]?.feedback ?? "",
  }));

  return {
    overall_score: parsed.overall_score ?? fallback.overall_score,
    technical_score: parsed.technical_score ?? fallback.technical_score,
    communication_score: parsed.communication_score ?? fallback.communication_score,
    questions,
    strengths: parsed.strengths ?? fallback.strengths,
    weaknesses: parsed.weaknesses ?? fallback.weaknesses,
    suggestions: parsed.suggestions ?? fallback.suggestions,
    summary: parsed.summary ?? fallback.summary,
  };
}

function localEvaluate(req: EvalRequest) {
  const questions = req.questions.map((q) => {
    const len = (q.answer || "").trim().length;
    let score = 0;
    if (len > 0) score = Math.min(10, Math.round(len / 30));
    if (len > 200) score = 8 + Math.floor(Math.random() * 3);
    const feedback = len === 0
      ? "No answer provided. Practice articulating your response even when unsure."
      : len < 100
      ? "Answer is too brief. Expand with specific examples and technical details."
      : len < 300
      ? "Decent answer. Add more concrete examples and structure (situation, action, result)."
      : "Well-structured answer with good detail. Consider tightening the explanation for impact.";
    return { question: q.question, answer: q.answer, score, feedback };
  });

  const answered = questions.filter((q) => q.score > 0).length;
  const avgQ = answered ? questions.reduce((s, q) => s + q.score, 0) / questions.length : 0;
  const overall = Math.round((avgQ / 10) * 100);
  const technical = Math.round(Math.min(100, overall + (req.config.interviewType === "HR" ? 10 : -5)));
  const communication = Math.round(Math.min(100, avgQ * 9 + 10));

  return {
    overall_score: overall,
    technical_score: Math.max(0, technical),
    communication_score: Math.max(0, communication),
    questions,
    strengths: answered > questions.length / 2 ? ["Consistent effort across questions", "Willingness to attempt all questions"] : ["Honest about knowledge gaps"],
    weaknesses: ["Answers could be more detailed", "Need more concrete examples", "Technical depth can be improved"],
    suggestions: [
      "Use the STAR method for behavioral questions",
      "Prepare 2-3 concrete examples for each skill on your resume",
      `Review ${ROLE_TOPICS[req.config.jobRole]?.slice(0, 2).join(" and ") || "core fundamentals"}`,
      "Practice speaking answers aloud to improve fluency",
    ],
    summary: `You answered ${answered} of ${questions.length} questions with an average quality of ${avgQ.toFixed(1)}/10. Focus on adding concrete examples and technical depth to your answers.`,
  };
}

// ─── 4. Roadmap generation ─────────────────────────────────────────────────

interface RoadmapRequest {
  company: string;
  jobRole: string;
  weakAreas: string[];
  previousScores?: { overall: number; technical: number; communication: number }[];
}

async function generateRoadmap(req: RoadmapRequest) {
  const fallback = localRoadmap(req);
  if (!GEMINI_API_KEY) return fallback;

  const prompt = `Create a focused 30-day placement preparation plan for a candidate targeting ${req.company} for a ${req.config?.jobRole ?? req.jobRole} role.
Weak areas: ${(req.weakAreas || []).join(", ") || "general fundamentals"}.

Return ONLY valid JSON (no markdown) with this exact shape:
{
  "plan": [
    {"day": 1, "title": "topic", "topics": ["subtopic1"], "tasks": ["task1"]}
  ]
}
Group days into logical weeks. Include 30 day entries.`;

  const raw = await callGemini(prompt);
  if (!raw) return fallback;
  const parsed = extractJson<{ plan: any[] }>(raw);
  if (!parsed?.plan?.length) return fallback;
  return { plan: parsed.plan.slice(0, 30) };
}

function localRoadmap(req: RoadmapRequest) {
  const role = req.jobRole || "Software Engineer";
  const topics = ROLE_TOPICS[role] || ROLE_TOPICS["Software Engineer"];
  const companyTopics = COMPANY_TOPICS[req.company] || [];
  const weak = req.weakAreas || [];

  const weekThemes = [
    "Foundations & Core Concepts",
    "Data Structures & Algorithms",
    "Domain Deep Dive",
    "Company-Specific Preparation",
    "Mock Interviews & Behavioral",
    "Final Revision & Company Pattern",
  ];

  const plan: { day: number; title: string; topics: string[]; tasks: string[] }[] = [];
  for (let day = 1; day <= 30; day++) {
    const week = Math.floor((day - 1) / 5);
    const theme = weekThemes[Math.min(week, weekThemes.length - 1)];
    const topicIdx = (day - 1) % topics.length;
    const companyTopic = companyTopics[(day - 1) % Math.max(companyTopics.length, 1)];
    const weakTopic = weak[(day - 1) % Math.max(weak.length, 1)];

    plan.push({
      day,
      title: `${theme}: ${topics[topicIdx] || "Practice"}`,
      topics: [topics[topicIdx], companyTopic].filter(Boolean),
      tasks: [
        `Study ${topics[topicIdx] || "core concepts"} for 2 hours`,
        weakTopic ? `Address weak area: ${weakTopic}` : "Solve 2 practice problems",
        day % 5 === 0 ? "Take a timed mock test" : "Review notes and summarize",
      ],
    });
  }
  return { plan };
}
