import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-yXxN1BOn.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { d as DialogContent$1, f as DialogDescription$1, h as DialogTitle$1, l as Dialog$1, m as DialogPortal$1, p as DialogOverlay$1, u as DialogClose } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as cn } from "./button-BkEFdjsN.mjs";
import { n as queryOptions } from "../_libs/tanstack__react-query.mjs";
import { X as Check, Y as ChevronDown, q as ChevronUp, t as X, tt as BookOpen } from "../_libs/lucide-react.mjs";
import { a as SelectItemIndicator, c as SelectPortal, d as SelectSeparator$1, f as SelectTrigger$1, i as SelectItem$1, l as SelectScrollDownButton$1, m as SelectViewport, n as SelectContent$1, o as SelectItemText, p as SelectValue$1, r as SelectIcon, s as SelectLabel$1, t as Select$1, u as SelectScrollUpButton$1 } from "../_libs/@radix-ui/react-select+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-client-CJwzytaT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ThemeContext = (0, import_react.createContext)({
	theme: "light",
	toggle: () => {},
	setTheme: () => {}
});
var themeInitScript = `(function(){try{var t=localStorage.getItem('studysync-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;
function ThemeProvider({ children }) {
	const [theme, setTheme] = (0, import_react.useState)("light");
	(0, import_react.useEffect)(() => {
		const initial = localStorage.getItem("studysync-theme") ?? null ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
		setTheme(initial);
		document.documentElement.classList.toggle("dark", initial === "dark");
	}, []);
	const toggle = (0, import_react.useCallback)(() => {
		setTheme((prev) => {
			const next = prev === "dark" ? "light" : "dark";
			localStorage.setItem("studysync-theme", next);
			document.documentElement.classList.toggle("dark", next === "dark");
			return next;
		});
	}, []);
	const apply = (0, import_react.useCallback)((next) => {
		setTheme(next);
		localStorage.setItem("studysync-theme", next);
		document.documentElement.classList.toggle("dark", next === "dark");
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeContext.Provider, {
		value: {
			theme,
			toggle,
			setTheme: apply
		},
		children
	});
}
var useTheme = () => (0, import_react.useContext)(ThemeContext);
/** The TeamUp logo: the same open book on the orange tile as the browser icon (public/icon.svg). */
function BrandMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		"aria-hidden": "true",
		className: cn("grid shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#FFAA55] to-[#E8622A] text-white shadow-sm ring-1 ring-black/5", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
			className: "size-[56%]",
			strokeWidth: 2.2
		})
	});
}
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
var Select = Select$1;
var SelectValue = SelectValue$1;
var SelectTrigger = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
	ref,
	className: cn("flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 opacity-50" })
	})]
}));
SelectTrigger.displayName = SelectTrigger$1.displayName;
var SelectScrollUpButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4" })
}));
SelectScrollUpButton.displayName = SelectScrollUpButton$1.displayName;
var SelectScrollDownButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" })
}));
SelectScrollDownButton.displayName = SelectScrollDownButton$1.displayName;
var SelectContent = import_react.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent$1, {
	ref,
	className: cn("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
	position,
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, {
			className: cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton, {})
	]
}) }));
SelectContent.displayName = SelectContent$1.displayName;
var SelectLabel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectLabel$1, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", className),
	...props
}));
SelectLabel.displayName = SelectLabel$1.displayName;
var SelectItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
	ref,
	className: cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children })]
}));
SelectItem.displayName = SelectItem$1.displayName;
var SelectSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSeparator$1, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
SelectSeparator.displayName = SelectSeparator$1.displayName;
var ERROR_MARK = "\0ERR:";
async function authHeaders() {
	const { data } = await supabase.auth.getSession();
	const token = data.session?.access_token;
	return token ? { Authorization: `Bearer ${token}` } : {};
}
function readableError(e) {
	const raw = e instanceof Error ? e.message : String(e ?? "");
	try {
		const parsed = JSON.parse(raw);
		if (parsed?.error) return parsed.error;
	} catch {}
	return raw || "The assistant is unavailable right now.";
}
/** Streams a written answer (summary, study guide, quiz, agenda, check-in). */
async function streamWrite(body, onText, signal) {
	const res = await fetch("/api/ai/write", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...await authHeaders()
		},
		body: JSON.stringify(body),
		signal
	});
	if (!res.ok || !res.body) {
		let message = "The assistant is unavailable right now.";
		try {
			message = (await res.json()).error ?? message;
		} catch {}
		throw new Error(message);
	}
	const reader = res.body.getReader();
	const decoder = new TextDecoder();
	let text = "";
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		text += decoder.decode(value, { stream: true });
		const errAt = text.indexOf(ERROR_MARK);
		if (errAt >= 0) {
			onText(text.slice(0, errAt));
			throw new Error(text.slice(errAt + 5));
		}
		onText(text);
	}
	return text;
}
var threadsQuery = () => queryOptions({
	queryKey: ["ai-threads"],
	queryFn: async () => {
		const { data, error } = await supabase.from("ai_threads").select("id, title, team_id, updated_at").order("updated_at", { ascending: false }).limit(50);
		if (error) throw new Error(error.message);
		return data ?? [];
	}
});
var threadQuery = (threadId) => queryOptions({
	queryKey: ["ai-thread", threadId],
	staleTime: 0,
	queryFn: async () => {
		const [{ data: thread, error }, { data: rows, error: msgErr }] = await Promise.all([supabase.from("ai_threads").select("id, title, team_id, updated_at").eq("id", threadId).maybeSingle(), supabase.from("ai_messages").select("id, role, parts, created_at").eq("thread_id", threadId).order("created_at", { ascending: true })]);
		if (error) throw new Error(error.message);
		if (msgErr) throw new Error(msgErr.message);
		if (!thread) return null;
		return {
			thread,
			messages: (rows ?? []).map((r) => ({
				id: r.id,
				role: r.role === "assistant" ? "assistant" : "user",
				parts: (Array.isArray(r.parts) ? r.parts : []).filter((p) => !!p && typeof p === "object" && p.type === "text").map((p) => ({
					type: "text",
					text: String(p.text ?? "")
				}))
			}))
		};
	}
});
async function createThread(userId, teamId) {
	const { data, error } = await supabase.from("ai_threads").insert({
		user_id: userId,
		team_id: teamId
	}).select("id").single();
	if (error) throw new Error(error.message);
	return data.id;
}
async function deleteThread(threadId) {
	const { error } = await supabase.from("ai_threads").delete().eq("id", threadId);
	if (error) throw new Error(error.message);
}
/** Suggested questions for the page the student is looking at. */
function pagePrompts(pathname) {
	if (/^\/teams\/[^/]+/.test(pathname)) return {
		label: "this team",
		prompts: [
			"Summarize where this team stands right now",
			"What are our biggest blockers?",
			"Is anyone overloaded with tasks?"
		]
	};
	if (pathname.startsWith("/teams")) return {
		label: "your teams",
		prompts: [
			"Which of my teams needs the most attention?",
			"How do I invite someone to my team?",
			"What makes a good project goal?"
		]
	};
	if (pathname.startsWith("/tasks")) return {
		label: "your tasks",
		prompts: [
			"What should I work on first?",
			"Which tasks are at risk of missing their deadline?",
			"Help me break my biggest task into steps"
		]
	};
	if (pathname.startsWith("/calendar")) return {
		label: "your calendar",
		prompts: [
			"Help me plan my study time this week",
			"Draft an agenda for our next meeting",
			"What deadlines are coming up soon?"
		]
	};
	if (pathname.startsWith("/resources")) return {
		label: "your resources",
		prompts: [
			"Explain our notes in simple terms",
			"Quiz me on our latest notes",
			"What topics are missing from our notes?"
		]
	};
	if (pathname.startsWith("/discover")) return {
		label: "finding teammates",
		prompts: [
			"What kind of teammate would help my team most?",
			"How do I join a public team?",
			"Write a short intro I can use when asking to join"
		]
	};
	if (pathname.startsWith("/settings")) return {
		label: "your settings",
		prompts: [
			"Why should I add my weekly availability?",
			"How do I make my profile discoverable?",
			"Help me write a short bio"
		]
	};
	return {
		label: "your day",
		prompts: [
			"What should I focus on today?",
			"Summarize what's due this week",
			"Do I have any overdue tasks?"
		]
	};
}
//#endregion
export { useTheme as C, threadsQuery as S, pagePrompts as _, DialogFooter as a, themeInitScript as b, Select as c, SelectTrigger as d, SelectValue as f, deleteThread as g, createThread as h, DialogDescription as i, SelectContent as l, authHeaders as m, Dialog as n, DialogHeader as o, ThemeProvider as p, DialogContent as r, DialogTitle as s, BrandMark as t, SelectItem as u, readableError as v, threadQuery as x, streamWrite as y };
