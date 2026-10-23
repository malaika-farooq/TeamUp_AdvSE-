import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/lib/supabase-result";
import type { Task } from "@/types/domain";

export async function fetchTasks(teamIds: string[]) {
  if (!teamIds.length) return [] as Task[];
  return unwrap(
    await supabase
      .from("tasks")
      .select("*")
      .in("team_id", teamIds)
      .order("position", { ascending: true }),
  );
}
