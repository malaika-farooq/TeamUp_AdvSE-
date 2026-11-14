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

/* ------------------------------ Team content ------------------------------ */
// The same rules the database enforces for tasks, sessions, resources, comments and team settings
// (migration 0009_member_permissions.sql), so screens only offer what will work.

type Who = { created_by: string; assignee_id?: string | null };

/** Owners and admins can change any task; members only tasks they created or that are assigned to them. */
export function canEditTask(
  role: Role | null | undefined,
  userId: string | undefined,
  task: Who,
): boolean {
  if (canManage(role)) return true;
  return !!userId && (task.created_by === userId || task.assignee_id === userId);
}

/** Deleting is stricter: being assigned a task does not let you delete it. */
export function canDeleteTask(
  role: Role | null | undefined,
  userId: string | undefined,
  task: Who,
): boolean {
  return canManage(role) || (!!userId && task.created_by === userId);
}

/** Sessions, notes, links and files: the person who made it, or an owner/admin. */
export function canChangeItem(
  role: Role | null | undefined,
  userId: string | undefined,
  item: { created_by: string },
): boolean {
  return canManage(role) || (!!userId && item.created_by === userId);
}

/** Anyone can delete their own comment; owners and admins can moderate. */
export function canDeleteComment(
  role: Role | null | undefined,
  userId: string | undefined,
  comment: { author_id: string },
): boolean {
  return canManage(role) || (!!userId && comment.author_id === userId);
}

export const canEditTeamDetails = (role: Role | null | undefined) => canManage(role);
export const canChangeVisibility = (role: Role | null | undefined) => role === "owner";
export const canDeleteTeam = (role: Role | null | undefined) => role === "owner";

export type Level = "yes" | "own" | "no";

/** The permission table shown to students (and checked against the rules above in tests). */
export const PERMISSION_ROWS: { label: string; owner: Level; admin: Level; member: Level }[] = [
  { label: "See tasks, sessions, files and activity", owner: "yes", admin: "yes", member: "yes" },
  {
    label: "Create tasks, sessions and notes, and upload files",
    owner: "yes",
    admin: "yes",
    member: "yes",
  },
  { label: "Comment and update checklists", owner: "yes", admin: "yes", member: "yes" },
  { label: "Edit a task", owner: "yes", admin: "yes", member: "own" },
  { label: "Delete a task", owner: "yes", admin: "yes", member: "own" },
  { label: "Edit or delete a session, note or file", owner: "yes", admin: "yes", member: "own" },
  { label: "Delete a comment", owner: "yes", admin: "yes", member: "own" },
  { label: "Invite people and answer join requests", owner: "yes", admin: "yes", member: "no" },
  { label: "Remove members", owner: "yes", admin: "yes", member: "no" },
  { label: "Edit team details", owner: "yes", admin: "yes", member: "no" },
  { label: "Change admin roles and transfer ownership", owner: "yes", admin: "no", member: "no" },
  { label: "Make the team public or private", owner: "yes", admin: "no", member: "no" },
  { label: "Delete the team", owner: "yes", admin: "no", member: "no" },
];

export const LEVEL_TEXT: Record<Level, string> = { yes: "Yes", own: "Own only", no: "No" };
