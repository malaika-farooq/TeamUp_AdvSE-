-- Functionality 4: task board with three columns (To Do / In Progress / Done), assignment and due dates.
-- Run once in the Supabase SQL editor, after 0010. Safe to run more than once.

-- 1. The board has three columns now. Tasks that were "In Review" move to "In Progress".
UPDATE public.tasks SET status = 'in_progress' WHERE status = 'in_review';

-- 2. The finished time is kept by the database, so it is right however a task was changed
--    (board, task panel, API): set when a task becomes Done, cleared when it is reopened.
CREATE OR REPLACE FUNCTION public.tasks_track_progress()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  IF NEW.status = 'done' THEN
    IF TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'done' OR NEW.completed_at IS NULL THEN
      NEW.completed_at := now();
    END IF;
  ELSE
    NEW.completed_at := NULL;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS tasks_track_progress ON public.tasks;
CREATE TRIGGER tasks_track_progress BEFORE INSERT OR UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.tasks_track_progress();

-- 3. A task can only be assigned to someone who is on its team (already enforced for people by the
--    row policies; this also covers service-side changes and gives a clear message).
CREATE OR REPLACE FUNCTION public.tasks_check_assignee()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.assignee_id IS NOT NULL
     AND (TG_OP = 'INSERT' OR NEW.assignee_id IS DISTINCT FROM OLD.assignee_id)
     AND NOT public.is_team_member(NEW.team_id, NEW.assignee_id) THEN
    RAISE EXCEPTION 'A task can only be assigned to a member of its team';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS tasks_check_assignee ON public.tasks;
CREATE TRIGGER tasks_check_assignee BEFORE INSERT OR UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.tasks_check_assignee();

-- 4. When someone leaves or is removed from a team, their open tasks become unassigned
--    instead of staying assigned to a person who can no longer see them.
CREATE OR REPLACE FUNCTION public.unassign_tasks_of_leaver()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.tasks SET assignee_id = NULL
  WHERE team_id = OLD.team_id AND assignee_id = OLD.user_id;
  RETURN OLD;
END; $$;

DROP TRIGGER IF EXISTS unassign_tasks_of_leaver ON public.team_members;
CREATE TRIGGER unassign_tasks_of_leaver AFTER DELETE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.unassign_tasks_of_leaver();
