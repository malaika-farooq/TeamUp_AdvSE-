import { i as __toESM } from "../_runtime.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as createServerFn } from "./createServerFn-BhqelEmK.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-CVhGCUbY.mjs";
import { a as numberType, n as booleanType, o as objectType, s as stringType, t as arrayType } from "../_libs/zod.mjs";
import { t as supabase } from "./client-yXxN1BOn.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { r as cn, t as Button } from "./button-BkEFdjsN.mjs";
import { i as useQuery, o as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { $ as CalendarClock, A as ListChecks, F as GraduationCap, G as CircleQuestionMark, O as LoaderCircle, P as Handshake, R as FileText, U as Clock, X as Check, d as Square, et as CalendarCheck, i as Users, it as ArrowRight, k as ListPlus, n as Wrench, o as UserPlus, r as WandSparkles, t as X, tt as BookOpen, w as MessageSquarePlus } from "../_libs/lucide-react.mjs";
import { _ as pagePrompts, c as Select, d as SelectTrigger, f as SelectValue, h as createThread, l as SelectContent, u as SelectItem, v as readableError, y as streamWrite } from "./ai-client-CJwzytaT.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useAuth } from "./auth-Bitinyml.mjs";
import { E as fetchTasks, I as notify, P as logActivity, T as fetchSessions, r as PRIORITIES, s as UserAvatar, w as fetchResources, x as fetchMyTeams } from "./UserAvatar-CWAQ5zUT.mjs";
import { t as Input } from "./input-o8_kklxJ.mjs";
import { t as Textarea } from "./textarea-DpZdO9KZ.mjs";
import { n as AnimatePresence } from "../_libs/framer-motion+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { _ as tidyMarkdown, c as MessageResponse, g as Suggestion, i as CardSkeletons, m as Shimmer, n as AssistantMark, o as EmptyState, r as Badge, s as ErrorState, t as AppShell } from "./states-BLyrGC0l.mjs";
import { t as ThreadList } from "./ThreadList-BcF4mLje.mjs";
import { n as useServerFn, t as createSsrRpc } from "./createSsrRpc-DdtAGDIv.mjs";
import { n as TIME_BLOCKS, r as nextOccurrence, t as DAY_LABELS } from "./partner-ranking-CGfSgEHb.mjs";
import { t as Label } from "./label-BEbnXoK8.mjs";
import { m as revokeInvitation, s as inviteStudent } from "./team-queries-DxvAyhx0.mjs";
import { t as Checkbox } from "./checkbox-95F7LIb9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/assistant.index-uzijAb_n.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var draftTaskPlan = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	teamId: stringType().uuid(),
	focus: stringType().max(500).optional(),
	count: numberType().int().min(3).max(10).optional()
}).parse(d)).handler(createSsrRpc("7c6328d4e7394546f68853cc682d21bce05ec5f1dc7315896bc31ff1a54279e2"));
var suggestTeammates = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	teamId: stringType().uuid(),
	wantedSkills: arrayType(stringType().trim().min(1).max(40)).max(8).optional()
}).parse(d)).handler(createSsrRpc("fba7fc8273d3524db1f0de50e7dc7d2f67375b11e725b8407b9e6a48b7d22e77"));
var breakdownTask = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ taskId: stringType().uuid() }).parse(d)).handler(createSsrRpc("dbb05214657ab236ecd62c9578dbfe910a0442a8bf667c72610a3fefb77d0a95"));
function Working({ text }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface-card flex items-center gap-3 p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssistantMark, { className: "size-8" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shimmer, { children: text })]
	});
}
/** Calmer heading sizes and spacing for written answers inside a card. */
var AI_PROSE = "leading-relaxed [&_h1]:mt-6 [&_h1]:mb-2 [&_h1]:font-display [&_h1]:text-xl [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-lg [&_h2]:text-foreground [&_h3]:mt-4 [&_h3]:mb-1 [&_h3]:font-display [&_h3]:text-base [&_strong]:text-foreground [&_ol]:space-y-1 [&_ul]:space-y-1";
var WRITER_COPY = {
	summary: {
		button: "Summarize progress",
		working: "Reading your tasks, notes and activity…",
		noteTitle: "Progress summary"
	},
	study_guide: {
		button: "Make a study guide",
		working: "Turning your notes into a study guide…",
		noteTitle: "Study guide"
	},
	quiz: {
		button: "Make a practice quiz",
		working: "Writing quiz questions from your notes…",
		noteTitle: "Practice quiz"
	},
	agenda: {
		button: "Draft the agenda",
		working: "Planning your meeting…",
		noteTitle: "Meeting agenda"
	},
	checkin: {
		button: "Write the weekly check-in",
		working: "Reviewing this week's work…",
		noteTitle: "Weekly check-in"
	}
};
function WriterTool({ tool, teamId }) {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [text, setText] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [error, setError] = (0, import_react.useState)(null);
	const [instructions, setInstructions] = (0, import_react.useState)("");
	const [noteIds, setNoteIds] = (0, import_react.useState)([]);
	const [sessionId, setSessionId] = (0, import_react.useState)("");
	const abortRef = (0, import_react.useRef)(null);
	const copy = WRITER_COPY[tool];
	const needsNotes = tool === "study_guide" || tool === "quiz";
	const notesQuery = useQuery({
		queryKey: ["resources", [teamId]],
		queryFn: () => fetchResources([teamId]),
		enabled: needsNotes
	});
	const notes = (notesQuery.data ?? []).filter((r) => r.kind === "note");
	const upcoming = (useQuery({
		queryKey: ["sessions", [teamId]],
		queryFn: () => fetchSessions([teamId]),
		enabled: tool === "agenda"
	}).data ?? []).filter((s) => new Date(s.ends_at).getTime() > Date.now() || s.recurrence === "weekly");
	(0, import_react.useEffect)(() => () => abortRef.current?.abort(), []);
	(0, import_react.useEffect)(() => {
		abortRef.current?.abort();
		setText("");
		setStatus("idle");
		setError(null);
		setNoteIds([]);
		setSessionId("");
	}, [teamId, tool]);
	async function run() {
		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;
		setText("");
		setError(null);
		setStatus("waiting");
		try {
			await streamWrite({
				tool,
				teamId,
				...noteIds.length ? { noteIds } : {},
				...sessionId ? { sessionId } : {},
				...instructions.trim() ? { instructions: instructions.trim() } : {}
			}, (t) => {
				setText(t);
				if (t) setStatus("streaming");
			}, controller.signal);
			setStatus("done");
		} catch (e) {
			if (controller.signal.aborted) {
				setStatus("done");
				return;
			}
			setError(e instanceof Error ? e.message : "The assistant is unavailable right now.");
			setStatus("error");
		}
	}
	async function save() {
		if (!user || !text) return;
		const { error: err } = await supabase.from("resources").insert({
			team_id: teamId,
			kind: "note",
			title: `${copy.noteTitle} — ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`,
			content: tidyMarkdown(text),
			tags: ["ai", tool.replace("_", "-")],
			created_by: user.id,
			updated_by: user.id
		});
		if (err) return void toast.error(err.message);
		toast.success("Saved to your team's notes in Resources");
		queryClient.invalidateQueries({ queryKey: ["resources"] });
	}
	const busy = status === "waiting" || status === "streaming";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			needsNotes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Which notes? (leave empty to use the latest)" }), notesQuery.isSuccess && notes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						"This team has no notes yet.",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/resources",
							className: "font-medium text-primary underline-offset-4 hover:underline",
							children: "Add one in Resources"
						}),
						" ",
						"first."
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: notes.slice(0, 12).map((n) => {
						const on = noteIds.includes(n.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": on,
							onClick: () => setNoteIds((prev) => on ? prev.filter((x) => x !== n.id) : [...prev, n.id].slice(-6)),
							className: on ? "rounded-full border border-teal bg-teal/15 px-3 py-1 text-xs font-medium text-foreground transition-colors" : "rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-teal/50 hover:text-foreground",
							children: n.title
						}, n.id);
					})
				})]
			}),
			tool === "agenda" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-sm space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Meeting" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: sessionId || "next",
					onValueChange: (v) => setSessionId(v === "next" ? "" : v),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						"aria-label": "Meeting",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "next",
						children: upcoming.length ? "Next scheduled session" : "No session scheduled (45 min)"
					}), upcoming.slice(0, 10).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
						value: s.id,
						children: [
							s.title,
							" ·",
							" ",
							new Date(s.starts_at).toLocaleString([], {
								dateStyle: "medium",
								timeStyle: "short"
							})
						]
					}, s.id))] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: `instr-${tool}`,
					children: "Anything to focus on? (optional)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: `instr-${tool}`,
					value: instructions,
					maxLength: 500,
					onChange: (e) => setInstructions(e.target.value),
					placeholder: tool === "quiz" ? "e.g. focus on chapter 3, make it harder" : tool === "agenda" ? "e.g. we need to pick a presentation date" : "e.g. keep it short"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					onClick: () => abortRef.current?.abort(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "mr-2 size-4" }), " Stop"]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: run,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WandSparkles, { className: "mr-2 size-4" }), status === "done" ? "Write it again" : copy.button]
				}), status === "done" && text && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: save,
					children: "Save as team note"
				})]
			}),
			status === "waiting" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Working, { text: copy.working }),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
				message: error,
				onRetry: run
			}),
			text && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.article, {
				initial: {
					opacity: 0,
					y: 6
				},
				animate: {
					opacity: 1,
					y: 0
				},
				transition: { duration: .2 },
				className: "surface-card p-5 text-sm sm:p-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageResponse, {
					isAnimating: status === "streaming",
					className: AI_PROSE,
					children: text
				})
			})
		]
	});
}
function PlanTool({ teamId }) {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const plan = useServerFn(draftTaskPlan);
	const [focus, setFocus] = (0, import_react.useState)("");
	const [count, setCount] = (0, import_react.useState)("6");
	const [drafts, setDrafts] = (0, import_react.useState)([]);
	const [members, setMembers] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setDrafts([]);
		setError(null);
	}, [teamId]);
	async function run() {
		setBusy(true);
		setError(null);
		try {
			const res = await plan({ data: {
				teamId,
				count: Number(count),
				...focus.trim() ? { focus: focus.trim() } : {}
			} });
			setMembers(res.members);
			setDrafts(res.tasks.map((t) => ({
				...t,
				selected: true
			})));
			if (!res.tasks.length) setError("The assistant didn't suggest any tasks. Try adding a focus.");
		} catch (e) {
			setError(e instanceof Error ? e.message : "The assistant is unavailable right now.");
		} finally {
			setBusy(false);
		}
	}
	function update(i, patch) {
		setDrafts((prev) => prev.map((d, j) => j === i ? {
			...d,
			...patch
		} : d));
	}
	async function save() {
		if (!user) return;
		const chosen = drafts.filter((d) => d.selected && d.title.trim());
		if (!chosen.length) return void toast.error("Select at least one task to save.");
		setSaving(true);
		const base = Date.now() % 1e6;
		const { data: created, error: err } = await supabase.from("tasks").insert(chosen.map((d, i) => ({
			team_id: teamId,
			title: d.title.trim(),
			description: d.description,
			priority: d.priority,
			status: "todo",
			due_date: d.dueDate,
			assignee_id: d.assigneeId,
			created_by: user.id,
			position: base + i
		}))).select("id, title, assignee_id");
		if (err || !created) {
			setSaving(false);
			toast.error(err?.message ?? "Couldn't save the tasks.");
			return;
		}
		const items = created.flatMap((t, i) => (chosen[i]?.checklist ?? []).map((label, position) => ({
			task_id: t.id,
			label,
			position
		})));
		if (items.length) {
			const { error: itemErr } = await supabase.from("task_checklist_items").insert(items);
			if (itemErr) toast.error(`Tasks saved, but checklists failed: ${itemErr.message}`);
		}
		await Promise.all(created.filter((t) => t.assignee_id && t.assignee_id !== user.id).map((t) => notify(t.assignee_id, "task_assigned", "New task assigned to you", t.title, "/tasks")));
		await logActivity(teamId, user.id, "task_created", `added ${created.length} planned tasks`);
		setSaving(false);
		toast.success(`${created.length} tasks added to the board`);
		setDrafts([]);
		queryClient.invalidateQueries();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-[1fr_140px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "plan-focus",
						children: "What should the plan focus on? (optional)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "plan-focus",
						value: focus,
						maxLength: 500,
						onChange: (e) => setFocus(e.target.value),
						placeholder: "e.g. the final presentation and report"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "How many tasks" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: count,
						onValueChange: setCount,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							"aria-label": "How many tasks",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
							"4",
							"6",
							"8",
							"10"
						].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
							value: n,
							children: [n, " tasks"]
						}, n)) })]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: run,
				disabled: busy,
				children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WandSparkles, { className: "mr-2 size-4" }), drafts.length ? "Draft a new plan" : "Draft a plan"]
			}),
			busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Working, { text: "Matching tasks to your team's skills and deadline…" }),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
				message: error,
				onRetry: run
			}),
			drafts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "These are suggestions only. Edit anything, untick what you don't want, then save."
			}),
			drafts.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				initial: {
					opacity: 0,
					y: 8
				},
				animate: {
					opacity: 1,
					y: 0
				},
				transition: {
					duration: .2,
					delay: i * .04
				},
				className: "surface-card p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
						className: "mt-2.5",
						checked: d.selected,
						onCheckedChange: (v) => update(i, { selected: !!v }),
						"aria-label": `Include ${d.title}`
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: d.title,
								onChange: (e) => update(i, { title: e.target.value }),
								className: "font-medium",
								"aria-label": "Task title"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 2,
								value: d.description,
								onChange: (e) => update(i, { description: e.target.value }),
								"aria-label": "Task description"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2 sm:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: d.priority,
										onValueChange: (v) => update(i, { priority: v }),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											"aria-label": "Priority",
											className: "capitalize",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: PRIORITIES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: p,
											className: "capitalize",
											children: p
										}, p)) })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: d.assigneeId ?? "none",
										onValueChange: (v) => update(i, {
											assigneeId: v === "none" ? null : v,
											assigneeName: members.find((m) => m.id === v)?.name ?? null
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											"aria-label": "Assignee",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "none",
											children: "Unassigned"
										}), members.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: m.id,
											children: m.name
										}, m.id))] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										"aria-label": "Due date",
										value: d.dueDate.slice(0, 10),
										onChange: (e) => e.target.value && update(i, { dueDate: (/* @__PURE__ */ new Date(`${e.target.value}T17:00:00Z`)).toISOString() })
									})
								]
							}),
							d.assigneeReason && d.assigneeId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-start gap-2 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "mt-0.5 size-3.5 shrink-0 text-teal" }), d.assigneeReason]
							}),
							d.checklist.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-1 rounded-lg bg-muted/50 p-3 text-xs",
								children: d.checklist.map((c, ci) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "☐"
									}), c]
								}, ci))
							})
						]
					})]
				})
			}, i)),
			drafts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sticky bottom-20 flex justify-end lg:bottom-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: save,
					disabled: saving,
					className: "shadow-lg",
					children: [
						saving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }),
						"Save ",
						drafts.filter((d) => d.selected).length,
						" selected tasks"
					]
				})
			})
		]
	});
}
var TEAMMATE_EMPTY = {
	none_discoverable: {
		title: "No discoverable students yet",
		description: "Nobody else has chosen to be discoverable, so there's no one to suggest. Check back once more students join TeamUp."
	},
	all_members: {
		title: "Everyone discoverable is already on this team",
		description: "Every student who chose to be discoverable is already a member, so there's nobody new to suggest."
	},
	no_matches: {
		title: "Nobody matches yet",
		description: "No discoverable student shares a course with your team, adds a skill it's missing, or has free time that overlaps. Adding your team's courses, skills and weekly availability in Settings gives better matches."
	}
};
function TeammatesTool({ teamId }) {
	const suggest = useServerFn(suggestTeammates);
	const [result, setResult] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const { user } = useAuth();
	const [decisions, setDecisions] = (0, import_react.useState)({});
	const [pending, setPending] = (0, import_react.useState)(null);
	const [invites, setInvites] = (0, import_react.useState)({});
	const [wanted, setWanted] = (0, import_react.useState)([]);
	const [wantedInput, setWantedInput] = (0, import_react.useState)("");
	function addWanted() {
		const parts = wantedInput.split(",").map((x) => x.trim()).filter(Boolean);
		if (!parts.length) return;
		setWanted((w) => [.../* @__PURE__ */ new Set([...w, ...parts])].slice(0, 8));
		setWantedInput("");
	}
	(0, import_react.useEffect)(() => {
		setResult(null);
		setError(null);
		setDecisions({});
	}, [teamId]);
	/** Accept = send this student a real team invitation they can accept or decline in My Teams. */
	async function accept(p) {
		if (!user || pending) return;
		setPending(p.id);
		try {
			const invitationId = await inviteStudent(teamId, p.id);
			setInvites((m) => ({
				...m,
				[p.id]: invitationId
			}));
			setDecisions((d) => ({
				...d,
				[p.id]: "accepted"
			}));
			toast.success(`Invitation sent to ${p.name}.`);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Couldn't send the invitation. Please try again.");
		} finally {
			setPending(null);
		}
	}
	async function takeBack(p) {
		const invitationId = invites[p.id];
		if (!invitationId || pending) return;
		setPending(p.id);
		try {
			await revokeInvitation(invitationId);
			setInvites(({ [p.id]: _gone, ...rest }) => rest);
			setDecisions(({ [p.id]: _removed, ...rest }) => rest);
			toast.success(`Invitation to ${p.name} cancelled.`);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Couldn't cancel the invitation.");
		} finally {
			setPending(null);
		}
	}
	function decline(id) {
		setDecisions((d) => ({
			...d,
			[id]: "declined"
		}));
	}
	function undo(id) {
		setDecisions((d) => {
			const { [id]: _removed, ...rest } = d;
			return rest;
		});
	}
	async function run() {
		setBusy(true);
		setError(null);
		setResult(null);
		setDecisions({});
		try {
			const res = await suggest({ data: {
				teamId,
				wantedSkills: wanted.length ? wanted : void 0
			} });
			if (!res || !Array.isArray(res.suggestions)) throw new Error("The assistant returned an unreadable answer. Please try again.");
			setResult(res);
		} catch (e) {
			setError(readableError(e) || "The assistant is unavailable right now.");
		} finally {
			setBusy(false);
		}
	}
	const people = result?.suggestions ?? null;
	const empty = result && people?.length === 0 ? TEAMMATE_EMPTY[result.empty ?? "no_matches"] : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					"Up to ",
					4,
					" students, best match first. Only students who chose to be discoverable and aren't on this team are considered. Matches use shared courses, skills your team doesn't have yet, and how many hours of free time overlap each week — nobody's exact schedule is shown."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "wanted-skills",
						children: "What kind of teammate do you want? (optional)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "wanted-skills",
							value: wantedInput,
							placeholder: "Skills you need, e.g. SQL, React, UI Design",
							onChange: (e) => setWantedInput(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									addWanted();
								}
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: addWanted,
							children: "Add"
						})]
					}),
					wanted.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1.5",
						children: wanted.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "secondary",
							className: "gap-1",
							children: [w, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": `Remove ${w}`,
								onClick: () => setWanted((x) => x.filter((y) => y !== w)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
							})]
						}, w))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: wanted.length ? "Only students with at least one of these skills are suggested." : "Leave empty to get the best overall matches."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: run,
				disabled: busy,
				children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WandSparkles, { className: "mr-2 size-4" }), result ? "Suggest again" : "Suggest teammates"]
			}),
			busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Working, { text: "Comparing courses, skills and free time…" }),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
				title: "Couldn't suggest teammates",
				message: error,
				onRetry: run
			}),
			empty && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				icon: UserPlus,
				title: empty.title,
				description: empty.description,
				action: result?.empty === "no_matches" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/settings",
						children: "Update your profile"
					})
				}) : void 0
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "grid gap-3 md:grid-cols-2",
				"aria-label": "Suggested teammates, best match first",
				children: people?.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.li, {
					initial: {
						opacity: 0,
						y: 8
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: {
						duration: .2,
						delay: i * .05
					},
					className: "surface-card hover-lift space-y-3 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "relative shrink-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
										name: p.name,
										path: p.avatar,
										className: "size-10"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-card",
										"aria-label": `Rank ${p.rank}`,
										children: p.rank
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate font-semibold",
										children: p.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-xs text-muted-foreground",
										children: [p.major, p.university].filter(Boolean).join(" · ") || "Student"
									})]
								}),
								p.rank === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: "ml-auto shrink-0 bg-primary/15 text-primary hover:bg-primary/15",
									children: "Best match"
								})
							]
						}),
						p.reason && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm",
							children: p.reason
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-1.5",
							children: [
								p.sharedCourses.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									className: "border-teal/40 bg-teal/10 text-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "mr-1 size-3" }), c]
								}, c)),
								p.newSkills.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									className: "border-lavender/40 bg-lavender/10 text-foreground",
									children: ["+ ", s]
								}, s)),
								p.overlapHours > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									className: "border-blue/40 bg-blue/10 text-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "mr-1 size-3" }),
										p.overlapHours,
										" h/week free together"
									]
								})
							]
						}),
						decisions[p.id] === "accepted" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								className: "bg-teal/15 text-foreground hover:bg-teal/15",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mr-1 size-3" }), "Invitation sent"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => takeBack(p),
								disabled: pending === p.id,
								children: "Take back"
							})]
						}) : decisions[p.id] === "declined" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-sm text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }),
								"Declined",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: () => undo(p.id),
									children: "Undo"
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								onClick: () => accept(p),
								disabled: pending !== null,
								children: [pending === p.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mr-1 size-4" }), "Accept"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => decline(p.id),
								disabled: pending === p.id,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mr-1 size-4" }), "Decline"]
							})]
						})
					]
				}, p.id))
			}),
			people && people.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/discover",
					children: "Find them in Discover"
				})
			})
		]
	});
}
function BreakdownTool({ teamId }) {
	const queryClient = useQueryClient();
	const breakdown = useServerFn(breakdownTask);
	const open = (useQuery({
		queryKey: ["tasks", [teamId]],
		queryFn: () => fetchTasks([teamId])
	}).data ?? []).filter((t) => t.status !== "done");
	const [taskId, setTaskId] = (0, import_react.useState)("");
	const [steps, setSteps] = (0, import_react.useState)([]);
	const [tip, setTip] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setTaskId("");
		setSteps([]);
		setTip("");
	}, [teamId]);
	async function run() {
		if (!taskId) return;
		setBusy(true);
		setError(null);
		try {
			const res = await breakdown({ data: { taskId } });
			setSteps(res.steps.map((label) => ({
				label,
				selected: true
			})));
			setTip(res.tip);
		} catch (e) {
			setError(e instanceof Error ? e.message : "The assistant is unavailable right now.");
		} finally {
			setBusy(false);
		}
	}
	async function addToChecklist() {
		const chosen = steps.filter((s) => s.selected && s.label.trim());
		if (!chosen.length) return void toast.error("Select at least one step.");
		const { count } = await supabase.from("task_checklist_items").select("id", {
			count: "exact",
			head: true
		}).eq("task_id", taskId);
		const { error: err } = await supabase.from("task_checklist_items").insert(chosen.map((s, i) => ({
			task_id: taskId,
			label: s.label.trim(),
			position: (count ?? 0) + i
		})));
		if (err) return void toast.error(err.message);
		toast.success(`${chosen.length} steps added to the task's checklist`);
		setSteps([]);
		setTip("");
		queryClient.invalidateQueries({ queryKey: ["task-detail", taskId] });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: taskId,
					onValueChange: setTaskId,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "sm:max-w-md",
						"aria-label": "Task to break down",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: open.length ? "Choose a task" : "No open tasks in this team" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: open.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: t.id,
						children: t.title
					}, t.id)) })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: run,
					disabled: !taskId || busy,
					children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "mr-2 size-4" }), "Break it down"]
				})]
			}),
			busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Working, { text: "Splitting the task into small steps…" }),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
				message: error,
				onRetry: run
			}),
			steps.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card space-y-3 p-4",
				children: [
					steps.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							checked: s.selected,
							onCheckedChange: (v) => setSteps((prev) => prev.map((p, j) => j === i ? {
								...p,
								selected: !!v
							} : p))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: s.label,
							onChange: (e) => setSteps((prev) => prev.map((p, j) => j === i ? {
								...p,
								label: e.target.value
							} : p)),
							"aria-label": `Step ${i + 1}`
						})]
					}, i)),
					tip && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "mt-0.5 size-3.5 shrink-0 text-primary" }), tip]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: addToChecklist,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListPlus, { className: "mr-2 size-4" }), " Add to the task's checklist"]
					})
				]
			})
		]
	});
}
/** A missing database function means the migrations haven't been applied; say so instead of a vague error. */
/** Individual study-partner matching: ranks in code, the model only writes the reasons. */
var suggestStudyPartners = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	wantedSkills: arrayType(stringType().trim().min(1).max(40)).max(8).optional(),
	/** Times the student wants to study: weekday 0-6 and minutes from midnight. */
	windows: arrayType(objectType({
		weekday: numberType().int().min(0).max(6),
		start: numberType().int().min(0).max(1410),
		end: numberType().int().min(30).max(1440)
	})).max(21).optional(),
	avoidHeavy: booleanType().optional()
}).parse(d)).handler(createSsrRpc("8f823bc2a0137c9407f6044254ac79b4d5442b8ceca8fedf544aebf93cc342dd"));
/** Proposes up to three group study slots when you and your chosen partners are free together. */
var proposeStudySessions = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ partnerIds: arrayType(stringType().uuid()).min(1).max(5) }).parse(d)).handler(createSsrRpc("2fe7c19dc876185529e27913260c646aab101873199c455e47fcd780bea350e5"));
var EMPTY = {
	none_discoverable: {
		title: "No new students to suggest",
		description: "Everyone discoverable is already a partner or has a pending request with you. Check back later."
	},
	profile_empty: {
		title: "Add your courses and skills first",
		description: "Matching compares your courses, skills and free time with other students. Add some in Settings."
	},
	no_matches: {
		title: "Nobody matches yet",
		description: "No discoverable student shares a course, adds a skill, or has free time that overlaps. Adding skills and weekly availability in Settings gives better matches."
	}
};
var LOAD_TONE = {
	light: "border-teal/40 bg-teal/10",
	moderate: "border-blue/40 bg-blue/10",
	heavy: "border-destructive/40 bg-destructive/10"
};
function fmtWhen(d) {
	return d.toLocaleString([], {
		weekday: "short",
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit"
	});
}
function PartnerMatchTool() {
	const queryClient = useQueryClient();
	const onChanged = () => void queryClient.invalidateQueries({ queryKey: ["partner-requests"] });
	const suggest = useServerFn(suggestStudyPartners);
	const [result, setResult] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [wanted, setWanted] = (0, import_react.useState)([]);
	const [input, setInput] = (0, import_react.useState)("");
	const [sent, setSent] = (0, import_react.useState)({});
	const [dismissed, setDismissed] = (0, import_react.useState)({});
	const [pending, setPending] = (0, import_react.useState)(null);
	const [times, setTimes] = (0, import_react.useState)([]);
	const [avoidHeavy, setAvoidHeavy] = (0, import_react.useState)(false);
	const toggleTime = (key) => setTimes((t) => t.includes(key) ? t.filter((x) => x !== key) : [...t, key]);
	function addWanted() {
		const parts = input.split(",").map((x) => x.trim()).filter(Boolean);
		if (!parts.length) return;
		setWanted((w) => [.../* @__PURE__ */ new Set([...w, ...parts])].slice(0, 8));
		setInput("");
	}
	async function run() {
		setBusy(true);
		setError(null);
		setResult(null);
		setSent({});
		setDismissed({});
		try {
			const windows = times.map((k) => {
				const [d, b] = k.split("-").map(Number);
				return {
					weekday: d,
					start: TIME_BLOCKS[b].start,
					end: TIME_BLOCKS[b].end
				};
			});
			const res = await suggest({ data: {
				wantedSkills: wanted.length ? wanted : void 0,
				windows: windows.length ? windows : void 0,
				avoidHeavy: avoidHeavy || void 0
			} });
			if (!res || !Array.isArray(res.suggestions)) throw new Error("The assistant returned an unreadable answer.");
			setResult(res);
		} catch (e) {
			setError(readableError(e));
		} finally {
			setBusy(false);
		}
	}
	async function send(id, name) {
		setPending(id);
		const { error: err } = await supabase.rpc("send_partner_request", { _to: id });
		setPending(null);
		if (err) return void toast.error(err.message);
		setSent((s) => ({
			...s,
			[id]: true
		}));
		toast.success(`Request sent to ${name}.`);
		onChanged();
	}
	const people = result?.suggestions ?? [];
	const empty = result && people.length === 0 ? EMPTY[result.empty ?? "no_matches"] : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Ranked by shared courses, skills you don't have, overlapping free hours and how busy each student is this week. Only students who chose to be discoverable are considered, and nobody's schedule or task list is shown."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "pw",
						children: "What kind of partner do you want? (optional)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex max-w-xl gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "pw",
							value: input,
							placeholder: "Skills you need, e.g. SQL, React",
							onChange: (e) => setInput(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									addWanted();
								}
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: addWanted,
							children: "Add"
						})]
					}),
					wanted.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1.5",
						children: wanted.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "secondary",
							className: "gap-1",
							children: [w, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": `Remove ${w}`,
								onClick: () => setWanted((x) => x.filter((y) => y !== w)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
							})]
						}, w))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "When do you want to study? (optional)" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full min-w-[420px] max-w-xl text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {}), DAY_LABELS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-1 text-xs font-medium text-muted-foreground",
								children: d
							}, d))] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: TIME_BLOCKS.map((b, bi) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "pr-2 text-xs text-muted-foreground",
								children: b.label
							}), DAY_LABELS.map((d, di) => {
								const key = `${di}-${bi}`;
								const on = times.includes(key);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-0.5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-pressed": on,
										"aria-label": `${d} ${b.label}`,
										onClick: () => toggleTime(key),
										className: cn("h-8 w-full rounded-md border border-border transition-colors", on ? "border-teal bg-teal/25" : "bg-muted/40 hover:bg-muted")
									})
								}, key);
							})] }, b.label)) })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: times.length ? "Only students free for at least an hour within these times are suggested." : "Leave empty to match on your saved weekly availability instead."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							id: "light",
							checked: avoidHeavy,
							onCheckedChange: (v) => setAvoidHeavy(v === true)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "light",
							className: "cursor-pointer text-sm",
							children: "Only students who aren't overloaded right now"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: run,
				disabled: busy,
				children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WandSparkles, { className: "mr-2 size-4" }), result ? "Find again" : "Find study partners"]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
				title: "Couldn't find partners",
				message: error,
				onRetry: run
			}),
			empty && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				icon: Handshake,
				title: empty.title,
				description: empty.description,
				action: result?.empty !== "none_discoverable" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/settings",
						children: "Open Settings"
					})
				}) : void 0
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "grid gap-3 md:grid-cols-2",
				"aria-label": "Suggested study partners, best match first",
				children: people.filter((p) => !dismissed[p.id]).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "surface-card space-y-3 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
									name: p.name,
									path: p.avatar,
									className: "size-10"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "truncate font-semibold",
										children: [
											p.rank,
											". ",
											p.name
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-xs text-muted-foreground",
										children: [p.major, p.university].filter(Boolean).join(" · ") || "Student"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									className: `ml-auto shrink-0 ${LOAD_TONE[p.workload]}`,
									children: [p.workload, " workload"]
								})
							]
						}),
						p.reason && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm",
							children: p.reason
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-1.5",
							children: [
								p.wantedSkills.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: "bg-primary/15 text-primary hover:bg-primary/15",
									children: s
								}, `w${s}`)),
								p.sharedCourses.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									className: "border-teal/40 bg-teal/10 text-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "mr-1 size-3" }), c]
								}, c)),
								p.newSkills.filter((s) => !p.wantedSkills.includes(s)).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									className: "border-lavender/40 bg-lavender/10 text-foreground",
									children: ["+ ", s]
								}, s)),
								p.overlapHours > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									className: "border-blue/40 bg-blue/10 text-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "mr-1 size-3" }),
										p.overlapHours,
										" h/week free together"
									]
								})
							]
						}),
						sent[p.id] ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							className: "bg-teal/15 text-foreground hover:bg-teal/15",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mr-1 size-3" }), "Request sent"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								disabled: pending !== null,
								onClick: () => send(p.id, p.name),
								children: [pending === p.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Handshake, { className: "mr-1 size-4" }), "Send request"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => setDismissed((d) => ({
									...d,
									[p.id]: true
								})),
								children: "Not now"
							})]
						})
					]
				}, p.id))
			})
		]
	});
}
function SessionPlanTool() {
	const queryClient = useQueryClient();
	const propose = useServerFn(proposeStudySessions);
	const requestsQuery = useQuery({
		queryKey: ["partner-requests"],
		queryFn: async () => {
			const { data, error } = await supabase.rpc("my_partner_requests");
			if (error) throw error;
			return data ?? [];
		}
	});
	const [selected, setSelected] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [proposals, setProposals] = (0, import_react.useState)(null);
	const [creating, setCreating] = (0, import_react.useState)(null);
	const partners = (requestsQuery.data ?? []).filter((r) => r.status === "accepted");
	async function find() {
		setBusy(true);
		setError(null);
		setProposals(null);
		try {
			const res = await propose({ data: { partnerIds: selected } });
			setProposals(res.proposals);
		} catch (e) {
			setError(readableError(e));
		} finally {
			setBusy(false);
		}
	}
	async function create(i, p) {
		const starts = nextOccurrence(p.weekday, p.startMinute);
		const ends = new Date(starts.getTime() + (p.endMinute - p.startMinute) * 6e4);
		setCreating(i);
		const { error: err } = await supabase.rpc("create_study_session", {
			_title: p.title,
			_note: p.agenda,
			_starts: starts.toISOString(),
			_ends: ends.toISOString(),
			_invitees: selected
		});
		setCreating(null);
		if (err) return void toast.error(err.message);
		toast.success("Session created. Your partners were invited.");
		setProposals(null);
		queryClient.invalidateQueries({ queryKey: ["study-sessions"] });
	}
	if (requestsQuery.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin" });
	if (requestsQuery.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
		title: "Couldn't load your partners",
		message: readableError(requestsQuery.error),
		onRetry: () => requestsQuery.refetch()
	});
	if (!partners.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		icon: Users,
		title: "No study partners yet",
		description: "Find a partner first with the Find study partners tool. Once someone accepts your request (or you accept theirs) they show up here.",
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/partners",
				children: "Open Study Partners"
			})
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Choose up to 5 partners. The assistant finds times when you are all free, based on everyone's saved weekly availability, and writes a title and agenda for each option."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-2 md:grid-cols-2",
				children: partners.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "surface-card flex items-center gap-3 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
						id: `sp-${r.other_id}`,
						checked: selected.includes(r.other_id),
						onCheckedChange: (v) => setSelected((s) => v ? [...s, r.other_id].slice(0, 5) : s.filter((x) => x !== r.other_id))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						htmlFor: `sp-${r.other_id}`,
						className: "flex-1 cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-2 align-middle",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
								name: r.other_name,
								path: r.other_avatar,
								className: "size-7"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold",
								children: r.other_name
							})]
						}), r.other_major && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-2 text-xs text-muted-foreground",
							children: r.other_major
						})]
					})]
				}, r.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: find,
				disabled: busy || selected.length === 0,
				children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "mr-2 size-4" }), "Suggest session times"]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
				title: "Couldn't plan a session",
				message: error,
				onRetry: find
			}),
			proposals && proposals.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				icon: CalendarClock,
				title: "No shared free time",
				description: "You and the chosen partners have no overlapping free blocks of at least 30 minutes. Update availability in Settings or pick fewer partners."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-3 md:grid-cols-3",
				children: proposals?.map((p, i) => {
					const starts = nextOccurrence(p.weekday, p.startMinute);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "surface-card space-y-2 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold",
								children: p.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm",
								children: [
									fmtWhen(starts),
									" · ",
									p.endMinute - p.startMinute,
									" min"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: p.agenda
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								children: [
									p.freeCount,
									" of ",
									selected.length + 1,
									" free"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								disabled: creating !== null,
								onClick: () => create(i, p),
								children: [creating === i && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 size-4 animate-spin" }), "Create & invite"]
							}) })
						]
					}, `${p.weekday}-${p.startMinute}`);
				})
			})
		]
	});
}
/** Tools that are about you personally and do not need a team selected. */
var PERSONAL_TOOLS = ["partners", "sessionplan"];
var TOOLS = [
	{
		id: "plan",
		name: "Plan tasks",
		desc: "Tasks with due dates and the best-fit teammate",
		icon: ListChecks,
		tone: "bg-primary/15 text-primary",
		group: "Plan"
	},
	{
		id: "breakdown",
		name: "Break down a task",
		desc: "Split a big task into checklist steps",
		icon: Wrench,
		tone: "bg-primary/15 text-primary",
		group: "Plan"
	},
	{
		id: "summary",
		name: "Progress summary",
		desc: "Decisions, blockers and next steps",
		icon: FileText,
		tone: "bg-teal/15 text-teal",
		group: "Track"
	},
	{
		id: "checkin",
		name: "Weekly check-in",
		desc: "What everyone did and what's coming up",
		icon: CalendarCheck,
		tone: "bg-teal/15 text-teal",
		group: "Track"
	},
	{
		id: "agenda",
		name: "Meeting agenda",
		desc: "A time-boxed plan for your next session",
		icon: CalendarClock,
		tone: "bg-blue/15 text-blue",
		group: "Track"
	},
	{
		id: "study_guide",
		name: "Study guide",
		desc: "Key ideas and terms from your notes",
		icon: BookOpen,
		tone: "bg-lavender/15 text-lavender",
		group: "Study"
	},
	{
		id: "quiz",
		name: "Practice quiz",
		desc: "Test yourself, with an answer key",
		icon: CircleQuestionMark,
		tone: "bg-lavender/15 text-lavender",
		group: "Study"
	},
	{
		id: "partners",
		name: "Find study partners",
		desc: "Matched on courses, skills, free time and workload",
		icon: Handshake,
		tone: "bg-teal/15 text-teal",
		group: "Partners"
	},
	{
		id: "sessionplan",
		name: "Plan a study session",
		desc: "Times when you and your partners are all free",
		icon: CalendarClock,
		tone: "bg-teal/15 text-teal",
		group: "Partners"
	},
	{
		id: "teammates",
		name: "Teammate ideas",
		desc: "Students who fill your team's gaps",
		icon: UserPlus,
		tone: "bg-blue/15 text-blue",
		group: "Team"
	}
];
function AssistantHub() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const teamsQuery = useQuery({
		queryKey: ["teams"],
		queryFn: fetchMyTeams
	});
	const teams = teamsQuery.data ?? [];
	const [teamChoice, setTeamChoice] = (0, import_react.useState)("");
	const teamId = teamChoice || teams[0]?.id || "";
	const team = teams.find((t) => t.id === teamId);
	const [tool, setTool] = (0, import_react.useState)(null);
	const [question, setQuestion] = (0, import_react.useState)("");
	const [starting, setStarting] = (0, import_react.useState)(false);
	const panelRef = (0, import_react.useRef)(null);
	async function startChat(prompt) {
		if (!user || starting) return;
		setStarting(true);
		try {
			const id = await createThread(user.id, teamId || null);
			const q = prompt?.trim();
			navigate({
				to: "/assistant/chat/$threadId",
				params: { threadId: id },
				search: q ? { q } : {}
			});
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Couldn't start a chat.");
			setStarting(false);
		}
	}
	function pickTool(id) {
		setTool(id);
		requestAnimationFrame(() => panelRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "start"
		}));
	}
	if (teamsQuery.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "AI Assistant",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletons, { count: 3 })
	});
	if (teamsQuery.isSuccess && teams.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "AI Assistant",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: Users,
			title: "Join a team first",
			description: "TeamUp AI works from your team's real tasks, notes and members. Create or join a team to get started."
		})
	});
	const active = TOOLS.find((t) => t.id === tool);
	const prompts = pagePrompts(team ? `/teams/${team.id}` : "/dashboard").prompts;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "AI Assistant",
		description: "Everything the assistant writes is a draft — nothing is saved until you choose to.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
			value: teamId,
			onValueChange: (v) => {
				setTeamChoice(v);
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
				className: "w-56",
				"aria-label": "Team",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose a team" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: teams.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
				value: t.id,
				children: t.name
			}, t.id)) })]
		}),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-4 lg:grid-cols-[1fr_320px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						opacity: 0,
						y: 8
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: { duration: .25 },
					className: "surface-card relative overflow-hidden p-5 sm:p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/10 blur-3xl" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex items-start gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssistantMark, { className: "size-16 sm:size-20" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-xl font-bold",
									children: "Ask TeamUp AI anything"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted-foreground",
									children: [
										"It reads ",
										team ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-foreground",
											children: team.name
										}) : "your team",
										"'s tasks, notes, sessions and members, and answers as it types."
									]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "relative mt-5 flex gap-2",
							onSubmit: (e) => {
								e.preventDefault();
								if (question.trim()) startChat(question);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: question,
								onChange: (e) => setQuestion(e.target.value),
								placeholder: `e.g. What should ${team?.name ?? "we"} do next?`,
								"aria-label": "Ask TeamUp AI",
								maxLength: 2e3,
								className: "h-11"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								className: "h-11",
								disabled: starting || !question.trim(),
								children: [starting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "sr-only sm:not-sr-only",
									children: "Ask"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "relative mt-3 flex flex-wrap gap-2",
							children: prompts.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Suggestion, {
								suggestion: p,
								disabled: starting,
								className: "h-auto whitespace-normal py-1.5 text-left text-xs",
								onClick: (s) => void startChat(s)
							}, p))
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						opacity: 0,
						y: 8
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: {
						duration: .25,
						delay: .05
					},
					className: "surface-card flex flex-col p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display font-semibold",
							children: "Recent chats"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => void startChat(),
							disabled: starting,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquarePlus, { className: "mr-1 size-4" }), " New"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "max-h-72 overflow-y-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThreadList, { limit: 6 })
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-semibold",
						children: "AI tools"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mb-4 text-sm text-muted-foreground",
						children: [
							"Pick a tool for ",
							team?.name ?? "your team",
							". Results appear below."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-3 md:grid-cols-4",
						children: TOOLS.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
							type: "button",
							onClick: () => pickTool(t.id),
							initial: {
								opacity: 0,
								y: 8
							},
							animate: {
								opacity: 1,
								y: 0
							},
							transition: {
								duration: .2,
								delay: .03 * i
							},
							"aria-pressed": tool === t.id,
							className: cn("surface-card hover-lift flex flex-col items-start gap-3 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", tool === t.id && "ring-2 ring-primary"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("grid size-10 place-items-center rounded-xl", t.tone),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(t.icon, { className: "size-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground",
									children: t.group
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block font-semibold leading-tight",
									children: t.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-1 block text-xs text-muted-foreground",
									children: t.desc
								})
							] })]
						}, t.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: panelRef,
				className: "scroll-mt-24",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
					mode: "wait",
					children: active && (teamId || PERSONAL_TOOLS.includes(active.id)) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.section, {
						initial: {
							opacity: 0,
							y: 10
						},
						animate: {
							opacity: 1,
							y: 0
						},
						exit: { opacity: 0 },
						transition: { duration: .2 },
						className: "mt-6 rounded-2xl border border-border bg-muted/30 p-4 sm:p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("grid size-10 place-items-center rounded-xl", active.tone),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(active.icon, { className: "size-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-lg font-semibold",
								children: active.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted-foreground",
								children: [active.desc, PERSONAL_TOOLS.includes(active.id) ? "" : ` · ${team?.name ?? ""}`]
							})] })]
						}), active.id === "partners" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartnerMatchTool, {}) : active.id === "sessionplan" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SessionPlanTool, {}) : active.id === "plan" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanTool, { teamId }) : active.id === "teammates" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeammatesTool, { teamId }) : active.id === "breakdown" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreakdownTool, { teamId }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WriterTool, {
							tool: active.id,
							teamId
						})]
					}, `${active.id}-${teamId}`)
				})
			})
		]
	});
}
//#endregion
export { AssistantHub as component };
