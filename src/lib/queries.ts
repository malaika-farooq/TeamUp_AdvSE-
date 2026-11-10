import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Team = Database["public"]["Tables"]["teams"]["Row"];
export type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type StudySession = Database["public"]["Tables"]["sessions"]["Row"];
export type Resource = Database["public"]["Tables"]["resources"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type ActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"];
export type TaskStatus = Database["public"]["Enums"]["task_status"];
export type TaskPriority = Database["public"]["Enums"]["task_priority"];
export type TeamRole = Database["public"]["Enums"]["team_role"];

export const STATUSES: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "in_review", label: "In Review" },
  { key: "done", label: "Done" },
];

export const PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];

export const ACCENTS = ["teal", "lavender", "blue", "primary"] as const;

export function accentClasses(accent: string | null | undefined) {
  switch (accent) {
    case "lavender":
      return "bg-lavender/15 text-lavender border-lavender/30";
    case "blue":
      return "bg-blue/15 text-blue border-blue/30";
    case "primary":
      return "bg-primary/15 text-primary border-primary/30";
    default:
      return "bg-teal/15 text-teal border-teal/30";
  }
}

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export async function fetchProfile(userId: string) {
  const res = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

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

export async function fetchNotifications() {
  return unwrap(
    await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
  );
}

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

export async function notify(
  userId: string,
  type: string,
  title: string,
  body: string,
  link: string,
  dedupeKey?: string,
) {
  await supabase
    .from("notifications")
    .insert({ user_id: userId, type, title, body, link, dedupe_key: dedupeKey ?? null });
}
