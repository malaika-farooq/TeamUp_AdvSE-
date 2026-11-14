// Team invitations, join requests and member management. Every change goes through a checked database
// function (migration 0008_team_workflow.sql), so these helpers only call it and explain failures.
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Role } from "./team-rules";

export const TEAM_SETUP_MESSAGE =
  "Team invitations aren't set up in the database yet. Ask the project owner to run migration 0008_team_workflow.sql in Supabase.";

/** Database messages are already written for students; only missing-function errors need translating. */
export function teamError(error: { message?: string; code?: string } | null | undefined): Error {
  const message = error?.message ?? "";
  if (error?.code === "PGRST202" || /could not find the function|schema cache/i.test(message)) {
    return new Error(TEAM_SETUP_MESSAGE);
  }
  if (/permission denied/i.test(message)) return new Error("You don't have permission to do that.");
  return new Error(message || "Something went wrong. Please try again.");
}

function ok<T>(res: { data: T | null; error: { message?: string; code?: string } | null }): T {
  if (res.error) throw teamError(res.error);
  return res.data as T;
}

export type TeamInvitation =
  Database["public"]["Functions"]["my_team_invitations"]["Returns"][number];
export type JoinRequestDetail =
  Database["public"]["Functions"]["team_join_requests"]["Returns"][number];
export type InvitationPreview =
  Database["public"]["Functions"]["invitation_preview"]["Returns"][number];

export async function createInviteLink(teamId: string, role: Role): Promise<string> {
  return ok(await supabase.rpc("create_invite_link", { _team: teamId, _role: role }));
}

/** Invites a discoverable student; returns the invitation id (so it can be taken back). */
export async function inviteStudent(
  teamId: string,
  userId: string,
  role: Role = "member",
): Promise<string> {
  return ok(await supabase.rpc("invite_student", { _team: teamId, _user: userId, _role: role }));
}

export async function revokeInvitation(id: string): Promise<void> {
  ok(await supabase.rpc("revoke_invitation", { _id: id }));
}

export async function myInvitations(): Promise<TeamInvitation[]> {
  return ok(await supabase.rpc("my_team_invitations")) ?? [];
}

export async function previewInvitation(token: string): Promise<InvitationPreview> {
  const rows = ok(await supabase.rpc("invitation_preview", { _token: token }));
  return (
    rows?.[0] ?? {
      team_id: null,
      team_name: null,
      role: null,
      inviter_name: null,
      member_count: 0,
      valid: false,
      reason: "not_found",
    }
  );
}

export async function acceptInvitation(token: string): Promise<string> {
  return ok(await supabase.rpc("redeem_invitation", { _token: token }));
}

export async function declineInvitation(token: string): Promise<void> {
  ok(await supabase.rpc("decline_invitation", { _token: token }));
}

export async function requestToJoin(teamId: string, message: string): Promise<void> {
  ok(await supabase.rpc("request_to_join", { _team: teamId, _message: message.trim() || null }));
}

export async function cancelJoinRequest(requestId: string): Promise<void> {
  ok(await supabase.rpc("cancel_join_request", { _request: requestId }));
}

export async function decideJoinRequest(requestId: string, approve: boolean): Promise<void> {
  ok(await supabase.rpc("decide_join_request", { _request: requestId, _approve: approve }));
}

export async function teamJoinRequests(teamId: string): Promise<JoinRequestDetail[]> {
  return ok(await supabase.rpc("team_join_requests", { _team: teamId })) ?? [];
}

/** team id -> number of waiting join requests, for teams the caller manages. */
export async function requestCounts(): Promise<Record<string, number>> {
  const rows = ok(await supabase.rpc("team_request_counts")) ?? [];
  return Object.fromEntries(rows.map((r) => [r.team_id, r.pending]));
}

export async function setMemberRole(teamId: string, userId: string, role: Role): Promise<void> {
  ok(await supabase.rpc("set_member_role", { _team: teamId, _user: userId, _role: role }));
}

export async function transferOwnership(teamId: string, userId: string): Promise<void> {
  ok(await supabase.rpc("transfer_ownership", { _team: teamId, _user: userId }));
}

export async function removeMember(teamId: string, userId: string): Promise<void> {
  ok(await supabase.rpc("remove_member", { _team: teamId, _user: userId }));
}

/** Leaves the team; resolves to true when it was the owner's last seat and the team was deleted. */
export async function leaveTeam(teamId: string): Promise<boolean> {
  return ok(await supabase.rpc("leave_team", { _team: teamId }));
}

export async function ensureCourse(code: string, title: string): Promise<string> {
  return ok(await supabase.rpc("ensure_course", { _code: code, _title: title }));
}
