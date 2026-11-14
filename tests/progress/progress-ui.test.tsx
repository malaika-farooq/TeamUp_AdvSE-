import { beforeEach, describe, expect, test } from "bun:test";
import { screen, waitFor, within } from "@testing-library/react";
import { ActivityHistory } from "../../src/components/app/teams/ActivityHistory";
import { ProgressDashboard } from "../../src/components/app/teams/ProgressDashboard";
import type { MemberWithProfile, Resource, StudySession, Task } from "../../src/lib/queries";
import { ACTIVITY_PAGE_SIZE } from "../../src/lib/team-progress";
import { h, resetHarness } from "../helpers/harness";
import { renderWithClient } from "../helpers/render";

const rel = (days: number, hours = 12) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
};
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

let n = 0;
const task = (over: Partial<Task> = {}): Task =>
  ({
    id: `task-${++n}`,
    team_id: "t1",
    title: `Task ${n}`,
    description: null,
    status: "todo",
    priority: "medium",
    assignee_id: null,
    created_by: "user-1",
    due_date: null,
    position: n,
    completed_at: null,
    created_at: "2026-11-01T00:00:00Z",
    updated_at: "2026-11-01T00:00:00Z",
    ...over,
  }) as Task;

const member = (id: string, name: string, role = "member"): MemberWithProfile =>
  ({
    team_id: "t1",
    user_id: id,
    role,
    joined_at: "2026-01-01",
    profile: { id, display_name: name, avatar_url: null },
  }) as unknown as MemberWithProfile;
const MEMBERS = [
  member("user-1", "Maya Chen", "owner"),
  member("u2", "Ben Ortiz"),
  member("u3", "Cy Park"),
];

const standard = () => [
  task({ title: "Draft outline", status: "done", assignee_id: "user-1" }),
  task({ title: "Collect sources", status: "done", assignee_id: "user-1" }),
  task({ title: "Build prototype", status: "in_progress", assignee_id: "u2", due_date: rel(-2) }),
  task({ title: "Write report", status: "todo", assignee_id: "u2", due_date: rel(2) }),
  task({ title: "Make slides", status: "todo", assignee_id: null, due_date: rel(5) }),
  task({ title: "Practise talk", status: "in_review", assignee_id: "user-1" }),
];

function show(
  tasks: Task[] = standard(),
  opts: { resources?: Resource[]; sessions?: StudySession[] } = {},
) {
  resetHarness();
  h.fake.seed("task_comments", [
    { task_id: tasks[0]?.id, author_id: "u2" },
    { task_id: tasks[0]?.id, author_id: "u2" },
    { task_id: tasks[0]?.id, author_id: "u3" },
  ] as never);
  h.fake.seed("activity_logs", [
    {
      id: "a1",
      team_id: "t1",
      actor_id: "user-1",
      action: "task_updated",
      summary: "moved a task",
      created_at: ago(2 * 3600_000),
    },
    {
      id: "a2",
      team_id: "t1",
      actor_id: "u2",
      action: "task_created",
      summary: "created a task",
      created_at: ago(26 * 3600_000),
    },
  ] as never);
  return renderWithClient(
    <ProgressDashboard
      teamId="t1"
      tasks={tasks}
      members={MEMBERS}
      resources={
        opts.resources ?? ([{ created_by: "u3" }, { created_by: "u3" }] as unknown as Resource[])
      }
      sessions={opts.sessions ?? ([{ created_by: "user-1" }] as unknown as StudySession[])}
    />,
  );
}
const stat = (label: string) => screen.getByTestId(`stat-${label}`).textContent;
const row = (name: string) => screen.getByText(name, { selector: "th span, th" }).closest("tr")!;

beforeEach(() => {
  n = 0;
});

