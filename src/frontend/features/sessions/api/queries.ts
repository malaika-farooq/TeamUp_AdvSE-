import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/lib/supabase-result";
import type { StudySession } from "@/types/domain";

export async function fetchSessions(teamIds: string[]) {
  if (!teamIds.length) return [] as StudySession[];
  return unwrap(
    await supabase
      .from("sessions")
      .select("*")
      .in("team_id", teamIds)
      .order("starts_at", { ascending: true }),
  );
}
