-- Completes "user profiles with enrolled courses, skills and weekly availability":
--  1. creates the storage buckets the app uploads to (avatars, team-files)
--  2. merges case-only duplicate skills/courses and prevents new ones
--  3. all-or-nothing save functions for courses, skills and weekly availability
--  4. exposes people's profile photos to the Study Partners requests and study-session lists

-- 1. Storage buckets ---------------------------------------------------------------------------
-- Profile photos are public-by-URL (the file name contains a random id); team files stay private.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE
  SET public = true, file_size_limit = 2097152, allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public)
VALUES ('team-files', 'team-files', false)
ON CONFLICT (id) DO NOTHING;

-- 2. De-duplicate skills and courses that differ only by letter case / spacing ------------------
CREATE TEMP TABLE _skill_map AS
SELECT s.id AS old_id, k.keep_id
FROM public.skills s
JOIN (
  SELECT lower(btrim(name)) AS key, (array_agg(id ORDER BY (name = lower(name)), (name <> btrim(name)), created_at, id))[1] AS keep_id
  FROM public.skills GROUP BY 1
) k ON k.key = lower(btrim(s.name))
WHERE s.id <> k.keep_id;

DELETE FROM public.user_skills us USING _skill_map m
WHERE us.skill_id = m.old_id
  AND EXISTS (SELECT 1 FROM public.user_skills x WHERE x.user_id = us.user_id AND x.skill_id = m.keep_id);
UPDATE public.user_skills us SET skill_id = m.keep_id FROM _skill_map m WHERE us.skill_id = m.old_id;
DELETE FROM public.skills WHERE id IN (SELECT old_id FROM _skill_map);
DROP TABLE _skill_map;

CREATE TEMP TABLE _course_map AS
SELECT c.id AS old_id, k.keep_id
FROM public.courses c
JOIN (
  SELECT lower(btrim(code)) AS code_key, lower(btrim(title)) AS title_key,
         (array_agg(id ORDER BY (code = lower(code)), (code <> btrim(code)), created_at, id))[1] AS keep_id
  FROM public.courses GROUP BY 1, 2
) k ON k.code_key = lower(btrim(c.code)) AND k.title_key = lower(btrim(c.title))
WHERE c.id <> k.keep_id;

DELETE FROM public.user_courses uc USING _course_map m
WHERE uc.course_id = m.old_id
  AND EXISTS (SELECT 1 FROM public.user_courses x WHERE x.user_id = uc.user_id AND x.course_id = m.keep_id);
UPDATE public.user_courses uc SET course_id = m.keep_id FROM _course_map m WHERE uc.course_id = m.old_id;
UPDATE public.teams t SET course_id = m.keep_id FROM _course_map m WHERE t.course_id = m.old_id;
DELETE FROM public.courses WHERE id IN (SELECT old_id FROM _course_map);
DROP TABLE _course_map;

CREATE UNIQUE INDEX IF NOT EXISTS skills_name_ci_key ON public.skills (lower(btrim(name)));
CREATE UNIQUE INDEX IF NOT EXISTS courses_code_title_ci_key
  ON public.courses (lower(btrim(code)), lower(btrim(title)));

-- 3. Save functions (each runs as one transaction: it saves everything or nothing) -------------

