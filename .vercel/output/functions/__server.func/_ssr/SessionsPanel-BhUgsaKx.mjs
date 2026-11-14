import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-yXxN1BOn.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { r as cn, t as Button } from "./button-BkEFdjsN.mjs";
import { i as useQuery, o as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { E as MapPin, O as LoaderCircle, Q as CalendarDays, U as Clock, g as Plus, l as Trash2, m as Search } from "../_libs/lucide-react.mjs";
import { a as DialogFooter, c as Select, d as SelectTrigger, f as SelectValue, i as DialogDescription, l as SelectContent, n as Dialog, o as DialogHeader, r as DialogContent, s as DialogTitle, u as SelectItem } from "./ai-client-CJwzytaT.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useAuth } from "./auth-Bitinyml.mjs";
import { D as fetchTeamMembers, I as notify, P as logActivity } from "./UserAvatar-CWAQ5zUT.mjs";
import { t as Input } from "./input-o8_kklxJ.mjs";
import { t as Textarea } from "./textarea-DpZdO9KZ.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { o as EmptyState, r as Badge } from "./states-BLyrGC0l.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-Bjv_scU6.mjs";
import { t as Label } from "./label-BEbnXoK8.mjs";
import { t as Switch } from "./switch-BCZQSDb-.mjs";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-x-SErZBX.mjs";
import { a as canChangeItem } from "./team-rules-DG0EiWUj.mjs";
import { t as useTeamRoles } from "./use-team-roles-Dom1WBFT.mjs";
import { n as TaskPanel, r as taskErrorMessage } from "./TaskBoard-BSF-VCxu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SessionsPanel-BhUgsaKx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var WEEKDAYS = [
	"Sun",
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat"
];
function expandSessions(sessions, from, to) {
	const out = [];
	for (const s of sessions) {
		const start = new Date(s.starts_at);
		const end = new Date(s.ends_at);
		const duration = end.getTime() - start.getTime();
		if (s.recurrence !== "weekly") {
			if (start >= from && start <= to) out.push({
				session: s,
				start,
				end,
				occurrenceKey: `${s.id}:${start.toISOString()}`
			});
			continue;
		}
		const until = s.recurrence_end ? new Date(s.recurrence_end) : to;
		let cursor = new Date(start);
		while (cursor <= to && cursor <= until) {
			if (cursor >= from) out.push({
				session: s,
				start: new Date(cursor),
				end: new Date(cursor.getTime() + duration),
				occurrenceKey: `${s.id}:${cursor.toISOString()}`
			});
			cursor = new Date(cursor.getTime() + 6048e5);
		}
	}
	return out.sort((a, b) => a.start.getTime() - b.start.getTime());
}
function SessionsPanel({ sessions, tasks, teams, defaultTeamId }) {
	const [view, setView] = (0, import_react.useState)("month");
	const [anchor, setAnchor] = (0, import_react.useState)(() => /* @__PURE__ */ new Date());
	const [createOpen, setCreateOpen] = (0, import_react.useState)(false);
	const [finderOpen, setFinderOpen] = (0, import_react.useState)(false);
	const [openTask, setOpenTask] = (0, import_react.useState)(null);
	const { user } = useAuth();
	const { roleIn } = useTeamRoles();
	const queryClient = useQueryClient();
	const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const [deleting, setDeleting] = (0, import_react.useState)(null);
	async function deleteSession() {
		if (!deleting) return;
		const { error } = await supabase.from("sessions").delete().eq("id", deleting.id);
		setDeleting(null);
		if (error) return void toast.error(error.message);
		toast.success("Session deleted");
		queryClient.invalidateQueries({ queryKey: ["sessions"] });
		queryClient.invalidateQueries({ queryKey: ["activity"] });
	}
	const openTaskMembers = useQuery({
		queryKey: ["members", openTask?.team_id],
		queryFn: () => fetchTeamMembers(openTask.team_id),
		enabled: !!openTask
	}).data ?? [];
	const nameOf = (id) => id ? openTaskMembers.find((m) => m.user_id === id)?.profile?.display_name ?? "Teammate" : "Unassigned";
	async function changeTaskStatus(task, status) {
		if (task.status === status) return;
		const { error } = await supabase.from("tasks").update({
			status,
			completed_at: status === "done" ? (/* @__PURE__ */ new Date()).toISOString() : null,
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", task.id);
		if (error) return void toast.error(`Couldn't save that change. ${taskErrorMessage(error)}`);
		if (user) await logActivity(task.team_id, user.id, "task_updated", `moved "${task.title}" to ${status.replace("_", " ")}`, task.id);
		setOpenTask({
			...task,
			status
		});
		queryClient.invalidateQueries({ queryKey: ["tasks"] });
		queryClient.invalidateQueries({ queryKey: ["activity"] });
	}
	const range = (0, import_react.useMemo)(() => {
		if (view === "week") {
			const start = new Date(anchor);
			start.setDate(start.getDate() - start.getDay());
			start.setHours(0, 0, 0, 0);
			return {
				start,
				end: new Date(start.getTime() + 6048e5)
			};
		}
		if (view === "agenda") {
			const start = /* @__PURE__ */ new Date();
			start.setHours(0, 0, 0, 0);
			return {
				start,
				end: new Date(start.getTime() + 5184e6)
			};
		}
		return {
			start: new Date(anchor.getFullYear(), anchor.getMonth(), 1),
			end: new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 23, 59, 59)
		};
	}, [view, anchor]);
	const occurrences = (0, import_react.useMemo)(() => expandSessions(sessions, range.start, range.end), [sessions, range]);
	const deadlines = (0, import_react.useMemo)(() => tasks.filter((t) => t.due_date && new Date(t.due_date) >= range.start && new Date(t.due_date) <= range.end).map((t) => ({
		task: t,
		date: new Date(t.due_date)
	})), [tasks, range]);
	const overlaps = (0, import_react.useMemo)(() => {
		const keys = /* @__PURE__ */ new Set();
		for (let i = 0; i < occurrences.length; i++) for (let j = i + 1; j < occurrences.length; j++) {
			const a = occurrences[i];
			const b = occurrences[j];
			if (a && b && a.end > b.start && a.start < b.end) {
				keys.add(a.occurrenceKey);
				keys.add(b.occurrenceKey);
			}
		}
		return keys;
	}, [occurrences]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
						value: view,
						onValueChange: (v) => setView(v),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "month",
								children: "Month"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "week",
								children: "Week"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "agenda",
								children: "Agenda"
							})
						] })
					}),
					view !== "agenda" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setAnchor((d) => view === "week" ? /* @__PURE__ */ new Date(d.getTime() - 6048e5) : new Date(d.getFullYear(), d.getMonth() - 1, 1)),
								children: "Prev"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setAnchor(/* @__PURE__ */ new Date()),
								children: "Today"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setAnchor((d) => view === "week" ? new Date(d.getTime() + 6048e5) : new Date(d.getFullYear(), d.getMonth() + 1, 1)),
								children: "Next"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							anchor.toLocaleDateString(void 0, {
								month: "long",
								year: "numeric"
							}),
							" · times shown in ",
							tz
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: () => setFinderOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "mr-1.5 size-4" }), "Find a meeting time"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => setCreateOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 size-4" }), "Schedule session"]
						})]
					})
				]
			}),
			view === "month" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthGrid, {
				anchor,
				occurrences,
				deadlines,
				overlaps,
				onOpenTask: setOpenTask
			}),
			view !== "month" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					occurrences.length === 0 && deadlines.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						icon: CalendarDays,
						title: "Nothing scheduled",
						description: "Create a study session or add task due dates to see them here."
					}),
					occurrences.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 8
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: { duration: .2 },
						className: "surface-card flex flex-wrap items-center justify-between gap-2 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: o.session.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								o.start.toLocaleString(),
								" –",
								" ",
								o.end.toLocaleTimeString([], { timeStyle: "short" }),
								o.session.location ? ` · ${o.session.location}` : ""
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								overlaps.has(o.occurrenceKey) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "destructive",
									children: "Overlaps"
								}),
								o.session.recurrence === "weekly" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									children: "Weekly"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RsvpButtons, { sessionId: o.session.id }),
								canChangeItem(roleIn(o.session.team_id), user?.id, o.session) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "ghost",
									"aria-label": `Delete ${o.session.title}`,
									onClick: () => setDeleting({
										id: o.session.id,
										title: o.session.title,
										weekly: o.session.recurrence === "weekly"
									}),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
								})
							]
						})]
					}, o.occurrenceKey)),
					deadlines.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setOpenTask(d.task),
						className: "flex w-full items-center justify-between rounded-xl border border-dashed border-border p-4 text-left transition-colors hover:border-lavender/50 hover:bg-lavender/5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: d.task.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: d.date.toLocaleString()
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							className: "bg-lavender/15 text-lavender",
							variant: "outline",
							children: "Task deadline"
						})]
					}, d.task.id))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: !!deleting,
				onOpenChange: (v) => !v && setDeleting(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, { children: [
					"Delete \"",
					deleting?.title,
					"\"?"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: deleting?.weekly ? "This removes the whole weekly series and everyone's replies." : "This removes the session and everyone's replies." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Keep it" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					onClick: deleteSession,
					children: "Delete session"
				})] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateSessionDialog, {
				open: createOpen,
				onOpenChange: setCreateOpen,
				teams,
				defaultTeamId
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingFinder, {
				open: finderOpen,
				onOpenChange: setFinderOpen,
				teams,
				defaultTeamId
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskPanel, {
				task: openTask,
				onClose: () => setOpenTask(null),
				onStatusChange: changeTaskStatus,
				nameOf,
				members: openTaskMembers
			})
		]
	});
}
function MonthGrid({ anchor, occurrences, deadlines, overlaps, onOpenTask }) {
	const startPad = new Date(anchor.getFullYear(), anchor.getMonth(), 1).getDay();
	const daysInMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();
	const cells = Array.from({ length: startPad + daysInMonth }, (_, i) => i < startPad ? null : i - startPad + 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-hidden rounded-2xl border border-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-7 bg-muted/60 text-xs font-semibold text-muted-foreground",
			children: WEEKDAYS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-2 text-center",
				children: d
			}, d))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-7",
			children: cells.map((day, i) => {
				const date = day ? new Date(anchor.getFullYear(), anchor.getMonth(), day) : null;
				const dayOcc = date ? occurrences.filter((o) => o.start.toDateString() === date.toDateString()) : [];
				const dayDl = date ? deadlines.filter((d) => d.date.toDateString() === date.toDateString()) : [];
				const isToday = date && date.toDateString() === (/* @__PURE__ */ new Date()).toDateString();
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("min-h-24 border-b border-r border-border p-1.5 text-xs", !day && "bg-muted/30", isToday && "bg-primary/5"),
					children: [day && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("mb-1 font-medium", isToday && "text-primary"),
						children: day
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [dayOcc.slice(0, 3).map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: cn("truncate rounded bg-teal/15 px-1 py-0.5 text-teal", overlaps.has(o.occurrenceKey) && "bg-destructive/15 text-destructive"),
							title: o.session.title,
							children: [
								o.start.toLocaleTimeString([], { timeStyle: "short" }),
								" ",
								o.session.title
							]
						}, o.occurrenceKey)), dayDl.slice(0, 2).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => onOpenTask(d.task),
							className: "block w-full truncate rounded bg-lavender/15 px-1 py-0.5 text-left text-lavender transition-colors hover:bg-lavender/30",
							title: d.task.title,
							children: ["Due: ", d.task.title]
						}, d.task.id))]
					})]
				}, i);
			})
		})]
	});
}
function RsvpButtons({ sessionId }) {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [status, setStatus] = (0, import_react.useState)(null);
	async function rsvp(value) {
		if (!user) return;
		const { error } = await supabase.from("session_attendees").upsert({
			session_id: sessionId,
			user_id: user.id,
			status: value
		}, { onConflict: "session_id,user_id" });
		if (error) return void toast.error(error.message);
		setStatus(value);
		toast.success(`Marked as ${value}`);
		queryClient.invalidateQueries({ queryKey: ["sessions"] });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
		value: status ?? "",
		onValueChange: (v) => rsvp(v),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
			className: "h-8 w-[130px] text-xs",
			"aria-label": "Your response",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "RSVP" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
				value: "accepted",
				children: "Going"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
				value: "tentative",
				children: "Maybe"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
				value: "declined",
				children: "Can't make it"
			})
		] })]
	});
}
function CreateSessionDialog({ open, onOpenChange, teams, defaultTeamId }) {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [teamId, setTeamId] = (0, import_react.useState)(defaultTeamId ?? teams[0]?.id ?? "");
	const [weekly, setWeekly] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		title: "",
		description: "",
		start: "",
		end: "",
		location: "",
		recurrenceEnd: ""
	});
	async function submit(e) {
		e.preventDefault();
		if (!user || !teamId) return;
		setBusy(true);
		const { data, error } = await supabase.from("sessions").insert({
			team_id: teamId,
			title: form.title,
			description: form.description || null,
			starts_at: new Date(form.start).toISOString(),
			ends_at: new Date(form.end).toISOString(),
			location: form.location || null,
			created_by: user.id,
			recurrence: weekly ? "weekly" : "none",
			recurrence_end: weekly && form.recurrenceEnd ? new Date(form.recurrenceEnd).toISOString() : null
		}).select("id").single();
		if (error) {
			setBusy(false);
			toast.error(error.message);
			return;
		}
		const members = await fetchTeamMembers(teamId);
		await supabase.from("session_attendees").insert(members.map((m) => ({
			session_id: data.id,
			user_id: m.user_id,
			status: m.user_id === user.id ? "accepted" : "invited"
		})));
		await logActivity(teamId, user.id, "session_created", `scheduled "${form.title}"`, data.id);
		await Promise.all(members.filter((m) => m.user_id !== user.id).map((m) => notify(m.user_id, "session_scheduled", "New study session", form.title, "/calendar")));
		setBusy(false);
		toast.success("Session scheduled");
		onOpenChange(false);
		queryClient.invalidateQueries();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90vh] overflow-y-auto sm:max-w-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Schedule a session" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Times are stored in UTC and shown in each member's timezone." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "st",
							children: "Title"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "st",
							required: true,
							value: form.title,
							onChange: (e) => setForm({
								...form,
								title: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Team" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: teamId,
							onValueChange: setTeamId,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: teams.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: t.id,
								children: t.name
							}, t.id)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "ss",
								children: "Starts"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "ss",
								type: "datetime-local",
								required: true,
								value: form.start,
								onChange: (e) => setForm({
									...form,
									start: e.target.value
								})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "se",
								children: "Ends"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "se",
								type: "datetime-local",
								required: true,
								value: form.end,
								onChange: (e) => setForm({
									...form,
									end: e.target.value
								})
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "sl",
							children: "Location or link"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "sl",
							value: form.location,
							onChange: (e) => setForm({
								...form,
								location: e.target.value
							}),
							placeholder: "Library room 3B or a meeting link"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "sd",
							children: "Description"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "sd",
							rows: 2,
							value: form.description,
							onChange: (e) => setForm({
								...form,
								description: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-xl border border-border p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "Repeat weekly"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Same day and time each week."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: weekly,
							onCheckedChange: setWeekly
						})]
					}),
					weekly && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "sre",
							children: "Repeat until"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "sre",
							type: "date",
							value: form.recurrenceEnd,
							onChange: (e) => setForm({
								...form,
								recurrenceEnd: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: () => onOpenChange(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						disabled: busy || !teamId,
						children: [busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Schedule"]
					})] })
				]
			})]
		})
	});
}
function MeetingFinder({ open, onOpenChange, teams, defaultTeamId }) {
	const [teamId, setTeamId] = (0, import_react.useState)(defaultTeamId ?? teams[0]?.id ?? "");
	const [duration, setDuration] = (0, import_react.useState)("60");
	const result = useQuery({
		queryKey: [
			"find-time",
			teamId,
			duration
		],
		enabled: open && !!teamId,
		queryFn: async () => {
			const ids = (await fetchTeamMembers(teamId)).map((m) => m.user_id);
			const { data: slots, error } = await supabase.from("availability_slots").select("*").in("user_id", ids);
			if (error) throw new Error(error.message);
			const need = Number(duration);
			const buckets = /* @__PURE__ */ new Map();
			(slots ?? []).forEach((s) => {
				for (let m = s.start_minute; m + need <= s.end_minute; m += 30) {
					const key = `${s.weekday}:${m}`;
					if (!buckets.has(key)) buckets.set(key, /* @__PURE__ */ new Set());
					buckets.get(key).add(s.user_id);
				}
			});
			return {
				options: Array.from(buckets.entries()).map(([key, users]) => {
					const parts = key.split(":").map(Number);
					return {
						weekday: parts[0] ?? 0,
						minute: parts[1] ?? 0,
						count: users.size
					};
				}).sort((a, b) => b.count - a.count || a.weekday - b.weekday || a.minute - b.minute).slice(0, 8),
				total: ids.length,
				withAvailability: new Set((slots ?? []).map((s) => s.user_id)).size
			};
		}
	});
	const fmt = (minute) => `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Find a meeting time" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Based only on the weekly availability teammates saved themselves." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: teamId,
						onValueChange: setTeamId,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							"aria-label": "Team",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: teams.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: t.id,
							children: t.name
						}, t.id)) })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: duration,
						onValueChange: setDuration,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							"aria-label": "Duration",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "30",
								children: "30 minutes"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "60",
								children: "1 hour"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "120",
								children: "2 hours"
							})
						] })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [
						result.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 inline size-4 animate-spin" }), "Checking availability…"]
						}),
						result.data && result.data.options.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No shared availability yet. Ask teammates to fill in their weekly availability in Settings."
						}),
						result.data?.options.map((o) => {
							const everyone = o.count === result.data.total;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between rounded-xl border border-border p-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4 text-muted-foreground" }),
										WEEKDAYS[o.weekday] ?? "",
										" at ",
										fmt(o.minute)
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: everyone ? "default" : "secondary",
									children: everyone ? "Everyone free" : `${o.count} of ${result.data.total} free`
								})]
							}, `${o.weekday}-${o.minute}`);
						}),
						result.data && result.data.withAvailability < result.data.total && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-center gap-1.5 text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3" }),
								result.data.total - result.data.withAvailability,
								" member(s) haven't shared availability, so these are partial matches."
							]
						})
					]
				})
			]
		})
	});
}
//#endregion
export { SessionsPanel as t };
