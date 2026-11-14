import { i as __toESM } from "../_runtime.mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as supabase } from "./client-yXxN1BOn.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as Button } from "./button-BkEFdjsN.mjs";
import { O as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-o8_kklxJ.mjs";
import { t as Label } from "./label-BEbnXoK8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-BLX85uFp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ResetPassword() {
	const [password, setPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const navigate = useNavigate();
	async function submit(e) {
		e.preventDefault();
		setBusy(true);
		const { error } = await supabase.auth.updateUser({ password });
		setBusy(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Password updated");
		navigate({ to: "/dashboard" });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "surface-card w-full max-w-sm space-y-4 p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-bold",
					children: "Choose a new password"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "pw",
						children: "New password"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "pw",
						type: "password",
						required: true,
						minLength: 6,
						value: password,
						onChange: (e) => setPassword(e.target.value),
						autoComplete: "new-password"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "submit",
					className: "w-full",
					disabled: busy,
					children: [busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Update password"]
				})
			]
		})
	});
}
//#endregion
export { ResetPassword as component };
