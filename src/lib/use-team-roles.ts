import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { fetchMyTeams } from "@/lib/queries";
import type { Role } from "@/lib/team-rules";

/** The signed-in student's role in each of their teams (shares the cached "My Teams" list). */
export function useTeamRoles() {
  const { user } = useAuth();
  const teams = useQuery({ queryKey: ["teams"], queryFn: fetchMyTeams, enabled: !!user });
  const roleIn = (teamId: string): Role | null =>
    (teams.data?.find((t) => t.id === teamId)?.role as Role | undefined) ?? null;
  return { roleIn, userId: user?.id, loaded: !teams.isLoading };
}
