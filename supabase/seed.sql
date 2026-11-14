-- TeamUp sample data for testing. Paste into the Supabase SQL editor and run (it runs as
-- the postgres role, which is required to create auth users). Safe to re-run: it removes the
-- previous sample data first, then recreates it.
--
-- 1. Set my_email below to the email you sign in to TeamUp with.
-- 2. Run the whole script.
-- 3. Sign in as yourself to test as the team owner, or as any sample student
--    (e.g. zara@teamup.test) with password  Password123!
--
-- Sample students all use @teamup.test emails and have profiles.is_sample = true.

do $seed$
declare
  my_email text := 'YOUR_EMAIL_HERE';   -- <-- change this
  me uuid;
  pw text;
  t1 uuid := 'b1000000-0000-4000-8000-000000000001';
  t2 uuid := 'b1000000-0000-4000-8000-000000000002';
  c_ds uuid; c_db uuid; c_web uuid; c_ml uuid; c_hci uuid;
  u record;
  s record;
  zara  uuid := 'a1000000-0000-4000-8000-000000000001';
  liam  uuid := 'a1000000-0000-4000-8000-000000000002';
  maya  uuid := 'a1000000-0000-4000-8000-000000000003';
  omar  uuid := 'a1000000-0000-4000-8000-000000000004';
  priya uuid := 'a1000000-0000-4000-8000-000000000005';
  noah  uuid := 'a1000000-0000-4000-8000-000000000006';
  sofia uuid := 'a1000000-0000-4000-8000-000000000007';
  kenji uuid := 'a1000000-0000-4000-8000-000000000008';
  ava   uuid := 'a1000000-0000-4000-8000-000000000009';
  ben   uuid := 'a1000000-0000-4000-8000-00000000000a';
  -- bulk data helpers
  fn text[] := array['Aisha','Ben','Chloe','Daniel','Elena','Farid','Grace','Hugo','Imani','Jonas','Keira','Luca','Mei','Nadia','Oscar','Paula','Quinn','Rahul','Sara','Tariq','Uma','Victor','Wen','Yusuf'];
  ln text[] := array['Ali','Brown','Costa','Diaz','Evans','Fischer','Gupta','Hassan','Ito','Jones','Khan','Lopez','Meyer','Nguyen','Ortiz','Park','Qureshi','Reyes','Singh','Thomas','Usman','Vega','Wang','Young'];
  unis text[] := array['Northbridge University','Harbor Tech','Lakeside College','Riverside Institute'];
  majors text[] := array['Computer Science','Software Engineering','Data Science','Information Systems','Design Technology','Mathematics','Electrical Engineering','Physics'];
  statuses text[] := array['todo','in_progress','in_review','done'];
  prios text[] := array['low','medium','high','urgent'];
  starts int[] := array[480,600,780,960,1080,1200];
  bulk uuid[] := '{}';
  all_courses uuid[]; all_skills uuid[];
  bid uuid; tm uuid; owner_id uuid; i int; k int; st int; n int; tok text;
  team_ids uuid[] := array[
    'b1000000-0000-4000-8000-000000000003','b1000000-0000-4000-8000-000000000004',
    'b1000000-0000-4000-8000-000000000005','b1000000-0000-4000-8000-000000000006']::uuid[];
