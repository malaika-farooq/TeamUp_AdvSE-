import { beforeEach, describe, expect, test } from "bun:test";
import { useState } from "react";
import { screen, waitFor, within } from "@testing-library/react";
import { TaskBoard } from "../../src/components/app/TaskBoard";
import type { Task } from "../../src/lib/queries";
import { h, resetHarness } from "../helpers/harness";
import { renderWithClient } from "../helpers/render";

const TEAM = { id: "t1", name: "Capstone Crew" };
const at = (days: number, hours = 12) => new Date(2026, 10, 13 + days, hours, 0, 0).toISOString();
// Dates in these tests are relative to "now" so the board's own clock agrees with them.
const soon = (days: number, hours = 12) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
};
void at;

let n = 0;
function task(over: Partial<Task> = {}): Task {
  n++;
  return {
    id: `task-${n}`,
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
  } as Task;
}

/** user-1 (Maya) is in the team with this role; Ben (u2) and Cy (u3) are members. */
function setup(role: "owner" | "admin" | "member" = "owner") {
  resetHarness();
  h.fake.seed("team_members", [
    { team_id: "t1", user_id: "user-1", role, joined_at: "2026-01-01" },
    { team_id: "t1", user_id: "u2", role: "member", joined_at: "2026-01-02" },
    { team_id: "t1", user_id: "u3", role: "member", joined_at: "2026-01-03" },
  ]);
  h.fake.seed("teams", [{ id: "t1", name: "Capstone Crew", created_at: "2026-01-01" }]);
  h.fake.seed("profiles", [
    { id: "user-1", display_name: "Maya Chen" },
    { id: "u2", display_name: "Ben Ortiz" },
    { id: "u3", display_name: "Cy Park" },
  ]);
}

function Board({ tasks, startOpen = false }: { tasks: Task[]; startOpen?: boolean }) {
  const [open, setOpen] = useState(startOpen);
  return (
    <TaskBoard
      tasks={tasks}
      teams={[TEAM]}
      defaultTeamId="t1"
      createOpen={open}
      onCreateOpenChange={setOpen}
    />
  );
}

const column = (name: string) => screen.getByRole("group", { name });
const inColumn = (name: string, text: string) => within(column(name)).queryByText(text);
const chooseOption = async (
  user: ReturnType<typeof renderWithClient>["user"],
  combo: HTMLElement,
  option: string,
) => {
  await user.click(combo);
  await user.click(await screen.findByRole("option", { name: option }));
};
const loaded = () => screen.findByText(/\d+ of \d+ done/);

let outline: Task, prototype: Task, review: Task, topic: Task;
function standardTasks() {
  outline = task({
    title: "Draft outline",
    status: "todo",
    assignee_id: "u2",
    created_by: "user-1",
    due_date: soon(1),
    priority: "high",
  });
  prototype = task({
    title: "Build prototype",
    status: "in_progress",
    assignee_id: "user-1",
    created_by: "u2",
    due_date: soon(-2),
    priority: "urgent",
  });
  review = task({ title: "Peer review", status: "in_review", created_by: "u2" });
  topic = task({
    title: "Pick topic",
    status: "done",
    assignee_id: "u3",
    created_by: "user-1",
    completed_at: soon(-5),
  });
  h.fake.seed("tasks", [outline, prototype, review, topic] as never);
  return [outline, prototype, review, topic];
}

beforeEach(() => {
  n = 0;
  setup();
});

