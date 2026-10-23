-- ENUMS
create type public.team_role as enum ('owner','admin','member');
create type public.team_visibility as enum ('public','private');
create type public.task_status as enum ('todo','in_progress','in_review','done');
create type public.task_priority as enum ('low','medium','high','urgent');
create type public.invitation_status as enum ('pending','accepted','declined','revoked','expired');
create type public.join_request_status as enum ('pending','approved','rejected');
create type public.resource_kind as enum ('note','link','file');
create type public.attendee_status as enum ('invited','accepted','declined','tentative');

-- PROFILES (discoverable fields)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Student',
  avatar_url text,
  university text,
  major text,
  bio text,
  timezone text not null default 'UTC',
  discoverable boolean not null default false,
  onboarded boolean not null default false,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid());
create policy "discoverable profiles read" on public.profiles for select to authenticated using (discoverable = true);
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- PRIVATE PROFILE DATA
create table public.profiles_private (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.profiles_private to authenticated;
grant all on public.profiles_private to service_role;
alter table public.profiles_private enable row level security;
create policy "own private profile" on public.profiles_private for all to authenticated using (id = auth.uid()) with check (id = auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1), 'Student'))
  on conflict (id) do nothing;
  insert into public.profiles_private (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- COURSES / SKILLS
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  title text not null,
  created_at timestamptz not null default now(),
  unique (code, title)
);
grant select, insert on public.courses to authenticated;
grant all on public.courses to service_role;
alter table public.courses enable row level security;
create policy "courses readable" on public.courses for select to authenticated using (true);
create policy "courses insertable" on public.courses for insert to authenticated with check (true);

create table public.user_courses (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);
grant select, insert, delete on public.user_courses to authenticated;
grant all on public.user_courses to service_role;
alter table public.user_courses enable row level security;
create policy "own user_courses write" on public.user_courses for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "discoverable user_courses read" on public.user_courses for select to authenticated
using (exists (select 1 from public.profiles p where p.id = user_courses.user_id and p.discoverable));

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);
grant select, insert on public.skills to authenticated;
grant all on public.skills to service_role;
alter table public.skills enable row level security;
create policy "skills readable" on public.skills for select to authenticated using (true);
create policy "skills insertable" on public.skills for insert to authenticated with check (true);

create table public.user_skills (
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  level int not null default 3 check (level between 1 and 5),
  primary key (user_id, skill_id)
);
grant select, insert, update, delete on public.user_skills to authenticated;
grant all on public.user_skills to service_role;
alter table public.user_skills enable row level security;
create policy "own user_skills write" on public.user_skills for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "discoverable user_skills read" on public.user_skills for select to authenticated
using (exists (select 1 from public.profiles p where p.id = user_skills.user_id and p.discoverable));

create table public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  start_minute int not null check (start_minute between 0 and 1439),
  end_minute int not null check (end_minute between 1 and 1440),
  created_at timestamptz not null default now(),
  check (end_minute > start_minute)
);
create index on public.availability_slots (user_id);
grant select, insert, update, delete on public.availability_slots to authenticated;
grant all on public.availability_slots to service_role;
alter table public.availability_slots enable row level security;
create policy "own availability" on public.availability_slots for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- TEAMS
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  description text,
  course_id uuid references public.courses(id) on delete set null,
  project_goal text,
  deadline date,
  visibility public.team_visibility not null default 'private',
  accent text not null default 'teal',
  created_by uuid not null references auth.users(id) on delete cascade,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.teams (visibility);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.team_role not null default 'member',
  joined_at timestamptz not null default now(),
  unique (team_id, user_id)
);
create index on public.team_members (user_id);

create or replace function public.is_team_member(_team uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.team_members m where m.team_id = _team and m.user_id = _user);
$$;
create or replace function public.team_role_of(_team uuid, _user uuid)
returns public.team_role language sql stable security definer set search_path = public as $$
  select m.role from public.team_members m where m.team_id = _team and m.user_id = _user;
$$;
create or replace function public.can_manage_team(_team uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.team_members m where m.team_id = _team and m.user_id = _user and m.role in ('owner','admin'));
$$;

grant select, insert, update, delete on public.teams to authenticated;
grant all on public.teams to service_role;
alter table public.teams enable row level security;
create policy "teams read" on public.teams for select to authenticated
using (visibility = 'public' or public.is_team_member(id, auth.uid()));
create policy "teams insert" on public.teams for insert to authenticated with check (created_by = auth.uid());
create policy "teams update" on public.teams for update to authenticated
using (public.can_manage_team(id, auth.uid())) with check (public.can_manage_team(id, auth.uid()));
create policy "teams delete" on public.teams for delete to authenticated
using (public.team_role_of(id, auth.uid()) = 'owner');

