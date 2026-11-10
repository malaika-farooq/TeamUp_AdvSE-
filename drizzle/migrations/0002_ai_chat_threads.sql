CREATE TABLE public.ai_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT 'New conversation' CHECK (char_length(title) BETWEEN 1 AND 120),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_threads_user_updated_idx ON public.ai_threads (user_id, updated_at DESC);

CREATE TABLE public.ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.ai_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  client_id text,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  parts jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_messages_thread_created_idx ON public.ai_messages (thread_id, created_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_threads TO authenticated;
GRANT ALL ON public.ai_threads TO service_role;
GRANT SELECT, INSERT, DELETE ON public.ai_messages TO authenticated;
GRANT ALL ON public.ai_messages TO service_role;

ALTER TABLE public.ai_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own threads read" ON public.ai_threads FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Own threads insert" ON public.ai_threads FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (team_id IS NULL OR public.is_team_member(team_id, auth.uid())));
CREATE POLICY "Own threads update" ON public.ai_threads FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND (team_id IS NULL OR public.is_team_member(team_id, auth.uid())));
CREATE POLICY "Own threads delete" ON public.ai_threads FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Own messages read" ON public.ai_messages FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Own messages insert" ON public.ai_messages FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.ai_threads t WHERE t.id = thread_id AND t.user_id = auth.uid()));
CREATE POLICY "Own messages delete" ON public.ai_messages FOR DELETE TO authenticated USING (user_id = auth.uid());