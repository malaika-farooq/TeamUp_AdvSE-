import { i as __toESM } from "../_runtime.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as supabase } from "./client-yXxN1BOn.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as Button } from "./button-BkEFdjsN.mjs";
import { i as useQuery, o as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { O as LoaderCircle, X as Check, g as Plus, i as Users, t as X } from "../_libs/lucide-react.mjs";
import { a as DialogFooter, c as Select, d as SelectTrigger, f as SelectValue, i as DialogDescription, l as SelectContent, n as Dialog, o as DialogHeader, r as DialogContent, s as DialogTitle, u as SelectItem } from "./ai-client-CJwzytaT.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { L as parseCourse, c as accentClasses, s as UserAvatar, t as ACCENTS, x as fetchMyTeams } from "./UserAvatar-CWAQ5zUT.mjs";
import { t as Input } from "./input-o8_kklxJ.mjs";
import { t as Textarea } from "./textarea-DpZdO9KZ.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { i as CardSkeletons, o as EmptyState, r as Badge, s as ErrorState, t as AppShell } from "./states-BLyrGC0l.mjs";
import { t as Label } from "./label-BEbnXoK8.mjs";
import { a as declineInvitation, f as requestCounts, l as myInvitations, o as ensureCourse, t as acceptInvitation } from "./team-queries-DxvAyhx0.mjs";
import { d as canManage, f as expiresText, i as ROLE_LABEL } from "./team-rules-DG0EiWUj.mjs";
import { n as stagger, t as fadeUp } from "./motion-DF95JR_G.mjs";
import { t as Route } from "./teams.index-AjBsMpKj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/teams.index-BuZuQN9H.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TeamsPage() {
	const search = Route.useSearch();
	const navigate = useNavigate();
	const [open, setOpen] = (0, import_react.useState)(!!search.create);
	const teamsQuery = useQuery({
		queryKey: ["teams"],
		queryFn: fetchMyTeams
	});
	const invitesQuery = useQuery({
		queryKey: ["my-invitations"],
		queryFn: myInvitations
	});
	const countsQuery = useQuery({
		queryKey: ["request-counts"],
		queryFn: async () => {
			try {
				return await requestCounts();
			} catch {
				return {};
			}
		}
	});
	(0, import_react.useEffect)(() => {
		if (search.create) setOpen(true);
	}, [search.create]);
	function closeDialog(next) {
		setOpen(next);
		if (!next && search.create) navigate({
			to: "/teams",
			search: {},
			replace: true
		});
	}
	const teams = teamsQuery.data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "My Teams",
		description: "Study groups, labs and project teams you are part of.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			onClick: () => setOpen(true),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 size-4" }), "Create Team"]
		}),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvitationsPanel, { invitations: invitesQuery.data ?? [] }),
			teamsQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletons, {}) : teamsQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
				message: teamsQuery.error.message,
				onRetry: () => teamsQuery.refetch()
			}) : teams.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				icon: Users,
				title: "You're not in a team yet",
				description: "Create a team for your next group project, or browse public teams looking for members.",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => setOpen(true),
						children: "Create a team"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/discover",
							children: "Discover teams"
						})
					})]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				variants: stagger,
				initial: "hidden",
				animate: "show",
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: teams.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					variants: fadeUp,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/teams/$teamId",
						params: { teamId: t.id },
						className: "surface-card hover-lift block h-full p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-semibold",
									children: t.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: accentClasses(t.accent),
									children: t.role
								})]
							}),
							canManage(t.role) && (countsQuery.data?.[t.id] ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								className: "mt-2",
								children: [
									countsQuery.data?.[t.id],
									" join request",
									countsQuery.data?.[t.id] === 1 ? "" : "s",
									" waiting"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 line-clamp-2 text-sm text-muted-foreground",
								children: t.description || "No description yet."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "secondary",
										children: t.visibility
									}),
									t.deadline && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "secondary",
										children: ["Due ", t.deadline]
									}),
									t.is_sample && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "secondary",
										children: "Sample"
									})
								]
							})
						]
					})
				}, t.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateTeamDialog, {
				open,
				onOpenChange: closeDialog
			})
		]
	});
}
function CreateTeamDialog({ open, onOpenChange }) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		description: "",
		course: "",
		goal: "",
		deadline: "",
		visibility: "private",
		accent: "teal"
	});
	async function submit(e) {
		e.preventDefault();
		if (form.name.trim().length < 2) {
			toast.error("Give your team a name with at least 2 characters.");
			return;
		}
		setBusy(true);
		try {
			const course = parseCourse(form.course);
			const courseId = course ? await ensureCourse(course.code, course.title) : null;
			const { data, error } = await supabase.rpc("create_team", {
				_name: form.name.trim(),
				_description: form.description || null,
				_course_id: courseId,
				_project_goal: form.goal || null,
				_deadline: form.deadline || null,
				_visibility: form.visibility,
				_accent: form.accent
			});
			if (error) throw error;
			toast.success("Team created");
			queryClient.invalidateQueries();
			onOpenChange(false);
			navigate({
				to: "/teams/$teamId",
				params: { teamId: data }
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not create the team");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90vh] overflow-y-auto sm:max-w-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create a team" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Public teams appear in Discover so classmates can request to join." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "tn",
							children: "Team name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "tn",
							value: form.name,
							onChange: (e) => setForm({
								...form,
								name: e.target.value
							}),
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "td",
							children: "Description"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "td",
							rows: 2,
							value: form.description,
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
								htmlFor: "tc",
								children: "Course"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "tc",
								placeholder: "CS201 Data Structures",
								value: form.course,
								onChange: (e) => setForm({
									...form,
									course: e.target.value
								})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "tdl",
								children: "Deadline (optional)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "tdl",
								type: "date",
								value: form.deadline,
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
							htmlFor: "tg",
							children: "Project goal"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "tg",
							rows: 2,
							value: form.goal,
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
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Visibility" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.visibility,
								onValueChange: (v) => setForm({
									...form,
									visibility: v
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "private",
									children: "Private — invite only"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "public",
									children: "Public — listed in Discover"
								})] })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Accent colour" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.accent,
								onValueChange: (v) => setForm({
									...form,
									accent: v
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: ACCENTS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: a,
									children: a
								}, a)) })]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: () => onOpenChange(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						disabled: busy,
						children: [busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Create team"]
					})] })
				]
			})]
		})
	});
}
function InvitationsPanel({ invitations }) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [busy, setBusy] = (0, import_react.useState)(null);
	if (invitations.length === 0) return null;
	async function answer(inv, accept) {
		setBusy(inv.id);
		try {
			if (accept) {
				const teamId = await acceptInvitation(inv.token);
				toast.success(`You joined ${inv.team_name}.`);
				await queryClient.invalidateQueries();
				navigate({
					to: "/teams/$teamId",
					params: { teamId }
				});
			} else {
				await declineInvitation(inv.token);
				toast.success("Invitation declined.");
				await queryClient.invalidateQueries({ queryKey: ["my-invitations"] });
				await queryClient.invalidateQueries({ queryKey: ["notifications"] });
			}
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Couldn't answer the invitation.");
			queryClient.invalidateQueries({ queryKey: ["my-invitations"] });
		} finally {
			setBusy(null);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Team invitations",
		className: "mb-6 space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "text-sm font-semibold",
			children: ["Invitations for you ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				className: "ml-1",
				children: invitations.length
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "grid gap-3 md:grid-cols-2",
			children: invitations.map((inv) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "surface-card space-y-3 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
						name: inv.inviter_name,
						path: inv.inviter_avatar,
						className: "size-10"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-semibold",
							children: inv.team_name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate text-xs text-muted-foreground",
							children: [
								inv.inviter_name ?? "A teammate",
								" invited you as",
								" ",
								ROLE_LABEL[inv.role].toLowerCase(),
								" · ",
								expiresText(inv.expires_at)
							]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						disabled: busy === inv.id,
						onClick: () => answer(inv, true),
						children: [busy === inv.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1.5 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mr-1.5 size-4" }), "Accept"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						disabled: busy === inv.id,
						onClick: () => answer(inv, false),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mr-1.5 size-4" }), "Decline"]
					})]
				})]
			}, inv.id))
		})]
	});
}
//#endregion
export { CreateTeamDialog, TeamsPage as component };
