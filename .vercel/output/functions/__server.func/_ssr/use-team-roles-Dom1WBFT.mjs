import { i as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as useAuth } from "./auth-Bitinyml.mjs";
import { x as fetchMyTeams } from "./UserAvatar-CWAQ5zUT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-team-roles-Dom1WBFT.js
/** The signed-in student's role in each of their teams (shares the cached "My Teams" list). */
function useTeamRoles() {
	const { user } = useAuth();
	const teams = useQuery({
		queryKey: ["teams"],
		queryFn: fetchMyTeams,
		enabled: !!user
	});
	const roleIn = (teamId) => teams.data?.find((t) => t.id === teamId)?.role ?? null;
	return {
		roleIn,
		userId: user?.id,
		loaded: !teams.isLoading
	};
}
//#endregion
export { useTeamRoles as t };
