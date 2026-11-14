// Functionality 6: the numbers behind a team's progress dashboard and its activity history.
// Pure functions (no React, no network) so every figure can be unit tested.
import { BOARD_COLUMNS, columnOf, isOverdue, type BoardStatus, type TaskLike } from "./task-board";

const DAY = 864e5;

/* --------------------------------- Tasks ----------------------------------- */

export type StatusCount = { key: BoardStatus; label: string; count: number; percent: number };

/** How many tasks sit in each column, and each column's share of all tasks. */
export function statusBreakdown(tasks: Pick<TaskLike, "status">[]): StatusCount[] {
  const total = tasks.length;
  return BOARD_COLUMNS.map((c) => {
    const count = tasks.filter((t) => columnOf(t.status) === c.key).length;
    return { key: c.key, label: c.label, count, percent: total ? Math.round((count / total) * 100) : 0 };
  });
}

export type OverviewStats = {
  total: number;
  done: number;
  open: number;
  overdue: number;
  dueThisWeek: number;
  unassigned: number;
  completionPercent: number;
};

export function overviewStats(
  tasks: Pick<TaskLike, "status" | "due_date" | "assignee_id">[],
  now: Date = new Date(),
): OverviewStats {
  const done = tasks.filter((t) => columnOf(t.status) === "done").length;
  const open = tasks.length - done;
  const overdue = tasks.filter((t) => isOverdue(t, now)).length;
  const dueThisWeek = tasks.filter((t) => {
    if (!t.due_date || columnOf(t.status) === "done") return false;
    const due = new Date(t.due_date).getTime();
    return due >= now.getTime() && due <= now.getTime() + 7 * DAY;
  }).length;
  const unassigned = tasks.filter((t) => columnOf(t.status) !== "done" && !t.assignee_id).length;
  return {
    total: tasks.length,
    done,
    open,
    overdue,
    dueThisWeek,
    unassigned,
    completionPercent: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
  };
}

/**
 * Overdue work (most overdue first) and what is coming up (soonest first). Finished tasks and tasks with no
 * due date are left out; `limit` applies to each list.
 */
export function upcomingDeadlines<T extends Pick<TaskLike, "status" | "due_date">>(
  tasks: T[],
  now: Date = new Date(),
  limit = 8,
): { overdue: T[]; upcoming: T[] } {
  const dated = tasks.filter((t) => t.due_date && columnOf(t.status) !== "done");
  const time = (t: T) => new Date(t.due_date!).getTime();
  return {
    overdue: dated.filter((t) => time(t) < now.getTime()).sort((a, b) => time(a) - time(b)).slice(0, limit),
    upcoming: dated.filter((t) => time(t) >= now.getTime()).sort((a, b) => time(a) - time(b)).slice(0, limit),
  };
}

/* ------------------------------ Contributions ------------------------------- */

export type Person = { id: string; name: string };

export type MemberStats = Person & {
  assigned: number;
  done: number;
  open: number;
  overdue: number;
  created: number;
  comments: number;
  resources: number;
  sessions: number;
  /** Actions in the activity history over the last 30 days. */
  recentActions: number;
  lastActive: string | null;
  /** Share of their assigned tasks that are finished (0 when nothing is assigned). */
  completionPercent: number;
  /** Share of all the team's finished tasks that this person finished. */
  sharePercent: number;
};

