import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/invite._token-Csc_Lg_d.js
var $$splitComponentImporter = () => import("./invite._token-Dxyy8GHj.mjs");
var Route = createFileRoute("/invite/$token")({
	ssr: false,
	head: () => ({ meta: [
		{ title: "Team invitation — TeamUp" },
		{
			name: "description",
			content: "Accept your TeamUp team invitation."
		},
		{
			property: "og:title",
			content: "Team invitation — TeamUp"
		},
		{
			property: "og:description",
			content: "Join a TeamUp study team."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
