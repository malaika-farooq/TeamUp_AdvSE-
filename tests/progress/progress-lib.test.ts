// Functionality 6: the figures on the progress dashboard and the rules for the activity history.
import { describe, expect, test } from "bun:test";
import {
  actionsByPerson,
  actionsOfGroup,
  activityMeta,
  filterActivity,
  memberContributions,
  NO_ACTIVITY_FILTERS,
  overviewStats,
  statusBreakdown,
  topContributor,
  upcomingDeadlines,
} from "../../src/lib/progress";

const NOW = new Date(2026, 10, 13, 12, 0, 0);
const at = (days: number, hours = 12) => new Date(2026, 10, 13 + days, hours, 0, 0).toISOString();
let n = 0;
const task = (over: Record<string, unknown> = {}) => ({
  id: `t${++n}`,
  status: "todo",
  due_date: null as string | null,
  assignee_id: null as string | null,
  created_by: "ann",
  ...over,
});

describe("Tasks by status", () => {
  test("counts and shares for each of the three columns", () => {
    const out = statusBreakdown([
      task({ status: "todo" }),
      task({ status: "in_progress" }),
      task({ status: "in_review" }),
      task({ status: "done" }),
    ]);
    expect(out.map((s) => [s.label, s.count, s.percent])).toEqual([
      ["To Do", 1, 25],
      ["In Progress", 2, 50],
      ["Done", 1, 25],
    ]);
  });
  test("no tasks gives zeros, not NaN", () => {
    expect(statusBreakdown([]).map((s) => [s.count, s.percent])).toEqual([[0, 0], [0, 0], [0, 0]]);
  });
  test("the shares add up to about 100 with three tasks", () => {
    const out = statusBreakdown([task(), task({ status: "in_progress" }), task({ status: "done" })]);
    expect(out.reduce((s, c) => s + c.percent, 0)).toBeGreaterThanOrEqual(99);
  });
});

describe("Overview figures", () => {
  const tasks = [
    task({ status: "done", due_date: at(-3), assignee_id: "ann" }),
    task({ status: "in_progress", due_date: at(-1), assignee_id: "ben" }),
    task({ status: "todo", due_date: at(2), assignee_id: "ann" }),
    task({ status: "todo", due_date: at(20) }),
    task({ status: "todo" }),
    task({ status: "in_review", due_date: at(0, 18), assignee_id: "ben" }),
  ];
  test("totals, completion, overdue, due this week and unassigned", () => {
    expect(overviewStats(tasks, NOW)).toEqual({
      total: 6,
      done: 1,
      open: 5,
      overdue: 1,
      dueThisWeek: 2,
      unassigned: 2,
      completionPercent: 17,
    });
  });
  test("a finished task is never overdue or due soon", () => {
    const s = overviewStats([task({ status: "done", due_date: at(-5) }), task({ status: "done", due_date: at(2) })], NOW);
    expect(s.overdue).toBe(0);
    expect(s.dueThisWeek).toBe(0);
    expect(s.completionPercent).toBe(100);
  });
  test("an empty team", () => {
    expect(overviewStats([], NOW)).toEqual({
      total: 0,
      done: 0,
      open: 0,
      overdue: 0,
      dueThisWeek: 0,
      unassigned: 0,
      completionPercent: 0,
    });
  });
});

describe("Upcoming deadlines", () => {
  test("overdue most-overdue first, upcoming soonest first, finished and undated left out", () => {
    const a = task({ due_date: at(-1) });
    const b = task({ due_date: at(-5) });
    const c = task({ due_date: at(3) });
    const d = task({ due_date: at(1) });
    const finished = task({ status: "done", due_date: at(1) });
    const undated = task();
    const out = upcomingDeadlines([a, b, c, d, finished, undated], NOW);
    expect(out.overdue.map((t) => t.id)).toEqual([b.id, a.id]);
    expect(out.upcoming.map((t) => t.id)).toEqual([d.id, c.id]);
  });
  test("the list is limited", () => {
    const many = Array.from({ length: 12 }, (_, i) => task({ due_date: at(i + 1) }));
    expect(upcomingDeadlines(many, NOW, 5).upcoming).toHaveLength(5);
    expect(upcomingDeadlines(many, NOW).upcoming).toHaveLength(8);
  });
  test("nothing to show", () => {
    expect(upcomingDeadlines([], NOW)).toEqual({ overdue: [], upcoming: [] });
  });
});

