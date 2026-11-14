import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-yXxN1BOn.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as Button } from "./button-BkEFdjsN.mjs";
import { i as useQuery } from "../_libs/tanstack__react-query.mjs";
import { O as LoaderCircle, X as Check, m as Search, o as UserPlus } from "../_libs/lucide-react.mjs";
import { a as DialogFooter, i as DialogDescription, n as Dialog, o as DialogHeader, r as DialogContent, s as DialogTitle } from "./ai-client-CJwzytaT.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { s as UserAvatar } from "./UserAvatar-CWAQ5zUT.mjs";
import { t as Input } from "./input-o8_kklxJ.mjs";
import { t as Label } from "./label-BEbnXoK8.mjs";
import { s as inviteStudent } from "./team-queries-DxvAyhx0.mjs";
import { i as ROLE_LABEL, m as inviteRolesFor, r as ROLE_HELP } from "./team-rules-DG0EiWUj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/InviteStudents-DsWr23W4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var selectClass = "h-9 rounded-md border border-input bg-background px-2 text-sm";
/** Choose which of your teams to invite one student to (used from Discover). */
function InviteToTeamDialog({ person, teams, open, onOpenChange }) {
	const [teamId, setTeamId] = (0, import_react.useState)("");
	const [role, setRole] = (0, import_react.useState)("member");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const team = teams.find((t) => t.id === teamId) ?? teams[0];
	const roles = inviteRolesFor(team?.role);
	const chosenRole = roles.includes(role) ? role : "member";
	async function send() {
		if (!person || !team) return;
		setBusy(true);
		try {
			await inviteStudent(team.id, person.id, chosenRole);
			toast.success(`Invitation sent to ${person.name}.`);
			onOpenChange(false);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Couldn't send the invitation.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: [
					"Invite ",
					person?.name ?? "a student",
					" to a team"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "They get a notification and can accept or decline. You can take the invitation back until they answer." })] }),
				teams.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "You can invite people to teams you own or administer. Create a team first."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "inv-team",
							children: "Team"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							id: "inv-team",
							className: `${selectClass} w-full`,
							value: team?.id,
							onChange: (e) => setTeamId(e.target.value),
							children: teams.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: t.id,
								children: [
									t.name,
									" (",
									ROLE_LABEL[t.role],
									")"
								]
							}, t.id))
						})]
					}), roles.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "inv-role",
								children: "Their role"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								id: "inv-role",
								className: `${selectClass} w-full`,
								value: chosenRole,
								onChange: (e) => setRole(e.target.value),
								children: roles.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: r,
									children: ROLE_LABEL[r]
								}, r))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: ROLE_HELP[chosenRole]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: () => onOpenChange(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: send,
					disabled: busy || teams.length === 0,
					children: [busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Send invitation"]
				})] })
			]
		})
	});
}
/** Search discoverable students by name and invite them to one team (used on the team's Members tab). */
function InviteStudentSearch({ teamId, myRole, memberIds, onInvited }) {
	const [term, setTerm] = (0, import_react.useState)("");
	const [role, setRole] = (0, import_react.useState)("member");
	const [sent, setSent] = (0, import_react.useState)({});
	const [busy, setBusy] = (0, import_react.useState)(null);
	const roles = inviteRolesFor(myRole);
	const chosenRole = roles.includes(role) ? role : "member";
	const clean = term.trim();
	const results = useQuery({
		queryKey: [
			"invite-search",
			teamId,
			clean
		],
		enabled: clean.length >= 2,
		queryFn: async () => {
			const escaped = clean.replace(/[\\%_]/g, "\\$&");
			const { data, error } = await supabase.from("profiles").select("id, display_name, avatar_url, university, major").eq("discoverable", true).ilike("display_name", `%${escaped}%`).limit(12);
			if (error) throw new Error(error.message);
			return data ?? [];
		}
	});
	async function invite(id, name) {
		setBusy(id);
		try {
			await inviteStudent(teamId, id, chosenRole);
			setSent((s) => ({
				...s,
				[id]: true
			}));
			toast.success(`Invitation sent to ${name}.`);
			onInvited();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Couldn't send the invitation.");
		} finally {
			setBusy(null);
		}
	}
	const people = (results.data ?? []).filter((p) => !memberIds.includes(p.id));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative min-w-[200px] flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"aria-label": "Search students by name",
						className: "pl-9",
						placeholder: "Search students by name",
						value: term,
						onChange: (e) => setTerm(e.target.value)
					})]
				}), roles.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					"aria-label": "Role for the invited student",
					className: selectClass,
					value: chosenRole,
					onChange: (e) => setRole(e.target.value),
					children: roles.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: r,
						children: ["Invite as ", ROLE_LABEL[r].toLowerCase()]
					}, r))
				})]
			}),
			clean.length >= 2 && results.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }),
			clean.length >= 2 && !results.isLoading && people.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No matching students. Only students who chose to be discoverable can be invited by name."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: people.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3 rounded-xl border border-border p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
							name: p.display_name,
							path: p.avatar_url,
							className: "size-9"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-medium",
								children: p.display_name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-xs text-muted-foreground",
								children: [p.major, p.university].filter(Boolean).join(" · ") || "Student"
							})]
						}),
						sent[p.id] ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1 text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }), "Invited"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							disabled: busy === p.id,
							onClick: () => invite(p.id, p.display_name),
							children: [busy === p.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1.5 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "mr-1.5 size-4" }), "Invite"]
						})
					]
				}, p.id))
			})
		]
	});
}
//#endregion
export { InviteToTeamDialog as n, InviteStudentSearch as t };