grant select, insert, update, delete on public.team_members to authenticated;
grant all on public.team_members to service_role;
alter table public.team_members enable row level security;
create policy "members read" on public.team_members for select to authenticated
using (user_id = auth.uid() or public.is_team_member(team_id, auth.uid()));
create policy "members self insert" on public.team_members for insert to authenticated
with check (user_id = auth.uid() or public.can_manage_team(team_id, auth.uid()));
create policy "members manage" on public.team_members for update to authenticated
using (public.can_manage_team(team_id, auth.uid())) with check (public.can_manage_team(team_id, auth.uid()));
create policy "members remove" on public.team_members for delete to authenticated
using (user_id = auth.uid() or public.can_manage_team(team_id, auth.uid()));

-- INVITATIONS
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(24),'hex'),
  email text,
  role public.team_role not null default 'member',
  status public.invitation_status not null default 'pending',
  created_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.invitations (team_id);
grant select, insert, update, delete on public.invitations to authenticated;
grant all on public.invitations to service_role;
alter table public.invitations enable row level security;
create policy "invites read" on public.invitations for select to authenticated
using (public.is_team_member(team_id, auth.uid()));
create policy "invites create" on public.invitations for insert to authenticated
with check (public.can_manage_team(team_id, auth.uid()) and created_by = auth.uid());
create policy "invites update" on public.invitations for update to authenticated
using (public.can_manage_team(team_id, auth.uid())) with check (public.can_manage_team(team_id, auth.uid()));
create policy "invites delete" on public.invitations for delete to authenticated
using (public.can_manage_team(team_id, auth.uid()));

-- redeem invitation securely
create or replace function public.redeem_invitation(_token text)
returns uuid language plpgsql security definer set search_path = public as $$
declare inv public.invitations; uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  select * into inv from public.invitations where token = _token;
  if inv is null then raise exception 'Invitation not found'; end if;
  if inv.status <> 'pending' then raise exception 'Invitation is no longer valid'; end if;
  if inv.expires_at < now() then
    update public.invitations set status='expired' where id = inv.id;
    raise exception 'Invitation has expired';
  end if;
  insert into public.team_members (team_id, user_id, role)
  values (inv.team_id, uid, inv.role)
  on conflict (team_id, user_id) do nothing;
  update public.invitations set status='accepted', accepted_by=uid, accepted_at=now() where id=inv.id;
  insert into public.activity_logs (team_id, actor_id, action, summary)
  values (inv.team_id, uid, 'member_joined', 'joined the team via invitation');
  return inv.team_id;
end; $$;

create or replace function public.invitation_preview(_token text)
returns table (team_name text, team_id uuid, valid boolean, reason text)
language plpgsql security definer set search_path = public as $$
declare inv public.invitations; t public.teams;
begin
  select * into inv from public.invitations where token = _token;
  if inv is null then return query select null::text, null::uuid, false, 'not_found'; return; end if;
  select * into t from public.teams where id = inv.team_id;
  if inv.status <> 'pending' then return query select t.name, t.id, false, 'used'; return; end if;
  if inv.expires_at < now() then return query select t.name, t.id, false, 'expired'; return; end if;
  return query select t.name, t.id, true, 'ok';
end; $$;

-- JOIN REQUESTS
create table public.join_requests (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  message text,
  status public.join_request_status not null default 'pending',
  decided_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  unique (team_id, user_id)
);
grant select, insert, update, delete on public.join_requests to authenticated;
grant all on public.join_requests to service_role;
alter table public.join_requests enable row level security;
create policy "jr read" on public.join_requests for select to authenticated
using (user_id = auth.uid() or public.can_manage_team(team_id, auth.uid()));
create policy "jr insert" on public.join_requests for insert to authenticated with check (user_id = auth.uid());
create policy "jr update" on public.join_requests for update to authenticated
using (public.can_manage_team(team_id, auth.uid())) with check (public.can_manage_team(team_id, auth.uid()));
create policy "jr delete" on public.join_requests for delete to authenticated
using (user_id = auth.uid() or public.can_manage_team(team_id, auth.uid()));

