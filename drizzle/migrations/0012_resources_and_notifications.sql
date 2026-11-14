-- Functionality 5: shared notes and links per team, plus in-app notifications (including deadline reminders).
-- Run once in the Supabase SQL editor, after 0011. Safe to run more than once.

-- 1. Shared notes, links and files ---------------------------------------------------------------

-- Every change to a resource moves its version on by one. The app uses the version to notice when two
-- people edited the same note at the same time, instead of one silently overwriting the other.
CREATE OR REPLACE FUNCTION public.resources_bump_version()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.version := OLD.version + 1;
  NEW.updated_at := now();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS resources_bump_version ON public.resources;
CREATE TRIGGER resources_bump_version BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.resources_bump_version();

-- A saved link must be a web address. (Without this, "javascript:..." could be saved and then run when
-- a teammate clicked it.) NOT VALID: links saved before this migration are left alone, new ones are checked.
ALTER TABLE public.resources DROP CONSTRAINT IF EXISTS resources_link_is_web_address;
ALTER TABLE public.resources ADD CONSTRAINT resources_link_is_web_address
  CHECK (url IS NULL OR url ~* '^https?://[^\s]+$') NOT VALID;

-- Titles and notes have sensible limits.
ALTER TABLE public.resources DROP CONSTRAINT IF EXISTS resources_size_limits;
ALTER TABLE public.resources ADD CONSTRAINT resources_size_limits
  CHECK (char_length(title) BETWEEN 1 AND 150
         AND (content IS NULL OR char_length(content) <= 20000)
         AND (url IS NULL OR char_length(url) <= 2000)) NOT VALID;

-- 2. Deadline reminders --------------------------------------------------------------------------
-- There is no background job, so the app asks for the signed-in student's reminders when it opens and every
-- few minutes after. Each reminder is created once: the dedupe key ties it to the task (or session) AND its
-- due time, so moving a deadline gives a fresh reminder and reloading never repeats one.
--   * a task assigned to you, not done, due in the next 24 hours  -> "Task due soon"
--   * a task assigned to you, not done, which became overdue in the last 7 days -> "Task overdue"
--   * a one-off session you're invited to, starting in the next 24 hours -> "Session starting soon"
-- Returns how many new reminders were created.
CREATE OR REPLACE FUNCTION public.refresh_deadline_notifications()
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); total int := 0; c int;
BEGIN
  IF uid IS NULL THEN RETURN 0; END IF;

  INSERT INTO public.notifications (user_id, type, title, body, link, dedupe_key)
  SELECT uid, 'task_due_soon', 'Task due within 24 hours', t.title, '/tasks',
         'due-soon:' || t.id || ':' || extract(epoch FROM t.due_date)::bigint
  FROM public.tasks t
  WHERE t.assignee_id = uid AND t.status <> 'done'
    AND t.due_date > now() AND t.due_date <= now() + interval '24 hours'
  ON CONFLICT (user_id, dedupe_key) DO NOTHING;
  GET DIAGNOSTICS c = ROW_COUNT; total := total + c;

  INSERT INTO public.notifications (user_id, type, title, body, link, dedupe_key)
  SELECT uid, 'task_overdue', 'Task overdue', t.title, '/tasks',
         'overdue:' || t.id || ':' || extract(epoch FROM t.due_date)::bigint
  FROM public.tasks t
  WHERE t.assignee_id = uid AND t.status <> 'done'
    AND t.due_date <= now() AND t.due_date > now() - interval '7 days'
  ON CONFLICT (user_id, dedupe_key) DO NOTHING;
  GET DIAGNOSTICS c = ROW_COUNT; total := total + c;

  INSERT INTO public.notifications (user_id, type, title, body, link, dedupe_key)
  SELECT uid, 'session_soon', 'Session starting within 24 hours', s.title, '/calendar',
         'session-soon:' || s.id || ':' || extract(epoch FROM s.starts_at)::bigint
  FROM public.sessions s
  JOIN public.session_attendees a ON a.session_id = s.id AND a.user_id = uid
  WHERE s.recurrence = 'none' AND a.status <> 'declined'
    AND s.starts_at > now() AND s.starts_at <= now() + interval '24 hours'
  ON CONFLICT (user_id, dedupe_key) DO NOTHING;
  GET DIAGNOSTICS c = ROW_COUNT; total := total + c;

  RETURN total;
END; $$;

REVOKE ALL ON FUNCTION public.refresh_deadline_notifications() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.refresh_deadline_notifications() TO authenticated;

-- 3. Notifications can't be rewritten ------------------------------------------------------------
-- You may mark your own notifications read or unread, or delete them, but not change what they say.
CREATE OR REPLACE FUNCTION public.notifications_only_read_state_changes()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.type IS DISTINCT FROM OLD.type
     OR NEW.title IS DISTINCT FROM OLD.title OR NEW.body IS DISTINCT FROM OLD.body
     OR NEW.link IS DISTINCT FROM OLD.link OR NEW.created_at IS DISTINCT FROM OLD.created_at
     OR NEW.dedupe_key IS DISTINCT FROM OLD.dedupe_key THEN
    RAISE EXCEPTION 'A notification can only be marked read or unread';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS notifications_only_read_state_changes ON public.notifications;
CREATE TRIGGER notifications_only_read_state_changes BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.notifications_only_read_state_changes();
