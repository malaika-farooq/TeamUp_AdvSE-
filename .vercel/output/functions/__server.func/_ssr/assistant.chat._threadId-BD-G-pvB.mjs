import { i as __toESM } from "../_runtime.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as Button } from "./button-BkEFdjsN.mjs";
import { i as useQuery, r as useSuspenseQuery } from "../_libs/tanstack__react-query.mjs";
import { C as MessageSquareX, N as History, at as ArrowLeft, w as MessageSquarePlus } from "../_libs/lucide-react.mjs";
import { _ as pagePrompts, h as createThread, x as threadQuery } from "./ai-client-CJwzytaT.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useAuth } from "./auth-Bitinyml.mjs";
import { x as fetchMyTeams } from "./UserAvatar-CWAQ5zUT.mjs";
import { t as Route } from "./assistant.chat._threadId-BLizm8_O.mjs";
import { a as ChatWindow, f as SheetTitle, l as Sheet, o as EmptyState, p as SheetTrigger, t as AppShell, u as SheetContent } from "./states-BLyrGC0l.mjs";
import { t as ThreadList } from "./ThreadList-BcF4mLje.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/assistant.chat._threadId-BD-G-pvB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ThreadPage() {
	const { threadId } = Route.useParams();
	const { q } = Route.useSearch();
	const navigate = useNavigate();
	const { user } = useAuth();
	const { data } = useSuspenseQuery(threadQuery(threadId));
	const { data: teams = [] } = useQuery({
		queryKey: ["teams"],
		queryFn: fetchMyTeams
	});
	const clearPrompt = (0, import_react.useCallback)(() => {
		navigate({
			to: "/assistant/chat/$threadId",
			params: { threadId },
			search: {},
			replace: true
		});
	}, [navigate, threadId]);
	async function newChat() {
		if (!user) return;
		try {
			const id = await createThread(user.id, data?.thread.team_id ?? null);
			navigate({
				to: "/assistant/chat/$threadId",
				params: { threadId: id }
			});
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Couldn't start a chat.");
		}
	}
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Conversation not found",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: MessageSquareX,
			title: "This conversation doesn't exist",
			description: "It may have been deleted. Start a new one from the AI Assistant page."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/assistant",
					children: "Back to AI Assistant"
				})
			})
		})]
	});
	const team = teams.find((t) => t.id === data.thread.team_id);
	const prompts = team ? pagePrompts(`/teams/${team.id}`).prompts : pagePrompts("/dashboard").prompts;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: data.thread.title,
		description: team ? `About ${team.name}` : "About all your teams",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/assistant",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "mr-1 size-4" }), " AI tools"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					className: "lg:hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "mr-1 size-4" }), " Chats"]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
				side: "left",
				className: "w-80 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
					className: "mb-3 font-display",
					children: "Conversations"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThreadList, { activeId: threadId })]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				onClick: newChat,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquarePlus, { className: "mr-1 size-4" }), " New chat"]
			})
		] }),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "hidden lg:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-card sticky top-20 max-h-[calc(100vh-8rem)] overflow-y-auto p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
						children: "Conversations"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThreadList, { activeId: threadId })]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "surface-card flex h-[calc(100dvh-15rem)] min-h-[420px] min-w-0 flex-col p-3 sm:p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatWindow, {
					threadId,
					initialMessages: data.messages,
					initialPrompt: q,
					onInitialPromptSent: clearPrompt,
					suggestions: prompts,
					contextLabel: team ? team.name : "your teams, tasks and schedule",
					className: "flex-1"
				}, threadId)
			})]
		})
	});
}
//#endregion
export { ThreadPage as component };