begin
  select id into me from auth.users where lower(email) = lower(my_email);
  if me is null then
    raise exception 'No user with email "%" - sign up in TeamUp first, then set my_email at the top of this script.', my_email;
  end if;

  pw := extensions.crypt('Password123!', extensions.gen_salt('bf'));

  -- Clean previous sample data (children cascade).
  delete from public.teams where id::text like 'b1000000-0000-4000-8000-%';
  delete from auth.users where email like '%@teamup.test';

  -- Sample students -----------------------------------------------------------------------
  for u in
    select * from (values
      (zara,  'zara@teamup.test',  'Zara Khan',   'Northbridge University', 'Computer Science',      'Loves graph problems and clean code.',              true),
      (liam,  'liam@teamup.test',  'Liam Chen',   'Northbridge University', 'Software Engineering',  'Backend developer, coffee-powered.',                true),
      (maya,  'maya@teamup.test',  'Maya Patel',  'Northbridge University', 'Computer Science',      'Strong in databases and SQL tuning.',               true),
      (omar,  'omar@teamup.test',  'Omar Haddad', 'Northbridge University', 'Data Science',          'Machine learning and data viz.',                    true),
      (priya, 'priya@teamup.test', 'Priya Nair',  'Harbor Tech',            'Design Technology',      'UI/UX designer who also writes React.',             true),
      (noah,  'noah@teamup.test',  'Noah Wilson', 'Northbridge University', 'Computer Science',      'Algorithms enthusiast, free most evenings.',        true),
      (sofia, 'sofia@teamup.test', 'Sofia Rossi', 'Harbor Tech',            'Information Systems',    'Project manager type; keeps teams on schedule.',    true),
      (kenji, 'kenji@teamup.test', 'Kenji Mori',  'Lakeside College',       'Physics',                'Not much overlap with CS, but happy to help.',      true),
      (ava,   'ava@teamup.test',   'Ava Brooks',  'Northbridge University', 'Computer Science',      'Prefers to stay private - not discoverable.',       false),
      (ben,   'ben@teamup.test',   'Ben Okafor',  'Northbridge University', 'Computer Science',      'Hasn''t finished setting up yet.',                  false)
    ) v(id, email, name, uni, major, bio, disc)
  loop
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new
    ) values (
      '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email, pw, now(),
      '{"provider":"email","providers":["email"]}', jsonb_build_object('display_name', u.name), now(), now(),
      '', '', '', ''
    );
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), u.id, u.id::text, jsonb_build_object('sub', u.id::text, 'email', u.email), 'email', now(), now(), now());

    -- handle_new_user() already created the profile rows; fill them in.
    update public.profiles
       set display_name = u.name, university = u.uni, major = u.major, bio = u.bio,
           discoverable = u.disc, onboarded = true, is_sample = true, timezone = 'America/New_York'
     where id = u.id;
  end loop;

  -- Make sure you can be suggested to / see yourself properly on the team.
  update public.profiles
     set university = coalesce(university, 'Northbridge University'),
         major = coalesce(major, 'Computer Science'),
         onboarded = true
   where id = me;

  -- Courses -------------------------------------------------------------------------------
  insert into public.courses (code, title) values
    ('CS201', 'Data Structures'), ('CS340', 'Databases'), ('CS310', 'Web Development'),
    ('DS420', 'Machine Learning'), ('DT250', 'Human-Computer Interaction')
  on conflict (code, title) do nothing;
  select id into c_ds  from public.courses where code = 'CS201';
  select id into c_db  from public.courses where code = 'CS340';
  select id into c_web from public.courses where code = 'CS310';
  select id into c_ml  from public.courses where code = 'DS420';
  select id into c_hci from public.courses where code = 'DT250';

  insert into public.skills (name) values
    ('Python'), ('Algorithms'), ('SQL'), ('React'), ('TypeScript'), ('UI Design'),
    ('Machine Learning'), ('Data Visualization'), ('Project Management'), ('Technical Writing'), ('Testing')
  on conflict (name) do nothing;

  -- Courses per student (the team's course is CS201, so shared-course matches rank higher).
  insert into public.user_courses (user_id, course_id) values
    (me, c_ds), (zara, c_ds), (liam, c_ds), (liam, c_web),
    (maya, c_ds), (maya, c_db), (noah, c_ds), (omar, c_ml), (omar, c_ds),
    (priya, c_web), (priya, c_hci), (sofia, c_db), (kenji, c_ml), (ava, c_ds), (ben, c_ds)
  on conflict do nothing;

  -- Skills: team (you + Zara + Liam) has Python / Algorithms / TypeScript, so candidates with
  -- SQL, React, UI Design, ML etc. show up as "skills the team lacks".
  for s in
    select * from (values
      (me,    'Python', 4), (me, 'Algorithms', 4),
      (zara,  'Python', 5), (zara, 'Algorithms', 5),
      (liam,  'TypeScript', 4), (liam, 'Testing', 3),
      (maya,  'SQL', 5), (maya, 'Python', 4), (maya, 'Technical Writing', 3),
      (omar,  'Machine Learning', 5), (omar, 'Data Visualization', 4), (omar, 'Python', 4),
      (priya, 'UI Design', 5), (priya, 'React', 4),
      (noah,  'Algorithms', 4), (noah, 'Testing', 4),
      (sofia, 'Project Management', 5), (sofia, 'Technical Writing', 4),
      (kenji, 'Data Visualization', 3),
      (ava,   'SQL', 4), (ben, 'React', 3)
    ) v(uid, skill, lvl)
  loop
    insert into public.user_skills (user_id, skill_id, level)
    select s.uid, id, s.lvl from public.skills where name = s.skill
    on conflict do nothing;
  end loop;

  -- Weekly availability (weekday 0 = Sunday; minutes from midnight). Replaces yours.
  delete from public.availability_slots where user_id = me;
  insert into public.availability_slots (user_id, weekday, start_minute, end_minute) values
    (me,    1, 1080, 1260), (me,    3, 1080, 1260), (me,    6, 600, 840),
    (zara,  1, 1080, 1200), (zara,  4, 1020, 1200),
    (liam,  3, 1140, 1320),
    (maya,  1, 1080, 1260), (maya,  3, 1080, 1260), (maya,  6, 600, 780),   -- lots of overlap
    (omar,  6, 660, 900),   (omar,  0, 600, 780),                          -- Saturday overlap
    (priya, 2, 780, 960),   (priya, 5, 780, 960),                          -- no overlap
    (noah,  1, 1080, 1320), (noah,  3, 1080, 1320), (noah, 5, 1080, 1320), -- heavy overlap
    (sofia, 3, 1200, 1260),
    (kenji, 2, 540, 600);                                                  -- no overlap

  -- Teams ---------------------------------------------------------------------------------
  insert into public.teams (id, name, description, course_id, project_goal, deadline, visibility, accent, created_by, is_sample)
  values
    (t1, 'Algorithms Study Squad', 'Weekly problem-solving sessions for CS201.', c_ds,
     'Finish the graph algorithms project and prepare for the midterm.', current_date + 21, 'public', 'teal', me, true),
    (t2, 'Capstone Web App', 'Building a campus events app for the capstone.', c_web,
     'Ship a working MVP with auth, event feed and RSVPs.', current_date + 45, 'public', 'blue', zara, true);

  insert into public.team_members (team_id, user_id, role) values
    (t1, me, 'owner'), (t1, zara, 'member'), (t1, liam, 'member'),
    (t2, zara, 'owner'), (t2, priya, 'member'), (t2, sofia, 'member');

  -- A pending join request on your team (test approve / reject), and one you can send to Team 2.
  insert into public.join_requests (team_id, user_id, message)
  values (t1, noah, 'Hi! I''m in CS201 and free most evenings - would love to join.')
  on conflict do nothing;

  -- Tasks on your team ---------------------------------------------------------------------
  insert into public.tasks (team_id, title, description, status, priority, assignee_id, created_by, due_date, position, completed_at) values
    (t1, 'Read the project brief',            'Skim the assignment and list open questions.',      'done',        'low',    me,   me, now() - interval '5 days', 1000, now() - interval '4 days'),
    (t1, 'Implement BFS and DFS',             'Adjacency-list graph with both traversals.',         'in_review',   'high',   zara, me, now() + interval '3 days',  2000, null),
    (t1, 'Write Dijkstra with a min-heap',    'Include complexity analysis in the comments.',       'in_progress', 'high',   liam, me, now() + interval '6 days',  3000, null),
    (t1, 'Unit tests for graph module',       'Cover empty graph, cycles and disconnected nodes.',  'todo',        'medium', null, me, now() + interval '8 days',  4000, null),
    (t1, 'Midterm practice problem set',      'Each member brings 3 problems for the next session.','todo',        'medium', me,   me, now() + interval '10 days', 5000, null),
    (t1, 'Final report and slides',           'Draft report, then build the slide deck.',           'todo',        'urgent', null, me, now() + interval '18 days', 6000, null);

  insert into public.activity_logs (team_id, actor_id, action, summary) values
    (t1, me,   'team_created',  'created the team'),
    (t1, zara, 'member_joined', 'joined the team'),
    (t1, liam, 'member_joined', 'joined the team');

  -- Workload variety for study-partner matching: Priya is heavily loaded, Noah moderately.
  insert into public.tasks (team_id, title, status, priority, assignee_id, created_by, due_date, position) values
    (t2, 'Design event feed screens',  'in_progress', 'high',   priya, zara, now() + interval '2 days', 1000),
    (t2, 'Design RSVP flow',           'todo',        'high',   priya, zara, now() + interval '3 days', 2000),
    (t2, 'Usability test plan',        'todo',        'medium', priya, zara, now() + interval '4 days', 3000),
    (t2, 'Brand style guide',          'todo',        'medium', priya, zara, now() + interval '5 days', 4000),
    (t2, 'Accessibility audit',        'todo',        'urgent', priya, zara, now() + interval '6 days', 5000),
    (t1, 'Practice set review',        'todo',        'low',    noah,  me,   now() + interval '5 days', 7000);

  -- ===================================== BULK DATA =====================================
  -- 24 more students, 8 more courses, 10 more skills, 4 more teams with tasks and sessions.
  insert into public.courses (code, title) values
    ('CS220','Operating Systems'), ('CS330','Computer Networks'), ('MA210','Linear Algebra'),
    ('MA301','Probability and Statistics'), ('CS410','Software Engineering'), ('CS450','Computer Security'),
    ('DS310','Data Mining'), ('EE200','Digital Logic')
  on conflict (code, title) do nothing;
  select array_agg(id order by code) into all_courses from public.courses
   where code in ('CS201','CS340','CS310','DS420','DT250','CS220','CS330','MA210','MA301','CS410','CS450','DS310','EE200');

  insert into public.skills (name) values
    ('Java'), ('JavaScript'), ('Git'), ('Docker'), ('Statistics'), ('Public Speaking'), ('Figma'),
    ('C++'), ('Cloud Computing'), ('Research')
  on conflict (name) do nothing;
  select array_agg(id order by name) into all_skills from public.skills
   where name in ('Python','Algorithms','SQL','React','TypeScript','UI Design','Machine Learning','Data Visualization',
                  'Project Management','Technical Writing','Testing','Java','JavaScript','Git','Docker','Statistics',
                  'Public Speaking','Figma','C++','Cloud Computing','Research');

  for i in 1..24 loop
    bid := ('a2000000-0000-4000-8000-' || lpad(to_hex(i), 12, '0'))::uuid;
    bulk := array_append(bulk, bid);
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new
    ) values (
      '00000000-0000-0000-0000-000000000000', bid, 'authenticated', 'authenticated',
      lower(fn[i]) || '.' || lower(ln[i]) || '@teamup.test', pw, now(),
      '{"provider":"email","providers":["email"]}', jsonb_build_object('display_name', fn[i] || ' ' || ln[i]),
      now() - (i || ' days')::interval, now(), '', '', '', ''
    );
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), bid, bid::text,
            jsonb_build_object('sub', bid::text, 'email', lower(fn[i]) || '.' || lower(ln[i]) || '@teamup.test'),
            'email', now(), now(), now());
    update public.profiles
       set display_name = fn[i] || ' ' || ln[i], university = unis[1 + i % 4], major = majors[1 + i % 8],
           bio = 'Studying ' || majors[1 + i % 8] || ' at ' || unis[1 + i % 4] || '. Looking for reliable study partners.',
           discoverable = (i % 7 <> 0), onboarded = true, is_sample = true, timezone = 'America/New_York'
     where id = bid;

    for k in 0..2 loop
      insert into public.user_courses (user_id, course_id)
      values (bid, all_courses[1 + (i * 2 + k * 3) % array_length(all_courses, 1)]) on conflict do nothing;
    end loop;
    for k in 0..3 loop
      insert into public.user_skills (user_id, skill_id, level)
      values (bid, all_skills[1 + (i + k * 5) % array_length(all_skills, 1)], 2 + (i + k) % 4) on conflict do nothing;
    end loop;
    for k in 0..3 loop
      st := starts[1 + (i + k) % 6];
      insert into public.availability_slots (user_id, weekday, start_minute, end_minute)
      values (bid, (i + k * 2) % 7, st, st + 120 + ((i + k) % 3) * 30);
    end loop;
  end loop;

  -- More availability for you so overlaps vary.
  insert into public.availability_slots (user_id, weekday, start_minute, end_minute) values
    (me, 5, 900, 1080), (me, 0, 600, 780);

  -- Four more teams (owned by the first four bulk students).
  insert into public.teams (id, name, description, course_id, project_goal, deadline, visibility, accent, created_by, is_sample)
  select team_ids[v.x], v.name, v.descr,
         (select id from public.courses where code = v.code), v.goal, current_date + v.days, 'public'::public.team_visibility, v.accent, bulk[v.x], true
  from (values
    (1, 'Database Design Group',    'Schema design and query tuning practice.',     'CS340', 'Design and normalise a library database.', 30, 'lavender'),
    (2, 'ML Reading Circle',        'Weekly paper discussions and small projects.', 'DS420', 'Train and evaluate a baseline classifier.', 40, 'blue'),
    (3, 'UX Research Lab',          'User interviews and usability testing.',       'DT250', 'Run 5 usability tests and present findings.', 25, 'teal'),
    (4, 'Systems Programming Crew', 'Pair-programming for OS assignments.',         'CS220', 'Implement a toy scheduler and shell.', 35, 'navy')
  ) as v(x, name, descr, code, goal, days, accent);

  for i in 1..4 loop
    insert into public.team_members (team_id, user_id, role) values (team_ids[i], bulk[i], 'owner');
    insert into public.activity_logs (team_id, actor_id, action, summary) values (team_ids[i], bulk[i], 'team_created', 'created the team');
  end loop;

  -- Everyone else joins one team; some also join Capstone Web App.
  for i in 5..24 loop
    tm := team_ids[1 + i % 4];
    insert into public.team_members (team_id, user_id, role)
    values (tm, bulk[i], case when i % 9 = 0 then 'admin'::public.team_role else 'member'::public.team_role end)
    on conflict do nothing;
    if i % 5 = 0 then
      insert into public.team_members (team_id, user_id, role) values (t2, bulk[i], 'member') on conflict do nothing;
    end if;
  end loop;

  -- Tasks: 0-6 assigned tasks per student (a spread of light / moderate / heavy workloads).
  for i in 5..24 loop
    tm := team_ids[1 + i % 4];
    owner_id := bulk[1 + i % 4];
    n := (i * 3) % 7;
    for k in 1..n loop
      insert into public.tasks (team_id, title, description, status, priority, assignee_id, created_by, due_date, position, completed_at)
      values (tm, 'Task ' || k || ' for ' || fn[i], 'Sample task generated for testing.',
              statuses[1 + (i + k) % 4]::public.task_status, prios[1 + (i * k) % 4]::public.task_priority, bulk[i], owner_id,
              now() + ((((i + k) % 12) - 2) || ' days')::interval, 1000 * (i * 10 + k),
              case when (i + k) % 4 = 3 then now() - interval '1 day' end);
    end loop;
  end loop;
  for i in 1..4 loop
    insert into public.tasks (team_id, title, description, status, priority, created_by, due_date, position) values
      (team_ids[i], 'Kick-off meeting notes',     'Agree on roles and weekly schedule.',    'done',        'low',    bulk[i], now() - interval '6 days', 100),
      (team_ids[i], 'Draft project outline',      'One page outline for the first review.', 'in_progress', 'high',   bulk[i], now() + interval '4 days', 200),
      (team_ids[i], 'Collect reference material', 'Papers, docs and past exams.',           'todo',        'medium', bulk[i], now() + interval '9 days', 300),
      (team_ids[i], 'Prepare final presentation', 'Slides and a short demo.',               'todo',        'urgent', bulk[i], now() + interval '25 days', 400);
    insert into public.sessions (team_id, title, description, starts_at, ends_at, location, created_by) values
      (team_ids[i], 'Weekly sync', 'Progress check and blockers.',
       date_trunc('hour', now()) + ((i + 1) || ' days')::interval,
       date_trunc('hour', now()) + ((i + 1) || ' days')::interval + interval '1 hour', 'Library room ' || (100 + i), bulk[i]),
      (team_ids[i], 'Working session', 'Pair up and tackle the outline.',
       date_trunc('hour', now()) + ((i + 6) || ' days')::interval,
       date_trunc('hour', now()) + ((i + 6) || ' days')::interval + interval '2 hours', 'Online', bulk[i]);
  end loop;

  -- Sessions for your own team.
  insert into public.sessions (team_id, title, description, starts_at, ends_at, location, created_by) values
    (t1, 'Graph algorithms workshop', 'BFS, DFS and Dijkstra practice.', date_trunc('hour', now()) + interval '2 days',
     date_trunc('hour', now()) + interval '2 days 2 hours', 'Library room 12', me),
    (t1, 'Midterm cram session', 'Past paper walkthrough.', date_trunc('hour', now()) + interval '9 days',
     date_trunc('hour', now()) + interval '9 days 3 hours', 'Online', me);

  -- More join requests on your team.
  insert into public.join_requests (team_id, user_id, message)
  select t1, bulk[x], 'Hi, I''d like to join your study group.' from unnest(array[5, 9, 13]) x
  on conflict do nothing;

  -- Study partners (needs migration 0005 applied; skipped otherwise).
  if to_regclass('public.partner_requests') is not null then
    delete from public.partner_requests where me in (from_user, to_user);
    delete from public.study_sessions where created_by = me and id::text like 'c1000000-%';
    insert into public.partner_requests (from_user, to_user, status, message, decided_at) values
      (me,   zara, 'accepted', 'Let''s study together!', now()),
      (omar, me,   'pending',  'Hi, I could use help with CS201 and can cover ML in return.', null);
    insert into public.study_sessions (id, created_by, title, note, starts_at, ends_at)
    values ('c1000000-0000-4000-8000-000000000001', zara, 'Graph algorithms review',
            '10 min: goals · 60 min: practice problems · 20 min: recap',
            now() + interval '2 days', now() + interval '2 days 90 minutes')
    on conflict (id) do nothing;
    insert into public.study_session_attendees (session_id, user_id, status) values
      ('c1000000-0000-4000-8000-000000000001', zara, 'accepted'),
      ('c1000000-0000-4000-8000-000000000001', me,   'invited')
    on conflict do nothing;
  end if;

  -- More study-partner data (needs migration 0005).
  if to_regclass('public.partner_requests') is not null then
    insert into public.partner_requests (from_user, to_user, status, message, decided_at) values
      (me,      bulk[1],  'accepted', 'Want to prep for the midterm together?', now() - interval '3 days'),
      (bulk[2], me,       'accepted', 'Saw we share CS201 - study buddies?',     now() - interval '2 days'),
      (bulk[3], me,       'accepted', null,                                      now() - interval '1 day'),
      (bulk[4], me,       'pending',  'Could use help with algorithms.',         null),
      (bulk[5], me,       'pending',  'Same course, similar schedule!',          null),
      (bulk[6], me,       'pending',  null,                                      null),
      (me,      bulk[8],  'pending',  'Hi! Could we study SQL together?',        null),
      (me,      bulk[9],  'pending',  null,                                      null),
      (me,      bulk[10], 'declined', 'Study session?',                          now() - interval '4 days'),
      (bulk[1], bulk[2],  'accepted', null,                                      now() - interval '5 days'),
      (bulk[3], bulk[4],  'accepted', null,                                      now() - interval '5 days')
    on conflict do nothing;

    -- Shared free time between you and your first three partners (for group session suggestions).
    insert into public.availability_slots (user_id, weekday, start_minute, end_minute)
    select b, w.wd, w.s, w.e
    from unnest(array[bulk[1], bulk[2], bulk[3]]) as b,
         (values (1, 1140, 1260), (3, 1080, 1200), (6, 660, 780)) as w(wd, s, e);

    insert into public.study_sessions (id, created_by, title, note, starts_at, ends_at) values
      ('c1000000-0000-4000-8000-000000000002', me,      'SQL joins workshop',      '15 min: review · 60 min: exercises · 15 min: Q&A',
        date_trunc('hour', now()) + interval '3 days', date_trunc('hour', now()) + interval '3 days 90 minutes'),
      ('c1000000-0000-4000-8000-000000000003', bulk[1], 'Algorithms problem swap', 'Each person brings two problems.',
        date_trunc('hour', now()) + interval '5 days', date_trunc('hour', now()) + interval '5 days 90 minutes'),
      ('c1000000-0000-4000-8000-000000000004', bulk[2], 'Past paper review',      'Timed paper, then mark each other''s answers.',
        date_trunc('hour', now()) - interval '3 days', date_trunc('hour', now()) - interval '3 days' + interval '2 hours'),
      ('c1000000-0000-4000-8000-000000000005', me,      'Weekend revision',        null,
        date_trunc('hour', now()) + interval '8 days', date_trunc('hour', now()) + interval '8 days 2 hours')
    on conflict (id) do nothing;
    insert into public.study_session_attendees (session_id, user_id, status) values
      ('c1000000-0000-4000-8000-000000000002', me,      'accepted'),
      ('c1000000-0000-4000-8000-000000000002', bulk[1], 'accepted'),
      ('c1000000-0000-4000-8000-000000000002', bulk[2], 'invited'),
      ('c1000000-0000-4000-8000-000000000003', bulk[1], 'accepted'),
      ('c1000000-0000-4000-8000-000000000003', me,      'invited'),
      ('c1000000-0000-4000-8000-000000000003', bulk[2], 'accepted'),
      ('c1000000-0000-4000-8000-000000000004', bulk[2], 'accepted'),
      ('c1000000-0000-4000-8000-000000000004', me,      'accepted'),
      ('c1000000-0000-4000-8000-000000000005', me,      'accepted'),
      ('c1000000-0000-4000-8000-000000000005', bulk[3], 'declined'),
      ('c1000000-0000-4000-8000-000000000005', bulk[1], 'invited')
    on conflict do nothing;
  end if;

  -- Team invitations (needs migration 0008): an invitation addressed to you, plus a request of yours that is
  -- still waiting, so you can try Accept / Decline and "Cancel request" straight away.
  if exists (select 1 from information_schema.columns
              where table_schema = 'public' and table_name = 'invitations' and column_name = 'invitee_id') then
    insert into public.invitations (team_id, role, created_by, invitee_id)
    values (team_ids[1], 'member', bulk[1], me) returning token into tok;
    insert into public.notifications (user_id, type, title, body, link, dedupe_key)
    values (me, 'team_invite', 'Team invitation',
            fn[1] || ' ' || ln[1] || ' invited you to join "Database Design Group".', '/invite/' || tok, 'seed:invite:' || team_ids[1])
    on conflict do nothing;
    insert into public.join_requests (team_id, user_id, message)
    values (team_ids[3], me, 'I would love to help with the usability tests.')
    on conflict do nothing;
  end if;

  -- Notifications for you.
  insert into public.notifications (user_id, type, title, body, link, dedupe_key) values
    (me, 'join_request', 'New join request', 'Noah Wilson asked to join Algorithms Study Squad.', '/teams/' || t1, 'seed:jr:' || t1),
    (me, 'join_request', 'New join requests', 'More students asked to join Algorithms Study Squad.', '/teams/' || t1, 'seed:jr2:' || t1),
    (me, 'task_assigned', 'Task assigned to you', 'Midterm practice problem set is due in 10 days.', '/tasks', 'seed:task1'),
    (me, 'session_reminder', 'Session coming up', 'Graph algorithms workshop starts in about 2 days.', '/calendar', 'seed:sess1'),
    (me, 'partner_request', 'New study partner request', 'Quinn Qureshi would like to study with you.', '/partners', 'seed:pr1'),
    (me, 'partner_request', 'New study partner request', 'Rahul Singh would like to study with you.', '/partners', 'seed:pr2')
  on conflict do nothing;

  raise notice 'Sample data ready: 34 students, 6 teams, tasks, sessions, partner requests. Logins e.g. zara@teamup.test or aisha.ali@teamup.test, password Password123!';
end
$seed$;