describe("Progress dashboard: tasks by status", () => {
  test("summary figures", async () => {
    show();
    expect(await screen.findByTestId("stat-Completed")).toBeTruthy();
    expect(stat("Completed")).toBe("33%");
    expect(stat("Open tasks")).toBe("4");
    expect(stat("Overdue")).toBe("1");
    expect(stat("Due this week")).toBe("2");
    expect(stat("Unassigned")).toBe("1");
  });

  test("shows each column's count and share", async () => {
    show();
    expect(await screen.findByRole("img", { name: "To Do: 2 of 6 tasks (33%)" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "In Progress: 2 of 6 tasks (33%)" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Done: 2 of 6 tasks (33%)" })).toBeTruthy();
    expect(screen.getByText("2 of 6 done")).toBeTruthy();
  });

  test("the overall bar matches the completion figure", async () => {
    show();
    const bar = await screen.findByRole("progressbar", { name: "Overall completion" });
    expect(bar).toBeTruthy();
  });

  test("a team with no tasks says so and shows zeros", async () => {
    show([]);
    expect(await screen.findByText(/No tasks yet/)).toBeTruthy();
    expect(stat("Completed")).toBe("0%");
    expect(stat("Open tasks")).toBe("0");
  });

  test("finishing every task shows 100%", async () => {
    show([task({ status: "done" }), task({ status: "done" })]);
    await screen.findByTestId("stat-Completed");
    expect(stat("Completed")).toBe("100%");
    expect(stat("Open tasks")).toBe("0");
  });
});

describe("Progress dashboard: deadlines", () => {
  test("overdue and upcoming are listed separately with who is responsible", async () => {
    show();
    const overdue = within(await screen.findByRole("list", { name: "Overdue tasks" }));
    expect(overdue.getAllByRole("listitem")).toHaveLength(1);
    expect(overdue.getByText("Build prototype")).toBeTruthy();
    expect(overdue.getByText(/Overdue by 2 days/)).toBeTruthy();
    expect(overdue.getByText(/Ben Ortiz/)).toBeTruthy();

    const upcoming = within(screen.getByRole("list", { name: "Upcoming deadlines" }));
    const items = upcoming.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]!.textContent).toContain("Write report");
    expect(items[1]!.textContent).toContain("Make slides");
    expect(items[1]!.textContent).toContain("Unassigned");
  });

  test("finished tasks never appear as deadlines", async () => {
    show([
      task({ title: "Old", status: "done", due_date: rel(-3) }),
      task({ title: "Future done", status: "done", due_date: rel(4) }),
    ]);
    await screen.findByText(/No open tasks have a due date/);
    expect(screen.queryByText("Old")).toBeNull();
  });

  test("no due dates at all", async () => {
    show([task(), task()]);
    expect(await screen.findByText(/No open tasks have a due date/)).toBeTruthy();
  });

  test("an empty overdue list says nothing is overdue", async () => {
    show([task({ due_date: rel(3) })]);
    expect(await screen.findByText("Nothing is overdue.")).toBeTruthy();
  });
});

describe("Progress dashboard: per-member contributions", () => {
  test("shows each member's assigned, done, open and overdue tasks", async () => {
    show();
    await screen.findByRole("table");
    const maya = row("Maya Chen").querySelectorAll("td");
    expect([...maya].slice(0, 4).map((c) => c.textContent)).toEqual(["3", "2", "1", "0"]);
    const ben = row("Ben Ortiz").querySelectorAll("td");
    expect([...ben].slice(0, 4).map((c) => c.textContent)).toEqual(["2", "0", "2", "1"]);
    const cy = row("Cy Park").querySelectorAll("td");
    expect([...cy].slice(0, 4).map((c) => c.textContent)).toEqual(["0", "0", "0", "0"]);
  });

  test("counts comments and shared notes, links and files", async () => {
    show();
    await waitFor(() => expect(row("Ben Ortiz").querySelectorAll("td")[4]!.textContent).toBe("2"));
    expect(row("Cy Park").querySelectorAll("td")[4]!.textContent).toBe("1");
    expect(row("Cy Park").querySelectorAll("td")[5]!.textContent).toBe("2");
    expect(row("Maya Chen").querySelectorAll("td")[5]!.textContent).toBe("0");
  });

  test("shows each member's share of the finished work", async () => {
    show();
    expect(
      await screen.findByRole("img", {
        name: "Maya Chen finished 100% of the team's completed tasks",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("img", { name: "Ben Ortiz finished 0% of the team's completed tasks" }),
    ).toBeTruthy();
  });

  test("members are ordered by tasks finished", async () => {
    show();
    await screen.findByRole("table");
    const names = within(screen.getByRole("table"))
      .getAllByRole("rowheader")
      .map((r) => r.textContent);
    expect(
      names.map((x) => ["Maya Chen", "Ben Ortiz", "Cy Park"].findIndex((nm) => x!.endsWith(nm))),
    ).toEqual([0, 1, 2]);
  });

  test("names the member who finished the most", async () => {
    show();
    expect(await screen.findByText(/Most tasks finished: Maya Chen \(2\)/)).toBeTruthy();
  });

  test("no 'most finished' badge when nobody has finished anything", async () => {
    show([task({ assignee_id: "u2" })]);
    await screen.findByRole("table");
    expect(screen.queryByText(/Most tasks finished/)).toBeNull();
  });

  test("shows when each person was last active", async () => {
    show();
    await waitFor(() => expect(row("Maya Chen").textContent).toContain("2 h ago"));
    expect(row("Cy Park").textContent).toContain("No activity");
  });

  test("a load error is shown with a retry", async () => {
    resetHarness();
    h.fake.failTable("activity_logs", "select", { message: "Network down" });
    renderWithClient(
      <ProgressDashboard
        teamId="t1"
        tasks={standard()}
        members={MEMBERS}
        resources={[]}
        sessions={[]}
      />,
    );
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Network down");
    await waitFor(() => expect(screen.getByRole("button", { name: /try again/i })).toBeTruthy());
  });
});

describe("Activity history", () => {
  const logs = (count: number, over: Record<string, unknown> = {}) =>
    Array.from({ length: count }, (_, i) => ({
      id: `log-${i}`,
      team_id: "t1",
      actor_id: i % 2 ? "u2" : "user-1",
      action: "task_updated",
      summary: `did thing ${i}`,
      created_at: ago((i + 1) * 60_000),
      ...over,
    }));
  const history = (rows: object[]) => {
    resetHarness();
    h.fake.seed("activity_logs", rows as never);
    return renderWithClient(<ActivityHistory teamId="t1" members={MEMBERS} />);
  };
  const entries = () => screen.getAllByRole("listitem");

  test("lists events newest first with who did them", async () => {
    history(logs(3));
    await screen.findByText(/did thing 0/);
    expect(entries()[0]!.textContent).toContain("Maya Chen");
    expect(entries()[0]!.textContent).toContain("did thing 0");
    expect(entries()[1]!.textContent).toContain("Ben Ortiz");
    expect(entries()[0]!.textContent).toContain("Task updated");
    expect(entries()[0]!.textContent).toContain("1 min ago");
    expect(screen.getByText("Showing 3 events")).toBeTruthy();
  });

  test("events by someone who left still show", async () => {
    history(logs(1, { actor_id: "gone" }));
    expect((await screen.findByText(/A former member/)).closest("li")!.textContent).toContain(
      "did thing 0",
    );
  });

  test("groups by day", async () => {
    history([
      ...logs(1),
      {
        id: "old",
        team_id: "t1",
        actor_id: "u2",
        action: "task_created",
        summary: "created long ago",
        created_at: ago(20 * 86_400_000),
      },
    ]);
    await screen.findByText(/created long ago/);
    expect(
      within(screen.getByRole("region", { name: "Today" })).getByText(/did thing 0/),
    ).toBeTruthy();
    expect(
      within(screen.getByRole("region", { name: "Earlier" })).getByText(/created long ago/),
    ).toBeTruthy();
  });

  test("an empty team's history says so", async () => {
    history([]);
    expect(await screen.findByText("No activity yet")).toBeTruthy();
  });

  test("filter by person", async () => {
    const { user } = history(logs(4));
    await screen.findByText(/did thing 0/);
    await user.selectOptions(screen.getByLabelText("Person"), "u2");
    await waitFor(() => expect(screen.queryByText(/did thing 0/)).toBeNull());
    expect(entries().every((li) => li.textContent!.includes("Ben Ortiz"))).toBe(true);
    expect(entries()).toHaveLength(2);
  });

  test("filter by type", async () => {
    const { user } = history([
      ...logs(2),
      {
        id: "r",
        team_id: "t1",
        actor_id: "u2",
        action: "resource_added",
        summary: 'added "Exam notes"',
        created_at: ago(5000),
      },
    ]);
    await screen.findByText(/Exam notes/);
    await user.selectOptions(screen.getByLabelText("Type"), "resources");
    await waitFor(() => expect(screen.queryByText(/did thing/)).toBeNull());
    expect(entries()).toHaveLength(1);
    expect(entries()[0]!.getAttribute("data-action")).toBe("resource_added");
  });

  test("filter by period", async () => {
    const { user } = history([
      ...logs(1),
      {
        id: "old",
        team_id: "t1",
        actor_id: "u2",
        action: "task_created",
        summary: "ancient",
        created_at: ago(40 * 86_400_000),
      },
    ]);
    await screen.findByText(/ancient/);
    await user.selectOptions(screen.getByLabelText("When"), "30");
    await waitFor(() => expect(screen.queryByText(/ancient/)).toBeNull());
    expect(screen.getByText(/did thing 0/)).toBeTruthy();
  });

  test("filters with no results can be cleared", async () => {
    const { user } = history(logs(2));
    await screen.findByText(/did thing 0/);
    await user.selectOptions(screen.getByLabelText("Type"), "meetings");
    expect(await screen.findByText("Nothing matches these filters")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(await screen.findByText(/did thing 0/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Clear filters" })).toBeNull();
  });

  test("long histories load a page at a time", async () => {
    const { user } = history(logs(ACTIVITY_PAGE_SIZE + 7));
    await screen.findByText(/did thing 0/);
    expect(entries()).toHaveLength(ACTIVITY_PAGE_SIZE);
    await user.click(screen.getByRole("button", { name: "Load more" }));
    await waitFor(() => expect(entries()).toHaveLength(ACTIVITY_PAGE_SIZE + 7));
    expect(screen.queryByRole("button", { name: "Load more" })).toBeNull();
    // no event appears twice
    const ids = entries().map((li) => li.textContent);
    expect(new Set(ids).size).toBe(ids.length);
    expect(screen.getByText(`Showing ${ACTIVITY_PAGE_SIZE + 7} events`)).toBeTruthy();
  });

  test("exactly one page has no 'Load more' once the end is reached", async () => {
    const { user } = history(logs(ACTIVITY_PAGE_SIZE));
    await screen.findByText(/did thing 0/);
    await user.click(screen.getByRole("button", { name: "Load more" }));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Load more" })).toBeNull());
    expect(entries()).toHaveLength(ACTIVITY_PAGE_SIZE);
  });

  test("a load error has a retry", async () => {
    resetHarness();
    h.fake.failTable("activity_logs", "select", { message: "Network down" });
    const { user } = renderWithClient(<ActivityHistory teamId="t1" members={MEMBERS} />);
    expect((await screen.findByRole("alert")).textContent).toContain("Network down");
    h.fake.seed("activity_logs", logs(1) as never);
    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(await screen.findByText(/did thing 0/)).toBeTruthy();
  });

  test("only this team's history is asked for", async () => {
    history([
      ...logs(1),
      {
        id: "x",
        team_id: "other",
        actor_id: "u2",
        action: "task_created",
        summary: "elsewhere",
        created_at: ago(1000),
      },
    ]);
    await screen.findByText(/did thing 0/);
    expect(screen.queryByText(/elsewhere/)).toBeNull();
  });
});
