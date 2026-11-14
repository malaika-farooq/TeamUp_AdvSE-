//#region node_modules/.nitro/vite/services/ssr/assets/team-rules-DG0EiWUj.js
var DAY = 864e5;
function canManage(role) {
	return role === "owner" || role === "admin";
}
/** Roles someone may hand out in an invitation: the owner can invite admins, an admin only members. */
function inviteRolesFor(role) {
	if (role === "owner") return ["member", "admin"];
	if (role === "admin") return ["member"];
	return [];
}
/** What `mine` may do to another member holding the role `theirs`. */
function memberActions(mine, theirs, isSelf) {
	const none = {
		changeRole: false,
		transfer: false,
		remove: false
	};
	if (isSelf || theirs === "owner") return none;
	if (mine === "owner") return {
		changeRole: true,
		transfer: true,
		remove: true
	};
	if (mine === "admin") return {
		...none,
		remove: theirs === "member"
	};
	return none;
}
/** Where a student stands with one team's join requests (a declined request can be repeated after 7 days). */
function requestState(request, now = /* @__PURE__ */ new Date()) {
	if (!request) return { kind: "none" };
	if (request.status === "pending") return { kind: "pending" };
	if (request.status === "rejected" && request.decided_at) {
		const retryOn = new Date(new Date(request.decided_at).getTime() + 7 * DAY);
		if (retryOn.getTime() > now.getTime()) return {
			kind: "wait",
			retryOn
		};
	}
	return { kind: "none" };
}
/** Plain-language reason an invitation page can't be used. */
function invitationProblem(reason) {
	switch (reason) {
		case "expired": return "This invitation has expired. Ask the team for a new one.";
		case "used": return "This invitation was already used.";
		case "revoked": return "The team cancelled this invitation.";
		case "declined": return "This invitation was declined.";
		case "not_for_you": return "This invitation was sent to someone else. Sign in with the account it was sent to.";
		default: return "We couldn't find that invitation.";
	}
}
/** "expires in 3 days", "expires today", "expired". */
function expiresText(expiresAt, now = /* @__PURE__ */ new Date()) {
	const ms = new Date(expiresAt).getTime() - now.getTime();
	if (ms <= 0) return "expired";
	const days = Math.floor(ms / DAY);
	if (days < 1) return "expires today";
	return `expires in ${days} day${days === 1 ? "" : "s"}`;
}
var ROLE_LABEL = {
	owner: "Owner",
	admin: "Admin",
	member: "Member"
};
var ROLE_HELP = {
	owner: "Full control, including roles, transferring ownership and deleting the team.",
	admin: "Invites people, answers join requests and removes members.",
	member: "Works on tasks, sessions and resources."
};
/** Owners and admins can change any task; members only tasks they created or that are assigned to them. */
function canEditTask(role, userId, task) {
	if (canManage(role)) return true;
	return !!userId && (task.created_by === userId || task.assignee_id === userId);
}
/** Deleting is stricter: being assigned a task does not let you delete it. */
function canDeleteTask(role, userId, task) {
	return canManage(role) || !!userId && task.created_by === userId;
}
/** Sessions, notes, links and files: the person who made it, or an owner/admin. */
function canChangeItem(role, userId, item) {
	return canManage(role) || !!userId && item.created_by === userId;
}
/** Anyone can delete their own comment; owners and admins can moderate. */
function canDeleteComment(role, userId, comment) {
	return canManage(role) || !!userId && comment.author_id === userId;
}
var canEditTeamDetails = (role) => canManage(role);
var canChangeVisibility = (role) => role === "owner";
/** The permission table shown to students (and checked against the rules above in tests). */
var PERMISSION_ROWS = [
	{
		label: "See tasks, sessions, files and activity",
		owner: "yes",
		admin: "yes",
		member: "yes"
	},
	{
		label: "Create tasks, sessions and notes, and upload files",
		owner: "yes",
		admin: "yes",
		member: "yes"
	},
	{
		label: "Comment and update checklists",
		owner: "yes",
		admin: "yes",
		member: "yes"
	},
	{
		label: "Edit a task",
		owner: "yes",
		admin: "yes",
		member: "own"
	},
	{
		label: "Delete a task",
		owner: "yes",
		admin: "yes",
		member: "own"
	},
	{
		label: "Edit or delete a session, note or file",
		owner: "yes",
		admin: "yes",
		member: "own"
	},
	{
		label: "Delete a comment",
		owner: "yes",
		admin: "yes",
		member: "own"
	},
	{
		label: "Invite people and answer join requests",
		owner: "yes",
		admin: "yes",
		member: "no"
	},
	{
		label: "Remove members",
		owner: "yes",
		admin: "yes",
		member: "no"
	},
	{
		label: "Edit team details",
		owner: "yes",
		admin: "yes",
		member: "no"
	},
	{
		label: "Change admin roles and transfer ownership",
		owner: "yes",
		admin: "no",
		member: "no"
	},
	{
		label: "Make the team public or private",
		owner: "yes",
		admin: "no",
		member: "no"
	},
	{
		label: "Delete the team",
		owner: "yes",
		admin: "no",
		member: "no"
	}
];
var LEVEL_TEXT = {
	yes: "Yes",
	own: "Own only",
	no: "No"
};
//#endregion
export { canChangeItem as a, canDeleteTask as c, canManage as d, expiresText as f, requestState as g, memberActions as h, ROLE_LABEL as i, canEditTask as l, inviteRolesFor as m, PERMISSION_ROWS as n, canChangeVisibility as o, invitationProblem as p, ROLE_HELP as r, canDeleteComment as s, LEVEL_TEXT as t, canEditTeamDetails as u };
