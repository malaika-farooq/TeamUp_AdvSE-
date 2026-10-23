import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/lib/supabase-result";
import type { Resource } from "@/types/domain";

export async function fetchResources(teamIds: string[]) {
  if (!teamIds.length) return [] as Resource[];
  return unwrap(
    await supabase
      .from("resources")
      .select("*")
      .in("team_id", teamIds)
      .order("updated_at", { ascending: false }),
  );
}
