import { t as supabase } from "./client-yXxN1BOn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/team-queries-DxvAyhx0.js
var TEAM_SETUP_MESSAGE = "Team invitations aren't set up in the database yet. Ask the project owner to run migration 0008_team_workflow.sql in Supabase.";
/** Database messages are already written for students; only missing-function errors need translating. */
function teamError(error) {
	const message = error?.message ?? "";
	if (error?.code === "PGRST202" || /could not find the function|schema cache/i.test(message)) return /* @__PURE__ */ new Error(TEAM_SETUP_MESSAGE);
	if (/permission denied/i.test(message)) return /* @__PURE__ */ new Error("You don't have permission to do that.");
	return new Error(message || "Something went wrong. Please try again.");
}
function ok(res) {
	if (res.error) throw teamError(res.error);
	return res.data;
}
async function createInviteLink(teamId, role) {
	return ok(await supabase.rpc("create_invite_link", {
		_team: teamId,
		_role: role
	}));
}
/** Invites a discoverable student; returns the invitation id (so it can be taken back). */
async function inviteStudent(teamId, userId, role = "member") {
	return ok(await supabase.rpc("invite_student", {
		_team: teamId,
		_user: userId,
		_role: role
	}));
}
async function revokeInvitation(id) {
	ok(await supabase.rpc("revoke_invitation", { _id: id }));
}
async function myInvitations() {
	return ok(await supabase.rpc("my_team_invitations")) ?? [];
}
async function previewInvitation(token) {
	return ok(await supabase.rpc("invitation_preview", { _token: token }))?.[0] ?? {
		team_id: null,
		team_name: null,
		role: null,
		inviter_name: null,
		member_count: 0,
		valid: false,
		reason: "not_found"
	};
}
async function acceptInvitation(token) {
	return ok(await supabase.rpc("redeem_invitation", { _token: token }));
}
async function declineInvitation(token) {
	ok(await supabase.rpc("decline_invitation", { _token: token }));
}
async function requestToJoin(teamId, message) {
	ok(await supabase.rpc("request_to_join", {
		_team: teamId,
		_message: message.trim() || null
	}));
}
async function cancelJoinRequest(requestId) {
	ok(await supabase.rpc("cancel_join_request", { _request: requestId }));
}
async function decideJoinRequest(requestId, approve) {
	ok(await supabase.rpc("decide_join_request", {
		_request: requestId,
		_approve: approve
	}));
}
async function teamJoinRequests(teamId) {
	return ok(await supabase.rpc("team_join_requests", { _team: teamId })) ?? [];
}
/** team id -> number of waiting join requests, for teams the caller manages. */
async function requestCounts() {
	const rows = ok(await supabase.rpc("team_request_counts")) ?? [];
	return Object.fromEntries(rows.map((r) => [r.team_id, r.pending]));
}
async function setMemberRole(teamId, userId, role) {
	ok(await supabase.rpc("set_member_role", {
		_team: teamId,
		_user: userId,
		_role: role
	}));
}
async function transferOwnership(teamId, userId) {
	ok(await supabase.rpc("transfer_ownership", {
		_team: teamId,
		_user: userId
	}));
}
async function removeMember(teamId, userId) {
	ok(await supabase.rpc("remove_member", {
		_team: teamId,
		_user: userId
	}));
}
/** Leaves the team; resolves to true when it was the owner's last seat and the team was deleted. */
async function leaveTeam(teamId) {
	return ok(await supabase.rpc("leave_team", { _team: teamId }));
}
async function ensureCourse(code, title) {
	return ok(await supabase.rpc("ensure_course", {
		_code: code,
		_title: title
	}));
}
//#endregion
export { transferOwnership as _, declineInvitation as a, leaveTeam as c, removeMember as d, requestCounts as f, teamJoinRequests as g, setMemberRole as h, decideJoinRequest as i, myInvitations as l, revokeInvitation as m, cancelJoinRequest as n, ensureCourse as o, requestToJoin as p, createInviteLink as r, inviteStudent as s, acceptInvitation as t, previewInvitation as u };
