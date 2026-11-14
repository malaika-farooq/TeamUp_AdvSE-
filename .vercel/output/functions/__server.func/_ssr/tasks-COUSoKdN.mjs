import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-yXxN1BOn.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { i as useQuery, o as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { E as fetchTasks, x as fetchMyTeams } from "./UserAvatar-CWAQ5zUT.mjs";
import { i as CardSkeletons, s as ErrorState, t as AppShell } from "./states-BLyrGC0l.mjs";
import { t as TaskBoard } from "./TaskBoard-BSF-VCxu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tasks-COUSoKdN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TasksPage() {
	const queryClient = useQueryClient();
	const [createOpen, setCreateOpen] = (0, import_react.useState)(false);
	const teamsQuery = useQuery({
		queryKey: ["teams"],
		queryFn: fetchMyTeams
	});
	const teamIds = (teamsQuery.data ?? []).map((t) => t.id);
	const tasksQuery = useQuery({
		queryKey: ["tasks", teamIds],
		queryFn: () => fetchTasks(teamIds),
		enabled: teamsQuery.isSuccess
	});
	(0, import_react.useEffect)(() => {
		if (!teamIds.length) return;
		const channel = supabase.channel("tasks-live").on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "tasks"
		}, () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		}).subscribe();
		return () => {
			supabase.removeChannel(channel);
		};
	}, [teamIds.join(","), queryClient]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Tasks",
		description: "Drag cards between columns or use the status menu for keyboard control.",
		children: teamsQuery.isLoading || tasksQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletons, { count: 4 }) : tasksQuery.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
			message: tasksQuery.error.message,
			onRetry: () => tasksQuery.refetch()
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskBoard, {
			tasks: tasksQuery.data ?? [],
			teams: teamsQuery.data ?? [],
			createOpen,
			onCreateOpenChange: setCreateOpen
		})
	});
}
//#endregion
export { TasksPage as component };