export function memberContributions(input: {
  members: Person[];
  tasks: Pick<TaskLike, "status" | "due_date" | "assignee_id" | "created_by">[];
  resources?: { created_by: string }[];
  comments?: { author_id: string }[];
  sessions?: { created_by: string }[];
  activity?: { actor_id: string; created_at: string }[];
  now?: Date;
}): MemberStats[] {
  const now = input.now ?? new Date();
  const since = now.getTime() - 30 * DAY;
  const teamDone = input.tasks.filter((t) => columnOf(t.status) === "done").length;

  // Group everything by person once, so the cost grows with the amount of data, not data x members.
  const group = <T,>(items: T[], key: (x: T) => string) => {
    const map = new Map<string, T[]>();
    for (const x of items) {
      const k = key(x);
      const list = map.get(k);
      if (list) list.push(x);
      else map.set(k, [x]);
    }
    return map;
  };
  const assigned = group(input.tasks, (t) => t.assignee_id ?? "");
  const created = group(input.tasks, (t) => t.created_by);
  const comments = group(input.comments ?? [], (c) => c.author_id);
  const resources = group(input.resources ?? [], (r) => r.created_by);
  const sessions = group(input.sessions ?? [], (s) => s.created_by);
  const activity = group(input.activity ?? [], (a) => a.actor_id);

  const stats = input.members.map((m): MemberStats => {
    const mine = assigned.get(m.id) ?? [];
    const done = mine.filter((t) => columnOf(t.status) === "done").length;
    const events = activity.get(m.id) ?? [];
    let last: string | null = null;
    let recent = 0;
    for (const a of events) {
      if (!last || a.created_at > last) last = a.created_at;
      if (new Date(a.created_at).getTime() >= since) recent++;
    }
    return {
      ...m,
      assigned: mine.length,
      done,
      open: mine.length - done,
      overdue: mine.filter((t) => isOverdue(t, now)).length,
      created: created.get(m.id)?.length ?? 0,
      comments: comments.get(m.id)?.length ?? 0,
      resources: resources.get(m.id)?.length ?? 0,
      sessions: sessions.get(m.id)?.length ?? 0,
      recentActions: recent,
      lastActive: last,
      completionPercent: mine.length ? Math.round((done / mine.length) * 100) : 0,
      sharePercent: teamDone ? Math.round((done / teamDone) * 100) : 0,
    };
  });
  return stats.sort(
    (a, b) => b.done - a.done || b.assigned - a.assigned || a.name.localeCompare(b.name),
  );
}

/** The member who has finished the most tasks (nobody if no task is finished; ties have no single winner). */
export function topContributor(stats: MemberStats[]): MemberStats | null {
  const best = stats[0];
  if (!best || best.done === 0) return null;
  if (stats[1] && stats[1].done === best.done) return null;
  return best;
}

/* ----------------------------- Activity history ----------------------------- */

export type ActivityGroup = "tasks" | "resources" | "meetings" | "people" | "other";

export const ACTIVITY_GROUPS: { key: ActivityGroup | "all"; label: string }[] = [
  { key: "all", label: "Everything" },
  { key: "tasks", label: "Tasks" },
  { key: "resources", label: "Notes & files" },
  { key: "meetings", label: "Meetings" },
  { key: "people", label: "People" },
];

const ACTIONS: Record<string, { group: ActivityGroup; label: string }> = {
  task_created: { group: "tasks", label: "Task created" },
  task_updated: { group: "tasks", label: "Task updated" },
  task_deleted: { group: "tasks", label: "Task deleted" },
  comment_added: { group: "tasks", label: "Comment" },
  resource_added: { group: "resources", label: "Shared" },
  resource_updated: { group: "resources", label: "Edited" },
  resource_removed: { group: "resources", label: "Removed" },
  session_created: { group: "meetings", label: "Meeting scheduled" },
  team_created: { group: "people", label: "Team created" },
  team_updated: { group: "people", label: "Team updated" },
  member_invited: { group: "people", label: "Invited" },
  member_joined: { group: "people", label: "Joined" },
  member_removed: { group: "people", label: "Removed" },
  role_changed: { group: "people", label: "Role changed" },
  ownership_transferred: { group: "people", label: "Ownership" },
};

export function activityMeta(action: string): { group: ActivityGroup; label: string } {
  return ACTIONS[action] ?? { group: "other", label: "Activity" };
}

export type ActivityFilters = { actor: string; group: ActivityGroup | "all"; days: number };
export const NO_ACTIVITY_FILTERS: ActivityFilters = { actor: "all", group: "all", days: 0 };

export function filterActivity<T extends { actor_id: string; action: string; created_at: string }>(
  items: T[],
  f: ActivityFilters,
  now: Date = new Date(),
): T[] {
  const since = f.days > 0 ? now.getTime() - f.days * DAY : -Infinity;
  return items.filter((a) => {
    if (f.actor !== "all" && a.actor_id !== f.actor) return false;
    if (f.group !== "all" && activityMeta(a.action).group !== f.group) return false;
    return new Date(a.created_at).getTime() >= since;
  });
}

/** How many events each person caused (for "who has been busy"). */
export function actionsByPerson(
  items: { actor_id: string }[],
  people: Person[],
): { id: string; name: string; count: number }[] {
  return people
    .map((p) => ({ id: p.id, name: p.name, count: items.filter((a) => a.actor_id === p.id).length }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** The activity types that belong to one group (used to ask the database for just that group). */
export function actionsOfGroup(group: ActivityGroup): string[] {
  return Object.entries(ACTIONS)
    .filter(([, v]) => v.group === group)
    .map(([k]) => k);
}
