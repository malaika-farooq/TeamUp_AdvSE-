import { a as require_jsx_runtime } from "../_libs/@ai-sdk/react+[...].mjs";
import { i as useQuery } from "../_libs/tanstack__react-query.mjs";
import { E as fetchTasks, T as fetchSessions, x as fetchMyTeams } from "./UserAvatar-CWAQ5zUT.mjs";
import { i as CardSkeletons, s as ErrorState, t as AppShell } from "./states-BLyrGC0l.mjs";
import { t as SessionsPanel } from "./SessionsPanel-BhUgsaKx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/calendar-lu6nQntE.js
var import_jsx_runtime = require_jsx_runtime();
function CalendarPage() {
	const teamsQuery = useQuery({
		queryKey: ["teams"],
		queryFn: fetchMyTeams
	});
	const teamIds = (teamsQuery.data ?? []).map((t) => t.id);
	const sessionsQuery = useQuery({
		queryKey: ["sessions", teamIds],
		queryFn: () => fetchSessions(teamIds),
		enabled: teamsQuery.isSuccess
	});
	const tasksQuery = useQuery({
		queryKey: ["tasks", teamIds],
		queryFn: () => fetchTasks(teamIds),
		enabled: teamsQuery.isSuccess
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Calendar",
		description: "Sessions and deadlines across all of your teams.",
		children: teamsQuery.isLoading || sessionsQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletons, { count: 3 }) : sessionsQuery.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
			message: sessionsQuery.error.message,
			onRetry: () => sessionsQuery.refetch()
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SessionsPanel, {
			sessions: sessionsQuery.data ?? [],
			tasks: tasksQuery.data ?? [],
			teams: teamsQuery.data ?? []
		})
	});
}
//#endregion
export { CalendarPage as component };