CREATE OR REPLACE FUNCTION public.normalize_label(_t text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT regexp_replace(btrim(coalesce(_t, '')), '\s+', ' ', 'g');
$$;

-- Replaces the caller's enrolled courses. Input: [{"code": "CS101", "title": "Intro to Programming"}, ...]
-- Courses are matched ignoring letter case; missing ones are created.
CREATE OR REPLACE FUNCTION public.set_my_courses(_courses jsonb)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); item jsonb; c_code text; c_title text; cid uuid; ids uuid[] := '{}';
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  _courses := coalesce(_courses, '[]'::jsonb);
  IF jsonb_typeof(_courses) <> 'array' THEN RAISE EXCEPTION 'Courses must be a list'; END IF;
  IF jsonb_array_length(_courses) > 30 THEN RAISE EXCEPTION 'You can list at most 30 courses'; END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(_courses) LOOP
    c_title := public.normalize_label(item ->> 'title');
    c_code := public.normalize_label(item ->> 'code');
    IF c_title = '' THEN RAISE EXCEPTION 'Every course needs a title'; END IF;
    IF c_code = '' THEN c_code := c_title; END IF;
    IF char_length(c_code) > 40 THEN RAISE EXCEPTION 'Course code is too long (max 40 characters)'; END IF;
    IF char_length(c_title) > 120 THEN RAISE EXCEPTION 'Course title is too long (max 120 characters)'; END IF;

    SELECT id INTO cid FROM public.courses
     WHERE lower(btrim(code)) = lower(c_code) AND lower(btrim(title)) = lower(c_title) LIMIT 1;
    IF cid IS NULL THEN
      INSERT INTO public.courses (code, title) VALUES (c_code, c_title)
      ON CONFLICT DO NOTHING RETURNING id INTO cid;
      IF cid IS NULL THEN
        SELECT id INTO cid FROM public.courses
         WHERE lower(btrim(code)) = lower(c_code) AND lower(btrim(title)) = lower(c_title) LIMIT 1;
      END IF;
    END IF;
    IF NOT (cid = ANY (ids)) THEN ids := array_append(ids, cid); END IF;
  END LOOP;

  DELETE FROM public.user_courses WHERE user_id = uid AND NOT (course_id = ANY (ids));
  INSERT INTO public.user_courses (user_id, course_id)
  SELECT uid, x FROM unnest(ids) x ON CONFLICT DO NOTHING;
  RETURN coalesce(array_length(ids, 1), 0);
END; $$;

-- Replaces the caller's skills. Input: [{"name": "Python", "level": 4}, ...] (level 1-5, default 3).
CREATE OR REPLACE FUNCTION public.set_my_skills(_skills jsonb)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); item jsonb; s_name text; s_level int; sid uuid; ids uuid[] := '{}';
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  _skills := coalesce(_skills, '[]'::jsonb);
  IF jsonb_typeof(_skills) <> 'array' THEN RAISE EXCEPTION 'Skills must be a list'; END IF;
  IF jsonb_array_length(_skills) > 40 THEN RAISE EXCEPTION 'You can list at most 40 skills'; END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(_skills) LOOP
    s_name := public.normalize_label(item ->> 'name');
    IF s_name = '' THEN CONTINUE; END IF;
    IF char_length(s_name) > 40 THEN RAISE EXCEPTION 'Skill names can be at most 40 characters'; END IF;
    s_level := least(5, greatest(1, coalesce((item ->> 'level')::int, 3)));

    SELECT id INTO sid FROM public.skills WHERE lower(btrim(name)) = lower(s_name) LIMIT 1;
    IF sid IS NULL THEN
      INSERT INTO public.skills (name) VALUES (s_name) ON CONFLICT DO NOTHING RETURNING id INTO sid;
      IF sid IS NULL THEN
        SELECT id INTO sid FROM public.skills WHERE lower(btrim(name)) = lower(s_name) LIMIT 1;
      END IF;
    END IF;
    IF sid = ANY (ids) THEN CONTINUE; END IF;
    ids := array_append(ids, sid);
    INSERT INTO public.user_skills (user_id, skill_id, level) VALUES (uid, sid, s_level)
    ON CONFLICT (user_id, skill_id) DO UPDATE SET level = EXCLUDED.level;
  END LOOP;

  DELETE FROM public.user_skills WHERE user_id = uid AND NOT (skill_id = ANY (ids));
  RETURN coalesce(array_length(ids, 1), 0);
END; $$;

