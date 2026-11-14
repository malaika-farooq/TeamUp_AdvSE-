import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as supabase } from "./client-yXxN1BOn.mjs";
import { a as require_jsx_runtime } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as Button } from "./button-BkEFdjsN.mjs";
import { i as useQuery, o as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { $ as CalendarClock, O as LoaderCircle, P as Handshake, X as Check, f as Sparkles, i as Users, t as X } from "../_libs/lucide-react.mjs";
import { v as readableError } from "./ai-client-CJwzytaT.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { s as UserAvatar } from "./UserAvatar-CWAQ5zUT.mjs";
import { o as EmptyState, r as Badge, s as ErrorState, t as AppShell } from "./states-BLyrGC0l.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-x-SErZBX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/partners-DnmGaLZI.js
var import_jsx_runtime = require_jsx_runtime();
function fmtWhen(d) {
	return d.toLocaleString([], {
		weekday: "short",
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit"
	});
}
function PartnersPage() {
	const queryClient = useQueryClient();
	const requestsQuery = useQuery({
		queryKey: ["partner-requests"],
		queryFn: async () => {
			const { data, error } = await supabase.rpc("my_partner_requests");
			if (error) throw error;
			return data ?? [];
		}
	});
	const incoming = (requestsQuery.data ?? []).filter((r) => r.direction === "incoming" && r.status === "pending");
	const refresh = () => {
		queryClient.invalidateQueries({ queryKey: ["partner-requests"] });
		queryClient.invalidateQueries({ queryKey: ["study-sessions"] });
		queryClient.invalidateQueries({ queryKey: ["notifications"] });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Study Partners",
		description: "Answer requests, see your partners and your upcoming study sessions.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/assistant",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-2 size-4" }), "Find partners with AI"]
			})
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: incoming.length ? "requests" : "partners",
			className: "space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "flex flex-wrap justify-start",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "requests",
							children: ["Requests", incoming.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: "ml-2",
								children: incoming.length
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "partners",
							children: "My partners"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "sessions",
							children: "Study sessions"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "requests",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestsTab, {
						query: requestsQuery,
						onChanged: refresh
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "partners",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartnersTab, { query: requestsQuery })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "sessions",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SessionsTab, { onChanged: refresh })
				})
			]
		})
	});
}
function RequestsTab({ query, onChanged }) {
	const respond = useMutation({
		mutationFn: async ({ id, accept }) => {
			const { error } = await supabase.rpc("respond_partner_request", {
				_request: id,
				_accept: accept
			});
			if (error) throw error;
			return accept;
		},
		onSuccess: (accept) => {
			toast.success(accept ? "You're now study partners." : "Request declined.");
			onChanged();
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't update the request.")
	});
	if (query.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin" });
	if (query.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
		title: "Couldn't load requests",
		message: readableError(query.error),
		onRetry: () => query.refetch()
	});
	const rows = query.data ?? [];
	if (!rows.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		icon: Handshake,
		title: "No requests yet",
		description: "Requests you send or receive show up here."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "grid gap-3 md:grid-cols-2",
		children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "surface-card space-y-2 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
							name: r.other_name,
							path: r.other_avatar,
							className: "size-8"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: r.other_name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: "ml-auto capitalize",
							children: [
								r.direction === "incoming" ? "Wants to study with you" : "You asked",
								" · ",
								r.status
							]
						})
					]
				}),
				r.other_major && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: r.other_major
				}),
				r.message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm",
					children: r.message
				}),
				r.direction === "incoming" && r.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						disabled: respond.isPending,
						onClick: () => respond.mutate({
							id: r.id,
							accept: true
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mr-1 size-4" }), "Accept"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						disabled: respond.isPending,
						onClick: () => respond.mutate({
							id: r.id,
							accept: false
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mr-1 size-4" }), "Decline"]
					})]
				})
			]
		}, r.id))
	});
}
function PartnersTab({ query }) {
	if (query.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin" });
	const partners = (query.data ?? []).filter((r) => r.status === "accepted");
	if (!partners.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		icon: Users,
		title: "No study partners yet",
		description: "Use the AI Assistant to find students who fit your courses, skills, free time and workload.",
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/assistant",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-2 size-4" }), "Find partners with AI"]
			})
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "grid gap-3 md:grid-cols-2",
			children: partners.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "surface-card flex items-center gap-3 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
					name: r.other_name,
					path: r.other_avatar,
					className: "size-10"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate font-semibold",
						children: r.other_name
					}), r.other_major && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-xs text-muted-foreground",
						children: r.other_major
					})]
				})]
			}, r.id))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/assistant",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "mr-2 size-4" }), "Plan a study session with AI"]
			})
		})]
	});
}
function SessionsTab({ onChanged }) {
	const sessionsQuery = useQuery({
		queryKey: ["study-sessions"],
		queryFn: async () => {
			const { data, error } = await supabase.rpc("my_study_sessions");
			if (error) throw error;
			return data ?? [];
		}
	});
	const respond = useMutation({
		mutationFn: async ({ id, accept }) => {
			const { error } = await supabase.rpc("respond_study_session", {
				_session: id,
				_accept: accept
			});
			if (error) throw error;
			return accept;
		},
		onSuccess: (accept) => {
			toast.success(accept ? "You're in." : "Declined.");
			onChanged();
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't update the invitation.")
	});
	if (sessionsQuery.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin" });
	if (sessionsQuery.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
		title: "Couldn't load sessions",
		message: readableError(sessionsQuery.error),
		onRetry: () => sessionsQuery.refetch()
	});
	const rows = sessionsQuery.data ?? [];
	if (!rows.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		icon: CalendarClock,
		title: "No study sessions",
		description: "Plan one from My partners and your invited partners will see it here."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "grid gap-3 md:grid-cols-2",
		children: rows.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "surface-card space-y-2 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: s.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm",
							children: fmtWhen(new Date(s.starts_at))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: s.is_creator ? "You organised this" : `Organised by ${s.creator_name}`
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: "ml-auto capitalize",
						children: s.my_status
					})]
				}),
				s.note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: s.note
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1.5",
					children: s.attendees.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "secondary",
						className: "gap-1.5 pl-1 capitalize",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
								name: a.name,
								path: a.avatar,
								className: "size-4",
								fallbackClassName: "text-[8px]"
							}),
							a.name,
							" · ",
							a.status
						]
					}, a.name))
				}),
				s.my_status === "invited" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						disabled: respond.isPending,
						onClick: () => respond.mutate({
							id: s.id,
							accept: true
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mr-1 size-4" }), "Accept"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						disabled: respond.isPending,
						onClick: () => respond.mutate({
							id: s.id,
							accept: false
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mr-1 size-4" }), "Decline"]
					})]
				})
			]
		}, s.id))
	});
}
//#endregion
export { PartnersPage as component };
