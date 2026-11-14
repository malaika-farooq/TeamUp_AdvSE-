import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-yXxN1BOn.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { r as cn, t as Button } from "./button-BkEFdjsN.mjs";
import { i as useQuery, o as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { $ as CalendarClock, A as ListChecks, O as LoaderCircle, g as Plus, l as Trash2 } from "../_libs/lucide-react.mjs";
import { a as useDroppable, i as useDraggable, n as KeyboardSensor, o as useSensor, r as PointerSensor, s as useSensors, t as DndContext } from "../_libs/@dnd-kit/core+[...].mjs";
import { a as DialogFooter, c as Select, d as SelectTrigger, f as SelectValue, l as SelectContent, n as Dialog, o as DialogHeader, r as DialogContent, s as DialogTitle, u as SelectItem } from "./ai-client-CJwzytaT.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useAuth } from "./auth-Bitinyml.mjs";
import { D as fetchTeamMembers, I as notify, P as logActivity, o as STATUSES, r as PRIORITIES, s as UserAvatar } from "./UserAvatar-CWAQ5zUT.mjs";
import { t as Input } from "./input-o8_kklxJ.mjs";
import { t as Textarea } from "./textarea-DpZdO9KZ.mjs";
import { n as AnimatePresence } from "../_libs/framer-motion+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { d as SheetHeader, f as SheetTitle, l as Sheet, o as EmptyState, r as Badge, u as SheetContent } from "./states-BLyrGC0l.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-Bjv_scU6.mjs";
import { t as Label } from "./label-BEbnXoK8.mjs";
import { t as Checkbox } from "./checkbox-95F7LIb9.mjs";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-x-SErZBX.mjs";
import { c as canDeleteTask, l as canEditTask, s as canDeleteComment } from "./team-rules-DG0EiWUj.mjs";
import { t as useTeamRoles } from "./use-team-roles-Dom1WBFT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/TaskBoard-BSF-VCxu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var COLORS = [
	"#F97316",
	"#2DD4BF",
	"#A78BFA",
	"#60A5FA",
	"#34D399"
];
function confettiBurst() {
	if (typeof document === "undefined") return;
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
	const container = document.createElement("div");
	container.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:100;overflow:hidden";
	document.body.appendChild(container);
	for (let i = 0; i < 40; i++) {
		const piece = document.createElement("span");
		const size = 6 + Math.random() * 6;
		piece.style.cssText = `position:absolute;top:-20px;left:${Math.random() * 100}%;width:${size}px;height:${size * 1.6}px;background:${COLORS[i % COLORS.length]};border-radius:2px;opacity:0.9`;
		container.appendChild(piece);
		piece.animate([{
			transform: "translateY(0) rotate(0deg)",
			opacity: 1
		}, {
			transform: `translateY(${window.innerHeight + 60}px) rotate(${360 + Math.random() * 360}deg)`,
			opacity: .2
		}], {
			duration: 1600 + Math.random() * 900,
			easing: "cubic-bezier(.2,.6,.3,1)"
		});
	}
	setTimeout(() => container.remove(), 2800);
}
function taskErrorMessage(error) {
	if (error.code === "42501") return "You don't have permission to change this task — only its creator, its assignee, or a team admin can.";
	return error.message;
}
function TaskBoard({ tasks, teams, defaultTeamId, createOpen, onCreateOpenChange, initialSearch = "" }) {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [view, setView] = (0, import_react.useState)("board");
	const [search, setSearch] = (0, import_react.useState)(initialSearch);
	const [teamFilter, setTeamFilter] = (0, import_react.useState)(defaultTeamId ?? "all");
	const [assigneeFilter, setAssigneeFilter] = (0, import_react.useState)("all");
	const [priorityFilter, setPriorityFilter] = (0, import_react.useState)("all");
	const [dueFilter, setDueFilter] = (0, import_react.useState)("all");
	const [openTask, setOpenTask] = (0, import_react.useState)(null);
	const [local, setLocal] = (0, import_react.useState)(tasks);
	(0, import_react.useEffect)(() => setLocal(tasks), [tasks]);
	(0, import_react.useEffect)(() => setSearch(initialSearch), [initialSearch]);
	const scopedTeamIds = teamFilter === "all" ? teams.map((t) => t.id) : [teamFilter];
	const members = useQuery({
		queryKey: ["members-multi", scopedTeamIds],
		queryFn: async () => {
			const flat = (await Promise.all(scopedTeamIds.map((id) => fetchTeamMembers(id)))).flat();
			const seen = /* @__PURE__ */ new Map();
			flat.forEach((m) => seen.set(m.user_id, m));
			return Array.from(seen.values());
		},
		enabled: scopedTeamIds.length > 0
	}).data ?? [];
	const nameOf = (id) => id ? members.find((m) => m.user_id === id)?.profile?.display_name ?? "Teammate" : "Unassigned";
	const { roleIn } = useTeamRoles();
	const editable = (t) => canEditTask(roleIn(t.team_id), user?.id, t);
	const avatarOf = (id) => id ? members.find((m) => m.user_id === id)?.profile?.avatar_url ?? null : null;
	const filtered = (0, import_react.useMemo)(() => {
		const now = Date.now();
		return local.filter((t) => {
			if (teamFilter !== "all" && t.team_id !== teamFilter) return false;
			if (assigneeFilter === "me" && t.assignee_id !== user?.id) return false;
			if (assigneeFilter !== "all" && assigneeFilter !== "me" && t.assignee_id !== assigneeFilter) return false;
			if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
			if (dueFilter === "overdue") {
				if (!(t.due_date && new Date(t.due_date).getTime() < now && t.status !== "done")) return false;
			}
			if (dueFilter === "week") {
				if (!(t.due_date && new Date(t.due_date).getTime() < now + 6048e5)) return false;
			}
			if (search.trim()) {
				const s = search.trim().toLowerCase();
				if (!t.title.toLowerCase().includes(s) && !(t.description ?? "").toLowerCase().includes(s)) return false;
			}
			return true;
		});
	}, [
		local,
		teamFilter,
		assigneeFilter,
		priorityFilter,
		dueFilter,
		search,
		user?.id
	]);
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor));
	async function changeStatus(task, status) {
		if (task.status === status) return;
		if (!editable(task)) {
			toast.error("Only the task's creator, its assignee, or a team admin can change it.");
			return;
		}
		const previous = local;
		const next = local.map((t) => t.id === task.id ? {
			...t,
			status,
			completed_at: status === "done" ? (/* @__PURE__ */ new Date()).toISOString() : null
		} : t);
		setLocal(next);
		const { error } = await supabase.from("tasks").update({
			status,
			completed_at: status === "done" ? (/* @__PURE__ */ new Date()).toISOString() : null,
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", task.id);
		if (error) {
			setLocal(previous);
			toast.error(`Couldn't save that change. ${taskErrorMessage(error)}`);
			return;
		}
		if (user) await logActivity(task.team_id, user.id, "task_updated", `moved "${task.title}" to ${status.replace("_", " ")}`, task.id);
		const teamTasks = next.filter((t) => t.team_id === task.team_id);
		if (status === "done" && teamTasks.length > 0 && teamTasks.every((t) => t.status === "done")) {
			confettiBurst();
			toast.success("Every task in this team is done. Nice work!");
		}
		queryClient.invalidateQueries({ queryKey: ["activity"] });
	}
	function onDragEnd(event) {
		const status = event.over?.id;
		const task = local.find((t) => t.id === event.active.id);
		if (!status || !task) return;
		changeStatus(task, status);
	}
	if (teams.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		icon: ListChecks,
		title: "No tasks yet",
		description: "Join or create a team first — tasks always belong to a team."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: search,
						onChange: (e) => setSearch(e.target.value),
						placeholder: "Search tasks",
						className: "w-full sm:w-52",
						"aria-label": "Search tasks"
					}),
					!defaultTeamId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
						value: teamFilter,
						onChange: setTeamFilter,
						label: "Team",
						options: [{
							value: "all",
							label: "All teams"
						}, ...teams.map((t) => ({
							value: t.id,
							label: t.name
						}))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
						value: assigneeFilter,
						onChange: setAssigneeFilter,
						label: "Assignee",
						options: [
							{
								value: "all",
								label: "Anyone"
							},
							{
								value: "me",
								label: "My tasks"
							},
							...members.map((m) => ({
								value: m.user_id,
								label: m.profile?.display_name ?? "Teammate"
							}))
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
						value: priorityFilter,
						onChange: setPriorityFilter,
						label: "Priority",
						options: [{
							value: "all",
							label: "Any priority"
						}, ...PRIORITIES.map((p) => ({
							value: p,
							label: p
						}))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
						value: dueFilter,
						onChange: setDueFilter,
						label: "Due",
						options: [
							{
								value: "all",
								label: "Any date"
							},
							{
								value: "week",
								label: "Next 7 days"
							},
							{
								value: "overdue",
								label: "Overdue"
							}
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
						value: view,
						onValueChange: (v) => setView(v),
						className: "ml-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "board",
							children: "Board"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "list",
							children: "List"
						})] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => onCreateOpenChange(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 size-4" }), "New task"]
					})
				]
			}),
			view === "board" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DndContext, {
				sensors,
				onDragEnd,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4",
					children: STATUSES.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Column, {
						status: col.key,
						label: col.label,
						tasks: filtered.filter((t) => t.status === col.key),
						onOpen: setOpenTask,
						nameOf,
						avatarOf,
						canEdit: editable,
						onStatusChange: changeStatus
					}, col.key))
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "space-y-2",
				children: [filtered.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setOpenTask(t),
					className: "surface-card hover-lift flex w-full items-center justify-between gap-3 p-4 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-medium",
							children: t.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1.5 align-middle",
									children: [t.assignee_id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
										name: nameOf(t.assignee_id),
										path: avatarOf(t.assignee_id),
										className: "size-4",
										fallbackClassName: "text-[8px]"
									}), nameOf(t.assignee_id)]
								}),
								" ",
								"· ",
								t.due_date ? new Date(t.due_date).toLocaleDateString() : "No due date"
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriorityBadge, { priority: t.priority }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							children: STATUSES.find((s) => s.key === t.status)?.label
						})]
					})]
				}) }, t.id)), filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: ListChecks,
					title: "No matching tasks",
					description: "Adjust your filters, or create a new task for your team."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateTaskDialog, {
				open: createOpen,
				onOpenChange: onCreateOpenChange,
				teams,
				defaultTeamId: defaultTeamId ?? (teamFilter !== "all" ? teamFilter : teams[0]?.id)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskPanel, {
				task: openTask,
				onClose: () => setOpenTask(null),
				onStatusChange: changeStatus,
				nameOf,
				members
			})
		]
	});
}
function FilterSelect({ value, onChange, label, options }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
		value,
		onValueChange: onChange,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
			className: "w-[150px]",
			"aria-label": label,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: label })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
			value: o.value,
			children: o.label
		}, o.value)) })]
	});
}
function PriorityBadge({ priority }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "outline",
		className: priority === "urgent" ? "bg-destructive/15 text-destructive border-destructive/30" : priority === "high" ? "bg-primary/15 text-primary border-primary/30" : priority === "medium" ? "bg-blue/15 text-blue border-blue/30" : "bg-muted text-muted-foreground",
		children: priority
	});
}
function Column({ status, label, tasks, onOpen, nameOf, avatarOf, canEdit, onStatusChange }) {
	const { setNodeRef, isOver } = useDroppable({ id: status });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: setNodeRef,
		className: cn("rounded-2xl border border-border bg-muted/40 p-3 transition-colors duration-200", isOver && "border-primary bg-primary/5"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between px-1 pb-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "secondary",
				children: tasks.length
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
				initial: false,
				children: tasks.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCard, {
					task: t,
					onOpen,
					nameOf,
					avatarOf,
					canEdit: canEdit(t),
					onStatusChange
				}, t.id))
			}), tasks.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground",
				children: "Drop tasks here"
			})]
		})]
	});
}
function TaskCard({ task, onOpen, nameOf, avatarOf, canEdit, onStatusChange }) {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id: task.id,
		disabled: !canEdit
	});
	const overdue = task.due_date && new Date(task.due_date).getTime() < Date.now() && task.status !== "done";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		ref: setNodeRef,
		layout: true,
		initial: {
			opacity: 0,
			y: 8
		},
		animate: {
			opacity: isDragging ? .6 : 1,
			y: 0
		},
		exit: {
			opacity: 0,
			scale: .97
		},
		transition: { duration: .18 },
		style: { transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : "none" },
		className: cn("surface-card p-3", canEdit ? "cursor-grab active:cursor-grabbing" : "cursor-default", isDragging && "shadow-[var(--shadow-lift)]"),
		...listeners,
		...attributes,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: () => onOpen(task),
			className: "w-full text-left",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: task.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriorityBadge, { priority: task.priority }), task.due_date && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: overdue ? "destructive" : "secondary",
						className: "gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "size-3" }), new Date(task.due_date).toLocaleDateString()]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 flex items-center gap-1.5 text-xs text-muted-foreground",
					children: [task.assignee_id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
						name: nameOf(task.assignee_id),
						path: avatarOf(task.assignee_id),
						className: "size-5",
						fallbackClassName: "text-[9px]"
					}), nameOf(task.assignee_id)]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2",
			onPointerDown: (e) => e.stopPropagation(),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: task.status,
				disabled: !canEdit,
				onValueChange: (v) => onStatusChange(task, v),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					className: "h-8 text-xs",
					"aria-label": canEdit ? `Status for ${task.title}` : `Status for ${task.title} (view only)`,
					title: canEdit ? void 0 : "Only the creator, the assignee or a team admin can change this task",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: s.key,
					children: s.label
				}, s.key)) })]
			})
		})]
	});
}
function CreateTaskDialog({ open, onOpenChange, teams, defaultTeamId }) {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [teamId, setTeamId] = (0, import_react.useState)(defaultTeamId ?? teams[0]?.id ?? "");
	const [form, setForm] = (0, import_react.useState)({
		title: "",
		description: "",
		priority: "medium",
		status: "todo",
		due: "",
		assignee: "unassigned"
	});
	(0, import_react.useEffect)(() => {
		if (defaultTeamId) setTeamId(defaultTeamId);
	}, [defaultTeamId]);
	const membersQuery = useQuery({
		queryKey: ["members", teamId],
		queryFn: () => fetchTeamMembers(teamId),
		enabled: !!teamId && open
	});
	async function submit(e) {
		e.preventDefault();
		if (!user || !teamId) return;
		setBusy(true);
		const { data, error } = await supabase.from("tasks").insert({
			team_id: teamId,
			title: form.title,
			description: form.description || null,
			priority: form.priority,
			status: form.status,
			due_date: form.due ? new Date(form.due).toISOString() : null,
			assignee_id: form.assignee === "unassigned" ? null : form.assignee,
			created_by: user.id,
			position: Date.now() % 1e6
		}).select("*").single();
		setBusy(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		await logActivity(teamId, user.id, "task_created", `created "${form.title}"`, data.id);
		if (form.assignee !== "unassigned" && form.assignee !== user.id) await notify(form.assignee, "task_assigned", "New task assigned to you", form.title, `/tasks`);
		toast.success("Task created");
		setForm({
			title: "",
			description: "",
			priority: "medium",
			status: "todo",
			due: "",
			assignee: "unassigned"
		});
		onOpenChange(false);
		queryClient.invalidateQueries();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90vh] overflow-y-auto sm:max-w-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "New task" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "tt",
							children: "Title"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "tt",
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
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "tdesc",
							children: "Description"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "tdesc",
							rows: 3,
							value: form.description,
							onChange: (e) => setForm({
								...form,
								description: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [
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
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Assignee" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.assignee,
									onValueChange: (v) => setForm({
										...form,
										assignee: v
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "unassigned",
										children: "Unassigned"
									}), (membersQuery.data ?? []).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: m.user_id,
										children: m.profile?.display_name ?? "Teammate"
									}, m.user_id))] })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Priority" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.priority,
									onValueChange: (v) => setForm({
										...form,
										priority: v
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: PRIORITIES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: p,
										children: p
									}, p)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "tdue",
									children: "Due date"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "tdue",
									type: "datetime-local",
									value: form.due,
									onChange: (e) => setForm({
										...form,
										due: e.target.value
									})
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: () => onOpenChange(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						disabled: busy || !teamId,
						children: [busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Create task"]
					})] })
				]
			})]
		})
	});
}
function TaskPanel({ task, onClose, onStatusChange, nameOf, members }) {
	const { user } = useAuth();
	const { roleIn } = useTeamRoles();
	const queryClient = useQueryClient();
	const [comment, setComment] = (0, import_react.useState)("");
	const [newItem, setNewItem] = (0, import_react.useState)("");
	const [confirmDelete, setConfirmDelete] = (0, import_react.useState)(false);
	const detail = useQuery({
		queryKey: ["task-detail", task?.id],
		queryFn: async () => {
			const [items, comments] = await Promise.all([supabase.from("task_checklist_items").select("*").eq("task_id", task.id).order("position"), supabase.from("task_comments").select("*").eq("task_id", task.id).order("created_at")]);
			return {
				items: items.data ?? [],
				comments: comments.data ?? []
			};
		},
		enabled: !!task
	});
	if (!task) return null;
	const myRole = roleIn(task.team_id);
	const mayEdit = canEditTask(myRole, user?.id, task);
	const mayDelete = canDeleteTask(myRole, user?.id, task);
	async function removeComment(id) {
		const { error } = await supabase.from("task_comments").delete().eq("id", id);
		if (error) return void toast.error(error.message);
		detail.refetch();
	}
	async function addComment() {
		if (!comment.trim() || !user || !task) return;
		const { error } = await supabase.from("task_comments").insert({
			task_id: task.id,
			author_id: user.id,
			body: comment.trim()
		});
		if (error) return void toast.error(error.message);
		setComment("");
		detail.refetch();
	}
	async function addItem() {
		if (!newItem.trim() || !task) return;
		const { error } = await supabase.from("task_checklist_items").insert({
			task_id: task.id,
			label: newItem.trim()
		});
		if (error) return void toast.error(error.message);
		setNewItem("");
		detail.refetch();
	}
	async function assign(userId) {
		if (!task) return;
		const { error } = await supabase.from("tasks").update({ assignee_id: userId === "unassigned" ? null : userId }).eq("id", task.id);
		if (error) return void toast.error(taskErrorMessage(error));
		if (userId !== "unassigned" && userId !== user?.id) await notify(userId, "task_assigned", "New task assigned to you", task.title, "/tasks");
		toast.success("Assignee updated");
		queryClient.invalidateQueries();
		onClose();
	}
	async function remove() {
		if (!task) return;
		const { error } = await supabase.from("tasks").delete().eq("id", task.id);
		if (error) return void toast.error(error.message);
		toast.success("Task deleted");
		setConfirmDelete(false);
		onClose();
		queryClient.invalidateQueries();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
		open: !!task,
		onOpenChange: (v) => !v && onClose(),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			className: "w-full overflow-y-auto sm:max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
				className: "pr-6 text-left",
				children: task.title
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5 px-4 pb-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: task.description || "No description provided."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Status" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: task.status,
								disabled: !mayEdit,
								onValueChange: (v) => onStatusChange(task, v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: s.key,
									children: s.label
								}, s.key)) })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Assignee" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: task.assignee_id ?? "unassigned",
								disabled: !mayEdit,
								onValueChange: assign,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "unassigned",
									children: "Unassigned"
								}), members.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: m.user_id,
									children: m.profile?.display_name ?? "Teammate"
								}, m.user_id))] })]
							})]
						})]
					}),
					!mayEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground",
						children: "View only. Only the creator, the assignee, or a team admin can change this task. You can still comment and tick checklist items."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "secondary",
								children: ["Created by ", nameOf(task.created_by)]
							}),
							task.due_date && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "secondary",
								children: ["Due ", new Date(task.due_date).toLocaleString()]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriorityBadge, { priority: task.priority })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "text-sm font-semibold",
							children: "Checklist"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 space-y-2",
							children: (detail.data?.items ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									checked: item.done,
									onCheckedChange: async (v) => {
										await supabase.from("task_checklist_items").update({ done: !!v }).eq("id", item.id);
										detail.refetch();
									}
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn(item.done && "text-muted-foreground line-through"),
									children: item.label
								})]
							}, item.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: newItem,
								onChange: (e) => setNewItem(e.target.value),
								placeholder: "Add a checklist item"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: addItem,
								children: "Add"
							})]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "text-sm font-semibold",
							children: "Comments"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 space-y-2",
							children: (detail.data?.comments ?? []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-lg border border-border p-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: c.body }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 flex items-center gap-1.5 text-xs text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
											name: nameOf(c.author_id),
											path: members.find((m) => m.user_id === c.author_id)?.profile?.avatar_url,
											className: "size-5",
											fallbackClassName: "text-[9px]"
										}),
										nameOf(c.author_id),
										" · ",
										new Date(c.created_at).toLocaleString(),
										canDeleteComment(myRole, user?.id, c) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "ml-auto text-xs underline-offset-2 hover:underline",
											onClick: () => removeComment(c.id),
											children: "Delete"
										})
									]
								})]
							}, c.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 2,
								value: comment,
								onChange: (e) => setComment(e.target.value),
								placeholder: "Write a comment"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: addComment,
								children: "Post"
							})]
						})
					] }),
					mayDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "destructive",
						className: "w-full",
						onClick: () => setConfirmDelete(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 size-4" }), "Delete task"]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
			open: confirmDelete,
			onOpenChange: setConfirmDelete,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Delete this task?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "This removes the task, its checklist and comments for everyone in the team." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
				onClick: remove,
				children: "Delete"
			})] })] })
		})]
	});
}
//#endregion
export { TaskPanel as n, taskErrorMessage as r, TaskBoard as t };
