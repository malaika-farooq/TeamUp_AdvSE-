-- Functionality 3: availability-overlap meeting scheduling.
-- Members mark weekly free time (Settings > Availability or the team's "Meeting times" tab); the team page
-- shows where everyone's free time overlaps. Run once in the Supabase SQL editor, after 0009.

-- Until now a student could only read their own availability rows, so the old "Find a meeting time" box could
-- only ever see the person using it. This function lets members of a team read each other's weekly free time,
-- and nobody else. The result is just weekday + minutes per person: no names, notes or tasks.
CREATE OR REPLACE FUNCTION public.team_availability(_team uuid)
RETURNS TABLE (user_id uuid, weekday int, start_minute int, end_minute int)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
#variable_conflict use_column
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF NOT public.is_team_member(_team, auth.uid()) THEN
    RAISE EXCEPTION 'Only team members can see the team''s availability';
  END IF;
  RETURN QUERY
  SELECT a.user_id, a.weekday, a.start_minute, a.end_minute
  FROM public.availability_slots a
  JOIN public.team_members m ON m.user_id = a.user_id AND m.team_id = _team
  ORDER BY a.user_id, a.weekday, a.start_minute;
END; $$;

-- Reminds teammates who haven't marked any free time yet. Any member can send it; each person is reminded at
-- most once a day. Returns how many people were reminded.
CREATE OR REPLACE FUNCTION public.nudge_team_availability(_team uuid)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
#variable_conflict use_column
DECLARE uid uuid := auth.uid(); tname text; sender text; n int := 0; r record;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF NOT public.is_team_member(_team, uid) THEN
    RAISE EXCEPTION 'Only team members can send reminders';
  END IF;
  SELECT t.name INTO tname FROM public.teams t WHERE t.id = _team;
  SELECT coalesce(p.display_name, 'A teammate') INTO sender FROM public.profiles p WHERE p.id = uid;
  FOR r IN
    SELECT m.user_id FROM public.team_members m
    WHERE m.team_id = _team AND m.user_id <> uid
      AND NOT EXISTS (SELECT 1 FROM public.availability_slots a WHERE a.user_id = m.user_id)
  LOOP
    INSERT INTO public.notifications (user_id, type, title, body, link, dedupe_key)
    VALUES (r.user_id, 'availability_nudge', 'Add your free time',
            sender || ' asked everyone in ' || tname || ' to mark when they are free, so the team can find a meeting time.',
            '/settings', 'avail-nudge:' || _team || ':' || to_char(now(), 'YYYY-MM-DD'))
    ON CONFLICT (user_id, dedupe_key) DO NOTHING;
    IF FOUND THEN n := n + 1; END IF;
  END LOOP;
  RETURN n;
END; $$;

DO $$
DECLARE f text;
BEGIN
  FOREACH f IN ARRAY ARRAY['team_availability(uuid)', 'nudge_team_availability(uuid)'] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM public, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', f);
  END LOOP;
END $$;
