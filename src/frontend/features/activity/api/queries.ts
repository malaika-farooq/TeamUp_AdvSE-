import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/lib/supabase-result";
import type { ActivityLog } from "@/types/domain";

export async function fetchActivity(teamIds: string[], limit = 25) {
  if (!teamIds.length) return [] as ActivityLog[];
  return unwrap(
    await supabase
      .from("activity_logs")
      .select("*")
      .in("team_id", teamIds)
      .order("created_at", { ascending: false })
      .limit(limit),
  );
}

export async function logActivity(
  teamId: string,
  actorId: string,
  action: string,
  summary: string,
  entityId?: string,
) {
  await supabase
    .from("activity_logs")
    .insert({ team_id: teamId, actor_id: actorId, action, summary, entity_id: entityId ?? null });
}
