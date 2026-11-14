import { i as __toESM } from "../_runtime.mjs";
import { b as Link, p as useRouterState, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as supabase } from "./client-yXxN1BOn.mjs";
import { a as require_jsx_runtime, n as DefaultChatTransport, o as require_react, t as useChat } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as Ui } from "../_libs/streamdown+[...].mjs";
import { d as DialogContent, f as DialogDescription, g as DialogTrigger, h as DialogTitle, l as Dialog, m as DialogPortal, p as DialogOverlay, u as DialogClose } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as cn, t as Button } from "./button-BkEFdjsN.mjs";
import { i as useQuery, o as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { A as ListChecks, B as CornerDownLeft, D as LogOut, H as Compass, J as ChevronRight, L as FolderOpen, M as LayoutDashboard, O as LoaderCircle, P as Handshake, Q as CalendarDays, T as Menu, V as Copy, W as Circle, X as Check, _ as PanelLeftOpen, b as Moon, c as TriangleAlert, d as Square, f as Sparkles, h as RefreshCw, i as Users, m as Search, nt as Bell, ot as ArrowDown, p as Settings, rt as ArrowUpRight, t as X, u as Sun, v as PanelLeftClose, w as MessageSquarePlus } from "../_libs/lucide-react.mjs";
import { a as Label2, c as Root2, d as SubTrigger2, f as Trigger, i as ItemIndicator2, l as Separator2, n as Content2, o as Portal2, r as Item2, s as RadioItem2, t as CheckboxItem2, u as SubContent2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { C as useTheme, _ as pagePrompts, c as Select, d as SelectTrigger, f as SelectValue, h as createThread, l as SelectContent, m as authHeaders, t as BrandMark, u as SelectItem, v as readableError } from "./ai-client-CJwzytaT.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useAuth } from "./auth-Bitinyml.mjs";
import { C as fetchProfile, S as fetchNotifications, s as UserAvatar, x as fetchMyTeams } from "./UserAvatar-CWAQ5zUT.mjs";
import { t as Input } from "./input-o8_kklxJ.mjs";
import { t as Textarea } from "./textarea-DpZdO9KZ.mjs";
import { n as AnimatePresence } from "../_libs/framer-motion+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { i as Trigger$1, n as Portal, r as Root2$1, t as Content2$1 } from "../_libs/radix-ui__react-popover.mjs";
import { a as Viewport, i as ScrollAreaThumb, n as Root, r as ScrollAreaScrollbar, t as Corner } from "../_libs/radix-ui__react-scroll-area.mjs";
import { n as useStickToBottomContext, t as StickToBottom } from "../_libs/use-stick-to-bottom.mjs";
import { t as Root$1 } from "../_libs/radix-ui__react-separator.mjs";
import { a as Trigger$2, i as Root3, n as Portal$1, r as Provider, t as Content2$2 } from "../_libs/radix-ui__react-tooltip.mjs";
import { t as W } from "../_libs/shiki+streamdown__code.mjs";
import { t as _e } from "../_libs/cmdk.mjs";
import { t as Content2$3 } from "../_libs/radix-ui__react-hover-card.mjs";
import { t as nanoid } from "../_libs/nanoid.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/states-BLyrGC0l.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
	variants: { variant: {
		default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
		secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
		destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
		outline: "text-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var Popover = Root2$1;
var PopoverTrigger = Trigger$1;
var PopoverContent = import_react.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2$1, {
	ref,
	align,
	sideOffset,
	className: cn("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)", className),
	...props
}) }));
PopoverContent.displayName = Content2$1.displayName;
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
var DropdownMenuSubTrigger = import_react.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SubTrigger2, {
	ref,
	className: cn("flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", inset && "pl-8", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-auto" })]
}));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
var DropdownMenuSubContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubContent2, {
	ref,
	className: cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}));
