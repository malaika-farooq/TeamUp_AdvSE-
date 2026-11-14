import { i as __toESM } from "../_runtime.mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as supabase } from "./client-yXxN1BOn.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { r as cn, t as Button } from "./button-BkEFdjsN.mjs";
import { i as useQuery, o as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { A as ListChecks, D as LogOut, L as FolderOpen, O as LoaderCircle, Q as CalendarDays, V as Copy, X as Check, a as UserRound, ct as Activity, i as Users, l as Trash2, t as X, x as Minus } from "../_libs/lucide-react.mjs";
import { c as Select, d as SelectTrigger, f as SelectValue, l as SelectContent, u as SelectItem } from "./ai-client-CJwzytaT.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useAuth } from "./auth-Bitinyml.mjs";
import { D as fetchTeamMembers, E as fetchTasks, L as parseCourse, T as fetchSessions, _ as courseLabel, b as fetchActivity, o as STATUSES, s as UserAvatar, t as ACCENTS, w as fetchResources } from "./UserAvatar-CWAQ5zUT.mjs";
import { t as Input } from "./input-o8_kklxJ.mjs";
import { t as Textarea } from "./textarea-DpZdO9KZ.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { i as CardSkeletons, o as EmptyState, r as Badge, s as ErrorState, t as AppShell } from "./states-BLyrGC0l.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-Bjv_scU6.mjs";
import { t as Label } from "./label-BEbnXoK8.mjs";
import { _ as transferOwnership, c as leaveTeam, d as removeMember, g as teamJoinRequests, h as setMemberRole, i as decideJoinRequest, m as revokeInvitation, o as ensureCourse, r as createInviteLink } from "./team-queries-DxvAyhx0.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-x-SErZBX.mjs";
import { f as expiresText, h as memberActions, i as ROLE_LABEL, m as inviteRolesFor, n as PERMISSION_ROWS, o as canChangeVisibility, t as LEVEL_TEXT, u as canEditTeamDetails } from "./team-rules-DG0EiWUj.mjs";
import { t as TaskBoard } from "./TaskBoard-BSF-VCxu.mjs";
import { t as SessionsPanel } from "./SessionsPanel-BhUgsaKx.mjs";
import { t as Progress } from "./progress-BElPnoUY.mjs";
import { t as InviteStudentSearch } from "./InviteStudents-DsWr23W4.mjs";
import { t as ResourcesPanel } from "./ResourcesPanel-DiV_xLZ6.mjs";
import { t as Route } from "./teams._teamId-CQBNGQnH.mjs";
import { a as Bar, i as CartesianGrid, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/teams._teamId-bVLdCvRF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ROLES = [
	"owner",
	"admin",
	"member"
];
function Cell({ level }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1 text-xs", level === "no" && "text-muted-foreground", level === "own" && "text-foreground"),
		children: [
			level === "yes" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
				className: "size-4 text-teal",
				"aria-hidden": "true"
			}),
			level === "own" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, {
				className: "size-4 text-blue",
				"aria-hidden": "true"
			}),
			level === "no" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {
				className: "size-4",
				"aria-hidden": "true"
			}),
			LEVEL_TEXT[level]
		]
	});
}
/** What each role can do in a team, with the viewer's own column highlighted. */
function PermissionTable({ myRole }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "surface-card overflow-x-auto p-5",
		"aria-label": "What each role can do",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-semibold",
				children: "What each role can do"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: [
					"You are ",
					myRole === "admin" ? "an" : "a",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: ROLE_LABEL[myRole].toLowerCase() }),
					" of this team. \"Own only\" means the things you created (for tasks, also ones assigned to you)."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "mt-3 w-full min-w-[480px] text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						scope: "col",
						className: "py-2 pr-3 font-medium text-muted-foreground",
						children: "Action"
					}), ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
						scope: "col",
						className: cn("px-3 py-2 font-medium", r === myRole && "rounded-t-lg bg-primary/10"),
						children: [ROLE_LABEL[r], r === myRole && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-1 text-xs font-normal text-muted-foreground",
							children: "(you)"
						})]
					}, r))]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: PERMISSION_ROWS.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border/60 last:border-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						scope: "row",
						className: "py-2 pr-3 text-left font-normal",
						children: row.label
					}), ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: cn("px-3 py-2", r === myRole && "bg-primary/10"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { level: row[r] })
					}, r))]
				}, row.label)) })]
			})
		]
	});
}
var selectClass = "h-9 w-full rounded-md border border-input bg-background px-2 text-sm";
/** Edit a team's details. Owners and admins can; only the owner can switch public/private. */
function TeamSettings({ team, myRole }) {
	const queryClient = useQueryClient();
	const editable = canEditTeamDetails(myRole);
	const mayChangeVisibility = canChangeVisibility(myRole);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		name: team.name,
		description: team.description ?? "",
		course: "",
		goal: team.project_goal ?? "",
		deadline: team.deadline ?? "",
		visibility: team.visibility,
		accent: team.accent
	});
	const courseQuery = useQuery({
		queryKey: ["course", team.course_id],
		enabled: !!team.course_id,
		queryFn: async () => {
			const { data } = await supabase.from("courses").select("code, title").eq("id", team.course_id).maybeSingle();
			return data ? courseLabel(data).replace(" · ", " ") : "";
		}
	});
	(0, import_react.useEffect)(() => {
		if (courseQuery.data !== void 0) setForm((f) => ({
			...f,
			course: courseQuery.data ?? ""
		}));
	}, [courseQuery.data]);
	async function save(e) {
		e.preventDefault();
		if (form.name.trim().length < 2) return void toast.error("A team name needs at least 2 characters.");
		setBusy(true);
		try {
			const course = parseCourse(form.course);
			const courseId = course ? await ensureCourse(course.code, course.title) : null;
			const { error } = await supabase.from("teams").update({
				name: form.name.trim(),
				description: form.description.trim() || null,
				course_id: courseId,
				project_goal: form.goal.trim() || null,
				deadline: form.deadline || null,
				accent: form.accent,
				...mayChangeVisibility ? { visibility: form.visibility } : {}
			}).eq("id", team.id);
			if (error) throw new Error(error.message);
			toast.success("Team settings saved");
			await queryClient.invalidateQueries();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Couldn't save the team settings.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: save,
		className: "surface-card max-w-2xl space-y-4 p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "ts-name",
					children: "Team name"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "ts-name",
					value: form.name,
					disabled: !editable,
					maxLength: 80,
					onChange: (e) => setForm({
						...form,
						name: e.target.value
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "ts-desc",
					children: "Description"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					id: "ts-desc",
					rows: 2,
					value: form.description,
					disabled: !editable,
					onChange: (e) => setForm({
						...form,
						description: e.target.value
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "ts-course",
						children: "Course"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "ts-course",
						placeholder: "CS201 Data Structures",
						value: form.course,
						disabled: !editable,
						onChange: (e) => setForm({
							...form,
							course: e.target.value
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "ts-deadline",
						children: "Deadline"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "ts-deadline",
						type: "date",
						value: form.deadline,
						disabled: !editable,
						onChange: (e) => setForm({
							...form,
							deadline: e.target.value
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "ts-goal",
					children: "Project goal"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					id: "ts-goal",
					rows: 2,
					value: form.goal,
					disabled: !editable,
					onChange: (e) => setForm({
						...form,
						goal: e.target.value
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "ts-visibility",
							children: "Who can find this team"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							id: "ts-visibility",
							className: selectClass,
							value: form.visibility,
							disabled: !mayChangeVisibility,
							onChange: (e) => setForm({
								...form,
								visibility: e.target.value
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "private",
								children: "Private: invite only"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "public",
								children: "Public: listed in Discover"
							})]
						}),
						!mayChangeVisibility && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Only the team owner can change this."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "ts-accent",
						children: "Accent colour"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						id: "ts-accent",
						className: selectClass,
						value: form.accent,
						disabled: !editable,
						onChange: (e) => setForm({
							...form,
							accent: e.target.value
						}),
						children: ACCENTS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: a,
							children: a
						}, a))
					})]
				})]
			}),
			form.visibility === "private" && team.visibility === "public" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Making this team private hides it from Discover. Current members stay, and open join requests are kept until someone answers them."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "submit",
				disabled: busy || !editable,
				children: [busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Save settings"]
			})
		]
	});
}
function TeamWorkspace() {
	const { teamId } = Route.useParams();
	const { user } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [createTaskOpen, setCreateTaskOpen] = (0, import_react.useState)(false);
	const [confirm, setConfirm] = (0, import_react.useState)(null);
	const [memberConfirm, setMemberConfirm] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const teamQuery = useQuery({
		queryKey: ["team", teamId],
		queryFn: async () => {
			const { data, error } = await supabase.from("teams").select("*").eq("id", teamId).single();
			if (error) throw new Error(error.message);
			return data;
		}
	});
	const membersQuery = useQuery({
		queryKey: ["members", teamId],
		queryFn: () => fetchTeamMembers(teamId)
	});
	const tasksQuery = useQuery({
		queryKey: ["tasks", [teamId]],
		queryFn: () => fetchTasks([teamId])
	});
	const sessionsQuery = useQuery({
		queryKey: ["sessions", [teamId]],
		queryFn: () => fetchSessions([teamId])
	});
	const resourcesQuery = useQuery({
		queryKey: ["resources", [teamId]],
		queryFn: () => fetchResources([teamId])
	});
	const activityQuery = useQuery({
		queryKey: ["activity", [teamId]],
		queryFn: () => fetchActivity([teamId], 50)
	});
	const invitationsQuery = useQuery({
		queryKey: ["invitations", teamId],
		queryFn: async () => {
			const { data } = await supabase.from("invitations").select("*").eq("team_id", teamId).order("created_at", { ascending: false });
			return data ?? [];
		}
	});
	const requestsQuery = useQuery({
		queryKey: ["join-requests", teamId],
		queryFn: async () => {
			try {
				return await teamJoinRequests(teamId);
			} catch {
				return [];
			}
		}
	});
	const inviteeIds = (invitationsQuery.data ?? []).map((i) => i.invitee_id).filter((id) => !!id);
	const inviteesQuery = useQuery({
		queryKey: [
			"invitees",
			teamId,
			inviteeIds.join(",")
		],
		enabled: inviteeIds.length > 0,
		queryFn: async () => {
			const { data } = await supabase.from("profiles").select("id, display_name").in("id", inviteeIds);
			return new Map((data ?? []).map((p) => [p.id, p.display_name]));
		}
	});
	(0, import_react.useEffect)(() => {
		const channel = supabase.channel(`team-${teamId}`).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "tasks"
		}, () => queryClient.invalidateQueries({ queryKey: ["tasks"] })).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "activity_logs"
		}, () => queryClient.invalidateQueries({ queryKey: ["activity"] })).subscribe();
		return () => {
			supabase.removeChannel(channel);
		};
	}, [teamId, queryClient]);
	const members = membersQuery.data ?? [];
	const myRole = members.find((m) => m.user_id === user?.id)?.role ?? "member";
	const canManage = myRole === "owner" || myRole === "admin";
	const isOwner = myRole === "owner";
	members.filter((m) => m.role === "owner");
	const tasks = tasksQuery.data ?? [];
	const done = tasks.filter((t) => t.status === "done").length;
	const completion = tasks.length ? Math.round(done / tasks.length * 100) : 0;
	const workload = (0, import_react.useMemo)(() => members.map((m) => ({
		name: (m.profile?.display_name ?? "Teammate").split(" ")[0],
		open: tasks.filter((t) => t.assignee_id === m.user_id && t.status !== "done").length,
		done: tasks.filter((t) => t.assignee_id === m.user_id && t.status === "done").length
	})), [members, tasks]);
	function refreshPeople() {
		queryClient.invalidateQueries({ queryKey: ["members", teamId] });
		queryClient.invalidateQueries({ queryKey: ["join-requests", teamId] });
		queryClient.invalidateQueries({ queryKey: ["invitations", teamId] });
		queryClient.invalidateQueries({ queryKey: ["activity"] });
		queryClient.invalidateQueries({ queryKey: ["teams"] });
		queryClient.invalidateQueries({ queryKey: ["request-counts"] });
	}
	/** Runs one action, shows its result and refreshes the lists. */
	async function act(key, work, success) {
		setBusy(key);
		try {
			await work();
			toast.success(success);
			refreshPeople();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Something went wrong. Please try again.");
		} finally {
			setBusy(null);
		}
	}
	async function createInvite(role) {
		setBusy(`link-${role}`);
		try {
			const token = await createInviteLink(teamId, role);
			const link = `${window.location.origin}/invite/${token}`;
			await navigator.clipboard.writeText(link).catch(() => void 0);
			toast.success("Invitation link created and copied. It works once and expires in 7 days.");
			refreshPeople();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Couldn't create the link.");
		} finally {
			setBusy(null);
		}
	}
	const revokeInvite = (id) => act(`revoke-${id}`, () => revokeInvitation(id), "Invitation cancelled");
	const decide = (requestId, approve) => act(`req-${requestId}`, () => decideJoinRequest(requestId, approve), approve ? "Request approved. They're now a member." : "Request declined");
	const changeRole = (userId, role) => act(`role-${userId}`, () => setMemberRole(teamId, userId, role), "Role updated");
	async function leave() {
		setBusy("leave");
		try {
			const deleted = await leaveTeam(teamId);
			toast.success(deleted ? "You were the only member, so the team was deleted." : "You left the team");
			queryClient.invalidateQueries();
			navigate({ to: "/teams" });
		} catch (e) {
			setConfirm(null);
			toast.error(e instanceof Error ? e.message : "Couldn't leave the team.");
		} finally {
			setBusy(null);
		}
	}
	async function deleteTeam() {
		const { error } = await supabase.from("teams").delete().eq("id", teamId);
		if (error) return void toast.error(error.message);
		toast.success("Team deleted");
		queryClient.invalidateQueries();
		navigate({ to: "/teams" });
	}
	if (teamQuery.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Team workspace",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletons, { count: 3 })
	});
	if (teamQuery.error || !teamQuery.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Team workspace",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { message: "You don't have access to this team, or it no longer exists." })
	});
	const team = teamQuery.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: team.name,
		description: team.description ?? "Your shared workspace.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				onClick: () => setConfirm("leave"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "mr-1.5 size-4" }), "Leave"]
			}), isOwner && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "destructive",
				onClick: () => setConfirm("delete"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-1.5 size-4" }), "Delete"]
			})]
		}),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "overview",
				className: "space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "flex w-full flex-wrap justify-start",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "overview",
								children: "Overview"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "tasks",
								children: "Task Board"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "calendar",
								children: "Calendar"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "resources",
								children: "Resources"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "members",
								children: ["Members", canManage && (requestsQuery.data ?? []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: "ml-2",
									"aria-label": `${(requestsQuery.data ?? []).length} join requests waiting`,
									children: (requestsQuery.data ?? []).length
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "activity",
								children: "Activity"
							}),
							canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "settings",
								children: "Settings"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "overview",
						className: "space-y-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
										label: "Tasks",
										value: String(tasks.length),
										icon: ListChecks
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
										label: "Completed",
										value: `${completion}%`,
										icon: Activity
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
										label: "Members",
										value: String(members.length),
										icon: Users
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
										label: "Sessions",
										value: String((sessionsQuery.data ?? []).length),
										icon: CalendarDays
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "surface-card space-y-3 p-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "font-semibold",
											children: "Project progress"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-sm text-muted-foreground",
											children: [
												done,
												" of ",
												tasks.length,
												" done"
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
										value: completion,
										className: "h-2.5"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid gap-3 sm:grid-cols-4",
										children: STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-xl border border-border p-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: s.label
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xl font-semibold",
												children: tasks.filter((t) => t.status === s.key).length
											})]
										}, s.key))
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "surface-card p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mb-3 font-semibold",
									children: "Workload by member"
								}), workload.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: "No members yet."
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-64",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
										width: "100%",
										height: "100%",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
											data: workload,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
													strokeDasharray: "3 3",
													opacity: .2
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
													dataKey: "name",
													fontSize: 12
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
													allowDecimals: false,
													fontSize: 12
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
													dataKey: "open",
													fill: "var(--color-blue)",
													radius: [
														6,
														6,
														0,
														0
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
													dataKey: "done",
													fill: "var(--color-teal)",
													radius: [
														6,
														6,
														0,
														0
													]
												})
											]
										})
									})
								})]
							}),
							team.project_goal && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "surface-card p-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-semibold",
										children: "Project goal"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted-foreground",
										children: team.project_goal
									}),
									team.deadline && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										className: "mt-3",
										variant: "secondary",
										children: ["Deadline ", new Date(team.deadline).toLocaleDateString()]
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "tasks",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskBoard, {
							tasks,
							teams: [team],
							defaultTeamId: teamId,
							createOpen: createTaskOpen,
							onCreateOpenChange: setCreateTaskOpen
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "calendar",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SessionsPanel, {
							sessions: sessionsQuery.data ?? [],
							tasks,
							teams: [team],
							defaultTeamId: teamId
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "resources",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResourcesPanel, {
							resources: resourcesQuery.data ?? [],
							teams: [team],
							defaultTeamId: teamId
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "members",
						className: "space-y-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "surface-card divide-y divide-border",
								children: members.map((m) => {
									const isSelf = m.user_id === user?.id;
									const actions = memberActions(myRole, m.role, isSelf);
									const name = m.profile?.display_name ?? "Teammate";
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-3 p-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
												name,
												path: m.profile?.avatar_url,
												className: "size-10"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0 flex-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "font-medium",
													children: [name, isSelf && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "ml-1.5 text-xs text-muted-foreground",
														children: "(you)"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-xs text-muted-foreground",
													children: [
														m.profile?.university ?? "—",
														" · joined",
														" ",
														new Date(m.joined_at).toLocaleDateString()
													]
												})]
											}),
											actions.changeRole ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: m.role,
												disabled: busy === `role-${m.user_id}`,
												onValueChange: (v) => changeRole(m.user_id, v),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "w-[130px]",
													"aria-label": `Role for ${name}`,
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "member",
													children: "Member"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "admin",
													children: "Admin"
												})] })]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: m.role === "owner" ? "default" : "secondary",
												children: ROLE_LABEL[m.role]
											}),
											actions.transfer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "outline",
												size: "sm",
												onClick: () => setMemberConfirm({
													kind: "transfer",
													userId: m.user_id,
													name
												}),
												children: "Make owner"
											}),
											actions.remove && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "ghost",
												size: "sm",
												onClick: () => setMemberConfirm({
													kind: "remove",
													userId: m.user_id,
													name
												}),
												children: "Remove"
											})
										]
									}, m.user_id);
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PermissionTable, { myRole }),
							canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "surface-card space-y-3 p-5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
											className: "font-semibold",
											children: ["Join requests", (requestsQuery.data ?? []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												className: "ml-2",
												children: (requestsQuery.data ?? []).length
											})]
										}), team.visibility !== "public" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: "This team is private, so students can't request to join. Invite people instead."
										})]
									}), (requestsQuery.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted-foreground",
										children: "No pending requests."
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "space-y-3",
										children: (requestsQuery.data ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "space-y-2 rounded-xl border border-border p-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex flex-wrap items-center gap-3",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
															name: r.name,
															path: r.avatar,
															className: "size-10"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "min-w-0 flex-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "font-medium",
																children: r.name
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																className: "truncate text-xs text-muted-foreground",
																children: [
																	[r.major, r.university].filter(Boolean).join(" · ") || "Student",
																	" · asked ",
																	new Date(r.requested_at).toLocaleDateString()
																]
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex gap-2",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
																size: "sm",
																disabled: busy === `req-${r.request_id}`,
																onClick: () => decide(r.request_id, true),
																children: [busy === `req-${r.request_id}` ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1.5 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mr-1.5 size-4" }), "Approve"]
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
																size: "sm",
																variant: "outline",
																disabled: busy === `req-${r.request_id}`,
																onClick: () => decide(r.request_id, false),
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mr-1.5 size-4" }), "Decline"]
															})]
														})
													]
												}),
												r.message && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-sm",
													children: [
														"“",
														r.message,
														"”"
													]
												}),
												r.skills.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "flex flex-wrap gap-1.5",
													children: r.skills.slice(0, 8).map((sk) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														variant: "secondary",
														className: "text-xs",
														children: sk
													}, sk))
												}),
												r.courses.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-xs text-muted-foreground",
													children: ["Courses: ", r.courses.slice(0, 4).join(", ")]
												})
											]
										}, r.request_id))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "surface-card space-y-4 p-5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-semibold",
										children: "Invite students"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InviteStudentSearch, {
										teamId,
										myRole,
										memberIds: members.map((m) => m.user_id),
										onInvited: refreshPeople
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "surface-card space-y-3 p-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "font-semibold",
											children: "Invitation links"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted-foreground",
											children: "A link works for one person and expires after 7 days. TeamUp doesn't send email, so share it yourself. You can cancel it any time."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex flex-wrap gap-2",
											children: inviteRolesFor(myRole).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												variant: r === "member" ? "default" : "outline",
												disabled: busy === `link-${r}`,
												onClick: () => createInvite(r),
												children: [
													busy === `link-${r}` && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }),
													"Create ",
													r,
													" link"
												]
											}, r))
										}),
										(invitationsQuery.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted-foreground",
											children: "No invitations yet."
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
											className: "space-y-2",
											children: (invitationsQuery.data ?? []).slice(0, 25).map((inv) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3 text-sm",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "min-w-0 truncate",
													children: [inv.invitee_id ? `To ${inviteesQuery.data?.get(inv.invitee_id) ?? "a student"}` : `Link ···${inv.token.slice(-6)}`, inv.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "ml-2 text-xs text-muted-foreground",
														children: expiresText(inv.expires_at)
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															variant: "secondary",
															children: inv.role
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															variant: inv.status === "pending" ? "default" : "outline",
															children: inv.status
														}),
														inv.status === "pending" && !inv.invitee_id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															size: "sm",
															variant: "ghost",
															"aria-label": "Copy invitation link",
															onClick: () => {
																navigator.clipboard.writeText(`${window.location.origin}/invite/${inv.token}`);
																toast.success("Link copied");
															},
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" })
														}),
														inv.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															size: "sm",
															variant: "ghost",
															disabled: busy === `revoke-${inv.id}`,
															onClick: () => revokeInvite(inv.id),
															children: "Cancel"
														})
													]
												})]
											}, inv.id))
										})
									]
								})
							] })
						]
					}),
					canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "settings",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamSettings, {
							team,
							myRole
						}, team.updated_at)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "activity",
						children: (activityQuery.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							icon: FolderOpen,
							title: "No activity yet",
							description: "Actions like task updates and new resources appear here."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "surface-card divide-y divide-border",
							children: (activityQuery.data ?? []).map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.li, {
								initial: {
									opacity: 0,
									x: -6
								},
								animate: {
									opacity: 1,
									x: 0
								},
								transition: {
									duration: .18,
									delay: i * .02
								},
								className: "p-4 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
										name: members.find((m) => m.user_id === a.actor_id)?.profile?.display_name ?? "Someone",
										path: members.find((m) => m.user_id === a.actor_id)?.profile?.avatar_url,
										className: "size-6",
										fallbackClassName: "text-[10px]"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										members.find((m) => m.user_id === a.actor_id)?.profile?.display_name ?? "Someone",
										" ",
										a.summary
									] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: new Date(a.created_at).toLocaleString()
								})]
							}, a.id))
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: !!confirm,
				onOpenChange: (v) => !v && setConfirm(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: confirm === "delete" ? "Delete this team?" : "Leave this team?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: confirm === "delete" ? "All tasks, sessions, resources and files for this team will be permanently removed." : isOwner && members.length > 1 ? "You own this team. Make another member the owner first (Members tab → Make owner), then you can leave." : isOwner ? "You're the only member, so leaving will delete the team and everything in it." : "You'll lose access to this team's tasks, files and sessions. Tasks assigned to you become unassigned." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					disabled: confirm === "leave" && isOwner && members.length > 1,
					onClick: confirm === "delete" ? deleteTeam : leave,
					children: confirm === "delete" ? "Delete team" : isOwner && members.length === 1 ? "Leave and delete" : "Leave team"
				})] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: !!memberConfirm,
				onOpenChange: (v) => !v && setMemberConfirm(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: memberConfirm?.kind === "transfer" ? `Make ${memberConfirm.name} the owner?` : `Remove ${memberConfirm?.name ?? "this person"}?` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: memberConfirm?.kind === "transfer" ? "They become the only owner and you become an admin. Only the new owner can undo this." : "They lose access to this team and their tasks become unassigned. They can ask to join again." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					onClick: () => {
						const c = memberConfirm;
						setMemberConfirm(null);
						if (!c) return;
						if (c.kind === "transfer") act(`own-${c.userId}`, () => transferOwnership(teamId, c.userId), `${c.name} is now the owner`);
						else act(`rm-${c.userId}`, () => removeMember(teamId, c.userId), `${c.name} was removed`);
					},
					children: memberConfirm?.kind === "transfer" ? "Transfer ownership" : "Remove"
				})] })] })
			})
		]
	});
}
function StatCard({ label, value, icon: Icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		initial: {
			opacity: 0,
			y: 10
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: { duration: .2 },
		className: "surface-card hover-lift flex items-center gap-3 p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "grid size-10 place-items-center rounded-xl bg-primary/10 text-primary",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-2xl font-semibold",
			children: value
		})] })]
	});
}
//#endregion
export { TeamWorkspace as component };
