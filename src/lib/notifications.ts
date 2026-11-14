// In-app notifications: how each kind is described, where it leads, grouping by day, and the few database
// calls the bell and the Notifications page make. The pure parts need no React or network.
import { supabase } from "@/integrations/supabase/client";

export type NotificationRow = {
  id: string;
  user_id?: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export type NotificationTone =
  "task" | "deadline" | "meeting" | "team" | "share" | "partner" | "general";

const META: Record<string, { label: string; tone: NotificationTone }> = {
  task_assigned: { label: "Task assigned", tone: "task" },
  task_done: { label: "Task finished", tone: "task" },
  task_due_changed: { label: "Due date changed", tone: "deadline" },
  task_due_soon: { label: "Due soon", tone: "deadline" },
  task_overdue: { label: "Overdue", tone: "deadline" },
  session_scheduled: { label: "Meeting scheduled", tone: "meeting" },
  session_soon: { label: "Starting soon", tone: "meeting" },
  resource_shared: { label: "Shared with the team", tone: "share" },
  availability_nudge: { label: "Free time reminder", tone: "meeting" },
  team_invite: { label: "Team invitation", tone: "team" },
  team_update: { label: "Team update", tone: "team" },
  member_joined: { label: "New member", tone: "team" },
  join_approved: { label: "Request approved", tone: "team" },
  join_rejected: { label: "Request declined", tone: "team" },
  invite_accepted: { label: "Invitation accepted", tone: "team" },
  invite_declined: { label: "Invitation declined", tone: "team" },
  partner_request: { label: "Study partner request", tone: "partner" },
  partner_accepted: { label: "Study partner accepted", tone: "partner" },
  partner_declined: { label: "Study partner declined", tone: "partner" },
  study_session_invite: { label: "Study session invite", tone: "partner" },
  study_session_reply: { label: "Study session reply", tone: "partner" },
};

export function notificationMeta(type: string): { label: string; tone: NotificationTone } {
  return META[type] ?? { label: "Notification", tone: "general" };
}

/** A notification may only lead somewhere inside the app. Anything else is ignored. */
export function safeLink(link: string | null | undefined): string | null {
  if (!link || !link.startsWith("/") || link.startsWith("//") || /[\s\\]/.test(link)) return null;
  return link;
}

export const unreadOf = <T extends Pick<NotificationRow, "read_at">>(items: T[]) =>
  items.filter((n) => !n.read_at);

/** Newest first. */
export function sortNotifications<T extends Pick<NotificationRow, "created_at">>(items: T[]): T[] {
  return [...items].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export type DayGroup<T> = { label: "Today" | "Yesterday" | "Earlier"; items: T[] };

/** Splits newest-first notifications into Today / Yesterday / Earlier (in the student's own time). */
export function groupByDay<T extends Pick<NotificationRow, "created_at">>(
  items: T[],
  now: Date = new Date(),
): DayGroup<T>[] {
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const today = startOf(now);
  const yesterday = today - 864e5;
  const groups: DayGroup<T>[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Earlier", items: [] },
  ];
  for (const n of items) {
    const t = new Date(n.created_at).getTime();
    (t >= today ? groups[0]! : t >= yesterday ? groups[1]! : groups[2]!).items.push(n);
  }
  return groups.filter((g) => g.items.length > 0);
}

/** "just now", "5 min ago", "3 h ago", "Yesterday", or the date. */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const diff = now.getTime() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return "";
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} h ago`;
  if (diff < 2 * 86_400_000) return "Yesterday";
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
}

/* ------------------------------- Database calls ----------------------------- */

export async function fetchAllNotifications(): Promise<NotificationRow[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []) as NotificationRow[];
}

async function setReadState(ids: string[], read: boolean) {
  if (!ids.length) return;
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: read ? new Date().toISOString() : null })
    .in("id", ids);
  if (error) throw new Error(error.message);
}
export const markRead = (ids: string[]) => setReadState(ids, true);
export const markUnread = (ids: string[]) => setReadState(ids, false);

export async function deleteNotifications(ids: string[]) {
  if (!ids.length) return;
  const { error } = await supabase.from("notifications").delete().in("id", ids);
  if (error) throw new Error(error.message);
}

/**
 * Asks the database for reminders that have just become due: tasks due within a day, overdue tasks and
 * sessions about to start. Returns how many new ones were created. A database that hasn't been updated
 * (migration 0012) simply has none, so that case is not an error.
 */
export async function refreshDeadlineNotifications(): Promise<number> {
  const { data, error } = await supabase.rpc("refresh_deadline_notifications");
  if (error) {
    if (
      error.code === "PGRST202" ||
      /could not find the function|schema cache/i.test(error.message)
    ) {
      return 0;
    }
    throw new Error(error.message);
  }
  return Number(data ?? 0);
}

/** Tells teammates (everyone but the sender) that something was shared. One insert for all of them. */
export async function notifyMany(
  userIds: string[],
  note: { type: string; title: string; body: string; link: string },
) {
  const ids = [...new Set(userIds)];
  if (!ids.length) return;
  const { error } = await supabase
    .from("notifications")
    .insert(ids.map((user_id) => ({ user_id, ...note })));
  if (error) throw new Error(error.message);
}
