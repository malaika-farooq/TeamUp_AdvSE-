// SYSTEM TEST: one student acts, the other is told, the team's dashboard and history stay in step.
// Both students share the same database. Functionalities covered: 4 (task board), 5 (shared notes, notifications),
// 6 (progress dashboard, activity history).
import { beforeEach, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import { NotificationsBell } from "../../src/components/app/notifications/NotificationCenter";
import { ActivityHistory } from "../../src/components/app/teams/ActivityHistory";
import { ProgressDashboard } from "../../src/components/app/teams/ProgressDashboard";
import { NotificationsPage } from "../../src/routes/_authenticated/notifications";
import { Route as TasksRoute } from "../../src/routes/_authenticated/tasks";
import { Route as ResourcesRoute } from "../../src/routes/_authenticated/resources";
import { fetchResources, fetchSessions, fetchTasks, fetchTeamMembers } from "../../src/lib/queries";
import { h, resetHarness } from "../../tests/helpers/harness";
import { renderWithClient } from "../../tests/helpers/render";

const TasksPage = (TasksRoute as unknown as { component: () => JSX.Element }).component;
const ResourcesPage = (ResourcesRoute as unknown as { component: () => JSX.Element }).component;
const BEN = { id: "u2", email: "ben@example.edu", user_metadata: { display_name: "Ben Ortiz" } };
const MAYA = { id: "user-1", email: "maya.chen@example.edu", user_metadata: { display_name: "Maya Chen" } };

type Session = ReturnType<typeof renderWithClient>;
const becomes = (who: typeof BEN | typeof MAYA) => {
  cleanup();
  h.user = who;
  h.fake.setUserId(who.id);
  h.toast.success.mockClear();
  h.toast.error.mockClear();
};
const choose = async (user: Session["user"], combo: HTMLElement, option: string) => {
  await user.click(combo);
  await user.click(await screen.findByRole("option", { name: option }));
};
const table = (name: string) => h.fake.tables[name] ?? [];

function LiveProgress() {
  const tasks = useQuery({ queryKey: ["tasks", ["t1"]], queryFn: () => fetchTasks(["t1"]) });
  const members = useQuery({ queryKey: ["members", "t1"], queryFn: () => fetchTeamMembers("t1") });
  const resources = useQuery({ queryKey: ["resources", ["t1"]], queryFn: () => fetchResources(["t1"]) });
  const sessions = useQuery({ queryKey: ["sessions", ["t1"]], queryFn: () => fetchSessions(["t1"]) });
  if (!tasks.data || !members.data) return <p>loading</p>;
  return (
    <>
      <ProgressDashboard
        teamId="t1"
        tasks={tasks.data}
        members={members.data}
        resources={resources.data ?? []}
        sessions={sessions.data ?? []}
      />
      <ActivityHistory teamId="t1" members={members.data} />
    </>
  );
}

beforeEach(() => {
  resetHarness();
  h.fake.seed("team_members", [
    { team_id: "t1", user_id: "user-1", role: "owner", joined_at: "2026-01-01" },
    { team_id: "t1", user_id: "u2", role: "member", joined_at: "2026-01-02" },
  ]);
  h.fake.seed("teams", [{ id: "t1", name: "Capstone Crew", created_at: "2026-01-01" }]);
  h.fake.seed("profiles", [
    { id: "user-1", display_name: "Maya Chen", avatar_url: null },
    { id: "u2", display_name: "Ben Ortiz", avatar_url: null },
  ]);
});

describe("System: a team works together from first task to finished project", () => {
  test("assign -> notified -> finish -> dashboard and history agree", async () => {
    // 1. Maya (owner) creates a task for Ben, due tomorrow.
    let session = renderWithClient(<TasksPage />);
    await session.user.click(await screen.findByRole("button", { name: /new task/i }));
    const dialog = await screen.findByRole("dialog");
    await session.user.type(within(dialog).getByLabelText("Title"), "Write the report");
    const tomorrow = new Date(Date.now() + 864e5);
    const local = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}T12:00`;
    fireEvent.change(within(dialog).getByLabelText("Due date"), { target: { value: local } });
    await choose(session.user, within(dialog).getByRole("combobox", { name: "Assignee" }), "Ben Ortiz");
    await session.user.click(within(dialog).getByRole("button", { name: "Create task" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Task created"));
    expect(await screen.findByText("Write the report")).toBeTruthy();
    expect(table("tasks")).toHaveLength(1);
    expect(table("tasks")[0]).toMatchObject({ title: "Write the report", assignee_id: "u2", created_by: "user-1", status: "todo" });

    // 2. Maya shares a note with the team.
    cleanup();
    session = renderWithClient(<ResourcesPage />);
    await session.user.click(await screen.findByRole("button", { name: /add resource/i }));
    const noteDialog = await screen.findByRole("dialog");
    await session.user.type(within(noteDialog).getByLabelText("Title"), "Report outline");
    await session.user.type(within(noteDialog).getByLabelText("Note (Markdown supported)"), "1. Intro 2. Method");
    await session.user.click(within(noteDialog).getByRole("button", { name: "Add resource" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Resource added"));

    // 3. Ben opens his bell: the assignment and the shared note are both there.
    becomes(BEN);
    session = renderWithClient(<NotificationsBell />);
    expect((await screen.findByTestId("unread-count")).textContent).toBe("2");
    await session.user.click(screen.getByRole("button", { name: /^Notifications/ }));
    const list = within(await screen.findByRole("dialog"));
    const titles = list.getAllByRole("listitem").map((li) => li.textContent ?? "");
    expect(titles.some((t) => t.includes("New task assigned to you") && t.includes("Write the report"))).toBe(true);
    expect(titles.some((t) => t.includes("New note shared in Capstone Crew") && t.includes("Report outline"))).toBe(true);

    // 4. Ben opens the task board and finishes his task.
    cleanup();
    session = renderWithClient(<TasksPage />);
    await screen.findByText("Write the report");
    await choose(session.user, screen.getByRole("combobox", { name: "Status for Write the report" }), "Done");
    await waitFor(() => expect(table("tasks")[0]!["status"]).toBe("done"));
    expect(table("tasks")[0]!["completed_at"]).toBeTruthy();
    expect(h.confetti).toHaveBeenCalled(); // every task in the team is done

    // 5. Maya is told, and her notifications page shows it.
    becomes(MAYA);
    session = renderWithClient(<NotificationsPage />);
    expect(await screen.findByText("A task you created is done")).toBeTruthy();
    expect(screen.getByText("Write the report")).toBeTruthy();

    // 6. The progress dashboard and history agree with all of that.
    cleanup();
    renderWithClient(<LiveProgress />);
    expect(await screen.findByTestId("stat-Completed")).toBeTruthy();
    await waitFor(() => expect(screen.getByTestId("stat-Completed").textContent).toBe("100%"));
    expect(screen.getByTestId("stat-Open tasks").textContent).toBe("0");
    expect(screen.getByTestId("stat-Overdue").textContent).toBe("0");
    expect(screen.getByRole("img", { name: "Done: 1 of 1 tasks (100%)" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Ben Ortiz finished 100% of the team's completed tasks" })).toBeTruthy();
    expect(screen.getByText(/Most tasks finished: Ben Ortiz \(1\)/)).toBeTruthy();
    const benRow = screen.getAllByText("Ben Ortiz").map((e) => e.closest("tr")).find(Boolean)!;
    expect([...benRow.querySelectorAll("td")].slice(0, 4).map((c) => c.textContent)).toEqual(["1", "1", "0", "0"]);
    const mayaRow = screen.getAllByText("Maya Chen").map((e) => e.closest("tr")).find(Boolean)!;
    expect(mayaRow.querySelectorAll("td")[5]!.textContent).toBe("1"); // she shared one note

    const history = await screen.findByRole("region", { name: "Today" });
    const lines = within(history).getAllByRole("listitem").map((li) => li.textContent ?? "");
    expect(lines.some((l) => l.includes("Maya Chen") && l.includes('created "Write the report"'))).toBe(true);
    expect(lines.some((l) => l.includes("Maya Chen") && l.includes('added "Report outline"'))).toBe(true);
    expect(lines.some((l) => l.includes("Ben Ortiz") && l.includes('moved "Write the report" to Done'))).toBe(true);
    // newest first: Ben's move is the latest thing that happened
    expect(lines[0]).toContain("Ben Ortiz");
  }, 60_000);

  test("an assignee who is not allowed cannot finish someone else's task", async () => {
    h.fake.seed("tasks", [
      {
        id: "x1", team_id: "t1", title: "Owner only", description: null, status: "todo", priority: "medium",
        assignee_id: null, created_by: "user-1", due_date: null, position: 1, completed_at: null,
        created_at: "2026-11-01T00:00:00Z", updated_at: "2026-11-01T00:00:00Z",
      },
    ] as never);
    becomes(BEN);
    renderWithClient(<TasksPage />);
    const status = await screen.findByRole("combobox", { name: "Status for Owner only (view only)" });
    expect((status as HTMLButtonElement).disabled).toBe(true);
    expect(table("tasks")[0]!["status"]).toBe("todo");
  });
});