describe("Task board: the three columns", () => {
  test("shows To Do, In Progress and Done, and nothing else", async () => {
    renderWithClient(<Board tasks={standardTasks()} />);
    await loaded();
    expect(screen.getAllByRole("group").map((g) => g.getAttribute("aria-label"))).toEqual([
      "To Do",
      "In Progress",
      "Done",
    ]);
    expect(screen.queryByText("In Review")).toBeNull();
  });

  test("puts each task in its column; an old 'In Review' task shows under In Progress", async () => {
    renderWithClient(<Board tasks={standardTasks()} />);
    await loaded();
    expect(inColumn("To Do", "Draft outline")).toBeTruthy();
    expect(inColumn("In Progress", "Build prototype")).toBeTruthy();
    expect(inColumn("In Progress", "Peer review")).toBeTruthy();
    expect(inColumn("Done", "Pick topic")).toBeTruthy();
    expect(inColumn("To Do", "Pick topic")).toBeNull();
  });

  test("each column says how many tasks it holds", async () => {
    renderWithClient(<Board tasks={standardTasks()} />);
    await loaded();
    expect(screen.getByLabelText("1 in To Do")).toBeTruthy();
    expect(screen.getByLabelText("2 in In Progress")).toBeTruthy();
    expect(screen.getByLabelText("1 in Done")).toBeTruthy();
  });

  test("shows overall progress and how many tasks are overdue", async () => {
    renderWithClient(<Board tasks={standardTasks()} />);
    expect(await screen.findByText(/1 of 4 done \(25%\)/)).toBeTruthy();
    expect(screen.getByText("1 overdue")).toBeTruthy();
  });

  test("an empty column invites you to drop a task", async () => {
    renderWithClient(<Board tasks={[topic0()]} />);
    await loaded();
    expect(within(column("To Do")).getByText("Drop tasks here")).toBeTruthy();
  });
  function topic0() {
    return task({ title: "Only done", status: "done" });
  }

  test("a team with no tasks shows three empty columns", async () => {
    renderWithClient(<Board tasks={[]} />);
    await screen.findByText("0 of 0 done (0%)");
    expect(screen.getAllByText("Drop tasks here")).toHaveLength(3);
  });

  test("tasks inside a column are ordered by due date", async () => {
    const later = task({ title: "Later", due_date: soon(5) });
    const sooner = task({ title: "Sooner", due_date: soon(1) });
    const none = task({ title: "Undated" });
    renderWithClient(<Board tasks={[none, later, sooner]} />);
    await loaded();
    const titles = within(column("To Do"))
      .getAllByText(/^(Later|Sooner|Undated)$/)
      .map((e) => e.textContent);
    expect(titles).toEqual(["Sooner", "Later", "Undated"]);
  });
});

describe("Task board: what a card shows", () => {
  test("assignee, priority and due date", async () => {
    renderWithClient(<Board tasks={standardTasks()} />);
    await loaded();
    const card = screen.getByText("Draft outline").closest("div[class*='surface-card']")!;
    expect(card.textContent).toContain("Ben Ortiz");
    expect(card.textContent).toContain("high");
    expect(card.textContent).toContain("Due tomorrow");
  });

  test("an unassigned task says so", async () => {
    renderWithClient(<Board tasks={standardTasks()} />);
    await loaded();
    const card = screen.getByText("Peer review").closest("div[class*='surface-card']")!;
    expect(card.textContent).toContain("Unassigned");
  });

  test("an overdue task is flagged, a finished one is not", async () => {
    const late = task({ title: "Late one", due_date: soon(-3) });
    const doneLate = task({ title: "Finished late", status: "done", due_date: soon(-3) });
    renderWithClient(<Board tasks={[late, doneLate]} />);
    await loaded();
    const lateCard = screen.getByText("Late one").closest("div[class*='surface-card']")!;
    expect(lateCard.querySelector("[data-due='overdue']")?.textContent).toContain(
      "Overdue by 3 days",
    );
    const doneCard = screen.getByText("Finished late").closest("div[class*='surface-card']")!;
    expect(doneCard.querySelector("[data-due='overdue']")).toBeNull();
    expect(doneCard.querySelector("[data-due='done']")).toBeTruthy();
  });
});

