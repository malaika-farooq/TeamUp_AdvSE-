// Loading what the progress dashboard and the activity history show.
import { supabase } from "@/integrations/supabase/client";
import type { ActivityLog } from "./queries";
import { actionsOfGroup, type ActivityFilters } from "./progress";

export const ACTIVITY_PAGE_SIZE = 20;

/** One page of a team's history, newest first. `before` is the time of the last event already shown. */
export async function fetchActivityPage(
  teamId: string,
  filters: ActivityFilters,
  before?: string,
  limit = ACTIVITY_PAGE_SIZE,
): Promise<ActivityLog[]> {
  let q = supabase.from("activity_logs").select("*").eq("team_id", teamId);
  if (filters.actor !== "all") q = q.eq("actor_id", filters.actor);
  if (filters.group !== "all") {
    const actions = actionsOfGroup(filters.group);
    if (!actions.length) return [];
    q = q.in("action", actions);
  }
  if (filters.days > 0) {
    q = q.gte("created_at", new Date(Date.now() - filters.days * 864e5).toISOString());
  }
  if (before) q = q.lt("created_at", before);
  const { data, error } = await q.order("created_at", { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as ActivityLog[];
}

/** The last 30 days of activity, for working out who has been active (capped so it stays quick). */
export async function fetchRecentActivity(
  teamId: string,
  days = 30,
  cap = 500,
): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("team_id", teamId)
    .gte("created_at", new Date(Date.now() - days * 864e5).toISOString())
    .order("created_at", { ascending: false })
    .limit(cap);
  if (error) throw new Error(error.message);
  return (data ?? []) as ActivityLog[];
}

/** Comments on the given tasks (one row each), to count who has been discussing the work. */
export async function fetchCommentAuthors(taskIds: string[]): Promise<{ author_id: string }[]> {
  if (!taskIds.length) return [];
  const { data, error } = await supabase
    .from("task_comments")
    .select("author_id")
    .in("task_id", taskIds);
  if (error) throw new Error(error.message);
  return data ?? [];
}
