// LOAD / PERFORMANCE TESTS: the engines and screens must stay fast with far more data than a real team has.
// Each test has a time budget (generous, so a slow laptop still passes) and also checks the answer is right.
// The JMeter plan in Tests_Requirements/load_testing covers the web server itself.
import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProgressDashboard } from "../../src/components/app/teams/ProgressDashboard";
import { bestMeetingTimes, type MemberAvailability } from "../../src/lib/meeting-times";
import { groupByDay } from "../../src/lib/notifications";
import { rankPartners } from "../../src/lib/partner-ranking";
import { memberContributions, overviewStats, statusBreakdown, upcomingDeadlines } from "../../src/lib/progress";
import { filterResources, parseTags } from "../../src/lib/resources";
import { NO_FILTERS, filterTasks, sortColumnTasks, type TaskLike } from "../../src/lib/task-board";
import { h, resetHarness } from "../../tests/helpers/harness";

function timed<T>(fn: () => T): { value: T; ms: number } {
  const start = performance.now();
  const value = fn();
  return { value, ms: performance.now() - start };
}

const STATUSES = ["todo", "in_progress", "in_review", "done"];
const PRIORITIES = ["low", "medium", "high", "urgent"];
const day = 864e5;

function tasks(count: number, people = 20): TaskLike[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `t${i}`,
    team_id: `team-${i % 5}`,
    title: `Task number ${i}`,
    description: i % 3 ? null : "some description text",
    status: STATUSES[i % 4]!,
    priority: PRIORITIES[i % 4]!,
    assignee_id: i % 7 === 0 ? null : `u${i % people}`,
    created_by: `u${(i * 3) % people}`,
    due_date: i % 5 === 0 ? null : new Date(Date.now() + ((i % 40) - 15) * day).toISOString(),
    position: i,
    completed_at: null,
    created_at: "2026-11-01T00:00:00Z",
  }));
}

describe("Load: the matching engines", () => {
  test("ranking 5,000 students takes well under a second and returns the best five", () => {
    const people = Array.from({ length: 5000 }, (_, i) => ({
      id: `s${i}`,
      name: `Student ${String(i).padStart(4, "0")}`,
      sharedCourses: Array.from({ length: i % 4 }, (_, k) => `C${k}`),
      newSkills: Array.from({ length: i % 6 }, (_, k) => `S${k}`),
      wantedSkills: i % 11 === 0 ? ["SQL"] : [],
      overlapMinutes: (i % 20) * 30,
      windowMinutes: (i % 9) * 30,
      workload: { openTasks: i % 15, dueSoon: i % 5, sessionsWeek: i % 4 },
    }));
    const { value, ms } = timed(() => rankPartners(people, 5, { requireWindow: true, avoidHeavy: true }));
    expect(value).toHaveLength(5);
    expect(value[0]!.score).toBeGreaterThanOrEqual(value[4]!.score);
    expect(ms).toBeLessThan(500);
  });

  test("finding common meeting times for a 40-person team with a full week of free time stays fast", () => {
    const members: MemberAvailability[] = Array.from({ length: 40 }, (_, m) => ({
      id: `m${m}`,
      name: `Member ${m}`,
      ranges: Array.from({ length: 7 }, (_, d) => ({ weekday: d, start: (6 + (m % 6)) * 60, end: (16 + (m % 5)) * 60 })),
    }));
    const { value, ms } = timed(() => bestMeetingTimes(members, 60));
    expect(value.length).toBeGreaterThan(0);
    expect(value[0]!.freeIds.length).toBeGreaterThan(20);
    expect(ms).toBeLessThan(1500);
  });
});