create or replace function public.decide_join_request(_request uuid, _approve boolean)
returns void language plpgsql security definer set search_path = public as $$
declare jr public.join_requests; uid uuid := auth.uid();
begin
  select * into jr from public.join_requests where id = _request;
  if jr is null then raise exception 'Request not found'; end if;
  if not public.can_manage_team(jr.team_id, uid) then raise exception 'Not allowed'; end if;
  if jr.status <> 'pending' then raise exception 'Already decided'; end if;
  if _approve then
    insert into public.team_members (team_id, user_id, role) values (jr.team_id, jr.user_id, 'member')
    on conflict (team_id, user_id) do nothing;
    update public.join_requests set status='approved', decided_by=uid, decided_at=now() where id=_request;
    insert into public.notifications (user_id, type, title, body, link)
    values (jr.user_id, 'join_approved', 'Join request approved', 'You are now a member of the team.', '/teams/'||jr.team_id);
    insert into public.activity_logs (team_id, actor_id, action, summary)
    values (jr.team_id, jr.user_id, 'member_joined', 'joined the team');
  else
    update public.join_requests set status='rejected', decided_by=uid, decided_at=now() where id=_request;
    insert into public.notifications (user_id, type, title, body, link)
    values (jr.user_id, 'join_rejected', 'Join request declined', 'Your request to join was declined.', '/discover');
  end if;
end; $$;

-- TASKS
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  description text,
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'medium',
  assignee_id uuid references auth.users(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete cascade,
  due_date timestamptz,
  position numeric not null default 1000,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.tasks (team_id, status);
create index on public.tasks (assignee_id);
grant select, insert, update, delete on public.tasks to authenticated;
grant all on public.tasks to service_role;
alter table public.tasks enable row level security;
create policy "tasks read" on public.tasks for select to authenticated using (public.is_team_member(team_id, auth.uid()));
create policy "tasks insert" on public.tasks for insert to authenticated
with check (public.is_team_member(team_id, auth.uid()) and created_by = auth.uid()
  and (assignee_id is null or public.is_team_member(team_id, assignee_id)));
create policy "tasks update" on public.tasks for update to authenticated
using (public.can_manage_team(team_id, auth.uid()) or created_by = auth.uid() or assignee_id = auth.uid())
with check (assignee_id is null or public.is_team_member(team_id, assignee_id));
create policy "tasks delete" on public.tasks for delete to authenticated
using (public.can_manage_team(team_id, auth.uid()) or created_by = auth.uid());

create table public.task_checklist_items (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  label text not null,
  done boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index on public.task_checklist_items (task_id);
grant select, insert, update, delete on public.task_checklist_items to authenticated;
grant all on public.task_checklist_items to service_role;
alter table public.task_checklist_items enable row level security;
create policy "checklist all" on public.task_checklist_items for all to authenticated
using (exists (select 1 from public.tasks t where t.id = task_id and public.is_team_member(t.team_id, auth.uid())))
with check (exists (select 1 from public.tasks t where t.id = task_id and public.is_team_member(t.team_id, auth.uid())));

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index on public.task_comments (task_id);
grant select, insert, update, delete on public.task_comments to authenticated;
grant all on public.task_comments to service_role;
alter table public.task_comments enable row level security;
create policy "comments read" on public.task_comments for select to authenticated
using (exists (select 1 from public.tasks t where t.id = task_id and public.is_team_member(t.team_id, auth.uid())));
create policy "comments insert" on public.task_comments for insert to authenticated
with check (author_id = auth.uid() and exists (select 1 from public.tasks t where t.id = task_id and public.is_team_member(t.team_id, auth.uid())));
create policy "comments delete" on public.task_comments for delete to authenticated using (author_id = auth.uid());

-- SESSIONS
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text,
  meeting_link text,
  recurrence text not null default 'none' check (recurrence in ('none','weekly')),
  recurrence_end date,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index on public.sessions (team_id, starts_at);
grant select, insert, update, delete on public.sessions to authenticated;
grant all on public.sessions to service_role;
alter table public.sessions enable row level security;
create policy "sessions read" on public.sessions for select to authenticated using (public.is_team_member(team_id, auth.uid()));
create policy "sessions insert" on public.sessions for insert to authenticated
with check (public.is_team_member(team_id, auth.uid()) and created_by = auth.uid());
create policy "sessions update" on public.sessions for update to authenticated
using (created_by = auth.uid() or public.can_manage_team(team_id, auth.uid()))
with check (created_by = auth.uid() or public.can_manage_team(team_id, auth.uid()));
create policy "sessions delete" on public.sessions for delete to authenticated
using (created_by = auth.uid() or public.can_manage_team(team_id, auth.uid()));

create table public.session_attendees (
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.attendee_status not null default 'invited',
  primary key (session_id, user_id)
);
grant select, insert, update, delete on public.session_attendees to authenticated;
grant all on public.session_attendees to service_role;
alter table public.session_attendees enable row level security;
create policy "attendees read" on public.session_attendees for select to authenticated
using (exists (select 1 from public.sessions s where s.id = session_id and public.is_team_member(s.team_id, auth.uid())));
create policy "attendees write" on public.session_attendees for all to authenticated
using (user_id = auth.uid() or exists (select 1 from public.sessions s where s.id = session_id and public.can_manage_team(s.team_id, auth.uid())))
with check (exists (select 1 from public.sessions s where s.id = session_id and public.is_team_member(s.team_id, auth.uid())));

create table public.recurrence_exceptions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  occurrence_date date not null,
  cancelled boolean not null default true,
  new_starts_at timestamptz,
  new_ends_at timestamptz,
  created_at timestamptz not null default now(),
  unique (session_id, occurrence_date)
);
grant select, insert, update, delete on public.recurrence_exceptions to authenticated;
grant all on public.recurrence_exceptions to service_role;
alter table public.recurrence_exceptions enable row level security;
create policy "rec ex all" on public.recurrence_exceptions for all to authenticated
using (exists (select 1 from public.sessions s where s.id = session_id and public.is_team_member(s.team_id, auth.uid())))
with check (exists (select 1 from public.sessions s where s.id = session_id and public.is_team_member(s.team_id, auth.uid())));

-- RESOURCES
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  kind public.resource_kind not null,
  title text not null,
  content text,
  url text,
  storage_path text,
  file_size bigint,
  mime_type text,
  tags text[] not null default '{}',
  version int not null default 1,
  created_by uuid not null references auth.users(id) on delete cascade,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.resources (team_id, kind);
grant select, insert, update, delete on public.resources to authenticated;
grant all on public.resources to service_role;
alter table public.resources enable row level security;
create policy "resources read" on public.resources for select to authenticated using (public.is_team_member(team_id, auth.uid()));
create policy "resources insert" on public.resources for insert to authenticated
with check (public.is_team_member(team_id, auth.uid()) and created_by = auth.uid());
create policy "resources update" on public.resources for update to authenticated
using (created_by = auth.uid() or public.can_manage_team(team_id, auth.uid()))
with check (public.is_team_member(team_id, auth.uid()));
create policy "resources delete" on public.resources for delete to authenticated
using (created_by = auth.uid() or public.can_manage_team(team_id, auth.uid()));

-- NOTIFICATIONS
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  dedupe_key text,
  created_at timestamptz not null default now(),
  unique (user_id, dedupe_key)
);
create index on public.notifications (user_id, created_at desc);
grant select, insert, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "own notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "own notifications update" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own notifications delete" on public.notifications for delete to authenticated using (user_id = auth.uid());
create policy "notifications insert" on public.notifications for insert to authenticated with check (true);

