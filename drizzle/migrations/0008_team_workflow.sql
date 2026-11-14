-- Study groups / project teams: invitation + request/approve workflow with owner, admin and member roles.
--
-- Before this migration any signed-in student could write the membership, invitation and join-request tables
-- directly (for example make themselves an owner of any team, or demote the owner). From now on those tables
-- are changed ONLY by the functions below, which check who is allowed to do what:
--   owner  - everything, including admin roles, transferring ownership and deleting the team
--   admin  - invite people, approve/decline requests, remove plain members
--   member - use the team, leave it
-- Run after 0007. Safe to run more than once.

-- 1. Schema additions ---------------------------------------------------------------------------
-- An invitation can be addressed to one student (invitee_id) or be a shareable link (invitee_id is null).
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS invitee_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS invitations_invitee_idx ON public.invitations (invitee_id) WHERE invitee_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS invitations_pending_invitee_key
  ON public.invitations (team_id, invitee_id) WHERE status = 'pending' AND invitee_id IS NOT NULL;

-- 2. Lock down direct writes --------------------------------------------------------------------
REVOKE INSERT, UPDATE, DELETE ON public.team_members FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.invitations FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.join_requests FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.team_members, public.invitations, public.join_requests FROM anon;

DROP POLICY IF EXISTS "members self insert" ON public.team_members;
DROP POLICY IF EXISTS "members manage" ON public.team_members;
DROP POLICY IF EXISTS "members remove" ON public.team_members;
DROP POLICY IF EXISTS "invites create" ON public.invitations;
DROP POLICY IF EXISTS "invites update" ON public.invitations;
DROP POLICY IF EXISTS "invites delete" ON public.invitations;
DROP POLICY IF EXISTS "jr insert" ON public.join_requests;
DROP POLICY IF EXISTS "jr update" ON public.join_requests;
DROP POLICY IF EXISTS "jr delete" ON public.join_requests;

-- Invitation links contain a secret token: only team managers (and the invited student) may read them.
DROP POLICY IF EXISTS "invites read" ON public.invitations;
CREATE POLICY "invites read" ON public.invitations FOR SELECT TO authenticated
  USING (public.can_manage_team(team_id, auth.uid()) OR invitee_id = auth.uid());

-- Notifications: only to yourself or to someone you share a team with (was: anyone to anyone).
DROP POLICY IF EXISTS "notifications insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications insert teammates" ON public.notifications;
CREATE POLICY "notifications insert teammates" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.team_members a
      JOIN public.team_members b ON b.team_id = a.team_id
      WHERE a.user_id = auth.uid() AND b.user_id = notifications.user_id
    )
  );

-- 3. Helpers ------------------------------------------------------------------------------------

-- Tell every owner/admin of a team about something (internal; not callable from the app).
CREATE OR REPLACE FUNCTION public.notify_managers(
  _team uuid, _type text, _title text, _body text, _link text, _dedupe text, _skip uuid DEFAULT NULL)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.notifications (user_id, type, title, body, link, dedupe_key)
  SELECT m.user_id, _type, _title, _body, _link, _dedupe
  FROM public.team_members m
  WHERE m.team_id = _team AND m.role IN ('owner', 'admin') AND m.user_id IS DISTINCT FROM _skip
  ON CONFLICT DO NOTHING;
$$;
REVOKE ALL ON FUNCTION public.notify_managers(uuid, text, text, text, text, text, uuid) FROM public, anon, authenticated;

