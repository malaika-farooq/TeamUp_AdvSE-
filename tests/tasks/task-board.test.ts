// Functionality 4: the rules behind the task board (columns, due dates, checking a task, filters, order).
import { describe, expect, test } from "bun:test";
import {
  BOARD_COLUMNS,
  DESCRIPTION_MAX,
  NO_FILTERS,
  TITLE_MAX,
  columnCounts,
  columnLabel,
  columnOf,
  describeChanges,
  dueState,
  filterTasks,
  isOverdue,
  progress,
  sortColumnTasks,
  statusPatch,
  tasksInColumn,
  toLocalInput,
  validateTaskForm,
  type TaskFilters,
  type TaskForm,
  type TaskLike,
} from "../../src/lib/task-board";

const NOW = new Date(2026, 10, 13, 12, 0, 0); // Fri 13 Nov 2026, noon, local time
const at = (days: number, hours = 12) => new Date(2026, 10, 13 + days, hours, 0, 0).toISOString();

let n = 0;
const task = (over: Partial<TaskLike> = {}): TaskLike => ({
  id: `t${++n}`,
  team_id: "team-1",
  title: "A task",
  description: null,
  status: "todo",
  priority: "medium",
  assignee_id: null,
  created_by: "me",
  due_date: null,
  position: 1000,
  completed_at: null,
  created_at: `2026-11-0${(n % 9) + 1}T00:00:00Z`,
  ...over,
});
const ids = (list: { id: string }[]) => list.map((t) => t.id);
const form = (over: Partial<TaskForm> = {}): TaskForm => ({
  title: "Write the report",
  description: "",
  priority: "medium",
  status: "todo",
  due: "",
  assignee: "unassigned",
  ...over,
});

describe("The three columns", () => {
  test("To Do, In Progress and Done, in that order", () => {
    expect(BOARD_COLUMNS.map((c) => c.label)).toEqual(["To Do", "In Progress", "Done"]);
    expect(BOARD_COLUMNS.map((c) => c.key)).toEqual(["todo", "in_progress", "done"]);
  });

  test("every status belongs to one column; the old In Review sits under In Progress", () => {
    expect(columnOf("todo")).toBe("todo");
    expect(columnOf("in_progress")).toBe("in_progress");
    expect(columnOf("in_review")).toBe("in_progress");
    expect(columnOf("done")).toBe("done");
    expect(columnOf("something odd")).toBe("todo");
    expect(columnLabel("in_review")).toBe("In Progress");
  });

  test("counts per column", () => {
    const list = [
      task({ status: "todo" }),
      task({ status: "in_progress" }),
      task({ status: "in_review" }),
      task({ status: "done" }),
      task({ status: "done" }),
    ];
    expect(columnCounts(list)).toEqual({ todo: 1, in_progress: 2, done: 2 });
  });

  test("progress is the share of tasks that are done", () => {
    expect(progress([])).toEqual({ done: 0, total: 0, percent: 0 });
    expect(progress([task({ status: "done" }), task(), task(), task()])).toEqual({
      done: 1,
      total: 4,
      percent: 25,
    });
    expect(progress([task({ status: "done" }), task({ status: "done" }), task()]).percent).toBe(67);
  });

  test("moving to Done stamps a finish time and anything else clears it", () => {
    const done = statusPatch("done", NOW);
    expect(done).toEqual({
      status: "done",
      completed_at: NOW.toISOString(),
      updated_at: NOW.toISOString(),
    });
    expect(statusPatch("in_progress", NOW).completed_at).toBeNull();
    expect(statusPatch("todo", NOW).completed_at).toBeNull();
  });
});