-- ACTIVITY LOGS
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  summary text not null,
  entity_id uuid,
  created_at timestamptz not null default now()
);
create index on public.activity_logs (team_id, created_at desc);
grant select, insert on public.activity_logs to authenticated;
grant all on public.activity_logs to service_role;
alter table public.activity_logs enable row level security;
create policy "activity read" on public.activity_logs for select to authenticated using (public.is_team_member(team_id, auth.uid()));
create policy "activity insert" on public.activity_logs for insert to authenticated
with check (actor_id = auth.uid() and public.is_team_member(team_id, auth.uid()));

-- team creation helper: creates team + owner membership atomically
create or replace function public.create_team(
  _name text, _description text, _course_id uuid, _project_goal text,
  _deadline date, _visibility public.team_visibility, _accent text
) returns uuid language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); tid uuid;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  insert into public.teams (name, description, course_id, project_goal, deadline, visibility, accent, created_by)
  values (_name, _description, _course_id, _project_goal, _deadline, coalesce(_visibility,'private'), coalesce(_accent,'teal'), uid)
  returning id into tid;
  insert into public.team_members (team_id, user_id, role) values (tid, uid, 'owner');
  insert into public.activity_logs (team_id, actor_id, action, summary) values (tid, uid, 'team_created', 'created the team');
  return tid;
end; $$;

-- realtime
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.activity_logs;
