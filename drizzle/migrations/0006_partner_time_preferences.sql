-- Lets a student ask for partners who are free at specific times. _windows is a JSON array of
-- {"weekday": 0-6, "start": minute, "end": minute}. Returns only how many minutes of those windows
-- each discoverable candidate is free for (30-minute buckets), never the candidate's slots.
CREATE OR REPLACE FUNCTION public.candidate_window_minutes(_candidates uuid[], _windows jsonb)
RETURNS TABLE (candidate_id uuid, window_minutes int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH w AS (
    SELECT (x->>'weekday')::int AS wd, (x->>'start')::int AS s, (x->>'end')::int AS e
    FROM jsonb_array_elements(_windows) x
    WHERE jsonb_array_length(_windows) <= 21
  ),
  b AS (
    SELECT w.wd, g AS sm FROM w, generate_series(w.s, w.e - 30, 30) g
  )
  SELECT c.id, (count(DISTINCT b.wd * 1440 + b.sm) * 30)::int
  FROM unnest(_candidates) AS c(id)
  JOIN public.profiles p ON p.id = c.id AND p.discoverable
  JOIN public.availability_slots a ON a.user_id = c.id
  JOIN b ON a.weekday = b.wd AND a.start_minute <= b.sm AND a.end_minute >= b.sm + 30
  WHERE auth.uid() IS NOT NULL
  GROUP BY c.id;
$$;
REVOKE ALL ON FUNCTION public.candidate_window_minutes(uuid[], jsonb) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.candidate_window_minutes(uuid[], jsonb) TO authenticated;