describe("Due dates", () => {
  test("no due date", () => {
    expect(dueState(null, "todo", NOW)).toEqual({ kind: "none", label: "No due date" });
    expect(dueState("not a date", "todo", NOW).kind).toBe("none");
  });

  test("overdue by days and by hours", () => {
    expect(dueState(at(-3), "todo", NOW)).toEqual({ kind: "overdue", label: "Overdue by 3 days" });
    expect(dueState(at(-1), "in_progress", NOW).label).toBe("Overdue by 1 day");
    expect(dueState(at(0, 9), "todo", NOW)).toEqual({
      kind: "overdue",
      label: "Overdue by 3 hours",
    });
    expect(dueState(at(0, 11), "todo", NOW).label).toBe("Overdue by 1 hour");
    expect(dueState(new Date(NOW.getTime() - 60_000).toISOString(), "todo", NOW).label).toBe(
      "Overdue",
    );
  });

  test("due later today, tomorrow and soon", () => {
    expect(dueState(at(0, 17), "todo", NOW).kind).toBe("today");
    expect(dueState(at(0, 17), "todo", NOW).label).toMatch(/^Due today, /);
    expect(dueState(at(1), "todo", NOW).label).toMatch(/^Due tomorrow, /);
    expect(dueState(at(1), "todo", NOW).kind).toBe("soon");
    expect(dueState(at(3), "todo", NOW)).toEqual({ kind: "soon", label: "Due in 3 days" });
  });

  test("further out shows the date", () => {
    const s = dueState(at(10), "todo", NOW);
    expect(s.kind).toBe("later");
    expect(s.label).toMatch(/^Due /);
    expect(s.label).not.toMatch(/days/);
  });

  test("a finished task is never overdue", () => {
    expect(dueState(at(-5), "done", NOW).kind).toBe("done");
    expect(isOverdue({ due_date: at(-5), status: "done" }, NOW)).toBe(false);
    expect(isOverdue({ due_date: at(-5), status: "in_review" }, NOW)).toBe(true);
    expect(isOverdue({ due_date: null, status: "todo" }, NOW)).toBe(false);
  });

  test("a due date turns into the value a date-time box wants and back", () => {
    const local = new Date(2026, 10, 20, 15, 30);
    expect(toLocalInput(local.toISOString())).toBe("2026-11-20T15:30");
    expect(toLocalInput(null)).toBe("");
    expect(toLocalInput("nonsense")).toBe("");
    const checked = validateTaskForm(form({ due: toLocalInput(local.toISOString()) }));
    expect(checked.ok && checked.clean.due_date).toBe(local.toISOString());
  });
});

describe("Checking a task before saving", () => {
  test("a good task is cleaned up", () => {
    const r = validateTaskForm(
      form({
        title: "  Write   the   report  ",
        description: "  Intro and method  ",
        priority: "high",
        status: "in_progress",
        assignee: "u2",
      }),
    );
    expect(r).toEqual({
      ok: true,
      clean: {
        title: "Write the report",
        description: "Intro and method",
        priority: "high",
        status: "in_progress",
        due_date: null,
        assignee_id: "u2",
      },
    });
  });

  test("unassigned and an empty description become null", () => {
    const r = validateTaskForm(form());
    expect(r.ok && r.clean.assignee_id).toBeNull();
    expect(r.ok && r.clean.description).toBeNull();
  });

  test("the title is required", () => {
    for (const title of ["", "   ", "\n\t"]) {
      const r = validateTaskForm(form({ title }));
      expect(r.ok).toBe(false);
      expect(!r.ok && r.errors.title).toBe("Give the task a title.");
    }
  });

  test("title and description have limits", () => {
    expect(validateTaskForm(form({ title: "x".repeat(TITLE_MAX) })).ok).toBe(true);
    const long = validateTaskForm(form({ title: "x".repeat(TITLE_MAX + 1) }));
    expect(!long.ok && long.errors.title).toContain(String(TITLE_MAX));
    const desc = validateTaskForm(form({ description: "x".repeat(DESCRIPTION_MAX + 1) }));
    expect(!desc.ok && desc.errors.description).toContain(String(DESCRIPTION_MAX));
  });

  test("priority and status must be real", () => {
    const r = validateTaskForm(form({ priority: "whenever", status: "in_review" }));
    expect(!r.ok && Object.keys(r.errors).sort()).toEqual(["priority", "status"]);
  });

  test("a due date has to be a real date", () => {
    const bad = validateTaskForm(form({ due: "31/31/2026" }));
    expect(!bad.ok && bad.errors.due).toContain("isn't valid");
    const far = validateTaskForm(form({ due: "2500-01-01T10:00" }));
    expect(!far.ok && far.errors.due).toContain("between 2000 and 2100");
  });

  test("a past due date is allowed (the board then marks it overdue)", () => {
    expect(validateTaskForm(form({ due: "2020-01-01T10:00" })).ok).toBe(true);
  });

  test("all the problems are reported together", () => {
    const r = validateTaskForm(form({ title: "", due: "nope" }));
    expect(!r.ok && Object.keys(r.errors).sort()).toEqual(["due", "title"]);
  });
});