-- Find or create a course ignoring letter case (used by "Create team").
CREATE OR REPLACE FUNCTION public.ensure_course(_code text, _title text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c_code text := public.normalize_label(_code); c_title text := public.normalize_label(_title); cid uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF c_title = '' THEN RAISE EXCEPTION 'A course needs a title'; END IF;
  IF c_code = '' THEN c_code := c_title; END IF;
  IF char_length(c_code) > 40 OR char_length(c_title) > 120 THEN RAISE EXCEPTION 'That course name is too long'; END IF;
  SELECT id INTO cid FROM public.courses
   WHERE lower(btrim(code)) = lower(c_code) AND lower(btrim(title)) = lower(c_title) LIMIT 1;
  IF cid IS NULL THEN
    INSERT INTO public.courses (code, title) VALUES (c_code, c_title) ON CONFLICT DO NOTHING RETURNING id INTO cid;
    IF cid IS NULL THEN
      SELECT id INTO cid FROM public.courses
       WHERE lower(btrim(code)) = lower(c_code) AND lower(btrim(title)) = lower(c_title) LIMIT 1;
    END IF;
  END IF;
  RETURN cid;
END; $$;

-- 4. Invitations --------------------------------------------------------------------------------

-- A shareable link. Managers can create member links; only the owner can create admin links.
CREATE OR REPLACE FUNCTION public.create_invite_link(_team uuid, _role public.team_role DEFAULT 'member')
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); tok text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF NOT public.can_manage_team(_team, uid) THEN RAISE EXCEPTION 'Only team owners and admins can invite people'; END IF;
  IF _role = 'owner' THEN RAISE EXCEPTION 'An invitation can only give member or admin access'; END IF;
  IF _role = 'admin' AND public.team_role_of(_team, uid) <> 'owner' THEN
    RAISE EXCEPTION 'Only the team owner can create admin invitations';
  END IF;
  IF (SELECT count(*) FROM public.invitations WHERE team_id = _team AND status = 'pending') >= 50 THEN
    RAISE EXCEPTION 'This team has too many open invitations - revoke some first';
  END IF;
  INSERT INTO public.invitations (team_id, role, created_by) VALUES (_team, _role, uid) RETURNING token INTO tok;
  RETURN tok;
END; $$;

-- An invitation addressed to one discoverable student, who sees it in My Teams and in notifications.
-- Returns the invitation's id (the student's link is sent to them as a notification).
-- An earlier draft of this function returned text, and Postgres can't change a return type in place.
DROP FUNCTION IF EXISTS public.invite_student(uuid, uuid, public.team_role);
CREATE FUNCTION public.invite_student(_team uuid, _user uuid, _role public.team_role DEFAULT 'member')
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); tok text; iid uuid; tname text; inviter text; invitee text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF NOT public.can_manage_team(_team, uid) THEN RAISE EXCEPTION 'Only team owners and admins can invite people'; END IF;
  IF _role = 'owner' THEN RAISE EXCEPTION 'An invitation can only give member or admin access'; END IF;
  IF _role = 'admin' AND public.team_role_of(_team, uid) <> 'owner' THEN
    RAISE EXCEPTION 'Only the team owner can invite someone as an admin';
  END IF;
  IF _user = uid THEN RAISE EXCEPTION 'You are already in this team'; END IF;
  SELECT display_name INTO invitee FROM public.profiles WHERE id = _user AND discoverable;
  IF invitee IS NULL THEN RAISE EXCEPTION 'That student can''t be invited (they are not discoverable)'; END IF;
  IF public.is_team_member(_team, _user) THEN RAISE EXCEPTION '% is already in this team', invitee; END IF;
  IF EXISTS (SELECT 1 FROM public.invitations WHERE team_id = _team AND invitee_id = _user AND status = 'pending' AND expires_at > now()) THEN
    RAISE EXCEPTION '% already has a pending invitation', invitee;
  END IF;
  IF (SELECT count(*) FROM public.invitations WHERE team_id = _team AND status = 'pending') >= 50 THEN
    RAISE EXCEPTION 'This team has too many open invitations - revoke some first';
  END IF;
  -- An old, expired invitation to the same student must not block a new one.
  UPDATE public.invitations SET status = 'expired'
   WHERE team_id = _team AND invitee_id = _user AND status = 'pending' AND expires_at <= now();

  INSERT INTO public.invitations (team_id, role, created_by, invitee_id)
  VALUES (_team, _role, uid, _user) RETURNING id, token INTO iid, tok;
  SELECT name INTO tname FROM public.teams WHERE id = _team;
  SELECT display_name INTO inviter FROM public.profiles WHERE id = uid;
  INSERT INTO public.notifications (user_id, type, title, body, link, dedupe_key)
  VALUES (_user, 'team_invite', 'Team invitation',
          coalesce(inviter, 'A teammate') || ' invited you to join "' || tname || '".',
          '/invite/' || tok, 'invite:' || iid);
  INSERT INTO public.activity_logs (team_id, actor_id, action, summary)
  VALUES (_team, uid, 'member_invited', 'invited ' || invitee || ' to the team');
  RETURN iid;
END; $$;

