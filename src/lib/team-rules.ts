// Who may do what in a team, and how request/invitation states are described.
// The database enforces these rules (migration 0008_team_workflow.sql); this module only decides what the
// screens offer, so people are never shown a button that would fail.

export type Role = "owner" | "admin" | "member";

export const REQUEST_RETRY_DAYS = 7;
const DAY = 24 * 60 * 60 * 1000;

export function canManage(role: Role | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

/** Roles someone may hand out in an invitation: the owner can invite admins, an admin only members. */
export function inviteRolesFor(role: Role | null | undefined): Role[] {
  if (role === "owner") return ["member", "admin"];
  if (role === "admin") return ["member"];
  return [];
}

export type MemberActions = { changeRole: boolean; transfer: boolean; remove: boolean };

/** What `mine` may do to another member holding the role `theirs`. */
export function memberActions(
  mine: Role | null | undefined,
  theirs: Role,
  isSelf: boolean,
): MemberActions {
  const none = { changeRole: false, transfer: false, remove: false };
  if (isSelf || theirs === "owner") return none;
  if (mine === "owner") return { changeRole: true, transfer: true, remove: true };
  if (mine === "admin") return { ...none, remove: theirs === "member" };
  return none;
}

export type RequestState = { kind: "none" } | { kind: "pending" } | { kind: "wait"; retryOn: Date };

/** Where a student stands with one team's join requests (a declined request can be repeated after 7 days). */
export function requestState(
  request: { status: string; decided_at: string | null } | undefined,
  now: Date = new Date(),
): RequestState {
  if (!request) return { kind: "none" };
  if (request.status === "pending") return { kind: "pending" };
  if (request.status === "rejected" && request.decided_at) {
    const retryOn = new Date(new Date(request.decided_at).getTime() + REQUEST_RETRY_DAYS * DAY);
    if (retryOn.getTime() > now.getTime()) return { kind: "wait", retryOn };
  }
  return { kind: "none" };
}

/** Plain-language reason an invitation page can't be used. */
export function invitationProblem(reason: string): string {
  switch (reason) {
    case "expired":
      return "This invitation has expired. Ask the team for a new one.";
    case "used":
      return "This invitation was already used.";
    case "revoked":
      return "The team cancelled this invitation.";
    case "declined":
      return "This invitation was declined.";
    case "not_for_you":
      return "This invitation was sent to someone else. Sign in with the account it was sent to.";
    default:
      return "We couldn't find that invitation.";
  }
}

/** "expires in 3 days", "expires today", "expired". */
export function expiresText(expiresAt: string | Date, now: Date = new Date()): string {
  const ms = new Date(expiresAt).getTime() - now.getTime();
  if (ms <= 0) return "expired";
  const days = Math.floor(ms / DAY);
  if (days < 1) return "expires today";
  return `expires in ${days} day${days === 1 ? "" : "s"}`;
}

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

export const ROLE_HELP: Record<Role, string> = {
  owner: "Full control, including roles, transferring ownership and deleting the team.",
  admin: "Invites people, answers join requests and removes members.",
  member: "Works on tasks, sessions and resources.",
};
