-- Skills of every member of a team, readable only by members of that team.
CREATE OR REPLACE FUNCTION public.team_member_skills(_team uuid)
RETURNS TABLE (user_id uuid, skill text, level int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT us.user_id, s.name, us.level
  FROM public.team_members m
  JOIN public.user_skills us ON us.user_id = m.user_id
  JOIN public.skills s ON s.id = us.skill_id
  WHERE m.team_id = _team
    AND public.is_team_member(_team, auth.uid());
$$;
REVOKE ALL ON FUNCTION public.team_member_skills(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.team_member_skills(uuid) TO authenticated;

-- Weekly free-time overlap (in minutes, 30-minute granularity) between each
-- discoverable candidate and at least one member of the team. Only a number is
-- returned, so nobody's private availability slots are exposed.
CREATE OR REPLACE FUNCTION public.candidate_availability_overlap(_team uuid, _candidates uuid[])
RETURNS TABLE (candidate_id uuid, overlap_minutes int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH buckets AS (
    SELECT d AS weekday, b * 30 AS start_minute
    FROM generate_series(0, 6) d, generate_series(0, 47) b
  ),
  team_buckets AS (
    SELECT DISTINCT bk.weekday, bk.start_minute
    FROM buckets bk
    JOIN public.availability_slots a
      ON a.weekday = bk.weekday AND a.start_minute <= bk.start_minute AND a.end_minute >= bk.start_minute + 30
    JOIN public.team_members m ON m.user_id = a.user_id AND m.team_id = _team
  ),
  cand AS (
    SELECT p.id FROM public.profiles p
    WHERE p.id = ANY(_candidates) AND p.discoverable
  )
  SELECT c.id,
    COALESCE((
      SELECT count(DISTINCT (tb.weekday, tb.start_minute))::int * 30
      FROM team_buckets tb
      JOIN public.availability_slots a
        ON a.user_id = c.id AND a.weekday = tb.weekday
       AND a.start_minute <= tb.start_minute AND a.end_minute >= tb.start_minute + 30
    ), 0)
  FROM cand c
  WHERE public.is_team_member(_team, auth.uid());
$$;
REVOKE ALL ON FUNCTION public.candidate_availability_overlap(uuid, uuid[]) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.candidate_availability_overlap(uuid, uuid[]) TO authenticated;