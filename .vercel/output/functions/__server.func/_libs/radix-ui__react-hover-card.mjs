import { i as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "./@ai-sdk/react+[...].mjs";
import { A as createContextScope, C as DismissableLayer, F as useComposedRefs, b as Presence } from "./@radix-ui/react-alert-dialog+[...].mjs";
import { t as composeEventHandlers } from "./radix-ui__primitive.mjs";
import { _ as Content, y as createPopperScope } from "./@radix-ui/react-dropdown-menu+[...].mjs";
//#region node_modules/@radix-ui/react-hover-card/dist/index.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", {
	value,
	configurable: true
});
var originalBodyUserSelect;
var HOVERCARD_NAME = "HoverCard";
var [createHoverCardContext, createHoverCardScope] = createContextScope(HOVERCARD_NAME, [createPopperScope]);
var usePopperScope = createPopperScope();
var [HoverCardProvider, useHoverCardContext] = createHoverCardContext(HOVERCARD_NAME);
var [PortalProvider, usePortalContext] = createHoverCardContext("HoverCardPortal", { forceMount: void 0 });
var CONTENT_NAME = "HoverCardContent";
var HoverCardContent = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function HoverCardContent2(props, forwardedRef) {
	const portalContext = usePortalContext(CONTENT_NAME, props.__scopeHoverCard);
	const { forceMount = portalContext.forceMount, ...contentProps } = props;
	const context = useHoverCardContext(CONTENT_NAME, props.__scopeHoverCard);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Presence, {
		present: forceMount || context.open,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoverCardContentImpl, {
			"data-state": context.open ? "open" : "closed",
			...contentProps,
			onPointerEnter: composeEventHandlers(props.onPointerEnter, excludeTouch(context.onOpen)),
			onPointerLeave: composeEventHandlers(props.onPointerLeave, excludeTouch(context.onClose)),
			ref: forwardedRef
		})
	});
}, "HoverCardContent"));
var HoverCardContentImpl = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function HoverCardContentImpl2(props, forwardedRef) {
	const { __scopeHoverCard, onEscapeKeyDown, onPointerDownOutside, onFocusOutside, onInteractOutside, ...contentProps } = props;
	const context = useHoverCardContext(CONTENT_NAME, __scopeHoverCard);
	const popperScope = usePopperScope(__scopeHoverCard);
	const ref = import_react.useRef(null);
	const composedRefs = useComposedRefs(forwardedRef, ref);
	const [containSelection, setContainSelection] = import_react.useState(false);
	import_react.useEffect(() => {
		if (containSelection) {
			const body = document.body;
			originalBodyUserSelect = body.style.userSelect || body.style.webkitUserSelect;
			body.style.userSelect = "none";
			body.style.webkitUserSelect = "none";
			return () => {
				body.style.userSelect = originalBodyUserSelect;
				body.style.webkitUserSelect = originalBodyUserSelect;
			};
		}
	}, [containSelection]);
	import_react.useEffect(() => {
		if (ref.current) {
			const handlePointerUp = /* @__PURE__ */ __name(() => {
				setContainSelection(false);
				context.isPointerDownOnContentRef.current = false;
				setTimeout(() => {
					if (document.getSelection()?.toString() !== "") context.hasSelectionRef.current = true;
				});
			}, "handlePointerUp");
			document.addEventListener("pointerup", handlePointerUp);
			return () => {
				document.removeEventListener("pointerup", handlePointerUp);
				context.hasSelectionRef.current = false;
				context.isPointerDownOnContentRef.current = false;
			};
		}
	}, [context.isPointerDownOnContentRef, context.hasSelectionRef]);
	import_react.useEffect(() => {
		if (ref.current) getTabbableNodes(ref.current).forEach((tabbable) => tabbable.setAttribute("tabindex", "-1"));
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DismissableLayer, {
		asChild: true,
		disableOutsidePointerEvents: false,
		onInteractOutside,
		onEscapeKeyDown,
		onPointerDownOutside,
		onFocusOutside: composeEventHandlers(onFocusOutside, (event) => {
			event.preventDefault();
		}),
		onDismiss: context.onDismiss,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
			...popperScope,
			...contentProps,
			onPointerDown: composeEventHandlers(contentProps.onPointerDown, (event) => {
				if (event.currentTarget.contains(event.target)) setContainSelection(true);
				context.hasSelectionRef.current = false;
				context.isPointerDownOnContentRef.current = true;
			}),
			ref: composedRefs,
			style: {
				...contentProps.style,
				userSelect: containSelection ? "text" : void 0,
				WebkitUserSelect: containSelection ? "text" : void 0,
				"--radix-hover-card-content-transform-origin": "var(--radix-popper-transform-origin)",
				"--radix-hover-card-content-available-width": "var(--radix-popper-available-width)",
				"--radix-hover-card-content-available-height": "var(--radix-popper-available-height)",
				"--radix-hover-card-trigger-width": "var(--radix-popper-anchor-width)",
				"--radix-hover-card-trigger-height": "var(--radix-popper-anchor-height)"
			}
		})
	});
}, "HoverCardContentImpl"));
function excludeTouch(eventHandler) {
	return (event) => event.pointerType === "touch" ? void 0 : eventHandler();
}
__name(excludeTouch, "excludeTouch");
function getTabbableNodes(container) {
	const nodes = [];
	const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, { acceptNode: /* @__PURE__ */ __name((node) => {
		return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	}, "acceptNode") });
	while (walker.nextNode()) nodes.push(walker.currentNode);
	return nodes;
}
__name(getTabbableNodes, "getTabbableNodes");
var Content2 = HoverCardContent;
//#endregion
export { Content2 as t };