describe("Task board: changing a task's status", () => {
  test("the status menu moves the card and saves the change", async () => {
    const { user } = renderWithClient(<Board tasks={standardTasks()} />);
    await loaded();
    await chooseOption(
      user,
      screen.getByRole("combobox", { name: "Status for Draft outline" }),
      "In Progress",
    );
    await waitFor(() => expect(inColumn("In Progress", "Draft outline")).toBeTruthy());
    expect(inColumn("To Do", "Draft outline")).toBeNull();
    const update = h.fake.callsTo("tasks", "update")[0]!;
    expect(update.filters).toEqual({ id: outline.id });
    expect(update.payload).toMatchObject({ status: "in_progress", completed_at: null });
    expect(screen.getByLabelText("0 in To Do")).toBeTruthy();
  });

  test("moving to Done records when it was finished and logs it", async () => {
    const { user } = renderWithClient(<Board tasks={standardTasks()} />);
    await loaded();
    await chooseOption(
      user,
      screen.getByRole("combobox", { name: "Status for Draft outline" }),
      "Done",
    );
    await waitFor(() => expect(inColumn("Done", "Draft outline")).toBeTruthy());
    const payload = h.fake.callsTo("tasks", "update")[0]!.payload as Record<string, string>;
    expect(payload["status"]).toBe("done");
    expect(Date.now() - new Date(payload["completed_at"]!).getTime()).toBeLessThan(10_000);
    await waitFor(() => expect(h.fake.callsTo("activity_logs", "insert")).toHaveLength(1));
    expect(
      (h.fake.callsTo("activity_logs", "insert")[0]!.payload as { summary: string }).summary,
    ).toBe('moved "Draft outline" to Done');
  });

  test("finishing a task someone else created tells them", async () => {
    const { user } = renderWithClient(<Board tasks={standardTasks()} />);
    await loaded();
    await chooseOption(
      user,
      screen.getByRole("combobox", { name: "Status for Build prototype" }),
      "Done",
    );
    await waitFor(() => expect(h.fake.callsTo("notifications", "insert")).toHaveLength(1));
    expect(h.fake.callsTo("notifications", "insert")[0]!.payload).toMatchObject({
      user_id: "u2",
      type: "task_done",
      body: "Build prototype",
    });
  });

  test("finishing your own task doesn't notify you", async () => {
    const { user } = renderWithClient(<Board tasks={standardTasks()} />);
    await loaded();
    await chooseOption(
      user,
      screen.getByRole("combobox", { name: "Status for Draft outline" }),
      "Done",
    );
    await waitFor(() => expect(inColumn("Done", "Draft outline")).toBeTruthy());
    expect(h.fake.callsTo("notifications", "insert")).toHaveLength(0);
  });

  test("a task can be reopened and loses its finish time", async () => {
    const { user } = renderWithClient(<Board tasks={standardTasks()} />);
    await loaded();
    await chooseOption(
      user,
      screen.getByRole("combobox", { name: "Status for Pick topic" }),
      "To Do",
    );
    await waitFor(() => expect(inColumn("To Do", "Pick topic")).toBeTruthy());
    expect(h.fake.callsTo("tasks", "update")[0]!.payload).toMatchObject({
      status: "todo",
      completed_at: null,
    });
  });

  test("finishing the last open task celebrates", async () => {
    const only = task({ title: "Last one", status: "in_progress" });
    const { user } = renderWithClient(
      <Board tasks={[only, task({ title: "Done already", status: "done" })]} />,
    );
    await loaded();
    await chooseOption(user, screen.getByRole("combobox", { name: "Status for Last one" }), "Done");
    await waitFor(() => expect(h.confetti).toHaveBeenCalledTimes(1));
    expect(h.toast.success).toHaveBeenCalledWith("Every task in this team is done. Nice work!");
  });

  test("no celebration while other tasks are still open", async () => {
    const { user } = renderWithClient(<Board tasks={standardTasks()} />);
    await loaded();
    await chooseOption(
      user,
      screen.getByRole("combobox", { name: "Status for Draft outline" }),
      "Done",
    );
    await waitFor(() => expect(inColumn("Done", "Draft outline")).toBeTruthy());
    expect(h.confetti).not.toHaveBeenCalled();
  });

  test("if saving fails the card goes back and the reason is shown", async () => {
    h.fake.failTable("tasks", "update", { message: "permission denied", code: "42501" });
    const { user } = renderWithClient(<Board tasks={standardTasks()} />);
    await loaded();
    await chooseOption(
      user,
      screen.getByRole("combobox", { name: "Status for Draft outline" }),
      "Done",
    );
    await waitFor(() =>
      expect(h.toast.error).toHaveBeenCalledWith(
        expect.stringContaining("Couldn't save that change"),
      ),
    );
    expect(h.toast.error.mock.calls[0]![0]).toContain("You don't have permission");
    expect(inColumn("To Do", "Draft outline")).toBeTruthy();
    expect(inColumn("Done", "Draft outline")).toBeNull();
    expect(h.fake.callsTo("activity_logs", "insert")).toHaveLength(0);
  });

  test("a member can't move a task they neither made nor were given", async () => {
    setup("member");
    const mine = task({ title: "Mine", created_by: "user-1" });
    const theirs = task({ title: "Theirs", created_by: "u2", assignee_id: "u3" });
    renderWithClient(<Board tasks={[mine, theirs]} />);
    await loaded();
    expect(
      (screen.getByRole("combobox", { name: "Status for Mine" }) as HTMLButtonElement).disabled,
    ).toBe(false);
    expect(
      (screen.getByRole("combobox", { name: "Status for Theirs (view only)" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  test("an assignee can move the task they were given", async () => {
    setup("member");
    const given = task({ title: "Given", created_by: "u2", assignee_id: "user-1" });
    renderWithClient(<Board tasks={[given]} />);
    await loaded();
    expect(
      (screen.getByRole("combobox", { name: "Status for Given" }) as HTMLButtonElement).disabled,
    ).toBe(false);
  });

  test("an admin can move anyone's task", async () => {
    setup("admin");
    const theirs = task({ title: "Theirs", created_by: "u2", assignee_id: "u3" });
    renderWithClient(<Board tasks={[theirs]} />);
    await loaded();
    expect(
      (screen.getByRole("combobox", { name: "Status for Theirs" }) as HTMLButtonElement).disabled,
    ).toBe(false);
  });
});

describe("Task board: filters and views", () => {
  test("search narrows the board", async () => {
    const { user } = renderWithClient(<Board tasks={standardTasks()} />);
    await loaded();
    await user.type(screen.getByLabelText("Search tasks"), "proto");
    expect(screen.getByText("Build prototype")).toBeTruthy();
    expect(screen.queryByText("Draft outline")).toBeNull();
    expect(screen.getByText(/0 of 1 done/)).toBeTruthy();
  });

  test("'My tasks' shows only what is assigned to you", async () => {
    const { user } = renderWithClient(<Board tasks={standardTasks()} />);
    await loaded();
    await chooseOption(user, screen.getByRole("combobox", { name: "Assignee" }), "My tasks");
    expect(screen.getByText("Build prototype")).toBeTruthy();
    expect(screen.queryByText("Draft outline")).toBeNull();
  });

  test("the Overdue filter finds late, unfinished work", async () => {
    const { user } = renderWithClient(<Board tasks={standardTasks()} />);
    await loaded();
    await chooseOption(user, screen.getByRole("combobox", { name: "Due" }), "Overdue");
    expect(screen.getByText("Build prototype")).toBeTruthy();
    expect(screen.queryByText("Draft outline")).toBeNull();
    expect(screen.queryByText("Pick topic")).toBeNull();
  });

  test("the priority filter works", async () => {
    const { user } = renderWithClient(<Board tasks={standardTasks()} />);
    await loaded();
    await chooseOption(user, screen.getByRole("combobox", { name: "Priority" }), "urgent");
    expect(screen.getByText("Build prototype")).toBeTruthy();
    expect(screen.queryByText("Draft outline")).toBeNull();
  });

  test("the list view shows every task with its due date and column", async () => {
    const { user } = renderWithClient(<Board tasks={standardTasks()} />);
    await loaded();
    await user.click(screen.getByRole("tab", { name: "List" }));
    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(4);
    expect(rows[0]!.textContent).toContain("Draft outline");
    expect(rows[0]!.textContent).toContain("To Do");
    expect(rows[0]!.textContent).toContain("Due tomorrow");
    expect(screen.getByText("Peer review").closest("li")!.textContent).toContain("In Progress");
    expect(screen.getByText("Pick topic").closest("li")!.textContent).toContain("Done");
  });

  test("an empty search says nothing matches (list view)", async () => {
    const { user } = renderWithClient(<Board tasks={standardTasks()} />);
    await loaded();
    await user.click(screen.getByRole("tab", { name: "List" }));
    await user.type(screen.getByLabelText("Search tasks"), "zzzz");
    expect(await screen.findByText("No matching tasks")).toBeTruthy();
  });
});
