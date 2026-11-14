import { i as __toESM } from "../_runtime.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { r as cn } from "./button-BkEFdjsN.mjs";
import { i as useQuery, o as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { S as MessageSquare, l as Trash2 } from "../_libs/lucide-react.mjs";
import { S as threadsQuery, g as deleteThread } from "./ai-client-CJwzytaT.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { x as fetchMyTeams } from "./UserAvatar-CWAQ5zUT.mjs";
import { h as Skeleton } from "./states-BLyrGC0l.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-Bjv_scU6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ThreadList-BcF4mLje.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ThreadList({ activeId, limit, onNavigate }) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { data, isLoading } = useQuery(threadsQuery());
	const { data: teams = [] } = useQuery({
		queryKey: ["teams"],
		queryFn: fetchMyTeams
	});
	const [toDelete, setToDelete] = (0, import_react.useState)(null);
	const threads = (data ?? []).slice(0, limit ?? 50);
	async function confirmDelete() {
		if (!toDelete) return;
		try {
			await deleteThread(toDelete.id);
			toast.success("Conversation deleted");
			await queryClient.invalidateQueries({ queryKey: ["ai-threads"] });
			if (toDelete.id === activeId) navigate({ to: "/assistant" });
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Couldn't delete the conversation.");
		} finally {
			setToDelete(null);
		}
	}
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-2",
		children: [
			0,
			1,
			2
		].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 w-full rounded-xl" }, i))
	});
	if (!threads.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "px-1 text-sm text-muted-foreground",
		children: "No conversations yet."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-1",
		children: threads.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: cn("group flex items-center gap-1 rounded-xl transition-colors", t.id === activeId ? "bg-accent" : "hover:bg-muted"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/assistant/chat/$threadId",
				params: { threadId: t.id },
				onClick: onNavigate,
				className: "flex min-w-0 flex-1 items-center gap-2 rounded-xl px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block truncate text-sm font-medium",
						children: t.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "block truncate text-[11px] text-muted-foreground",
						children: [
							teams.find((x) => x.id === t.team_id)?.name ?? "All my teams",
							" ·",
							" ",
							new Date(t.updated_at).toLocaleDateString()
						]
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setToDelete(t),
				className: "mr-1 grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
				"aria-label": `Delete conversation ${t.title}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
			})]
		}, t.id))
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
		open: !!toDelete,
		onOpenChange: (o) => !o && setToDelete(null),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Delete this conversation?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
			"\"",
			toDelete?.title,
			"\" and all its messages will be removed. This can't be undone."
		] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
			onClick: confirmDelete,
			children: "Delete"
		})] })] })
	})] });
}
//#endregion
export { ThreadList as t };
