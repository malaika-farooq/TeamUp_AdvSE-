import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/lib/supabase-result";
import type { Team, TeamRole } from "@/types/domain";

export async function fetchMyTeams() {
  const memberships = unwrap(
    await supabase.from("team_members").select("team_id, role, joined_at"),
  );
  const ids = memberships.map((m) => m.team_id);
  if (!ids.length) return [] as (Team & { role: TeamRole })[];
  const teams = unwrap(await supabase.from("teams").select("*").in("id", ids));
  return teams.map((t) => ({
    ...t,
    role: (memberships.find((m) => m.team_id === t.id)?.role ?? "member") as TeamRole,
  }));
}

export async function fetchTeamMembers(teamId: string) {
  const members = unwrap(await supabase.from("team_members").select("*").eq("team_id", teamId));
  const ids = members.map((m) => m.user_id);
  const profiles = ids.length
    ? unwrap(await supabase.from("profiles").select("*").in("id", ids))
    : [];
  return members.map((m) => ({
    ...m,
    profile: profiles.find((p) => p.id === m.user_id) ?? null,
  }));
}

export type MemberWithProfile = Awaited<ReturnType<typeof fetchTeamMembers>>[number];
