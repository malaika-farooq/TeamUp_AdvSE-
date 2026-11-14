// Rules for the task board: the three columns, due dates, filters, sorting and checking a task before it is
// saved. Pure functions (no React, no network) so every rule can be unit tested.

export type BoardStatus = "todo" | "in_progress" | "done";
export type Priority = "low" | "medium" | "high" | "urgent";

export const BOARD_COLUMNS: { key: BoardStatus; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

export const PRIORITY_LIST: Priority[] = ["low", "medium", "high", "urgent"];
const PRIORITY_RANK: Record<string, number> = { low: 0, medium: 1, high: 2, urgent: 3 };

export const TITLE_MAX = 200;
export const DESCRIPTION_MAX = 2000;

/** The column a task sits in. The old "In Review" step now lives under In Progress. */
export function columnOf(status: string): BoardStatus {
  if (status === "done") return "done";
  if (status === "in_progress" || status === "in_review") return "in_progress";
  return "todo";
}

export function columnLabel(status: string): string {
  return BOARD_COLUMNS.find((c) => c.key === columnOf(status))!.label;
}

export type TaskLike = {
  id: string;
  team_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignee_id: string | null;
  created_by: string;
  due_date: string | null;
  position: number;
  completed_at: string | null;
  created_at: string;
};

/* ------------------------------- Due dates -------------------------------- */

export type DueKind = "none" | "done" | "overdue" | "today" | "soon" | "later";

const DAY = 864e5;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** How a due date should be shown: a short phrase and a kind for colouring it. */
export function dueState(
  due: string | null,
  status: string,
  now: Date = new Date(),
): { kind: DueKind; label: string } {
  if (!due) return { kind: "none", label: "No due date" };
  const date = new Date(due);
  if (Number.isNaN(date.getTime())) return { kind: "none", label: "No due date" };
  const shown = date.toLocaleDateString([], { month: "short", day: "numeric" });
  if (columnOf(status) === "done") return { kind: "done", label: `Due ${shown}` };
  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (date.getTime() < now.getTime()) {
    const hours = Math.floor((now.getTime() - date.getTime()) / 36e5);
    const days = Math.round((startOfDay(now).getTime() - startOfDay(date).getTime()) / DAY);
    if (days >= 1)
      return { kind: "overdue", label: `Overdue by ${days} day${days === 1 ? "" : "s"}` };
    return {
      kind: "overdue",
      label: hours >= 1 ? `Overdue by ${hours} hour${hours === 1 ? "" : "s"}` : "Overdue",
    };
  }
  const days = Math.round((startOfDay(date).getTime() - startOfDay(now).getTime()) / DAY);
  if (days === 0) return { kind: "today", label: `Due today, ${time}` };
  if (days === 1) return { kind: "soon", label: `Due tomorrow, ${time}` };
  if (days <= 3) return { kind: "soon", label: `Due in ${days} days` };
  return { kind: "later", label: `Due ${shown}` };
}

export function isOverdue(t: Pick<TaskLike, "due_date" | "status">, now: Date = new Date()) {
  if (!t.due_date || columnOf(t.status) === "done") return false;
  const due = new Date(t.due_date).getTime();
  return !Number.isNaN(due) && due < now.getTime();
}

/** `2026-11-20T15:00:00Z` -> the `YYYY-MM-DDTHH:mm` a date-time input wants, in the student's own time. */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/* ------------------------------- Checking a task --------------------------- */

export type TaskForm = {
  title: string;
  description: string;
  priority: string;
  status: string;
  /** Value of a date-time input, or "" for no due date. */
  due: string;
  /** A member's id, or "unassigned". */
  assignee: string;
};

export type CleanTask = {
  title: string;
  description: string | null;
  priority: Priority;
  status: BoardStatus;
  due_date: string | null;
  assignee_id: string | null;
};

export type TaskFormResult =
  { ok: true; clean: CleanTask } | { ok: false; errors: Partial<Record<keyof TaskForm, string>> };

export function validateTaskForm(form: TaskForm): TaskFormResult {
  const errors: Partial<Record<keyof TaskForm, string>> = {};
  const title = form.title.replace(/\s+/g, " ").trim();
  if (!title) errors.title = "Give the task a title.";
  else if (title.length > TITLE_MAX) errors.title = `Keep the title under ${TITLE_MAX} characters.`;
  const description = form.description.trim();
  if (description.length > DESCRIPTION_MAX)
    errors.description = `Keep the description under ${DESCRIPTION_MAX} characters.`;
  if (!PRIORITY_LIST.includes(form.priority as Priority)) errors.priority = "Choose a priority.";
  if (!BOARD_COLUMNS.some((c) => c.key === form.status)) errors.status = "Choose a status.";
  let due: string | null = null;
  if (form.due) {
    const d = new Date(form.due);
    if (Number.isNaN(d.getTime())) errors.due = "That due date isn't valid.";
    else if (d.getFullYear() < 2000 || d.getFullYear() > 2100)
      errors.due = "Pick a due date between 2000 and 2100.";
    else due = d.toISOString();
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    clean: {
      title,
      description: description || null,
      priority: form.priority as Priority,
      status: form.status as BoardStatus,
      due_date: due,
      assignee_id: form.assignee && form.assignee !== "unassigned" ? form.assignee : null,
    },
  };
}

/** The columns a status change writes: done tasks get a finished time, others lose it. */
export function statusPatch(status: BoardStatus, now: Date = new Date()) {
  return {
    status,
    completed_at: status === "done" ? now.toISOString() : null,
    updated_at: now.toISOString(),
  };
}

/** Plain-words list of what changed between two versions of a task, for the activity feed. */
export function describeChanges(
  before: Pick<TaskLike, "title" | "description" | "priority" | "due_date">,
  after: Pick<TaskLike, "title" | "description" | "priority" | "due_date">,
): string[] {
  const out: string[] = [];
  if (before.title !== after.title) out.push("title");
  if ((before.description ?? "") !== (after.description ?? "")) out.push("description");
  if (before.priority !== after.priority) out.push("priority");
  if (before.due_date !== after.due_date)
    out.push(after.due_date ? "due date" : "due date (removed)");
  return out;
}

/* ------------------------------- Filtering & order ------------------------- */

export type TaskFilters = {
  team: string; // "all" or a team id
  assignee: string; // "all", "me", "unassigned" or a user id
  priority: string; // "all" or a priority
  due: string; // "all", "week" or "overdue"
  search: string;
};

export const NO_FILTERS: TaskFilters = {
  team: "all",
  assignee: "all",
  priority: "all",
  due: "all",
  search: "",
};

export function filterTasks<T extends TaskLike>(
  tasks: T[],
  f: TaskFilters,
  userId: string | undefined,
  now: Date = new Date(),
): T[] {
  const q = f.search.trim().toLowerCase();
  return tasks.filter((t) => {
    if (f.team !== "all" && t.team_id !== f.team) return false;
    if (f.assignee === "me" && t.assignee_id !== userId) return false;
    if (f.assignee === "unassigned" && t.assignee_id !== null) return false;
    if (!["all", "me", "unassigned"].includes(f.assignee) && t.assignee_id !== f.assignee)
      return false;
    if (f.priority !== "all" && t.priority !== f.priority) return false;
    if (f.due === "overdue" && !isOverdue(t, now)) return false;
    if (f.due === "week") {
      if (!t.due_date || columnOf(t.status) === "done") return false;
      const due = new Date(t.due_date).getTime();
      if (due < now.getTime() || due > now.getTime() + 7 * DAY) return false;
    }
    if (q && !t.title.toLowerCase().includes(q) && !(t.description ?? "").toLowerCase().includes(q))
      return false;
    return true;
  });
}

/** Within a column: soonest due first (no due date last), then the more urgent, then the order they were added. */
export function sortColumnTasks<T extends TaskLike>(tasks: T[]): T[] {
  return [...tasks].sort((a, b) => {
    const ad = a.due_date ? new Date(a.due_date).getTime() : Infinity;
    const bd = b.due_date ? new Date(b.due_date).getTime() : Infinity;
    if (ad !== bd) return ad < bd ? -1 : 1;
    const pr = (PRIORITY_RANK[b.priority] ?? 0) - (PRIORITY_RANK[a.priority] ?? 0);
    if (pr) return pr;
    return Number(a.position) - Number(b.position) || a.created_at.localeCompare(b.created_at);
  });
}

export function tasksInColumn<T extends TaskLike>(tasks: T[], column: BoardStatus): T[] {
  return sortColumnTasks(tasks.filter((t) => columnOf(t.status) === column));
}

export function columnCounts(tasks: Pick<TaskLike, "status">[]): Record<BoardStatus, number> {
  const out: Record<BoardStatus, number> = { todo: 0, in_progress: 0, done: 0 };
  for (const t of tasks) out[columnOf(t.status)]++;
  return out;
}

export function progress(tasks: Pick<TaskLike, "status">[]): {
  done: number;
  total: number;
  percent: number;
} {
  const done = tasks.filter((t) => columnOf(t.status) === "done").length;
  return {
    done,
    total: tasks.length,
    percent: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
  };
}
