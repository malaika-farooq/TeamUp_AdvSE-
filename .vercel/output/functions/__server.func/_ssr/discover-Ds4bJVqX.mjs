import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-yXxN1BOn.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as Button } from "./button-BkEFdjsN.mjs";
import { i as useQuery, o as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { H as Compass, O as LoaderCircle, i as Users, m as Search, o as UserPlus } from "../_libs/lucide-react.mjs";
import { a as DialogFooter, i as DialogDescription, n as Dialog, o as DialogHeader, r as DialogContent, s as DialogTitle } from "./ai-client-CJwzytaT.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useAuth } from "./auth-Bitinyml.mjs";
import { _ as courseLabel, c as accentClasses, s as UserAvatar, x as fetchMyTeams } from "./UserAvatar-CWAQ5zUT.mjs";
import { t as Input } from "./input-o8_kklxJ.mjs";
import { t as Textarea } from "./textarea-DpZdO9KZ.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { i as CardSkeletons, o as EmptyState, r as Badge, t as AppShell } from "./states-BLyrGC0l.mjs";
import { n as cancelJoinRequest, p as requestToJoin } from "./team-queries-DxvAyhx0.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-x-SErZBX.mjs";
import { d as canManage, g as requestState } from "./team-rules-DG0EiWUj.mjs";
import { n as stagger, t as fadeUp } from "./motion-DF95JR_G.mjs";
import { n as InviteToTeamDialog } from "./InviteStudents-DsWr23W4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/discover-Ds4bJVqX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Discover() {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [q, setQ] = (0, import_react.useState)("");
	const query = useQuery({
		queryKey: ["discover"],
		queryFn: async () => {
			const [teams, memberships, requests, courses] = await Promise.all([
				supabase.from("teams").select("*").eq("visibility", "public"),
				supabase.from("team_members").select("team_id"),
				supabase.from("join_requests").select("id, team_id, status, decided_at"),
				supabase.from("courses").select("*")
			]);
			if (teams.error) throw new Error(teams.error.message);
			return {
				teams: teams.data ?? [],
				memberIds: new Set((memberships.data ?? []).map((m) => m.team_id)),
				requests: requests.data ?? [],
				courses: courses.data ?? []
			};
		},
		enabled: !!user
	});
	const peopleQuery = useQuery({
		queryKey: ["discover-people"],
		queryFn: async () => {
			const [profiles, userSkills, skills, userCourses, courses] = await Promise.all([
				supabase.from("profiles").select("id, display_name, avatar_url, university, major, bio, timezone, is_sample").eq("discoverable", true),
				supabase.from("user_skills").select("user_id, skill_id, level"),
				supabase.from("skills").select("id, name"),
				supabase.from("user_courses").select("user_id, course_id"),
				supabase.from("courses").select("id, code, title")
			]);
			if (profiles.error) throw new Error(profiles.error.message);
			const skillName = new Map((skills.data ?? []).map((s) => [s.id, s.name]));
			const courseLabel$1 = new Map((courses.data ?? []).map((c) => [c.id, courseLabel(c)]));
			return (profiles.data ?? []).filter((p) => p.id !== user?.id).map((p) => ({
				...p,
				skills: (userSkills.data ?? []).filter((s) => s.user_id === p.id).map((s) => skillName.get(s.skill_id) ?? "").filter(Boolean),
				courses: (userCourses.data ?? []).filter((c) => c.user_id === p.id).map((c) => courseLabel$1.get(c.course_id) ?? "").filter(Boolean)
			}));
		},
		enabled: !!user
	});
	const term = q.trim().toLowerCase();
	const courseName = (id) => {
		const c = query.data?.courses.find((x) => x.id === id);
		return c ? `${c.code} ${c.title}` : null;
	};
	const results = (query.data?.teams ?? []).filter((t) => {
		if (!term) return true;
		return t.name.toLowerCase().includes(term) || (t.description ?? "").toLowerCase().includes(term) || (t.project_goal ?? "").toLowerCase().includes(term) || (courseName(t.course_id) ?? "").toLowerCase().includes(term);
	});
	const [askTeam, setAskTeam] = (0, import_react.useState)(null);
	const [askMessage, setAskMessage] = (0, import_react.useState)("");
	const [asking, setAsking] = (0, import_react.useState)(false);
	const [cancelling, setCancelling] = (0, import_react.useState)(null);
	const [inviting, setInviting] = (0, import_react.useState)(null);
	const managedTeams = (useQuery({
		queryKey: ["teams"],
		queryFn: fetchMyTeams,
		enabled: !!user
	}).data ?? []).filter((t) => canManage(t.role)).map((t) => ({
		id: t.id,
		name: t.name,
		role: t.role
	}));
	async function sendRequest() {
		if (!askTeam) return;
		setAsking(true);
		try {
			await requestToJoin(askTeam.id, askMessage);
			toast.success(`Request sent. The owners of ${askTeam.name} will review it.`);
			setAskTeam(null);
			setAskMessage("");
			await queryClient.invalidateQueries({ queryKey: ["discover"] });
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Couldn't send your request.");
		} finally {
			setAsking(false);
		}
	}
	async function withdraw(requestId) {
		setCancelling(requestId);
		try {
			await cancelJoinRequest(requestId);
			toast.success("Request cancelled.");
			await queryClient.invalidateQueries({ queryKey: ["discover"] });
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Couldn't cancel the request.");
		} finally {
			setCancelling(null);
		}
	}
	const people = (peopleQuery.data ?? []).filter((p) => {
		if (!term) return true;
		return p.display_name.toLowerCase().includes(term) || (p.university ?? "").toLowerCase().includes(term) || (p.major ?? "").toLowerCase().includes(term) || (p.bio ?? "").toLowerCase().includes(term) || p.skills.some((s) => s.toLowerCase().includes(term)) || p.courses.some((c) => c.toLowerCase().includes(term));
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Discover",
		description: "Public study teams and classmates open to collaborating.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mb-5 max-w-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: q,
					onChange: (e) => setQ(e.target.value),
					placeholder: "Search by course, skill or keyword",
					className: "pl-9",
					"aria-label": "Search teams and people"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "teams",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "mb-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "teams",
							children: "Teams"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "people",
							children: "People"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "people",
						children: peopleQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletons, {}) : people.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							icon: Users,
							title: "No classmates match",
							description: "Only students who turned on discoverability in Settings appear here."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
							variants: stagger,
							initial: "hidden",
							animate: "show",
							className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
							children: people.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.article, {
								variants: fadeUp,
								className: "surface-card hover-lift p-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start gap-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
												name: p.display_name,
												path: p.avatar_url,
												className: "size-10"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
													className: "truncate font-semibold",
													children: p.display_name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "truncate text-xs text-muted-foreground",
													children: [p.major, p.university].filter(Boolean).join(" · ") || "Student"
												})]
											}),
											p.is_sample && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "ml-auto shrink-0",
												children: "Sample"
											})
										]
									}),
									p.bio && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 line-clamp-2 text-sm text-muted-foreground",
										children: p.bio
									}),
									p.skills.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 flex flex-wrap gap-1.5",
										children: p.skills.slice(0, 5).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "secondary",
											className: "text-xs",
											children: s
										}, s))
									}),
									p.courses.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 text-xs text-muted-foreground",
										children: ["Courses: ", p.courses.slice(0, 3).join(", ")]
									}),
									managedTeams.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "outline",
										className: "mt-4",
										onClick: () => setInviting({
											id: p.id,
											name: p.display_name
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "mr-1.5 size-4" }), "Invite to a team"]
									})
								]
							}, p.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "teams",
						children: query.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletons, {}) : results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							icon: Compass,
							title: "No public teams match",
							description: "Try a different keyword, or create a public team so classmates can find you."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
							variants: stagger,
							initial: "hidden",
							animate: "show",
							className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
							children: results.map((t) => {
								const isMember = query.data?.memberIds.has(t.id);
								const myRequest = query.data?.requests.find((r) => r.team_id === t.id);
								const state = requestState(myRequest);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.article, {
									variants: fadeUp,
									className: "surface-card hover-lift p-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-start justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "font-semibold",
												children: t.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: accentClasses(t.accent),
												children: "public"
											})]
										}),
										courseName(t.course_id) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: courseName(t.course_id)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 line-clamp-3 text-sm text-muted-foreground",
											children: t.description || t.project_goal || "No description yet."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-4",
											children: isMember ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "secondary",
												children: "You're a member"
											}) : state.kind === "pending" && myRequest ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "secondary",
													children: "Request pending"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "sm",
													variant: "ghost",
													disabled: cancelling === myRequest.id,
													onClick: () => withdraw(myRequest.id),
													children: [cancelling === myRequest.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1.5 size-4 animate-spin" }), "Cancel request"]
												})]
											}) : state.kind === "wait" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
												variant: "outline",
												children: ["Declined. You can ask again on ", state.retryOn.toLocaleDateString()]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												onClick: () => setAskTeam({
													id: t.id,
													name: t.name
												}),
												children: "Request to join"
											})
										})
									]
								}, t.id);
							})
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!askTeam,
				onOpenChange: (v) => !v && setAskTeam(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Request to join ", askTeam?.name] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "The team owner and admins will see your name, courses and skills with your message, then approve or decline." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								"aria-label": "Message to the team",
								rows: 3,
								maxLength: 300,
								placeholder: "Say hi and why you would like to join (optional)",
								value: askMessage,
								onChange: (e) => setAskMessage(e.target.value)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [askMessage.length, "/300"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => setAskTeam(null),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: sendRequest,
							disabled: asking,
							children: [asking && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Send request"]
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InviteToTeamDialog, {
				person: inviting,
				teams: managedTeams,
				open: !!inviting,
				onOpenChange: (v) => !v && setInviting(null)
			})
		]
	});
}
//#endregion
export { Discover as component };