describe("Describing an edit", () => {
  const base = {
    title: "A",
    description: null,
    priority: "medium",
    due_date: null as string | null,
  };
  test("lists only what changed", () => {
    expect(describeChanges(base, base)).toEqual([]);
    expect(describeChanges(base, { ...base, title: "B" })).toEqual(["title"]);
    expect(
      describeChanges(base, { ...base, description: "x", priority: "high", due_date: at(2) }),
    ).toEqual(["description", "priority", "due date"]);
    expect(describeChanges({ ...base, due_date: at(2) }, base)).toEqual(["due date (removed)"]);
  });
  test("no description and an empty one are the same", () => {
    expect(describeChanges(base, { ...base, description: "" })).toEqual([]);
  });
});

describe("Filtering the board", () => {
  const mine = task({
    assignee_id: "me",
    title: "Draft slides",
    priority: "high",
    due_date: at(2),
  });
  const theirs = task({ assignee_id: "sam", title: "Collect data", description: "survey results" });
  const nobody = task({ title: "Pick a topic", priority: "low", due_date: at(-2) });
  const finishedLate = task({
    status: "done",
    due_date: at(-4),
    title: "Old thing",
    assignee_id: "sam",
  });
  const otherTeam = task({ team_id: "team-2", title: "Elsewhere" });
  const all = [mine, theirs, nobody, finishedLate, otherTeam];
  const run = (f: Partial<TaskFilters>) =>
    ids(filterTasks(all, { ...NO_FILTERS, ...f }, "me", NOW));

  test("no filters shows everything", () => {
    expect(run({})).toEqual(ids(all));
  });
  test("by team", () => {
    expect(run({ team: "team-2" })).toEqual([otherTeam.id]);
  });
  test("my tasks, someone else's, and unassigned", () => {
    expect(run({ assignee: "me" })).toEqual([mine.id]);
    expect(run({ assignee: "sam" })).toEqual([theirs.id, finishedLate.id]);
    expect(run({ assignee: "unassigned" })).toEqual([nobody.id, otherTeam.id]);
  });
  test("by priority", () => {
    expect(run({ priority: "high" })).toEqual([mine.id]);
    expect(run({ priority: "low" })).toEqual([nobody.id]);
  });
  test("overdue leaves out finished tasks", () => {
    expect(run({ due: "overdue" })).toEqual([nobody.id]);
  });
  test("the next 7 days leaves out overdue, undated and finished tasks", () => {
    expect(run({ due: "week" })).toEqual([mine.id]);
  });
  test("search looks in titles and descriptions, ignoring case and spacing around", () => {
    expect(run({ search: "  SLIDES " })).toEqual([mine.id]);
    expect(run({ search: "survey" })).toEqual([theirs.id]);
    expect(run({ search: "zzz" })).toEqual([]);
  });
  test("filters combine", () => {
    expect(run({ assignee: "sam", due: "overdue" })).toEqual([]);
    expect(run({ team: "team-1", priority: "high", assignee: "me" })).toEqual([mine.id]);
  });
});

describe("Order inside a column", () => {
  test("soonest due first, tasks with no date last", () => {
    const a = task({ due_date: at(5) });
    const b = task({ due_date: at(1) });
    const c = task({ due_date: null });
    const d = task({ due_date: at(-2) });
    expect(ids(sortColumnTasks([a, b, c, d]))).toEqual([d.id, b.id, a.id, c.id]);
  });
  test("then the more urgent first", () => {
    const low = task({ priority: "low" });
    const urgent = task({ priority: "urgent" });
    const medium = task({ priority: "medium" });
    expect(ids(sortColumnTasks([low, urgent, medium]))).toEqual([urgent.id, medium.id, low.id]);
  });
  test("then the order they were added", () => {
    const first = task({ position: 1 });
    const second = task({ position: 2 });
    expect(ids(sortColumnTasks([second, first]))).toEqual([first.id, second.id]);
  });
  test("sorting never changes the list it was given", () => {
    const list = [task({ due_date: at(3) }), task({ due_date: at(1) })];
    const copy = [...list];
    sortColumnTasks(list);
    expect(list).toEqual(copy);
  });
  test("a column holds only its own tasks", () => {
    const t = task({ status: "todo" });
    const p = task({ status: "in_progress" });
    const r = task({ status: "in_review" });
    const d = task({ status: "done" });
    expect(ids(tasksInColumn([t, p, r, d], "in_progress")).sort()).toEqual([p.id, r.id].sort());
    expect(ids(tasksInColumn([t, p, r, d], "done"))).toEqual([d.id]);
  });
});
