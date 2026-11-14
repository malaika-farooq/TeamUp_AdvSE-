import { a as require_jsx_runtime } from "../_libs/@ai-sdk/react+[...].mjs";
import { i as useQuery } from "../_libs/tanstack__react-query.mjs";
import { w as fetchResources, x as fetchMyTeams } from "./UserAvatar-CWAQ5zUT.mjs";
import { i as CardSkeletons, s as ErrorState, t as AppShell } from "./states-BLyrGC0l.mjs";
import { t as ResourcesPanel } from "./ResourcesPanel-DiV_xLZ6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/resources-pmuYYoC3.js
var import_jsx_runtime = require_jsx_runtime();
function ResourcesPage() {
	const teamsQuery = useQuery({
		queryKey: ["teams"],
		queryFn: fetchMyTeams
	});
	const teamIds = (teamsQuery.data ?? []).map((t) => t.id);
	const resourcesQuery = useQuery({
		queryKey: ["resources", teamIds],
		queryFn: () => fetchResources(teamIds),
		enabled: teamsQuery.isSuccess
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Resources",
		description: "Everything your teams have shared, in one place.",
		children: teamsQuery.isLoading || resourcesQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletons, { count: 3 }) : resourcesQuery.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
			message: resourcesQuery.error.message,
			onRetry: () => resourcesQuery.refetch()
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResourcesPanel, {
			resources: resourcesQuery.data ?? [],
			teams: teamsQuery.data ?? []
		})
	});
}
//#endregion
export { ResourcesPage as component };