DropdownMenuSubContent.displayName = SubContent2.displayName;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}) }));
DropdownMenuContent.displayName = Content2.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0", inset && "pl-8", className),
	...props
}));
DropdownMenuItem.displayName = Item2.displayName;
var DropdownMenuCheckboxItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CheckboxItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), children]
}));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
var DropdownMenuRadioItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-2 w-2 fill-current" }) })
	}), children]
}));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
var DropdownMenuLabel = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label2, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
	...props
}));
DropdownMenuLabel.displayName = Label2.displayName;
var DropdownMenuSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
DropdownMenuSeparator.displayName = Separator2.displayName;
var DropdownMenuShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest opacity-60", className),
		...props
	});
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
var Sheet = Dialog;
var SheetTrigger = DialogTrigger;
var SheetPortal = DialogPortal;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = DialogOverlay.displayName;
var sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out", {
	variants: { side: {
		top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = import_react.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	}), children]
})] }));
SheetContent.displayName = DialogContent.displayName;
var SheetHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
SheetFooter.displayName = "SheetFooter";
var SheetTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
	ref,
	className: cn("text-lg font-semibold text-foreground", className),
	...props
}));
SheetTitle.displayName = DialogTitle.displayName;
var SheetDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
SheetDescription.displayName = DialogDescription.displayName;
var ScrollArea = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root, {
	ref,
	className: cn("relative overflow-hidden", className),
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
			className: "h-full w-full rounded-[inherit]",
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollBar, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Corner, {})
	]
}));
ScrollArea.displayName = Root.displayName;
var ScrollBar = import_react.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaScrollbar, {
	ref,
	orientation,
	className: cn("flex touch-none select-none transition-colors", orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]", orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
}));
ScrollBar.displayName = ScrollAreaScrollbar.displayName;
var Suggestions = ({ className, children, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrollArea, {
	className: "w-full overflow-x-auto whitespace-nowrap",
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex w-max flex-nowrap items-center gap-2", className),
		children
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollBar, {
		className: "hidden",
		orientation: "horizontal"
	})]
});
var Suggestion = ({ suggestion, onClick, className, variant = "outline", size = "sm", children, ...props }) => {
	const handleClick = (0, import_react.useCallback)(() => {
		onClick?.(suggestion);
	}, [onClick, suggestion]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		className: cn("cursor-pointer rounded-full px-4", className),
		onClick: handleClick,
		size,
		type: "button",
		variant,
		...props,
		children: children || suggestion
	});
};
var teamup_owl_default = "/assets/teamup-owl-C5MVoxmO.png";
/** TeamUp AI's identity: the study owl. */
function AssistantMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: teamup_owl_default,
		alt: "",
		"aria-hidden": true,
		width: 256,
		height: 256,
		loading: "lazy",
		className: cn("size-10 shrink-0 select-none object-contain", className)
	});
}
var Conversation = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickToBottom, {
	className: cn("relative flex-1 overflow-y-hidden", className),
	initial: "smooth",
	resize: "smooth",
	role: "log",
	...props
});
var ConversationContent = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickToBottom.Content, {
	className: cn("flex flex-col gap-8 p-4", className),
	...props
});
var ConversationEmptyState = ({ className, title = "No messages yet", description = "Start a conversation to see messages here", icon, children, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex size-full flex-col items-center justify-center gap-3 p-8 text-center", className),
	...props,
	children: children ?? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-muted-foreground",
		children: icon
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "font-medium text-sm",
			children: title
		}), description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground text-sm",
			children: description
		})]
	})] })
});
var ConversationScrollButton = ({ className, ...props }) => {
	const { isAtBottom, scrollToBottom } = useStickToBottomContext();
	const handleScrollToBottom = (0, import_react.useCallback)(() => {
		scrollToBottom();
	}, [scrollToBottom]);
	return !isAtBottom && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		className: cn("absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full dark:bg-background dark:hover:bg-muted", className),
		onClick: handleScrollToBottom,
		size: "icon",
		type: "button",
		variant: "outline",
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "size-4" })
	});
};
var Separator = import_react.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root$1, {
	ref,
	decorative,
	orientation,
	className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className),
	...props
}));
Separator.displayName = Root$1.displayName;
cva("flex w-fit items-stretch has-[>[data-slot=button-group]]:gap-2 [&>*]:focus-visible:relative [&>*]:focus-visible:z-10 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1", {
	variants: { orientation: {
		horizontal: "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none",
		vertical: "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none"
	} },
	defaultVariants: { orientation: "horizontal" }
});
var TooltipProvider = Provider;
var Tooltip = Root3;
var TooltipTrigger = Trigger$2;
var TooltipContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal$1, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2$2, {
	ref,
	sideOffset,
	className: cn("z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-tooltip-content-transform-origin)", className),
	...props
}) }));
TooltipContent.displayName = Content2$2.displayName;
/**
* - `** Title **` (spaces inside the stars) doesn't render as bold, so trim the spaces.
* - A heading glued to the previous line doesn't render as a heading, so add a blank line.
*/
function tidyMarkdown(text) {
	return text.replace(/\*\*[ \t]*([^*\n]*?[^*\s])[ \t]*\*\*/g, "**$1**").replace(/([^\n])\n(#{1,6} )/g, "$1\n\n$2");
}
var Message = ({ className, from, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("group flex w-full max-w-[95%] flex-col gap-2", from === "user" ? "is-user ml-auto justify-end" : "is-assistant", className),
	...props
});
var MessageContent = ({ children, className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("is-user:dark flex w-fit min-w-0 max-w-full flex-col gap-2 overflow-hidden text-sm", "group-[.is-user]:ml-auto group-[.is-user]:rounded-lg group-[.is-user]:bg-secondary group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-foreground", "group-[.is-assistant]:text-foreground", className),
	...props,
	children
});
var MessageActions = ({ className, children, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex items-center gap-1", className),
	...props,
	children
});
var MessageAction = ({ tooltip, children, label, variant = "ghost", size = "icon-sm", ...props }) => {
	const button = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		size,
		type: "button",
		variant,
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: label || tooltip
		})]
	});
	if (tooltip) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
		asChild: true,
		children: button
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: tooltip }) })] }) });
	return button;
};
(0, import_react.createContext)(null);
var streamdownPlugins = { code: W };
var MessageResponse = (0, import_react.memo)(({ className, children, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ui, {
	className: cn("size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className),
	plugins: streamdownPlugins,
	...props,
	children: typeof children === "string" ? tidyMarkdown(children) : ""
}), (prevProps, nextProps) => prevProps.children === nextProps.children && nextProps.isAnimating === prevProps.isAnimating);
MessageResponse.displayName = "MessageResponse";
var Command$1 = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e, {
	ref,
	className: cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className),
	...props
}));
Command$1.displayName = _e.displayName;
var CommandInput = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	className: "flex items-center border-b px-3",
	"cmdk-input-wrapper": "",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Input, {
		ref,
		className: cn("flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	})]
}));
CommandInput.displayName = _e.Input.displayName;
var CommandList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.List, {
	ref,
	className: cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className),
	...props
}));
CommandList.displayName = _e.List.displayName;
var CommandEmpty = import_react.forwardRef((props, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Empty, {
	ref,
	className: "py-6 text-center text-sm",
	...props
}));
CommandEmpty.displayName = _e.Empty.displayName;
var CommandGroup = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Group, {
	ref,
	className: cn("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", className),
	...props
}));
CommandGroup.displayName = _e.Group.displayName;
var CommandSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Separator, {
	ref,
	className: cn("-mx-1 h-px bg-border", className),
	...props
}));
CommandSeparator.displayName = _e.Separator.displayName;
var CommandItem = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Item, {
	ref,
	className: cn("relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", className),
	...props
}));
CommandItem.displayName = _e.Item.displayName;
var CommandShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest text-muted-foreground", className),
		...props
	});
};
CommandShortcut.displayName = "CommandShortcut";
var HoverCardContent = import_react.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2$3, {
	ref,
	align,
	sideOffset,
	className: cn("z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-hover-card-content-transform-origin)", className),
	...props
}));
HoverCardContent.displayName = Content2$3.displayName;
function InputGroup({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "input-group",
		role: "group",
		className: cn("group/input-group border-input dark:bg-input/30 shadow-xs relative flex w-full items-center rounded-md border outline-none transition-[color,box-shadow]", "h-9 has-[>textarea]:h-auto", "has-[>[data-align=inline-start]]:[&>input]:pl-2", "has-[>[data-align=inline-end]]:[&>input]:pr-2", "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3", "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3", "has-[[data-slot=input-group-control]:focus-visible]:ring-ring has-[[data-slot=input-group-control]:focus-visible]:ring-1", "has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40", className),
		...props
	});
}
var inputGroupAddonVariants = cva("text-muted-foreground flex h-auto cursor-text select-none items-center justify-center gap-2 py-1.5 text-sm font-medium group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4", {
	variants: { align: {
		"inline-start": "order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
		"inline-end": "order-last pr-3 has-[>button]:mr-[-0.4rem] has-[>kbd]:mr-[-0.35rem]",
		"block-start": "[.border-b]:pb-3 order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5",
		"block-end": "[.border-t]:pt-3 order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5"
	} },
	defaultVariants: { align: "inline-start" }
});
function InputGroupAddon({ className, align = "inline-start", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "group",
		"data-slot": "input-group-addon",
		"data-align": align,
		className: cn(inputGroupAddonVariants({ align }), className),
		onClick: (e) => {
			if (e.target.closest("button")) return;
			e.currentTarget.parentElement?.querySelector("input")?.focus();
		},
		...props
	});
}
var inputGroupButtonVariants = cva("flex items-center gap-2 text-sm shadow-none", {
	variants: { size: {
		xs: "h-6 gap-1 rounded-[calc(var(--radius)-5px)] px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
		sm: "h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5",
		"icon-xs": "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
		"icon-sm": "size-8 p-0 has-[>svg]:p-0"
	} },
	defaultVariants: { size: "xs" }
});
function InputGroupButton({ className, type = "button", variant = "ghost", size = "xs", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type,
		"data-size": size,
		variant,
		className: cn(inputGroupButtonVariants({ size }), className),
		...props
	});
}
function InputGroupTextarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
		"data-slot": "input-group-control",
		className: cn("flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent", className),
		...props
	});
}
function Spinner({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
		role: "status",
		"aria-label": "Loading",
		className: cn("size-4 animate-spin", className),
		...props
	});
}
var convertBlobUrlToDataUrl = async (url) => {
	try {
		const blob = await (await fetch(url)).blob();
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result);
			reader.onerror = () => resolve(null);
			reader.readAsDataURL(blob);
		});
	} catch {
		return null;
	}
};
var PromptInputController = (0, import_react.createContext)(null);
var ProviderAttachmentsContext = (0, import_react.createContext)(null);
var useOptionalPromptInputController = () => (0, import_react.useContext)(PromptInputController);
var useOptionalProviderAttachments = () => (0, import_react.useContext)(ProviderAttachmentsContext);
var LocalAttachmentsContext = (0, import_react.createContext)(null);
var usePromptInputAttachments = () => {
	const provider = useOptionalProviderAttachments();
	const context = (0, import_react.useContext)(LocalAttachmentsContext) ?? provider;
	if (!context) throw new Error("usePromptInputAttachments must be used within a PromptInput or PromptInputProvider");
	return context;
};
var LocalReferencedSourcesContext = (0, import_react.createContext)(null);
var PromptInput = ({ className, accept, multiple, globalDrop, syncHiddenInput, maxFiles, maxFileSize, onError, onSubmit, children, ...props }) => {
	const controller = useOptionalPromptInputController();
	const usingProvider = !!controller;
	const inputRef = (0, import_react.useRef)(null);
	const formRef = (0, import_react.useRef)(null);
	const [items, setItems] = (0, import_react.useState)([]);
	const files = usingProvider ? controller.attachments.files : items;
	const [referencedSources, setReferencedSources] = (0, import_react.useState)([]);
	const filesRef = (0, import_react.useRef)(files);
	(0, import_react.useEffect)(() => {
		filesRef.current = files;
	}, [files]);
	const openFileDialogLocal = (0, import_react.useCallback)(() => {
		inputRef.current?.click();
	}, []);
	const matchesAccept = (0, import_react.useCallback)((f) => {
		if (!accept || accept.trim() === "") return true;
		return accept.split(",").map((s) => s.trim()).filter(Boolean).some((pattern) => {
			if (pattern.endsWith("/*")) {
				const prefix = pattern.slice(0, -1);
				return f.type.startsWith(prefix);
			}
			return f.type === pattern;
		});
	}, [accept]);
	const addLocal = (0, import_react.useCallback)((fileList) => {
		const incoming = [...fileList];
		const accepted = incoming.filter((f) => matchesAccept(f));
		if (incoming.length && accepted.length === 0) {
			onError?.({
				code: "accept",
				message: "No files match the accepted types."
			});
			return;
		}
		const withinSize = (f) => maxFileSize ? f.size <= maxFileSize : true;
		const sized = accepted.filter(withinSize);
		if (accepted.length > 0 && sized.length === 0) {
			onError?.({
				code: "max_file_size",
				message: "All files exceed the maximum size."
			});
			return;
		}
		setItems((prev) => {
			const capacity = typeof maxFiles === "number" ? Math.max(0, maxFiles - prev.length) : void 0;
			const capped = typeof capacity === "number" ? sized.slice(0, capacity) : sized;
			if (typeof capacity === "number" && sized.length > capacity) onError?.({
				code: "max_files",
				message: "Too many files. Some were not added."
			});
			const next = [];
			for (const file of capped) next.push({
				filename: file.name,
				id: nanoid(),
				mediaType: file.type,
				type: "file",
				url: URL.createObjectURL(file)
			});
			return [...prev, ...next];
		});
	}, [
		matchesAccept,
		maxFiles,
		maxFileSize,
		onError
	]);
	const removeLocal = (0, import_react.useCallback)((id) => setItems((prev) => {
		const found = prev.find((file) => file.id === id);
		if (found?.url) URL.revokeObjectURL(found.url);
		return prev.filter((file) => file.id !== id);
	}), []);
	const addWithProviderValidation = (0, import_react.useCallback)((fileList) => {
		const incoming = [...fileList];
		const accepted = incoming.filter((f) => matchesAccept(f));
		if (incoming.length && accepted.length === 0) {
			onError?.({
				code: "accept",
				message: "No files match the accepted types."
			});
			return;
		}
		const withinSize = (f) => maxFileSize ? f.size <= maxFileSize : true;
		const sized = accepted.filter(withinSize);
		if (accepted.length > 0 && sized.length === 0) {
			onError?.({
				code: "max_file_size",
				message: "All files exceed the maximum size."
			});
			return;
		}
		const currentCount = files.length;
		const capacity = typeof maxFiles === "number" ? Math.max(0, maxFiles - currentCount) : void 0;
		const capped = typeof capacity === "number" ? sized.slice(0, capacity) : sized;
		if (typeof capacity === "number" && sized.length > capacity) onError?.({
			code: "max_files",
			message: "Too many files. Some were not added."
		});
		if (capped.length > 0) controller?.attachments.add(capped);
	}, [
		matchesAccept,
		maxFileSize,
		maxFiles,
		onError,
		files.length,
		controller
	]);
	const clearAttachments = (0, import_react.useCallback)(() => usingProvider ? controller?.attachments.clear() : setItems((prev) => {
		for (const file of prev) if (file.url) URL.revokeObjectURL(file.url);
		return [];
	}), [usingProvider, controller]);
	const clearReferencedSources = (0, import_react.useCallback)(() => setReferencedSources([]), []);
	const add = usingProvider ? addWithProviderValidation : addLocal;
	const remove = usingProvider ? controller.attachments.remove : removeLocal;
	const openFileDialog = usingProvider ? controller.attachments.openFileDialog : openFileDialogLocal;
	const clear = (0, import_react.useCallback)(() => {
		clearAttachments();
		clearReferencedSources();
	}, [clearAttachments, clearReferencedSources]);
	(0, import_react.useEffect)(() => {
		if (!usingProvider) return;
		controller.__registerFileInput(inputRef, () => inputRef.current?.click());
	}, [usingProvider, controller]);
	(0, import_react.useEffect)(() => {
		if (syncHiddenInput && inputRef.current && files.length === 0) inputRef.current.value = "";
	}, [files, syncHiddenInput]);
	(0, import_react.useEffect)(() => {
		const form = formRef.current;
		if (!form) return;
		if (globalDrop) return;
		const onDragOver = (e) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
		};
		const onDrop = (e) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
			if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) add(e.dataTransfer.files);
		};
		form.addEventListener("dragover", onDragOver);
		form.addEventListener("drop", onDrop);
		return () => {
			form.removeEventListener("dragover", onDragOver);
			form.removeEventListener("drop", onDrop);
		};
	}, [add, globalDrop]);
	(0, import_react.useEffect)(() => {
		if (!globalDrop) return;
		const onDragOver = (e) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
		};
		const onDrop = (e) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
			if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) add(e.dataTransfer.files);
		};
		document.addEventListener("dragover", onDragOver);
		document.addEventListener("drop", onDrop);
		return () => {
			document.removeEventListener("dragover", onDragOver);
			document.removeEventListener("drop", onDrop);
		};
	}, [add, globalDrop]);
	(0, import_react.useEffect)(() => () => {
		if (!usingProvider) {
			for (const f of filesRef.current) if (f.url) URL.revokeObjectURL(f.url);
		}
	}, [usingProvider]);
	const handleChange = (0, import_react.useCallback)((event) => {
		if (event.currentTarget.files) add(event.currentTarget.files);
		event.currentTarget.value = "";
	}, [add]);
	const attachmentsCtx = (0, import_react.useMemo)(() => ({
		add,
		clear: clearAttachments,
		fileInputRef: inputRef,
		files: files.map((item) => ({
			...item,
			id: item.id
		})),
		openFileDialog,
		remove
	}), [
		files,
		add,
		remove,
		clearAttachments,
		openFileDialog
	]);
	const refsCtx = (0, import_react.useMemo)(() => ({
		add: (incoming) => {
			const array = Array.isArray(incoming) ? incoming : [incoming];
			setReferencedSources((prev) => [...prev, ...array.map((s) => ({
				...s,
				id: nanoid()
			}))]);
		},
		clear: clearReferencedSources,
		remove: (id) => {
			setReferencedSources((prev) => prev.filter((s) => s.id !== id));
		},
		sources: referencedSources
	}), [referencedSources, clearReferencedSources]);
	const handleSubmit = (0, import_react.useCallback)(async (event) => {
		event.preventDefault();
		const form = event.currentTarget;
		const text = usingProvider ? controller.textInput.value : (() => {
			return new FormData(form).get("message") || "";
		})();
		if (!usingProvider) form.reset();
		try {
			const result = onSubmit({
				files: await Promise.all(files.map(async ({ id: _id, ...item }) => {
					if (item.url?.startsWith("blob:")) {
						const dataUrl = await convertBlobUrlToDataUrl(item.url);
						return {
							...item,
							url: dataUrl ?? item.url
						};
					}
					return item;
				})),
				text
			}, event);
			if (result instanceof Promise) try {
				await result;
				clear();
				if (usingProvider) controller.textInput.clear();
			} catch {}
			else {
				clear();
				if (usingProvider) controller.textInput.clear();
			}
		} catch {}
	}, [
		usingProvider,
		controller,
		files,
		onSubmit,
		clear
	]);
	const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		accept,
		"aria-label": "Upload files",
		className: "hidden",
		multiple,
		onChange: handleChange,
		ref: inputRef,
		title: "Upload files",
		type: "file"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
		className: cn("w-full", className),
		onSubmit: handleSubmit,
		ref: formRef,
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroup, {
			className: "overflow-hidden",
			children
		})
	})] });
	const withReferencedSources = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocalReferencedSourcesContext.Provider, {
		value: refsCtx,
		children: inner
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocalAttachmentsContext.Provider, {
		value: attachmentsCtx,
		children: withReferencedSources
	});
};
var PromptInputTextarea = ({ onChange, onKeyDown, className, placeholder = "What would you like to know?", ...props }) => {
	const controller = useOptionalPromptInputController();
	const attachments = usePromptInputAttachments();
	const [isComposing, setIsComposing] = (0, import_react.useState)(false);
	const handleKeyDown = (0, import_react.useCallback)((e) => {
		onKeyDown?.(e);
		if (e.defaultPrevented) return;
		if (e.key === "Enter") {
			if (isComposing || e.nativeEvent.isComposing) return;
			if (e.shiftKey) return;
			e.preventDefault();
			const { form } = e.currentTarget;
			if ((form?.querySelector("button[type=\"submit\"]"))?.disabled) return;
			form?.requestSubmit();
		}
		if (e.key === "Backspace" && e.currentTarget.value === "" && attachments.files.length > 0) {
			e.preventDefault();
			const lastAttachment = attachments.files.at(-1);
			if (lastAttachment) attachments.remove(lastAttachment.id);
		}
	}, [
		onKeyDown,
		isComposing,
		attachments
	]);
	const handlePaste = (0, import_react.useCallback)((event) => {
		const items = event.clipboardData?.items;
		if (!items) return;
		const files = [];
		for (const item of items) if (item.kind === "file") {
			const file = item.getAsFile();
			if (file) files.push(file);
		}
		if (files.length > 0) {
			event.preventDefault();
			attachments.add(files);
		}
	}, [attachments]);
	const handleCompositionEnd = (0, import_react.useCallback)(() => setIsComposing(false), []);
	const handleCompositionStart = (0, import_react.useCallback)(() => setIsComposing(true), []);
	const controlledProps = controller ? {
		onChange: (e) => {
			controller.textInput.setInput(e.currentTarget.value);
			onChange?.(e);
		},
		value: controller.textInput.value
	} : { onChange };
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupTextarea, {
		className: cn("field-sizing-content max-h-48 min-h-16", className),
		name: "message",
		onCompositionEnd: handleCompositionEnd,
		onCompositionStart: handleCompositionStart,
		onKeyDown: handleKeyDown,
		onPaste: handlePaste,
		placeholder,
		...props,
		...controlledProps
	});
};
var PromptInputFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupAddon, {
	align: "block-end",
	className: cn("justify-between gap-1", className),
	...props
});
var PromptInputSubmit = ({ className, variant = "default", size = "icon-sm", status, onStop, onClick, children, ...props }) => {
	const isGenerating = status === "submitted" || status === "streaming";
	let Icon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CornerDownLeft, { className: "size-4" });
	if (status === "submitted") Icon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spinner, {});
	else if (status === "streaming") Icon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-4" });
	else if (status === "error") Icon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" });
	const handleClick = (0, import_react.useCallback)((e) => {
		if (isGenerating && onStop) {
			e.preventDefault();
			onStop();
			return;
		}
		onClick?.(e);
	}, [
		isGenerating,
		onStop,
		onClick
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupButton, {
		"aria-label": isGenerating ? "Stop" : "Submit",
		className: cn(className),
		onClick: handleClick,
		size,
		type: isGenerating && onStop ? "button" : "submit",
		variant,
		...props,
		children: children ?? Icon
	});
};
var motionComponentCache = /* @__PURE__ */ new Map();
var getMotionComponent = (element) => {
	let component = motionComponentCache.get(element);
	if (!component) {
		component = motion.create(element);
		motionComponentCache.set(element, component);
	}
	return component;
};
var ShimmerComponent = ({ children, as: Component = "p", className, duration = 2, spread = 2 }) => {
	const MotionComponent = getMotionComponent(Component);
	const dynamicSpread = (0, import_react.useMemo)(() => (children?.length ?? 0) * spread, [children, spread]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MotionComponent, {
		animate: { backgroundPosition: "0% center" },
		className: cn("relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent", "[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--color-background),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]", className),
		initial: { backgroundPosition: "100% center" },
		style: {
			"--spread": `${dynamicSpread}px`,
			backgroundImage: "var(--bg), linear-gradient(var(--color-muted-foreground), var(--color-muted-foreground))"
		},
		transition: {
			duration,
			ease: "linear",
			repeat: Number.POSITIVE_INFINITY
		},
		children
	});
};
var Shimmer = (0, import_react.memo)(ShimmerComponent);
function textOf(m) {
	return m.parts.map((p) => p.type === "text" ? p.text : "").join("").trim();
}
function ChatWindow({ threadId, initialMessages, initialPrompt, onInitialPromptSent, suggestions = [], contextLabel, className }) {
	const queryClient = useQueryClient();
	const textareaRef = (0, import_react.useRef)(null);
	const sentInitial = (0, import_react.useRef)(false);
	const transport = (0, import_react.useMemo)(() => new DefaultChatTransport({
		api: "/api/ai/chat",
		headers: authHeaders,
		prepareSendMessagesRequest: ({ id, messages }) => ({ body: {
			threadId: id,
			message: messages[messages.length - 1]
		} })
	}), []);
	const { messages, sendMessage, status, stop, error, regenerate, clearError } = useChat({
		id: threadId,
		messages: initialMessages,
		transport,
		onFinish: () => {
			queryClient.invalidateQueries({ queryKey: ["ai-threads"] });
			queryClient.invalidateQueries({ queryKey: ["ai-thread", threadId] });
			textareaRef.current?.focus();
		}
	});
	(0, import_react.useEffect)(() => {
		textareaRef.current?.focus();
	}, [threadId]);
	const sendRef = (0, import_react.useRef)(sendMessage);
	sendRef.current = sendMessage;
	const sentCallbackRef = (0, import_react.useRef)(onInitialPromptSent);
	sentCallbackRef.current = onInitialPromptSent;
	(0, import_react.useEffect)(() => {
		if (!initialPrompt || sentInitial.current || initialMessages.length > 0) return;
		const timer = setTimeout(() => {
			if (sentInitial.current) return;
			sentInitial.current = true;
			sendRef.current({ text: initialPrompt });
			sentCallbackRef.current?.();
		}, 0);
		return () => clearTimeout(timer);
	}, [initialPrompt, initialMessages.length]);
	const busy = status === "submitted" || status === "streaming";
	function send(text) {
		const clean = text.trim();
		if (!clean || busy) return;
		if (error) clearError();
		sendMessage({ text: clean });
		textareaRef.current?.focus();
	}
	const last = messages[messages.length - 1];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex min-h-0 w-full min-w-0 flex-col", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Conversation, {
				className: "min-h-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ConversationContent, {
					className: "gap-6",
					children: [
						messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ConversationEmptyState, {
							className: "gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssistantMark, { className: "size-20" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-display text-lg font-semibold",
										children: "Hi, I'm TeamUp AI"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "max-w-sm text-sm text-muted-foreground",
										children: [
											"Ask me about ",
											contextLabel ?? "your teams, tasks and schedule",
											". I read your real records and never change anything without you."
										]
									})]
								}),
								suggestions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex max-w-md flex-wrap justify-center gap-2",
									children: suggestions.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Suggestion, {
										suggestion: s,
										onClick: send
									}, s))
								})
							]
						}) : messages.map((m) => {
							const isLast = m.id === last?.id;
							const streaming = isLast && status === "streaming" && m.role === "assistant";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Message, {
								from: m.role,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageContent, {
									className: cn("group-[.is-user]:bg-navy group-[.is-user]:text-navy-foreground", "group-[.is-assistant]:w-full"),
									children: m.parts.map((p, i) => p.type === "text" ? m.role === "assistant" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageResponse, {
										isAnimating: streaming,
										children: p.text
									}, i) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "whitespace-pre-wrap",
										children: p.text
									}, i) : null)
								}), m.role === "assistant" && !streaming && textOf(m) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MessageActions, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageAction, {
									tooltip: "Copy",
									onClick: () => {
										navigator.clipboard.writeText(textOf(m));
										toast.success("Copied");
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" })
								}), isLast && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageAction, {
									tooltip: "Try again",
									onClick: () => void regenerate(),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" })
								})] })]
							}, m.id);
						}),
						status === "submitted" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Message, {
							from: "assistant",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shimmer, { children: "Thinking…" }) })
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							role: "alert",
							className: "flex flex-wrap items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1",
								children: readableError(error)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => void regenerate(),
								children: "Try again"
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConversationScrollButton, {})]
			}),
			messages.length > 0 && suggestions.length > 0 && !busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Suggestions, {
				className: "px-1 pb-2",
				children: suggestions.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Suggestion, {
					suggestion: s,
					onClick: send,
					className: "text-xs"
				}, s))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PromptInput, {
				onSubmit: (msg) => send(msg.text),
				className: "shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromptInputTextarea, {
					ref: textareaRef,
					placeholder: "Ask TeamUp AI…",
					"aria-label": "Message TeamUp AI"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PromptInputFooter, {
					className: "justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] text-muted-foreground",
						children: "Answers use your team's records. Double-check before you rely on them."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromptInputSubmit, {
						status,
						onStop: stop
					})]
				})]
			})
		]
	});
}
var GENERAL = "general";
/**
* Page-aware AI helper: a "need a hand?" card at the end of each page plus a
* floating button, both opening a side chat with suggestions for that page.
*/
function AIHelper() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { user } = useAuth();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [threadId, setThreadId] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(void 0);
	const [starting, setStarting] = (0, import_react.useState)(false);
	const [teamChoice, setTeamChoice] = (0, import_react.useState)(null);
	const teams = useQuery({
		queryKey: ["teams"],
		queryFn: fetchMyTeams,
		enabled: !!user
	}).data ?? [];
	const routeTeam = pathname.match(/^\/teams\/([0-9a-f-]{36})/)?.[1];
	const teamId = teamChoice ?? (routeTeam && teams.some((t) => t.id === routeTeam) ? routeTeam : GENERAL);
	const { label, prompts } = pagePrompts(pathname);
	const teamName = teams.find((t) => t.id === teamId)?.name;
	if (pathname.startsWith("/assistant") || pathname.startsWith("/onboarding")) return null;
	function reset() {
		setThreadId(null);
		setPending(void 0);
	}
	async function start(prompt) {
		if (!user || starting) return;
		setStarting(true);
		try {
			const id = await createThread(user.id, teamId === GENERAL ? null : teamId);
			setPending(prompt);
			setThreadId(id);
			setOpen(true);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Couldn't start a chat.");
		} finally {
			setStarting(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			"aria-label": "Ask TeamUp AI",
			className: "surface-card mt-10 flex flex-col gap-4 p-5 sm:flex-row sm:items-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssistantMark, { className: "size-14" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-display font-semibold",
					children: [
						"Need a hand with ",
						label,
						"?"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "TeamUp AI reads your real tasks, notes and schedule to help."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: prompts.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Suggestion, {
						suggestion: p,
						className: "h-auto whitespace-normal py-1.5 text-left text-xs",
						disabled: starting,
						onClick: (s) => void start(s)
					}, p))
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
			type: "button",
			onClick: () => setOpen(true),
			initial: {
				scale: .8,
				opacity: 0
			},
			animate: {
				scale: 1,
				opacity: 1
			},
			whileHover: { y: -2 },
			transition: { duration: .2 },
			className: "fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-4 shadow-lg transition-shadow hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:bottom-6 lg:right-6",
			"aria-label": "Open TeamUp AI",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssistantMark, { className: "size-9" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-semibold",
				children: "Ask AI"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
			open,
			onOpenChange: setOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
				side: "right",
				className: "flex w-full flex-col gap-0 p-0 sm:max-w-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 border-b border-border p-4 pr-12",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssistantMark, { className: "size-10" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
								className: "font-display text-base",
								children: "TeamUp AI"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, {
								className: "truncate text-xs",
								children: teamName ? `Helping with ${teamName}` : "Helping across all your teams"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 border-b border-border px-4 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: teamId,
							onValueChange: (v) => {
								setTeamChoice(v);
								reset();
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-8 flex-1 text-xs",
								"aria-label": "What should the AI focus on?",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: GENERAL,
								children: "All my teams"
							}), teams.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: t.id,
								children: t.name
							}, t.id))] })]
						}), threadId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: reset,
							"aria-label": "New chat",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquarePlus, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/assistant/chat/$threadId",
								params: { threadId },
								onClick: () => setOpen(false),
								"aria-label": "Open in full chat",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4" })
							})
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
						mode: "wait",
						children: threadId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
							initial: { opacity: 0 },
							animate: { opacity: 1 },
							className: "flex min-h-0 flex-1 flex-col p-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatWindow, {
								threadId,
								initialMessages: [],
								initialPrompt: pending,
								onInitialPromptSent: () => setPending(void 0),
								contextLabel: teamName ?? "your teams",
								className: "flex-1"
							})
						}, threadId) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: { opacity: 0 },
							animate: { opacity: 1 },
							className: "flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssistantMark, { className: "size-20" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-lg font-semibold",
									children: "How can I help?"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted-foreground",
									children: [
										"Pick a suggestion for ",
										label,
										", or start a blank chat."
									]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex w-full flex-col gap-2",
									children: prompts.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Suggestion, {
										suggestion: p,
										disabled: starting,
										className: "h-auto w-full justify-start whitespace-normal rounded-xl py-2 text-left",
										onClick: (s) => void start(s)
									}, p))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									disabled: starting || !user,
									onClick: async () => {
										if (!user) return;
										setStarting(true);
										try {
											setThreadId(await createThread(user.id, teamId === GENERAL ? null : teamId));
										} catch (e) {
											toast.error(e instanceof Error ? e.message : "Couldn't start a chat.");
										} finally {
											setStarting(false);
										}
									},
									children: [starting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquarePlus, { className: "mr-2 size-4" }), "Blank chat"]
								})
							]
						}, "start")
					})
				]
			})
		})
	] });
}
var NAV = [
	{
		to: "/dashboard",
		label: "Dashboard",
		icon: LayoutDashboard
	},
	{
		to: "/teams",
		label: "My Teams",
		icon: Users
	},
	{
		to: "/discover",
		label: "Discover",
		icon: Compass
	},
	{
		to: "/partners",
		label: "Study Partners",
		icon: Handshake
	},
	{
		to: "/tasks",
		label: "Tasks",
		icon: ListChecks
	},
	{
		to: "/calendar",
		label: "Calendar",
		icon: CalendarDays
	},
	{
		to: "/resources",
		label: "Resources",
		icon: FolderOpen
	},
	{
		to: "/assistant",
		label: "AI Assistant",
		icon: Sparkles
	},
	{
		to: "/settings",
		label: "Settings",
		icon: Settings
	}
];
var MOBILE_NAV = NAV.filter((n) => [
	"/dashboard",
	"/teams",
	"/tasks",
	"/calendar",
	"/assistant"
].includes(n.to));
function AppShell({ children, title, description, actions }) {
	const [collapsed, setCollapsed] = (0, import_react.useState)(false);
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	(0, import_react.useEffect)(() => {
		const stored = localStorage.getItem("studysync-nav-collapsed");
		if (stored) setCollapsed(stored === "1");
	}, []);
	function toggleCollapsed() {
		setCollapsed((prev) => {
			localStorage.setItem("studysync-nav-collapsed", prev ? "0" : "1");
			return !prev;
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: cn("fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 lg:flex", collapsed ? "w-[76px]" : "w-64"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex h-16 items-center gap-2 px-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, { className: "size-9" }), !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-lg font-bold",
							children: "TeamUp"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex-1 space-y-1 px-3 py-2",
						children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
							item,
							active: pathname.startsWith(item.to),
							collapsed
						}, item.to))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: toggleCollapsed,
							className: "w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
							"aria-label": collapsed ? "Expand navigation" : "Collapse navigation",
							children: [collapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeftOpen, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeftClose, { className: "size-4" }), !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2",
								children: "Collapse"
							})]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("transition-[padding] duration-200", collapsed ? "lg:pl-[76px]" : "lg:pl-64"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
					className: "mx-auto max-w-6xl px-4 pb-28 pt-6 lg:pb-12",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: {
								opacity: 0,
								y: 8
							},
							animate: {
								opacity: 1,
								y: 0
							},
							transition: { duration: .2 },
							className: "mb-6 flex flex-wrap items-end justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-2xl font-bold sm:text-3xl",
								children: title
							}), description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: description
							})] }), actions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: actions
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
							mode: "wait",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
								initial: {
									opacity: 0,
									y: 8
								},
								animate: {
									opacity: 1,
									y: 0
								},
								exit: { opacity: 0 },
								transition: { duration: .2 },
								children
							}, pathname)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AIHelper, {})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-5",
					children: MOBILE_NAV.map((item) => {
						const active = pathname.startsWith(item.to);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("flex min-h-[60px] flex-col items-center justify-center gap-1 text-[11px] transition-colors", active ? "text-primary" : "text-muted-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-5" }), item.label.replace("AI ", "")]
						}, item.to);
					})
				})
			})
		]
	});
}
function NavItem({ item, active, collapsed }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: item.to,
		title: item.label,
		className: cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200", active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-[18px] shrink-0" }), !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate",
			children: item.label
		})]
	});
}
function TopBar() {
	const { theme, toggle } = useTheme();
	const { user } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [query, setQuery] = (0, import_react.useState)("");
	const { data: profile } = useQuery({
		queryKey: ["profile", user?.id],
		queryFn: () => fetchProfile(user.id),
		enabled: !!user
	});
	const { data: notifications = [] } = useQuery({
		queryKey: ["notifications"],
		queryFn: fetchNotifications,
		enabled: !!user
	});
	(0, import_react.useEffect)(() => {
		if (!user) return;
		const channel = supabase.channel("notifications-topbar").on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "notifications",
			filter: `user_id=eq.${user.id}`
		}, () => queryClient.invalidateQueries({ queryKey: ["notifications"] })).subscribe();
		return () => {
			supabase.removeChannel(channel);
		};
	}, [user, queryClient]);
	const unread = notifications.filter((n) => !n.read_at);
	async function markAllRead() {
		if (!unread.length) return;
		await supabase.from("notifications").update({ read_at: (/* @__PURE__ */ new Date()).toISOString() }).in("id", unread.map((n) => n.id));
		queryClient.invalidateQueries({ queryKey: ["notifications"] });
	}
	async function signOut() {
		await queryClient.cancelQueries();
		queryClient.clear();
		await supabase.auth.signOut();
		navigate({
			to: "/auth",
			search: {
				mode: "signin",
				redirect: void 0
			},
			replace: true
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					className: "lg:hidden",
					"aria-label": "Open menu",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
				side: "left",
				className: "w-72 bg-sidebar p-0 text-sidebar-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
					className: "px-5 pt-5 font-display text-lg text-sidebar-foreground",
					children: "TeamUp"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "space-y-1 p-3",
					children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						item,
						active: pathname.startsWith(item.to),
						collapsed: false
					}, item.to))
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "relative hidden max-w-sm flex-1 sm:block",
				onSubmit: (e) => {
					e.preventDefault();
					navigate({
						to: "/tasks",
						search: { q: query || void 0 }
					});
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: query,
					onChange: (e) => setQuery(e.target.value),
					placeholder: "Search tasks…",
					className: "pl-9",
					"aria-label": "Search tasks"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ml-auto flex items-center gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "icon",
							className: "relative",
							"aria-label": "Notifications",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-5" }), unread.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground",
								children: unread.length > 9 ? "9+" : unread.length
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
						align: "end",
						className: "w-80 p-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between border-b border-border p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold",
								children: "Notifications"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: markAllRead,
								disabled: !unread.length,
								children: "Mark all read"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
							className: "max-h-80",
							children: notifications.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "p-6 text-center text-sm text-muted-foreground",
								children: "You're all caught up."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "divide-y divide-border",
								children: notifications.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: cn("p-3", !n.read_at && "bg-primary/5"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-medium",
											children: n.title
										}),
										n.body && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: n.body
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-1 flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[11px] text-muted-foreground",
												children: new Date(n.created_at).toLocaleString()
											}), !n.read_at && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "secondary",
												className: "h-4 px-1.5 text-[10px]",
												children: "New"
											})]
										})
									]
								}, n.id))
							})
						})]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						onClick: toggle,
						"aria-label": "Toggle theme",
						children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "Account menu",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
								name: profile?.display_name ?? user?.email ?? "Student",
								path: profile?.avatar_url,
								className: "size-8"
							})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
						align: "end",
						className: "w-56",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuLabel, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold",
									children: profile?.display_name ?? "Student"
								}),
								(profile?.university || profile?.major) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs font-normal text-muted-foreground",
									children: [profile?.major, profile?.university].filter(Boolean).join(" · ")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs font-normal text-muted-foreground",
									children: user?.email
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/settings",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "mr-2 size-4" }), "Settings"]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onClick: signOut,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "mr-2 size-4" }), "Sign out"]
							})
						]
					})] })
				]
			})
		]
	});
}
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-primary/10", className),
		...props
	});
}
function CardSkeletons({ count = 3 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
		children: Array.from({ length: count }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface-card space-y-3 p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-24" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-32" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-full" })
			]
		}, i))
	});
}
function EmptyState({ icon: Icon, title, description, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface-card flex flex-col items-center gap-3 p-10 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-6" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-lg font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-sm text-sm text-muted-foreground",
				children: description
			}),
			action
		]
	});
}
function ErrorState({ message, onRetry, title = "Something went wrong" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "alert",
		className: "surface-card flex flex-col items-center gap-3 p-10 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-8 text-destructive" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-lg font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-sm text-sm text-muted-foreground",
				children: message
			}),
			onRetry && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: onRetry,
				children: "Try again"
			})
		]
	});
}
//#endregion
export { tidyMarkdown as _, ChatWindow as a, MessageResponse as c, SheetHeader as d, SheetTitle as f, Suggestion as g, Skeleton as h, CardSkeletons as i, Sheet as l, Shimmer as m, AssistantMark as n, EmptyState as o, SheetTrigger as p, Badge as r, ErrorState as s, AppShell as t, SheetContent as u };
