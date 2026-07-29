/*
# AI Interview Coach — core schema

1. Overview
Creates the tables that power the AI Interview Coach platform:
- `resumes`     — one row per uploaded resume, stores AI-extracted structured data.
- `interviews`  — one row per completed mock interview, stores config + Q&A + scores.
- `roadmaps`    — AI-generated 30-day placement preparation plans.
All tables are owner-scoped to the authenticated user via `user_id` with a
default of `auth.uid()` so client inserts that omit `user_id` still satisfy RLS.

2. New Tables
- `resumes`
  - `id` uuid PK
  - `user_id` uuid NOT NULL DEFAULT auth.uid() → auth.users(id) ON DELETE CASCADE
  - `file_name` text — original uploaded file name
  - `storage_path` text — path in the `resumes` storage bucket
  - `raw_text` text — extracted plain text from the resume
  - `analysis` jsonb — AI-extracted structured data (name, skills, projects, etc.)
  - `created_at` timestamptz
- `interviews`
  - `id` uuid PK
  - `user_id` uuid NOT NULL DEFAULT auth.uid() → auth.users(id) ON DELETE CASCADE
  - `resume_id` uuid nullable → resumes(id) ON DELETE SET NULL
  - `company` text — selected company (or "General")
  - `job_role` text — e.g. Frontend Developer
  - `experience_level` text — Fresher | Intermediate | Experienced
  - `interview_type` text — Technical | HR | Project Discussion | Mixed
  - `mode` text — text | voice
  - `num_questions` int
  - `questions` jsonb — array of {question, answer, score, feedback}
  - `overall_score` int
  - `technical_score` int
  - `communication_score` int
  - `strengths` jsonb — array of strings
  - `weaknesses` jsonb — array of strings
  - `suggestions` jsonb — array of strings
  - `summary` text — overall AI feedback
  - `created_at` timestamptz
- `roadmaps`
  - `id` uuid PK
  - `user_id` uuid NOT NULL DEFAULT auth.uid() → auth.users(id) ON DELETE CASCADE
  - `company` text
  - `job_role` text
  - `weak_areas` jsonb — array of strings
  - `plan` jsonb — array of {day, title, topics[], tasks[]}
  - `created_at` timestamptz

3. Security
- RLS enabled on all three tables.
- Owner-scoped CRUD (select/insert/update/delete) for `authenticated` users only,
  using `auth.uid() = user_id`. The app has a sign-in screen, so policies are
  scoped to `authenticated`.
- A public storage bucket `resumes` is created for resume file uploads. Storage
  policies allow authenticated users to manage only objects under their own
  `user_id` prefix.

4. Notes
- `user_id` defaults to `auth.uid()` so frontend inserts omitting `user_id` work.
- `resume_id` on interviews is nullable and SET NULL on resume delete so past
  interview history is preserved when a resume is removed.
*/

CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  raw_text text NOT NULL DEFAULT '',
  analysis jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_resumes" ON resumes;
CREATE POLICY "select_own_resumes" ON resumes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_resumes" ON resumes;
CREATE POLICY "insert_own_resumes" ON resumes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_resumes" ON resumes;
CREATE POLICY "update_own_resumes" ON resumes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_resumes" ON resumes;
CREATE POLICY "delete_own_resumes" ON resumes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id uuid REFERENCES resumes(id) ON DELETE SET NULL,
  company text NOT NULL DEFAULT 'General',
  job_role text NOT NULL DEFAULT 'Software Engineer',
  experience_level text NOT NULL DEFAULT 'Fresher',
  interview_type text NOT NULL DEFAULT 'Mixed',
  mode text NOT NULL DEFAULT 'text',
  num_questions int NOT NULL DEFAULT 5,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  overall_score int NOT NULL DEFAULT 0,
  technical_score int NOT NULL DEFAULT 0,
  communication_score int NOT NULL DEFAULT 0,
  strengths jsonb NOT NULL DEFAULT '[]'::jsonb,
  weaknesses jsonb NOT NULL DEFAULT '[]'::jsonb,
  suggestions jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_interviews" ON interviews;
CREATE POLICY "select_own_interviews" ON interviews FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_interviews" ON interviews;
CREATE POLICY "insert_own_interviews" ON interviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_interviews" ON interviews;
CREATE POLICY "update_own_interviews" ON interviews FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_interviews" ON interviews;
CREATE POLICY "delete_own_interviews" ON interviews FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  company text NOT NULL DEFAULT 'General',
  job_role text NOT NULL DEFAULT 'Software Engineer',
  weak_areas jsonb NOT NULL DEFAULT '[]'::jsonb,
  plan jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_roadmaps" ON roadmaps;
CREATE POLICY "select_own_roadmaps" ON roadmaps FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_roadmaps" ON roadmaps;
CREATE POLICY "insert_own_roadmaps" ON roadmaps FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_roadmaps" ON roadmaps;
CREATE POLICY "update_own_roadmaps" ON roadmaps FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_roadmaps" ON roadmaps;
CREATE POLICY "delete_own_roadmaps" ON roadmaps FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS interviews_user_id_created_at_idx
  ON interviews (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON resumes (user_id);
CREATE INDEX IF NOT EXISTS roadmaps_user_id_idx ON roadmaps (user_id);

INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "users_upload_own_resume" ON storage.objects;
CREATE POLICY "users_upload_own_resume" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resumes' AND (auth.uid()::text = (storage.foldername(name))[1]));

DROP POLICY IF EXISTS "users_read_own_resume" ON storage.objects;
CREATE POLICY "users_read_own_resume" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'resumes' AND (auth.uid()::text = (storage.foldername(name))[1]));

DROP POLICY IF EXISTS "users_delete_own_resume" ON storage.objects;
CREATE POLICY "users_delete_own_resume" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'resumes' AND (auth.uid()::text = (storage.foldername(name))[1]));
