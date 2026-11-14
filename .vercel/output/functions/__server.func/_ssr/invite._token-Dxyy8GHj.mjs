import { i as __toESM } from "../_runtime.mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as Button } from "./button-BkEFdjsN.mjs";
import { O as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useAuth } from "./auth-Bitinyml.mjs";
import { a as declineInvitation, t as acceptInvitation, u as previewInvitation } from "./team-queries-DxvAyhx0.mjs";
import { i as ROLE_LABEL, p as invitationProblem, r as ROLE_HELP } from "./team-rules-DG0EiWUj.mjs";
import { t as Route } from "./invite._token-Csc_Lg_d.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/invite._token-Dxyy8GHj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function InvitePage() {
	const { token } = Route.useParams();
	const { user, loading } = useAuth();
	const navigate = useNavigate();
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [loadError, setLoadError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const userId = user?.id;
	(0, import_react.useEffect)(() => {
		let live = true;
		previewInvitation(token).then((p) => live && setPreview(p)).catch((e) => live && setLoadError(e instanceof Error ? e.message : "Couldn't load the invitation."));
		return () => {
			live = false;
		};
	}, [token, userId]);
	async function accept() {
		setBusy("accept");
		try {
			const teamId = await acceptInvitation(token);
			toast.success(`You're in${preview?.team_name ? `: ${preview.team_name}` : ""}.`);
			navigate({
				to: "/teams/$teamId",
				params: { teamId }
			});
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Couldn't accept the invitation.");
			setBusy(null);
		}
	}
	async function decline() {
		setBusy("decline");
		try {
			await declineInvitation(token);
			toast.success("Invitation declined.");
		} catch {}
		navigate({ to: "/dashboard" });
	}
	if (loadError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, {
		title: "We couldn't load this invitation",
		text: loadError,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			onClick: () => window.location.reload(),
			children: "Try again"
		})
	});
	if (loading || !preview) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-muted-foreground" })
	});
	if (!preview.valid) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, {
		title: "This invitation can't be used",
		text: invitationProblem(preview.reason),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			onClick: () => navigate({ to: user ? "/dashboard" : "/auth" }),
			children: user ? "Go to dashboard" : "Sign in"
		})
	});
	const role = preview.role ?? "member";
	const who = preview.inviter_name ?? "A teammate";
	const people = preview.member_count === 1 ? "1 member" : `${preview.member_count} members`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, {
		title: `Join ${preview.team_name}`,
		text: `${who} invited you to join as ${ROLE_LABEL[role].toLowerCase()}. ${ROLE_HELP[role]} The team has ${people}.`,
		children: user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			onClick: accept,
			disabled: busy !== null,
			children: [busy === "accept" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Accept invitation"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			onClick: decline,
			disabled: busy !== null,
			children: [busy === "decline" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Decline"]
		})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: () => navigate({
				to: "/auth",
				search: {
					mode: "signin",
					redirect: `/invite/${token}`
				}
			}),
			children: "Sign in to accept"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			onClick: () => navigate({
				to: "/auth",
				search: {
					mode: "signup",
					redirect: `/invite/${token}`
				}
			}),
			children: "Create an account"
		})] })
	});
}
function Shell({ title, text, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface-card max-w-md p-8 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: text
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children
				})
			]
		})
	});
}
//#endregion
export { InvitePage as component };
