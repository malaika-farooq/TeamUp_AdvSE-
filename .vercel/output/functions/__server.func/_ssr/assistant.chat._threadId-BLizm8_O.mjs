import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { x as threadQuery } from "./ai-client-CJwzytaT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/assistant.chat._threadId-BLizm8_O.js
var $$splitComponentImporter = () => import("./assistant.chat._threadId-BD-G-pvB.mjs");
var Route = createFileRoute("/_authenticated/assistant/chat/$threadId")({
	validateSearch: (s) => {
		const q = s["q"];
		return typeof q === "string" && q ? { q: q.slice(0, 2e3) } : {};
	},
	loader: ({ context, params }) => context.queryClient.ensureQueryData(threadQuery(params.threadId)),
	head: () => ({ meta: [
		{ title: "Chat — TeamUp AI" },
		{
			name: "description",
			content: "Chat with TeamUp AI about your team's tasks, notes and schedule."
		},
		{
			property: "og:title",
			content: "Chat — TeamUp AI"
		},
		{
			property: "og:description",
			content: "Chat with TeamUp AI about your team's tasks, notes and schedule."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
