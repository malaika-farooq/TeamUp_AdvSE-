-- Individual study-partner matching: requests between two students, group study sessions,
-- and aggregate-only helpers (availability overlap, workload, shared free windows).
-- Tables have RLS enabled and no direct grants: all reads/writes go through the
-- security-definer functions below, so raw schedules and task lists are never exposed.

CREATE TABLE public.partner_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text CHECK (message IS NULL OR char_length(message) <= 300),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  CHECK (from_user <> to_user),
  UNIQUE (from_user, to_user)
);
CREATE INDEX partner_requests_to_idx ON public.partner_requests (to_user, status);
ALTER TABLE public.partner_requests ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.partner_requests TO service_role;

CREATE TABLE public.study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  note text CHECK (note IS NULL OR char_length(note) <= 2000),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);
CREATE TABLE public.study_session_attendees (
  session_id uuid NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined')),
  PRIMARY KEY (session_id, user_id)
);
CREATE INDEX study_session_attendees_user_idx ON public.study_session_attendees (user_id);
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_session_attendees ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.study_sessions TO service_role;
GRANT ALL ON public.study_session_attendees TO service_role;

-- True when the two students have an accepted partnership (either direction).
CREATE OR REPLACE FUNCTION public.are_study_partners(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.partner_requests r
    WHERE r.status = 'accepted'
      AND ((r.from_user = _a AND r.to_user = _b) OR (r.from_user = _b AND r.to_user = _a))
  );
$$;
REVOKE ALL ON FUNCTION public.are_study_partners(uuid, uuid) FROM public, anon, authenticated;

-- Requests ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.send_partner_request(_to uuid, _message text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); rid uuid; sender text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF _to = uid THEN RAISE EXCEPTION 'You can''t send a request to yourself'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = _to AND discoverable) THEN
    RAISE EXCEPTION 'That student isn''t discoverable';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.partner_requests r
    WHERE (r.from_user = uid AND r.to_user = _to) OR (r.from_user = _to AND r.to_user = uid)
  ) THEN
    RAISE EXCEPTION 'There is already a request between you two - check the Requests tab';
  END IF;
  INSERT INTO public.partner_requests (from_user, to_user, message)
  VALUES (uid, _to, NULLIF(btrim(coalesce(_message, '')), '')) RETURNING id INTO rid;
  SELECT display_name INTO sender FROM public.profiles WHERE id = uid;
  INSERT INTO public.notifications (user_id, type, title, body, link, dedupe_key)
  VALUES (_to, 'partner_request', 'New study partner request',
          coalesce(sender, 'A student') || ' would like to study with you.', '/partners', 'partner:' || rid);
  RETURN rid;
END; $$;

CREATE OR REPLACE FUNCTION public.respond_partner_request(_request uuid, _accept boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); r public.partner_requests; me text;
BEGIN
  SELECT * INTO r FROM public.partner_requests WHERE id = _request;
  IF r IS NULL OR r.to_user <> uid THEN RAISE EXCEPTION 'Request not found'; END IF;
  IF r.status <> 'pending' THEN RAISE EXCEPTION 'Already answered'; END IF;
  UPDATE public.partner_requests
     SET status = CASE WHEN _accept THEN 'accepted' ELSE 'declined' END, decided_at = now()
   WHERE id = _request;
  SELECT display_name INTO me FROM public.profiles WHERE id = uid;
  INSERT INTO public.notifications (user_id, type, title, body, link, dedupe_key)
  VALUES (r.from_user,
          CASE WHEN _accept THEN 'partner_accepted' ELSE 'partner_declined' END,
          CASE WHEN _accept THEN 'Study partner request accepted' ELSE 'Study partner request declined' END,
          CASE WHEN _accept THEN coalesce(me, 'A student') || ' is now your study partner.'
               ELSE coalesce(me, 'A student') || ' can''t study together right now.' END,
          '/partners', 'partner-reply:' || _request);
END; $$;

