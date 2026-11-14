import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-yXxN1BOn.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-Bitinyml.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function readAuthUrlError(href) {
	let url;
	try {
		url = new URL(href);
	} catch {
		return null;
	}
	const params = new URLSearchParams(url.search);
	new URLSearchParams(url.hash.replace(/^#/, "")).forEach((v, k) => params.set(k, v));
	const code = params.get("error_code") ?? params.get("error");
	const description = params.get("error_description");
	if (!code && !description) return null;
	const text = (description ?? "").replace(/\+/g, " ").trim();
	if (code === "access_denied" && /denied|cancel/i.test(text + code)) return {
		code: code ?? "access_denied",
		message: "Google sign-in was cancelled. You can try again."
	};
	if (/redirect|url/i.test(text)) return {
		code: code ?? "redirect",
		message: "Google sign-in couldn't return to this site. The site's address must be added to Supabase → Authentication → URL Configuration."
	};
	return {
		code: code ?? "error",
		message: text ? `Sign-in didn't complete: ${text}` : "Sign-in didn't complete. Please try again."
	};
}
/** The same address without the error parameters, so a refresh doesn't show the message again. */
function withoutAuthError(href) {
	const url = new URL(href);
	for (const k of [
		"error",
		"error_code",
		"error_description"
	]) url.searchParams.delete(k);
	const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
	for (const k of [
		"error",
		"error_code",
		"error_description"
	]) hash.delete(k);
	const h = hash.toString();
	return `${url.pathname}${url.search}${h ? `#${h}` : ""}`;
}
var AuthContext = (0, import_react.createContext)({
	session: null,
	user: null,
	loading: true,
	signOut: async () => {}
});
function AuthProvider({ children }) {
	const [session, setSession] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const problem = readAuthUrlError(window.location.href);
		if (!problem) return;
		toast.error(problem.message, { duration: 1e4 });
		window.history.replaceState(null, "", withoutAuthError(window.location.href));
	}, []);
	(0, import_react.useEffect)(() => {
		let active = true;
		const { data } = supabase.auth.onAuthStateChange((_event, next) => {
			if (!active) return;
			setSession(next);
			setLoading(false);
		});
		supabase.auth.getSession().then(({ data: s }) => {
			if (!active) return;
			setSession(s.session);
			setLoading(false);
		});
		return () => {
			active = false;
			data.subscription.unsubscribe();
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value: {
			session,
			user: session?.user ?? null,
			loading,
			signOut: async () => {
				await supabase.auth.signOut();
			}
		},
		children
	});
}
var useAuth = () => (0, import_react.useContext)(AuthContext);
//#endregion
export { useAuth as n, AuthProvider as t };
