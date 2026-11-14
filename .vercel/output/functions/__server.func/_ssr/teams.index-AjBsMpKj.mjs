import "../_runtime.mjs";
import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as booleanType, o as objectType } from "../_libs/zod.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import "./button-BkEFdjsN.mjs";
import "./ai-client-CJwzytaT.mjs";
import "../_libs/sonner.mjs";
import "./input-o8_kklxJ.mjs";
import "./textarea-DpZdO9KZ.mjs";
import "./label-BEbnXoK8.mjs";
require_react();
require_jsx_runtime();
var $$splitComponentImporter = () => import("./teams.index-BuZuQN9H.mjs");
var Route = createFileRoute("/_authenticated/teams/")({
	validateSearch: objectType({ create: booleanType().optional() }),
	head: () => ({ meta: [
		{ title: "My Teams — TeamUp" },
		{
			name: "description",
			content: "All the study teams and project groups you belong to."
		},
		{
			property: "og:title",
			content: "My Teams — TeamUp"
		},
		{
			property: "og:description",
			content: "Manage your study teams and project groups."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