CREATE OR REPLACE FUNCTION public.my_partner_requests()
RETURNS TABLE (id uuid, other_id uuid, other_name text, other_major text, direction text,
               status text, message text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.id,
         o.id,
         o.display_name,
         o.major,
         CASE WHEN r.from_user = auth.uid() THEN 'outgoing' ELSE 'incoming' END,
         r.status,
         r.message,
         r.created_at
  FROM public.partner_requests r
  JOIN public.profiles o ON o.id = CASE WHEN r.from_user = auth.uid() THEN r.to_user ELSE r.from_user END
  WHERE auth.uid() IN (r.from_user, r.to_user)
  ORDER BY r.created_at DESC;
$$;

-- Aggregates for matching ---------------------------------------------------------------

-- Weekly free-time overlap (minutes, 30-minute buckets) between the caller and each candidate.
CREATE OR REPLACE FUNCTION public.partner_availability_overlap(_candidates uuid[])
RETURNS TABLE (candidate_id uuid, overlap_minutes int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH buckets AS (
    SELECT d AS weekday, b * 30 AS start_minute
    FROM generate_series(0, 6) d, generate_series(0, 47) b
  ),
  free AS (
    SELECT DISTINCT a.user_id, bk.weekday, bk.start_minute
    FROM buckets bk
    JOIN public.availability_slots a
      ON a.weekday = bk.weekday AND a.start_minute <= bk.start_minute AND a.end_minute >= bk.start_minute + 30
    WHERE a.user_id = auth.uid() OR a.user_id = ANY (_candidates)
  )
  SELECT c.id, (count(*) * 30)::int
  FROM unnest(_candidates) AS c(id)
  JOIN public.profiles p ON p.id = c.id AND p.discoverable
  JOIN free f1 ON f1.user_id = c.id
  JOIN free f2 ON f2.user_id = auth.uid() AND f2.weekday = f1.weekday AND f2.start_minute = f1.start_minute
  WHERE auth.uid() IS NOT NULL
  GROUP BY c.id;
$$;

-- Academic workload as three counts only: open tasks, tasks due within 7 days, and sessions in the
-- next 7 days (team sessions plus accepted study sessions). Never returns the tasks themselves.
CREATE OR REPLACE FUNCTION public.candidate_workload(_candidates uuid[])
RETURNS TABLE (candidate_id uuid, open_tasks int, due_soon int, sessions_week int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id,
    (SELECT count(*) FROM public.tasks t WHERE t.assignee_id = p.id AND t.status <> 'done')::int,
    (SELECT count(*) FROM public.tasks t
       WHERE t.assignee_id = p.id AND t.status <> 'done' AND t.due_date IS NOT NULL
         AND t.due_date < now() + interval '7 days')::int,
    ((SELECT count(*) FROM public.sessions s
        JOIN public.team_members m ON m.team_id = s.team_id
        WHERE m.user_id = p.id AND s.starts_at BETWEEN now() AND now() + interval '7 days')
     + (SELECT count(*) FROM public.study_session_attendees a
        JOIN public.study_sessions ss ON ss.id = a.session_id
        WHERE a.user_id = p.id AND a.status = 'accepted'
          AND ss.starts_at BETWEEN now() AND now() + interval '7 days'))::int
  FROM public.profiles p
  WHERE p.id = ANY (_candidates) AND (p.discoverable OR p.id = auth.uid()) AND auth.uid() IS NOT NULL;
$$;

-- Windows (weekday + minutes) when the caller and at least one of the given accepted partners are
-- free together. Only the window and how many people are free: no names, no individual slots.
CREATE OR REPLACE FUNCTION public.group_free_windows(_users uuid[])
RETURNS TABLE (weekday int, start_minute int, end_minute int, free_count int)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
#variable_conflict use_column
DECLARE uid uuid := auth.uid(); everyone uuid[];
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF EXISTS (SELECT 1 FROM unnest(_users) u WHERE u <> uid AND NOT public.are_study_partners(uid, u)) THEN
    RAISE EXCEPTION 'You can only plan sessions with your study partners';
  END IF;
  SELECT array_agg(DISTINCT x) INTO everyone FROM unnest(array_append(_users, uid)) x;
  RETURN QUERY
  WITH buckets AS (
    SELECT d AS wd, b * 30 AS sm FROM generate_series(0, 6) d, generate_series(0, 47) b
  ),
  counts AS (
    SELECT bk.wd, bk.sm, count(DISTINCT a.user_id)::int AS n, bool_or(a.user_id = uid) AS mine
    FROM buckets bk
    JOIN public.availability_slots a
      ON a.weekday = bk.wd AND a.start_minute <= bk.sm AND a.end_minute >= bk.sm + 30
    WHERE a.user_id = ANY (everyone)
    GROUP BY bk.wd, bk.sm
  ),
  shared AS (SELECT * FROM counts WHERE mine AND n >= 2),
  islands AS (
    SELECT s.*, s.sm - (row_number() OVER (PARTITION BY s.wd, s.n ORDER BY s.sm)) * 30 AS grp FROM shared s
  )
  SELECT i.wd, min(i.sm), max(i.sm) + 30, i.n
  FROM islands i GROUP BY i.wd, i.n, i.grp
  ORDER BY i.n DESC, (max(i.sm) + 30 - min(i.sm)) DESC, i.wd;
END; $$;

-- Study sessions ------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_study_session(
  _title text, _note text, _starts timestamptz, _ends timestamptz, _invitees uuid[])
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); sid uuid; u uuid; creator text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF coalesce(array_length(_invitees, 1), 0) NOT BETWEEN 1 AND 5 THEN
    RAISE EXCEPTION 'Invite between 1 and 5 study partners';
  END IF;
  IF _starts < now() OR _ends <= _starts THEN RAISE EXCEPTION 'Pick a time in the future'; END IF;
  FOREACH u IN ARRAY _invitees LOOP
    IF u = uid OR NOT public.are_study_partners(uid, u) THEN
      RAISE EXCEPTION 'You can only invite your study partners';
    END IF;
  END LOOP;
  INSERT INTO public.study_sessions (created_by, title, note, starts_at, ends_at)
  VALUES (uid, left(btrim(_title), 120), NULLIF(btrim(coalesce(_note, '')), ''), _starts, _ends)
  RETURNING id INTO sid;
  INSERT INTO public.study_session_attendees (session_id, user_id, status) VALUES (sid, uid, 'accepted');
  SELECT display_name INTO creator FROM public.profiles WHERE id = uid;
  FOREACH u IN ARRAY _invitees LOOP
    INSERT INTO public.study_session_attendees (session_id, user_id) VALUES (sid, u) ON CONFLICT DO NOTHING;
    INSERT INTO public.notifications (user_id, type, title, body, link, dedupe_key)
    VALUES (u, 'study_session_invite', 'Study session invite',
            coalesce(creator, 'A study partner') || ' invited you to "' || left(btrim(_title), 120) || '".',
            '/partners', 'study:' || sid);
  END LOOP;
  RETURN sid;
END; $$;

CREATE OR REPLACE FUNCTION public.respond_study_session(_session uuid, _accept boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); s public.study_sessions; me text;
BEGIN
  SELECT * INTO s FROM public.study_sessions WHERE id = _session;
  IF s IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.study_session_attendees a WHERE a.session_id = _session AND a.user_id = uid AND a.status = 'invited'
  ) THEN RAISE EXCEPTION 'Invitation not found'; END IF;
  UPDATE public.study_session_attendees
     SET status = CASE WHEN _accept THEN 'accepted' ELSE 'declined' END
   WHERE session_id = _session AND user_id = uid;
  SELECT display_name INTO me FROM public.profiles WHERE id = uid;
  INSERT INTO public.notifications (user_id, type, title, body, link, dedupe_key)
  VALUES (s.created_by, 'study_session_reply',
          CASE WHEN _accept THEN 'Study session: accepted' ELSE 'Study session: declined' END,
          coalesce(me, 'A student') || CASE WHEN _accept THEN ' will join ' ELSE ' can''t make ' END || '"' || s.title || '".',
          '/partners', 'study-reply:' || _session || ':' || uid);
END; $$;

CREATE OR REPLACE FUNCTION public.my_study_sessions()
RETURNS TABLE (id uuid, title text, note text, starts_at timestamptz, ends_at timestamptz,
               creator_name text, is_creator boolean, my_status text, attendees jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.id, s.title, s.note, s.starts_at, s.ends_at, cp.display_name, s.created_by = auth.uid(), me.status,
    (SELECT coalesce(jsonb_agg(jsonb_build_object('name', p.display_name, 'status', a.status) ORDER BY p.display_name), '[]'::jsonb)
       FROM public.study_session_attendees a JOIN public.profiles p ON p.id = a.user_id
      WHERE a.session_id = s.id)
  FROM public.study_sessions s
  JOIN public.study_session_attendees me ON me.session_id = s.id AND me.user_id = auth.uid()
  JOIN public.profiles cp ON cp.id = s.created_by
  WHERE s.ends_at > now() - interval '1 day'
  ORDER BY s.starts_at;
$$;

DO $$
DECLARE f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'send_partner_request(uuid, text)', 'respond_partner_request(uuid, boolean)', 'my_partner_requests()',
    'partner_availability_overlap(uuid[])', 'candidate_workload(uuid[])', 'group_free_windows(uuid[])',
    'create_study_session(text, text, timestamptz, timestamptz, uuid[])',
    'respond_study_session(uuid, boolean)', 'my_study_sessions()'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM public, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', f);
  END LOOP;
END $$;
