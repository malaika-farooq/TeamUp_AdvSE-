import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as Button } from "./button-BkEFdjsN.mjs";
import { i as useQuery, o as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { I as FolderPlus, K as CircleCheck, Z as CalendarPlus, ct as Activity, f as Sparkles, i as Users, k as ListPlus, o as UserPlus, st as AlarmClock } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useAuth } from "./auth-Bitinyml.mjs";
import { E as fetchTasks, S as fetchNotifications, T as fetchSessions, b as fetchActivity, c as accentClasses, x as fetchMyTeams } from "./UserAvatar-CWAQ5zUT.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { i as CardSkeletons, o as EmptyState, r as Badge, s as ErrorState, t as AppShell } from "./states-BLyrGC0l.mjs";
import { n as useServerFn } from "./createSsrRpc-DdtAGDIv.mjs";
import { n as stagger, t as fadeUp } from "./motion-DF95JR_G.mjs";
import { t as Progress } from "./progress-BElPnoUY.mjs";
import { t as createSampleWorkspace } from "./sample.functions-syRnQCGo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-BoX7RzKE.js
var import_jsx_runtime = require_jsx_runtime();
function Dashboard() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const makeSample = useServerFn(createSampleWorkspace);
	const teamsQuery = useQuery({
		queryKey: ["teams"],
		queryFn: fetchMyTeams,
		enabled: !!user
	});
	const teamIds = (teamsQuery.data ?? []).map((t) => t.id);
	const tasksQuery = useQuery({
		queryKey: ["tasks", teamIds],
		queryFn: () => fetchTasks(teamIds),
		enabled: teamsQuery.isSuccess
	});
	const sessionsQuery = useQuery({
		queryKey: ["sessions", teamIds],
		queryFn: () => fetchSessions(teamIds),
		enabled: teamsQuery.isSuccess
	});
	const activityQuery = useQuery({
		queryKey: ["activity", teamIds],
		queryFn: () => fetchActivity(teamIds, 8),
		enabled: teamsQuery.isSuccess
	});
	const notificationsQuery = useQuery({
		queryKey: ["notifications"],
		queryFn: fetchNotifications,
		enabled: !!user
	});
	const teams = teamsQuery.data ?? [];
	const tasks = tasksQuery.data ?? [];
	const now = Date.now();
	const myTasks = tasks.filter((t) => t.assignee_id === user?.id || t.created_by === user?.id);
	const overdue = myTasks.filter((t) => t.status !== "done" && t.due_date && new Date(t.due_date).getTime() < now);
	const dueSoon = myTasks.filter((t) => t.status !== "done" && t.due_date && new Date(t.due_date).getTime() >= now && new Date(t.due_date).getTime() < now + 6048e5);
	const done = tasks.filter((t) => t.status === "done").length;
	const completion = tasks.length ? Math.round(done / tasks.length * 100) : 0;
	const upcoming = (sessionsQuery.data ?? []).filter((s) => new Date(s.starts_at).getTime() > now - 36e5);
	const unread = (notificationsQuery.data ?? []).filter((n) => !n.read_at);
	async function handleSample() {
		try {
			const res = await makeSample({ data: void 0 });
			toast.success(res.created ? "Sample workspace created" : "Sample workspace already exists");
			queryClient.invalidateQueries();
			navigate({
				to: "/teams/$teamId",
				params: { teamId: res.teamId }
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not create sample workspace");
		}
	}
	if (teamsQuery.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Dashboard",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
			message: teamsQuery.error.message,
			onRetry: () => teamsQuery.refetch()
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Dashboard",
		description: "Everything your study groups need this week.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "outline",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/discover",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "mr-1.5 size-4" }), "Join Team"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/teams",
				search: { create: true },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "mr-1.5 size-4" }), "Create Team"]
			})
		})] }),
		children: teamsQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletons, { count: 4 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			variants: stagger,
			initial: "hidden",
			animate: "show",
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					variants: fadeUp,
					className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Due in 7 days",
							value: dueSoon.length,
							tone: "text-primary",
							icon: AlarmClock
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Overdue",
							value: overdue.length,
							tone: "text-destructive",
							icon: AlarmClock
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Active teams",
							value: teams.length,
							tone: "text-teal",
							icon: Users
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Needs attention",
							value: unread.length,
							tone: "text-lavender",
							icon: Activity
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					variants: fadeUp,
					className: "surface-card p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: "Overall completion"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								done,
								" of ",
								tasks.length,
								" tasks across your teams"
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-2xl font-bold",
							children: [completion, "%"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
						value: completion,
						className: "mt-4"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					variants: fadeUp,
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickAction, {
							to: "/tasks",
							search: { create: true },
							icon: ListPlus,
							label: "Create Task"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickAction, {
							to: "/calendar",
							search: { create: true },
							icon: CalendarPlus,
							label: "Schedule Session"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickAction, {
							to: "/resources",
							search: { create: true },
							icon: FolderPlus,
							label: "Add Resource"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickAction, {
							to: "/assistant",
							icon: Sparkles,
							label: "Ask the AI assistant"
						})
					]
				}),
				teams.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					variants: fadeUp,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						icon: Users,
						title: "No teams yet",
						description: "Create your first study team, join a public one, or load a sample workspace to see how TeamUp works.",
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap justify-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/teams",
									search: { create: true },
									children: "Create a team"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: handleSample,
								children: "Create Sample Workspace"
							})]
						})
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 lg:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.section, {
							variants: fadeUp,
							className: "surface-card p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-semibold",
								children: "Tasks needing you"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "mt-3 space-y-2",
								children: [[...overdue, ...dueSoon].slice(0, 6).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate",
										children: t.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: t.due_date && new Date(t.due_date).getTime() < now ? "destructive" : "secondary",
										children: t.due_date ? new Date(t.due_date).toLocaleDateString() : "No date"
									})]
								}, t.id)), overdue.length + dueSoon.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-success" }), " Nothing due in the next week."]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.section, {
							variants: fadeUp,
							className: "surface-card p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-semibold",
								children: "Upcoming sessions"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "mt-3 space-y-2",
								children: [upcoming.slice(0, 5).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "rounded-lg border border-border p-3 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: s.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: [
											new Date(s.starts_at).toLocaleString(),
											" · ",
											s.location ?? "Online"
										]
									})]
								}, s.id)), upcoming.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground",
									children: "No sessions scheduled yet."
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.section, {
							variants: fadeUp,
							className: "surface-card p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-semibold",
								children: "Your teams"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-3 space-y-2",
								children: teams.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/teams/$teamId",
									params: { teamId: t.id },
									className: "hover-lift flex items-center justify-between rounded-lg border border-border p-3 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate font-medium",
										children: t.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: accentClasses(t.accent),
										variant: "outline",
										children: t.role
									})]
								}) }, t.id))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.section, {
							variants: fadeUp,
							className: "surface-card p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-semibold",
								children: "Recent team activity"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "mt-3 space-y-2",
								children: [(activityQuery.data ?? []).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "rounded-lg border border-border p-3 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: a.summary }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: new Date(a.created_at).toLocaleString()
									})]
								}, a.id)), (activityQuery.data ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground",
									children: "Activity will appear here as your team works."
								})]
							})]
						})
					]
				})
			]
		})
	});
}
function StatCard({ label, value, tone, icon: Icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface-card hover-lift p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium text-muted-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `size-4 ${tone}` })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: `mt-2 text-3xl font-bold ${tone}`,
			children: value
		})]
	});
}
function QuickAction({ to, search, icon: Icon, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		asChild: true,
		variant: "outline",
		size: "sm",
		className: "hover-lift",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to,
			search,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "mr-1.5 size-4" }), label]
		})
	});
}
//#endregion
export { Dashboard as component };
