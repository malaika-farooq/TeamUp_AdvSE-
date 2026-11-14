-- Member permission levels: what owners, admins and plain members may do with a team's data.
-- Run after 0008. Safe to run more than once.
--
--                              owner   admin   member
--   see everything in the team   yes     yes     yes
--   create tasks/sessions/notes  yes     yes     yes
--   edit or delete a task        any     any     only ones they created (edit also: assigned to them)
--   edit/delete a session        any     any     only their own
--   edit/delete a resource/file  any     any     only their own
--   delete someone's comment     yes     yes     only their own
--   edit team details            yes     yes     no
--   make team public/private     yes     no      no
--   delete the team              yes     no      no
-- (Inviting, join requests, roles and removing people are covered by migration 0008.)

-- 1. Authorship and ownership of rows can never be rewritten --------------------------------------
-- (Before: whoever could edit a task could also change who "created" it, or move it between teams.)
CREATE OR REPLACE FUNCTION public.lock_row_identity()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN NEW; END IF; -- server-side maintenance (SQL editor, seed) is not restricted
  IF NEW.team_id IS DISTINCT FROM OLD.team_id THEN RAISE EXCEPTION 'Items can''t be moved to another team'; END IF;
  IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN RAISE EXCEPTION 'The creator of an item can''t be changed'; END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS lock_row_identity ON public.tasks;
CREATE TRIGGER lock_row_identity BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.lock_row_identity();
DROP TRIGGER IF EXISTS lock_row_identity ON public.sessions;
CREATE TRIGGER lock_row_identity BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.lock_row_identity();
DROP TRIGGER IF EXISTS lock_row_identity ON public.resources;
CREATE TRIGGER lock_row_identity BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.lock_row_identity();

-- 2. Team details: admins edit them, only the owner decides who can find the team -------------------
CREATE OR REPLACE FUNCTION public.guard_team_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;
  IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN RAISE EXCEPTION 'The creator of a team can''t be changed'; END IF;
  IF NEW.visibility IS DISTINCT FROM OLD.visibility AND public.team_role_of(OLD.id, auth.uid()) IS DISTINCT FROM 'owner' THEN
    RAISE EXCEPTION 'Only the team owner can make a team public or private';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS guard_team_update ON public.teams;
CREATE TRIGGER guard_team_update BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.guard_team_update();

-- 3. Recurring sessions: only the session's creator or a manager can cancel/move an occurrence -----
DROP POLICY IF EXISTS "rec ex all" ON public.recurrence_exceptions;
DROP POLICY IF EXISTS "rec ex read" ON public.recurrence_exceptions;
DROP POLICY IF EXISTS "rec ex write" ON public.recurrence_exceptions;
CREATE POLICY "rec ex read" ON public.recurrence_exceptions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.sessions s WHERE s.id = session_id AND public.is_team_member(s.team_id, auth.uid())));
CREATE POLICY "rec ex write" ON public.recurrence_exceptions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.sessions s WHERE s.id = session_id
                 AND (s.created_by = auth.uid() OR public.can_manage_team(s.team_id, auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.sessions s WHERE s.id = session_id
                      AND (s.created_by = auth.uid() OR public.can_manage_team(s.team_id, auth.uid()))));

-- 4. Session attendance: your own RSVP is yours alone --------------------------------------------
-- A session's creator (or a manager) can invite team members, but cannot answer for them.
DROP POLICY IF EXISTS "attendees write" ON public.session_attendees;
DROP POLICY IF EXISTS "attendees insert" ON public.session_attendees;
DROP POLICY IF EXISTS "attendees update own" ON public.session_attendees;
DROP POLICY IF EXISTS "attendees delete" ON public.session_attendees;
CREATE POLICY "attendees insert" ON public.session_attendees FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = session_id
      AND public.is_team_member(s.team_id, auth.uid())
      AND public.is_team_member(s.team_id, user_id)
      AND (user_id = auth.uid()
           OR (status = 'invited' AND (s.created_by = auth.uid() OR public.can_manage_team(s.team_id, auth.uid()))))
  ));
CREATE POLICY "attendees update own" ON public.session_attendees FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "attendees delete" ON public.session_attendees FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = session_id AND (s.created_by = auth.uid() OR public.can_manage_team(s.team_id, auth.uid()))
  ));

-- 5. Comments: authors can delete their own, owners and admins can moderate ---------------------
DROP POLICY IF EXISTS "comments delete" ON public.task_comments;
CREATE POLICY "comments delete" ON public.task_comments FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.tasks t WHERE t.id = task_id AND public.can_manage_team(t.team_id, auth.uid())
  ));

-- 6. Team files: members can add files, but only the uploader or a manager can replace or delete one -
DROP POLICY IF EXISTS "team files update" ON storage.objects;
DROP POLICY IF EXISTS "team files delete" ON storage.objects;
CREATE POLICY "team files update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'team-files' AND (
    owner_id = auth.uid()::text
    OR public.can_manage_team(((storage.foldername(name))[1])::uuid, auth.uid())
  ));
CREATE POLICY "team files delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'team-files' AND (
    owner_id = auth.uid()::text
    OR public.can_manage_team(((storage.foldername(name))[1])::uuid, auth.uid())
  ));