CREATE OR REPLACE FUNCTION public.revoke_invitation(_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inv public.invitations;
BEGIN
  SELECT * INTO inv FROM public.invitations WHERE id = _id;
  IF inv IS NULL OR NOT public.can_manage_team(inv.team_id, auth.uid()) THEN RAISE EXCEPTION 'Invitation not found'; END IF;
  IF inv.status <> 'pending' THEN RAISE EXCEPTION 'That invitation is already %', inv.status; END IF;
  UPDATE public.invitations SET status = 'revoked' WHERE id = _id;
END; $$;

-- Invitations addressed to the caller that are still open.
CREATE OR REPLACE FUNCTION public.my_team_invitations()
RETURNS TABLE (id uuid, token text, team_id uuid, team_name text, role public.team_role,
               inviter_name text, inviter_avatar text, created_at timestamptz, expires_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT i.id, i.token, i.team_id, t.name, i.role, p.display_name, p.avatar_url, i.created_at, i.expires_at
  FROM public.invitations i
  JOIN public.teams t ON t.id = i.team_id
  LEFT JOIN public.profiles p ON p.id = i.created_by
  WHERE i.invitee_id = auth.uid() AND i.status = 'pending' AND i.expires_at > now()
  ORDER BY i.created_at DESC;
$$;

-- What the invitation page shows before the student accepts (also usable when signed out).
DROP FUNCTION IF EXISTS public.invitation_preview(text);
CREATE FUNCTION public.invitation_preview(_token text)
RETURNS TABLE (team_id uuid, team_name text, role public.team_role, inviter_name text,
               member_count int, valid boolean, reason text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
#variable_conflict use_column
DECLARE inv public.invitations; t public.teams; why text := 'ok'; who text; n int;
BEGIN
  SELECT * INTO inv FROM public.invitations WHERE token = _token;
  IF inv IS NULL THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::public.team_role, NULL::text, 0, false, 'not_found'; RETURN;
  END IF;
  SELECT * INTO t FROM public.teams WHERE id = inv.team_id;
  SELECT display_name INTO who FROM public.profiles WHERE id = inv.created_by;
  SELECT count(*)::int INTO n FROM public.team_members WHERE team_id = inv.team_id;
  IF inv.status = 'revoked' THEN why := 'revoked';
  ELSIF inv.status = 'declined' THEN why := 'declined';
  ELSIF inv.status <> 'pending' THEN why := 'used';
  ELSIF inv.expires_at < now() THEN why := 'expired';
  ELSIF inv.invitee_id IS NOT NULL AND auth.uid() IS NOT NULL AND inv.invitee_id <> auth.uid() THEN why := 'not_for_you';
  END IF;
  RETURN QUERY SELECT t.id, t.name, inv.role, who, n, (why = 'ok'), why;
END; $$;

-- Accepting. A link works once; one addressed to a student only works for that student.
CREATE OR REPLACE FUNCTION public.redeem_invitation(_token text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inv public.invitations; uid uuid := auth.uid(); me text; tname text; already boolean;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO inv FROM public.invitations WHERE token = _token FOR UPDATE;
  IF inv IS NULL THEN RAISE EXCEPTION 'Invitation not found'; END IF;
  IF inv.status <> 'pending' THEN RAISE EXCEPTION 'This invitation was already used, declined or revoked'; END IF;
  IF inv.expires_at < now() THEN
    UPDATE public.invitations SET status = 'expired' WHERE id = inv.id;
    RAISE EXCEPTION 'Invitation has expired';
  END IF;
  IF inv.invitee_id IS NOT NULL AND inv.invitee_id <> uid THEN
    RAISE EXCEPTION 'This invitation was sent to someone else';
  END IF;

  already := public.is_team_member(inv.team_id, uid);
  IF already THEN
    -- Opening a link you already belong to must not use it up; a personal invitation is simply closed.
    IF inv.invitee_id IS NOT NULL THEN
      UPDATE public.invitations SET status = 'accepted', accepted_by = uid, accepted_at = now() WHERE id = inv.id;
    END IF;
    RETURN inv.team_id;
  END IF;

  INSERT INTO public.team_members (team_id, user_id, role) VALUES (inv.team_id, uid, inv.role)
  ON CONFLICT (team_id, user_id) DO NOTHING;
  UPDATE public.invitations SET status = 'accepted', accepted_by = uid, accepted_at = now() WHERE id = inv.id;
  -- A pending request to the same team is now answered.
  UPDATE public.join_requests SET status = 'approved', decided_by = inv.created_by, decided_at = now()
   WHERE team_id = inv.team_id AND user_id = uid AND status = 'pending';

  SELECT display_name INTO me FROM public.profiles WHERE id = uid;
  SELECT name INTO tname FROM public.teams WHERE id = inv.team_id;
  INSERT INTO public.activity_logs (team_id, actor_id, action, summary)
  VALUES (inv.team_id, uid, 'member_joined', 'joined the team via invitation');
  INSERT INTO public.notifications (user_id, type, title, body, link, dedupe_key)
  VALUES (inv.created_by, 'invite_accepted', 'Invitation accepted',
          coalesce(me, 'A student') || ' joined "' || tname || '".', '/teams/' || inv.team_id, 'invite-ok:' || inv.id)
  ON CONFLICT DO NOTHING;
  RETURN inv.team_id;
END; $$;

-- Declining an invitation that was addressed to you.
CREATE OR REPLACE FUNCTION public.decline_invitation(_token text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inv public.invitations; uid uuid := auth.uid(); me text; tname text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO inv FROM public.invitations WHERE token = _token FOR UPDATE;
  IF inv IS NULL OR inv.invitee_id IS DISTINCT FROM uid THEN RAISE EXCEPTION 'Only an invitation sent to you can be declined'; END IF;
  IF inv.status <> 'pending' THEN RAISE EXCEPTION 'This invitation was already answered'; END IF;
  UPDATE public.invitations SET status = 'declined' WHERE id = inv.id;
  SELECT display_name INTO me FROM public.profiles WHERE id = uid;
  SELECT name INTO tname FROM public.teams WHERE id = inv.team_id;
  INSERT INTO public.notifications (user_id, type, title, body, link, dedupe_key)
  VALUES (inv.created_by, 'invite_declined', 'Invitation declined',
          coalesce(me, 'A student') || ' declined to join "' || tname || '".', '/teams/' || inv.team_id, 'invite-no:' || inv.id)
  ON CONFLICT DO NOTHING;
END; $$;

-- 5. Join requests ------------------------------------------------------------------------------

-- Ask to join a public team. A declined request can be repeated after 7 days.
CREATE OR REPLACE FUNCTION public.request_to_join(_team uuid, _message text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); t public.teams; jr public.join_requests; rid uuid; me text; msg text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  SELECT * INTO t FROM public.teams WHERE id = _team;
  IF t IS NULL OR t.visibility <> 'public' THEN RAISE EXCEPTION 'That team isn''t open for join requests'; END IF;
  IF public.is_team_member(_team, uid) THEN RAISE EXCEPTION 'You are already in this team'; END IF;
  msg := NULLIF(btrim(coalesce(_message, '')), '');
  IF msg IS NOT NULL AND char_length(msg) > 300 THEN RAISE EXCEPTION 'Keep your message under 300 characters'; END IF;
  IF EXISTS (SELECT 1 FROM public.invitations WHERE team_id = _team AND invitee_id = uid AND status = 'pending' AND expires_at > now()) THEN
    RAISE EXCEPTION 'You already have an invitation to this team - accept it from My Teams';
  END IF;

  SELECT * INTO jr FROM public.join_requests WHERE team_id = _team AND user_id = uid;
  IF jr IS NULL THEN
    INSERT INTO public.join_requests (team_id, user_id, message) VALUES (_team, uid, msg) RETURNING id INTO rid;
  ELSIF jr.status = 'pending' THEN
    RAISE EXCEPTION 'You already asked to join this team';
  ELSIF jr.status = 'rejected' AND jr.decided_at > now() - interval '7 days' THEN
    RAISE EXCEPTION 'Your last request was declined. You can ask again after %', to_char(jr.decided_at + interval '7 days', 'Mon DD');
  ELSE
    UPDATE public.join_requests
       SET status = 'pending', message = msg, decided_by = NULL, decided_at = NULL, created_at = now()
     WHERE id = jr.id RETURNING id INTO rid;
  END IF;

  SELECT display_name INTO me FROM public.profiles WHERE id = uid;
  PERFORM public.notify_managers(_team, 'join_request', 'New join request',
          coalesce(me, 'A student') || ' asked to join "' || t.name || '".', '/teams/' || _team,
          'jr:' || rid || ':' || floor(extract(epoch FROM now()))::bigint);
  RETURN rid;
END; $$;

CREATE OR REPLACE FUNCTION public.cancel_join_request(_request uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.join_requests WHERE id = _request AND user_id = auth.uid() AND status = 'pending';
  IF NOT FOUND THEN RAISE EXCEPTION 'No pending request to cancel'; END IF;
END; $$;

-- Who is asking, for owners and admins deciding on a request.
CREATE OR REPLACE FUNCTION public.team_join_requests(_team uuid)
RETURNS TABLE (request_id uuid, requester_id uuid, name text, avatar text, university text, major text,
               bio text, message text, requested_at timestamptz, skills text[], courses text[])
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
#variable_conflict use_column
BEGIN
  IF NOT public.can_manage_team(_team, auth.uid()) THEN RAISE EXCEPTION 'Only team owners and admins can see join requests'; END IF;
  RETURN QUERY
  SELECT r.id, r.user_id, p.display_name, p.avatar_url, p.university, p.major, p.bio, r.message, r.created_at,
    coalesce((SELECT array_agg(s.name ORDER BY s.name) FROM public.user_skills us
              JOIN public.skills s ON s.id = us.skill_id WHERE us.user_id = r.user_id), '{}'::text[]),
    coalesce((SELECT array_agg(CASE WHEN lower(c.code) = lower(c.title) THEN c.title ELSE c.code || ' ' || c.title END ORDER BY c.code)
              FROM public.user_courses uc JOIN public.courses c ON c.id = uc.course_id WHERE uc.user_id = r.user_id), '{}'::text[])
  FROM public.join_requests r
  JOIN public.profiles p ON p.id = r.user_id
  WHERE r.team_id = _team AND r.status = 'pending'
  ORDER BY r.created_at;
END; $$;

-- Number of waiting requests per team the caller manages (for badges).
CREATE OR REPLACE FUNCTION public.team_request_counts()
RETURNS TABLE (team_id uuid, pending int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.team_id, count(*)::int
  FROM public.join_requests r
  WHERE r.status = 'pending' AND public.can_manage_team(r.team_id, auth.uid())
  GROUP BY r.team_id;
$$;

-- 6. Members and roles --------------------------------------------------------------------------

-- Owner only: make someone an admin or a plain member.
CREATE OR REPLACE FUNCTION public.set_member_role(_team uuid, _user uuid, _role public.team_role)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); cur public.team_role; tname text; who text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF public.team_role_of(_team, uid) IS DISTINCT FROM 'owner' THEN RAISE EXCEPTION 'Only the team owner can change roles'; END IF;
  IF _role = 'owner' THEN RAISE EXCEPTION 'Use "Transfer ownership" to make someone else the owner'; END IF;
  cur := public.team_role_of(_team, _user);
  IF cur IS NULL THEN RAISE EXCEPTION 'That person is not in this team'; END IF;
  IF cur = 'owner' THEN RAISE EXCEPTION 'The owner''s role can only change by transferring ownership'; END IF;
  IF cur = _role THEN RETURN; END IF;
  UPDATE public.team_members SET role = _role WHERE team_id = _team AND user_id = _user;
  SELECT name INTO tname FROM public.teams WHERE id = _team;
  SELECT display_name INTO who FROM public.profiles WHERE id = _user;
  INSERT INTO public.activity_logs (team_id, actor_id, action, summary)
  VALUES (_team, uid, 'role_changed', 'made ' || coalesce(who, 'a member') || ' ' || CASE WHEN _role = 'admin' THEN 'an admin' ELSE 'a member' END);
  INSERT INTO public.notifications (user_id, type, title, body, link)
  VALUES (_user, 'team_update', 'Your role changed',
          'You are now ' || CASE WHEN _role = 'admin' THEN 'an admin' ELSE 'a member' END || ' of "' || tname || '".', '/teams/' || _team);
END; $$;

-- Owner only: hand the team to another member (you become an admin). One step, so there is never no owner.
CREATE OR REPLACE FUNCTION public.transfer_ownership(_team uuid, _user uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); tname text; who text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF public.team_role_of(_team, uid) IS DISTINCT FROM 'owner' THEN RAISE EXCEPTION 'Only the team owner can transfer ownership'; END IF;
  IF _user = uid THEN RAISE EXCEPTION 'You already own this team'; END IF;
  IF NOT public.is_team_member(_team, _user) THEN RAISE EXCEPTION 'That person is not in this team'; END IF;
  UPDATE public.team_members SET role = 'owner' WHERE team_id = _team AND user_id = _user;
  UPDATE public.team_members SET role = 'admin' WHERE team_id = _team AND user_id = uid;
  SELECT name INTO tname FROM public.teams WHERE id = _team;
  SELECT display_name INTO who FROM public.profiles WHERE id = _user;
  INSERT INTO public.activity_logs (team_id, actor_id, action, summary)
  VALUES (_team, uid, 'ownership_transferred', 'made ' || coalesce(who, 'a member') || ' the team owner');
  INSERT INTO public.notifications (user_id, type, title, body, link)
  VALUES (_user, 'team_update', 'You are now the team owner', 'You now own "' || tname || '".', '/teams/' || _team);
END; $$;

-- Owners and admins remove members; admins can only remove plain members. Their open tasks become unassigned.
CREATE OR REPLACE FUNCTION public.remove_member(_team uuid, _user uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); mine public.team_role; theirs public.team_role; tname text; who text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  mine := public.team_role_of(_team, uid);
  IF mine IS NULL OR mine = 'member' THEN RAISE EXCEPTION 'Only team owners and admins can remove members'; END IF;
  IF _user = uid THEN RAISE EXCEPTION 'Use "Leave team" to leave'; END IF;
  theirs := public.team_role_of(_team, _user);
  IF theirs IS NULL THEN RAISE EXCEPTION 'That person is not in this team'; END IF;
  IF theirs = 'owner' THEN RAISE EXCEPTION 'The team owner can''t be removed'; END IF;
  IF theirs = 'admin' AND mine <> 'owner' THEN RAISE EXCEPTION 'Only the owner can remove an admin'; END IF;

  UPDATE public.tasks SET assignee_id = NULL WHERE team_id = _team AND assignee_id = _user;
  DELETE FROM public.session_attendees sa USING public.sessions s WHERE sa.session_id = s.id AND s.team_id = _team AND sa.user_id = _user;
  DELETE FROM public.team_members WHERE team_id = _team AND user_id = _user;
  SELECT name INTO tname FROM public.teams WHERE id = _team;
  SELECT display_name INTO who FROM public.profiles WHERE id = _user;
  INSERT INTO public.activity_logs (team_id, actor_id, action, summary)
  VALUES (_team, uid, 'member_removed', 'removed ' || coalesce(who, 'a member') || ' from the team');
  INSERT INTO public.notifications (user_id, type, title, body, link)
  VALUES (_user, 'team_update', 'Removed from a team', 'You were removed from "' || tname || '".', '/teams');
END; $$;

-- Leave a team. The owner must transfer ownership first, unless they are the only member (then it is deleted).
-- Returns true when the team was deleted.
CREATE OR REPLACE FUNCTION public.leave_team(_team uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); mine public.team_role; n int; who text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  mine := public.team_role_of(_team, uid);
  IF mine IS NULL THEN RAISE EXCEPTION 'You are not in this team'; END IF;
  SELECT count(*)::int INTO n FROM public.team_members WHERE team_id = _team;
  IF mine = 'owner' THEN
    IF n > 1 THEN RAISE EXCEPTION 'Transfer ownership to another member before leaving this team'; END IF;
    DELETE FROM public.teams WHERE id = _team;
    RETURN true;
  END IF;
  UPDATE public.tasks SET assignee_id = NULL WHERE team_id = _team AND assignee_id = uid;
  DELETE FROM public.session_attendees sa USING public.sessions s WHERE sa.session_id = s.id AND s.team_id = _team AND sa.user_id = uid;
  DELETE FROM public.team_members WHERE team_id = _team AND user_id = uid;
  SELECT display_name INTO who FROM public.profiles WHERE id = uid;
  PERFORM public.notify_managers(_team, 'team_update', 'A member left',
          coalesce(who, 'A member') || ' left the team.', '/teams/' || _team, 'left:' || _team || ':' || uid || ':' || floor(extract(epoch FROM now()))::bigint, uid);
  RETURN false;
END; $$;

-- 7. Who can call what ---------------------------------------------------------------------------
DO $$
DECLARE f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'ensure_course(text, text)', 'create_invite_link(uuid, public.team_role)',
    'invite_student(uuid, uuid, public.team_role)', 'revoke_invitation(uuid)', 'my_team_invitations()',
    'redeem_invitation(text)', 'decline_invitation(text)', 'request_to_join(uuid, text)',
    'cancel_join_request(uuid)', 'team_join_requests(uuid)', 'team_request_counts()',
    'set_member_role(uuid, uuid, public.team_role)', 'transfer_ownership(uuid, uuid)',
    'remove_member(uuid, uuid)', 'leave_team(uuid)', 'decide_join_request(uuid, boolean)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM public, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', f);
  END LOOP;
END $$;
-- The invitation page may look up a link before the student has signed in.
REVOKE ALL ON FUNCTION public.invitation_preview(text) FROM public;
GRANT EXECUTE ON FUNCTION public.invitation_preview(text) TO anon, authenticated;