-- Replaces the caller's weekly availability.
-- Input: [{"weekday": 1, "start": 540, "end": 720}, ...]  weekday 0=Sun..6=Sat, minutes from midnight,
-- on the hour or half hour (that is the resolution matching works at).
CREATE OR REPLACE FUNCTION public.set_my_availability(_slots jsonb)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); item jsonb; wd int; s int; e int; n int := 0;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  _slots := coalesce(_slots, '[]'::jsonb);
  IF jsonb_typeof(_slots) <> 'array' THEN RAISE EXCEPTION 'Availability must be a list'; END IF;
  IF jsonb_array_length(_slots) > 100 THEN RAISE EXCEPTION 'Too many availability slots'; END IF;

  -- Validate everything first, then replace in one go.
  FOR item IN SELECT * FROM jsonb_array_elements(_slots) LOOP
    wd := (item ->> 'weekday')::int; s := (item ->> 'start')::int; e := (item ->> 'end')::int;
    IF wd IS NULL OR wd NOT BETWEEN 0 AND 6 THEN RAISE EXCEPTION 'Weekday must be 0 (Sunday) to 6 (Saturday)'; END IF;
    IF s IS NULL OR e IS NULL OR s < 0 OR e > 1440 OR e <= s THEN
      RAISE EXCEPTION 'Each time range needs an end after its start';
    END IF;
    IF s % 30 <> 0 OR e % 30 <> 0 THEN RAISE EXCEPTION 'Times must be on the hour or half hour'; END IF;
  END LOOP;

  DELETE FROM public.availability_slots WHERE user_id = uid;
  INSERT INTO public.availability_slots (user_id, weekday, start_minute, end_minute)
  SELECT DISTINCT uid, (x ->> 'weekday')::int, (x ->> 'start')::int, (x ->> 'end')::int
  FROM jsonb_array_elements(_slots) x;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END; $$;

DO $$
DECLARE f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'set_my_courses(jsonb)', 'set_my_skills(jsonb)', 'set_my_availability(jsonb)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM public, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', f);
  END LOOP;
END $$;

-- 4. Study partner lists also return the partner's photo -----------------------------------------
DROP FUNCTION IF EXISTS public.my_partner_requests();
CREATE FUNCTION public.my_partner_requests()
RETURNS TABLE (id uuid, other_id uuid, other_name text, other_major text, direction text,
               status text, message text, created_at timestamptz, other_avatar text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.id,
         o.id,
         o.display_name,
         o.major,
         CASE WHEN r.from_user = auth.uid() THEN 'outgoing' ELSE 'incoming' END,
         r.status,
         r.message,
         r.created_at,
         o.avatar_url
  FROM public.partner_requests r
  JOIN public.profiles o ON o.id = CASE WHEN r.from_user = auth.uid() THEN r.to_user ELSE r.from_user END
  WHERE auth.uid() IN (r.from_user, r.to_user)
  ORDER BY r.created_at DESC;
$$;
REVOKE ALL ON FUNCTION public.my_partner_requests() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.my_partner_requests() TO authenticated;

-- Same function as before, but each attendee also carries their photo path.
CREATE OR REPLACE FUNCTION public.my_study_sessions()
RETURNS TABLE (id uuid, title text, note text, starts_at timestamptz, ends_at timestamptz,
               creator_name text, is_creator boolean, my_status text, attendees jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.id, s.title, s.note, s.starts_at, s.ends_at, cp.display_name, s.created_by = auth.uid(), me.status,
    (SELECT coalesce(jsonb_agg(jsonb_build_object('name', p.display_name, 'status', a.status, 'avatar', p.avatar_url)
                              ORDER BY p.display_name), '[]'::jsonb)
       FROM public.study_session_attendees a JOIN public.profiles p ON p.id = a.user_id
      WHERE a.session_id = s.id)
  FROM public.study_sessions s
  JOIN public.study_session_attendees me ON me.session_id = s.id AND me.user_id = auth.uid()
  JOIN public.profiles cp ON cp.id = s.created_by
  WHERE s.ends_at > now() - interval '1 day'
  ORDER BY s.starts_at;
$$;