describe("Load: the task board's engines", () => {
  test("filtering and ordering 20,000 tasks", () => {
    const all = tasks(20000);
    const { value, ms } = timed(() => filterTasks(all, { ...NO_FILTERS, search: "number 19", priority: "high" }, "u1"));
    expect(value.every((t) => t.priority === "high" && t.title.includes("number 19"))).toBe(true);
    expect(ms).toBeLessThan(800);
    const sorted = timed(() => sortColumnTasks(all.filter((t) => t.status === "todo")));
    expect(sorted.value).toHaveLength(5000);
    expect(sorted.ms).toBeLessThan(1000);
  });

  test("the progress figures for 20,000 tasks and 50 members", () => {
    const all = tasks(20000, 50);
    const people = Array.from({ length: 50 }, (_, i) => ({ id: `u${i}`, name: `Member ${String(i).padStart(2, "0")}` }));
    const a = timed(() => overviewStats(all));
    expect(a.value.total).toBe(20000);
    expect(a.ms).toBeLessThan(500);
    const b = timed(() => statusBreakdown(all));
    expect(b.value.reduce((s, c) => s + c.count, 0)).toBe(20000);
    const c = timed(() => upcomingDeadlines(all));
    expect(c.value.overdue.length).toBeLessThanOrEqual(8);
    const d = timed(() =>
      memberContributions({
        members: people,
        tasks: all,
        resources: Array.from({ length: 2000 }, (_, i) => ({ created_by: `u${i % 50}` })),
        comments: Array.from({ length: 5000 }, (_, i) => ({ author_id: `u${i % 50}` })),
        activity: Array.from({ length: 5000 }, (_, i) => ({ actor_id: `u${i % 50}`, created_at: new Date(Date.now() - i * 3600e3).toISOString() })),
      }),
    );
    expect(d.value).toHaveLength(50);
    expect(d.ms).toBeLessThan(4000);
    // every task assigned to a member is counted once
    expect(d.value.reduce((s, m) => s + m.assigned, 0)).toBe(all.filter((t) => t.assignee_id).length);
  });

  test("searching 10,000 shared notes and links", () => {
    const items = Array.from({ length: 10000 }, (_, i) => ({
      id: `r${i}`, team_id: "t1", kind: ["note", "link", "file"][i % 3]!, title: `Resource ${i}`,
      content: i % 2 ? "recursion and trees" : null, url: i % 3 === 1 ? `https://example.com/${i}` : null,
      storage_path: null, file_size: null, tags: [`tag${i % 30}`], created_by: "u1", updated_at: "2026-11-01T00:00:00Z",
    }));
    const { value, ms } = timed(() => filterResources(items, { kind: "all", team: "all", tag: "tag7", search: "recursion" }));
    expect(value.length).toBeGreaterThan(0);
    expect(ms).toBeLessThan(500);
  });

  test("grouping 10,000 notifications by day", () => {
    const items = Array.from({ length: 10000 }, (_, i) => ({ created_at: new Date(Date.now() - i * 1800e3).toISOString() }));
    const { value, ms } = timed(() => groupByDay(items));
    expect(value.reduce((s, g) => s + g.items.length, 0)).toBe(10000);
    expect(ms).toBeLessThan(500);
  });

  test("tags from a very long paste", () => {
    const { value, ms } = timed(() => parseTags(Array.from({ length: 50000 }, (_, i) => `tag${i}`).join(",")));
    expect(value).toHaveLength(10);
    expect(ms).toBeLessThan(500);
  });
});

describe("Load: screens with a lot on them", () => {
  test("the progress dashboard draws 2,000 tasks and 30 members in a few seconds", async () => {
    resetHarness();
    const members = Array.from({ length: 30 }, (_, i) => ({
      team_id: "t1", user_id: `u${i}`, role: "member", joined_at: "2026-01-01",
      profile: { id: `u${i}`, display_name: `Member ${String(i).padStart(2, "0")}`, avatar_url: null },
    }));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const start = performance.now();
    render(
      <QueryClientProvider client={client}>
        <ProgressDashboard
          teamId="t1"
          tasks={tasks(2000, 30) as never}
          members={members as never}
          resources={[]}
          sessions={[]}
        />
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId("stat-Completed")).toBeTruthy();
    expect(screen.getAllByRole("row")).toHaveLength(31); // header + one row per member
    expect(performance.now() - start).toBeLessThan(8000);
    expect(h.fake.callsTo("activity_logs").length).toBeGreaterThan(0);
  });
});
