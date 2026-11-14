import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/teams._teamId-CQBNGQnH.js
var $$splitComponentImporter = () => import("./teams._teamId-bVLdCvRF.mjs");
var Route = createFileRoute("/_authenticated/teams/$teamId")({
	head: () => ({ meta: [
		{ title: "Team workspace — TeamUp" },
		{
			name: "description",
			content: "Tasks, sessions, resources and members for your team."
		},
		{
			property: "og:title",
			content: "Team workspace — TeamUp"
		},
		{
			property: "og:description",
			content: "Tasks, sessions, resources and members for your team."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