describe("Per-member contributions", () => {
  const people = [
    { id: "ann", name: "Ann" },
    { id: "ben", name: "Ben" },
    { id: "cy", name: "Cy" },
  ];
  const tasks = [
    task({ status: "done", assignee_id: "ann", created_by: "ann" }),
    task({ status: "done", assignee_id: "ann", created_by: "ben" }),
    task({ status: "todo", assignee_id: "ann", due_date: at(-2), created_by: "ann" }),
    task({ status: "done", assignee_id: "ben", created_by: "ann" }),
    task({ status: "in_progress", assignee_id: "ben", created_by: "ben" }),
    task({ status: "todo", assignee_id: null, created_by: "ann" }),
  ];
  const stats = () =>
    memberContributions({
      members: people,
      tasks,
      resources: [{ created_by: "ben" }, { created_by: "ben" }, { created_by: "ann" }],
      comments: [{ author_id: "cy" }, { author_id: "ann" }, { author_id: "ann" }],
      sessions: [{ created_by: "ann" }],
      activity: [
        { actor_id: "ann", created_at: at(-1) },
        { actor_id: "ann", created_at: at(-40) },
        { actor_id: "ben", created_at: at(-3) },
      ],
      now: NOW,
    });
  const of = (id: string) => stats().find((s) => s.id === id)!;

  test("assigned, done, open and overdue", () => {
    expect(of("ann")).toMatchObject({ assigned: 3, done: 2, open: 1, overdue: 1 });
    expect(of("ben")).toMatchObject({ assigned: 2, done: 1, open: 1, overdue: 0 });
    expect(of("cy")).toMatchObject({ assigned: 0, done: 0, open: 0, overdue: 0 });
  });
  test("tasks created, comments, shared items and meetings", () => {
    expect(of("ann")).toMatchObject({ created: 4, comments: 2, resources: 1, sessions: 1 });
    expect(of("ben")).toMatchObject({ created: 2, comments: 0, resources: 2, sessions: 0 });
    expect(of("cy")).toMatchObject({ created: 0, comments: 1 });
  });
  test("completion of their own work and share of the team's finished work", () => {
    expect(of("ann")).toMatchObject({ completionPercent: 67, sharePercent: 67 });
    expect(of("ben")).toMatchObject({ completionPercent: 50, sharePercent: 33 });
    expect(of("cy")).toMatchObject({ completionPercent: 0, sharePercent: 0 });
  });
  test("recent actions only count the last 30 days; last active is the newest event", () => {
    expect(of("ann").recentActions).toBe(1);
    expect(of("ann").lastActive).toBe(at(-1));
    expect(of("cy").lastActive).toBeNull();
  });
  test("ordered by finished tasks, then assigned, then name", () => {
    expect(stats().map((s) => s.id)).toEqual(["ann", "ben", "cy"]);
    const tie = memberContributions({
      members: [{ id: "z", name: "Zed" }, { id: "a", name: "Amy" }],
      tasks: [],
      now: NOW,
    });
    expect(tie.map((s) => s.name)).toEqual(["Amy", "Zed"]);
  });
  test("the finished work of all members never exceeds 100%", () => {
    const total = stats().reduce((s, m) => s + m.sharePercent, 0);
    expect(total).toBeLessThanOrEqual(101);
  });
  test("tasks assigned to someone who left don't break anything", () => {
    const s = memberContributions({
      members: people,
      tasks: [task({ status: "done", assignee_id: "gone" })],
      now: NOW,
    });
    expect(s.every((m) => m.done === 0)).toBe(true);
  });
  test("a team with no members has no rows", () => {
    expect(memberContributions({ members: [], tasks, now: NOW })).toEqual([]);
  });
  test("the top contributor is the one who finished most, unless tied or nothing is done", () => {
    expect(topContributor(stats())?.id).toBe("ann");
    expect(topContributor([])).toBeNull();
    const tied = memberContributions({
      members: people,
      tasks: [task({ status: "done", assignee_id: "ann" }), task({ status: "done", assignee_id: "ben" })],
      now: NOW,
    });
    expect(topContributor(tied)).toBeNull();
    expect(topContributor(memberContributions({ members: people, tasks: [task()], now: NOW }))).toBeNull();
  });
});

describe("Activity history rules", () => {
  test("every action the app records belongs to a group", () => {
    expect(activityMeta("task_created")).toEqual({ group: "tasks", label: "Task created" });
    expect(activityMeta("comment_added").group).toBe("tasks");
    expect(activityMeta("task_deleted").group).toBe("tasks");
    expect(activityMeta("resource_added").group).toBe("resources");
    expect(activityMeta("session_created").group).toBe("meetings");
    expect(activityMeta("member_joined").group).toBe("people");
    expect(activityMeta("role_changed").group).toBe("people");
    expect(activityMeta("whatever")).toEqual({ group: "other", label: "Activity" });
  });
  test("the actions of a group", () => {
    expect(actionsOfGroup("tasks").sort()).toEqual(["comment_added", "task_created", "task_deleted", "task_updated"]);
    expect(actionsOfGroup("meetings")).toEqual(["session_created"]);
    expect(actionsOfGroup("other")).toEqual([]);
  });
  const log = (actor: string, action: string, days: number) => ({
    actor_id: actor,
    action,
    created_at: at(-days),
  });
  const all = [
    log("ann", "task_created", 1),
    log("ben", "resource_added", 3),
    log("ann", "session_created", 10),
    log("ben", "task_updated", 40),
  ];
  test("by person, type and period, alone and together", () => {
    const run = (f: object) => filterActivity(all, { ...NO_ACTIVITY_FILTERS, ...f }, NOW).length;
    expect(run({})).toBe(4);
    expect(run({ actor: "ann" })).toBe(2);
    expect(run({ group: "tasks" })).toBe(2);
    expect(run({ days: 7 })).toBe(2);
    expect(run({ days: 30 })).toBe(3);
    expect(run({ actor: "ben", group: "tasks" })).toBe(1);
    expect(run({ actor: "ben", group: "tasks", days: 7 })).toBe(0);
  });
  test("how busy each person has been", () => {
    expect(actionsByPerson(all, [{ id: "ann", name: "Ann" }, { id: "ben", name: "Ben" }, { id: "cy", name: "Cy" }])).toEqual([
      { id: "ann", name: "Ann", count: 2 },
      { id: "ben", name: "Ben", count: 2 },
      { id: "cy", name: "Cy", count: 0 },
    ]);
  });
});
