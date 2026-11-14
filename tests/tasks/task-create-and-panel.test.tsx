import { beforeEach, describe, expect, test } from "bun:test";
import { useState } from "react";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { TaskBoard } from "../../src/components/app/TaskBoard";
import type { Task } from "../../src/lib/queries";
import { h, resetHarness } from "../helpers/harness";
import { renderWithClient } from "../helpers/render";

const TEAM = { id: "t1", name: "Capstone Crew" };
const soon = (days: number, hours = 12) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
};
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

function Board({ tasks }: { tasks: Task[] }) {
  const [open, setOpen] = useState(false);
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
type User = ReturnType<typeof renderWithClient>["user"];
const column = (name: string) => screen.getByRole("group", { name });
const loaded = () => screen.findByText(/\d+ of \d+ done/);
const choose = async (user: User, combo: HTMLElement, option: string) => {
  await user.click(combo);
  await user.click(await screen.findByRole("option", { name: option }));
};
const insertedTask = () => h.fake.callsTo("tasks", "insert")[0]?.payload as Record<string, unknown>;

beforeEach(() => {
  n = 0;
  setup();
});

describe("Adding a task", () => {
  async function openNew(tasks: Task[] = []) {
    const view = renderWithClient(<Board tasks={tasks} />);
    await loaded();
    await view.user.click(screen.getByRole("button", { name: /new task/i }));
    return { ...view, dialog: await screen.findByRole("dialog") };
  }

  test("'New task' opens the form, starting in To Do", async () => {
    const { dialog } = await openNew();
    expect(within(dialog).getByText("New task", { selector: "h2" })).toBeTruthy();
    expect(within(dialog).getByRole("combobox", { name: "Status" }).textContent).toBe("To Do");
    expect(within(dialog).getByRole("combobox", { name: "Assignee" }).textContent).toBe(
      "Unassigned",
    );
    expect(within(dialog).getByRole("combobox", { name: "Priority" }).textContent).toBe("medium");
  });

  test("creates a task with all its details", async () => {
    const { user, dialog } = await openNew();
    await user.type(within(dialog).getByLabelText("Title"), "  Write the   report ");
    await user.type(within(dialog).getByLabelText("Description"), "Intro and method");
    fireEvent.change(within(dialog).getByLabelText("Due date"), {
      target: { value: "2030-05-06T14:30" },
    });
    await choose(user, within(dialog).getByRole("combobox", { name: "Assignee" }), "Ben Ortiz");
    await choose(user, within(dialog).getByRole("combobox", { name: "Priority" }), "high");
    await choose(user, within(dialog).getByRole("combobox", { name: "Status" }), "In Progress");
    await user.click(within(dialog).getByRole("button", { name: "Create task" }));

    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Task created"));
    expect(insertedTask()).toMatchObject({
      team_id: "t1",
      title: "Write the report",
      description: "Intro and method",
      priority: "high",
      status: "in_progress",
      assignee_id: "u2",
      created_by: "user-1",
      completed_at: null,
    });
    expect(new Date(insertedTask()["due_date"] as string).getTime()).toBe(
      new Date(2030, 4, 6, 14, 30).getTime(),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  test("tells the assignee, and logs it for the team", async () => {
    const { user, dialog } = await openNew();
    await user.type(within(dialog).getByLabelText("Title"), "Review slides");
    await choose(user, within(dialog).getByRole("combobox", { name: "Assignee" }), "Cy Park");
    await user.click(within(dialog).getByRole("button", { name: "Create task" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    expect(h.fake.callsTo("notifications", "insert")[0]!.payload).toMatchObject({
      user_id: "u3",
      type: "task_assigned",
      body: "Review slides",
    });
    expect(
      (h.fake.callsTo("activity_logs", "insert")[0]!.payload as { summary: string }).summary,
    ).toBe('created "Review slides"');
  });

  test("assigning it to yourself sends no notification", async () => {
    const { user, dialog } = await openNew();
    await user.type(within(dialog).getByLabelText("Title"), "My own task");
    await choose(user, within(dialog).getByRole("combobox", { name: "Assignee" }), "Maya Chen");
    await user.click(within(dialog).getByRole("button", { name: "Create task" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    expect(insertedTask()["assignee_id"]).toBe("user-1");
    expect(h.fake.callsTo("notifications", "insert")).toHaveLength(0);
  });

  test("a task created as Done gets a finish time", async () => {
    const { user, dialog } = await openNew();
    await user.type(within(dialog).getByLabelText("Title"), "Already finished");
    await choose(user, within(dialog).getByRole("combobox", { name: "Status" }), "Done");
    await user.click(within(dialog).getByRole("button", { name: "Create task" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    expect(insertedTask()["status"]).toBe("done");
    expect(insertedTask()["completed_at"]).toBeTruthy();
  });

  test("won't create a task without a title", async () => {
    const { user, dialog } = await openNew();
    await user.type(within(dialog).getByLabelText("Title"), "    ");
    await user.click(within(dialog).getByRole("button", { name: "Create task" }));
    expect(await within(dialog).findByText("Give the task a title.")).toBeTruthy();
    expect(h.fake.callsTo("tasks", "insert")).toHaveLength(0);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  test("the error goes away once the problem is fixed", async () => {
    const { user, dialog } = await openNew();
    await user.click(within(dialog).getByRole("button", { name: "Create task" }));
    await within(dialog).findByText("Give the task a title.");
    await user.type(within(dialog).getByLabelText("Title"), "Now it has one");
    await user.click(within(dialog).getByRole("button", { name: "Create task" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
  });

  test("the title can't be longer than 200 characters", async () => {
    const { dialog } = await openNew();
    expect(within(dialog).getByLabelText("Title").getAttribute("maxlength")).toBe("200");
  });

  test("shows why saving failed and keeps what was typed", async () => {
    h.fake.failTable("tasks", "insert", {
      message: "new row violates row-level security policy",
      code: "42501",
    });
    const { user, dialog } = await openNew();
    await user.type(within(dialog).getByLabelText("Title"), "Will fail");
    await user.click(within(dialog).getByRole("button", { name: "Create task" }));
    await waitFor(() =>
      expect(h.toast.error).toHaveBeenCalledWith(
        expect.stringContaining("You don't have permission"),
      ),
    );
    expect(h.toast.success).not.toHaveBeenCalled();
    expect(
      (within(screen.getByRole("dialog")).getByLabelText("Title") as HTMLInputElement).value,
    ).toBe("Will fail");
  });

  test("Cancel closes the form without creating anything", async () => {
    const { user, dialog } = await openNew();
    await user.type(within(dialog).getByLabelText("Title"), "Never mind");
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(h.fake.callsTo("tasks", "insert")).toHaveLength(0);
  });

  test("the + on a column starts a task in that column", async () => {
    const { user } = renderWithClient(<Board tasks={[]} />);
    await loaded();
    await user.click(screen.getByRole("button", { name: "Add task to In Progress" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("combobox", { name: "Status" }).textContent).toBe(
      "In Progress",
    );
    await user.type(within(dialog).getByLabelText("Title"), "Started already");
    await user.click(within(dialog).getByRole("button", { name: "Create task" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    expect(insertedTask()["status"]).toBe("in_progress");
  });

  test("the + on Done starts a finished task, and 'New task' goes back to To Do", async () => {
    const { user } = renderWithClient(<Board tasks={[]} />);
    await loaded();
    await user.click(screen.getByRole("button", { name: "Add task to Done" }));
    let dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("combobox", { name: "Status" }).textContent).toBe("Done");
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await user.click(screen.getByRole("button", { name: /new task/i }));
    dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("combobox", { name: "Status" }).textContent).toBe("To Do");
  });

  test("lists the team's members as possible assignees", async () => {
    const { user, dialog } = await openNew();
    await user.click(within(dialog).getByRole("combobox", { name: "Assignee" }));
    const options = (await screen.findAllByRole("option")).map((o) => o.textContent);
    expect(options).toEqual(["Unassigned", "Maya Chen", "Ben Ortiz", "Cy Park"]);
  });
});

describe("The task panel", () => {
  async function openPanel(tasks: Task[], title: string) {
    const view = renderWithClient(<Board tasks={tasks} />);
    await loaded();
    await view.user.click(within(column(title === "x" ? "To Do" : "To Do")).getByText(title));
    return { ...view, panel: await screen.findByRole("dialog") };
  }

  test("opens with the task's details", async () => {
    const t = task({
      title: "Draft outline",
      description: "Sections and headings",
      assignee_id: "u2",
      created_by: "u3",
      due_date: soon(2),
      priority: "high",
    });
    const { panel } = await openPanel([t], "Draft outline");
    expect(within(panel).getByText("Sections and headings")).toBeTruthy();
    expect(within(panel).getByRole("combobox", { name: "Status" }).textContent).toBe("To Do");
    expect(within(panel).getByRole("combobox", { name: "Assignee" }).textContent).toBe("Ben Ortiz");
    expect(within(panel).getByText("Created by Cy Park")).toBeTruthy();
    expect(within(panel).getByText(/Due in 2 days/)).toBeTruthy();
  });

  test("changing the status in the panel shows the new status straight away", async () => {
    const t = task({ title: "Draft outline" });
    const { user, panel } = await openPanel([t], "Draft outline");
    await choose(user, within(panel).getByRole("combobox", { name: "Status" }), "In Progress");
    await waitFor(() =>
      expect(within(panel).getByRole("combobox", { name: "Status" }).textContent).toBe(
        "In Progress",
      ),
    );
    expect(h.fake.callsTo("tasks", "update")[0]!.payload).toMatchObject({ status: "in_progress" });
  });

  test("assigning keeps the panel open, saves, and tells the new assignee", async () => {
    const t = task({ title: "Draft outline" });
    const { user, panel } = await openPanel([t], "Draft outline");
    await choose(user, within(panel).getByRole("combobox", { name: "Assignee" }), "Cy Park");
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Assignee updated"));
    expect(h.fake.callsTo("tasks", "update")[0]!.payload).toEqual({ assignee_id: "u3" });
    expect(h.fake.callsTo("notifications", "insert")[0]!.payload).toMatchObject({
      user_id: "u3",
      type: "task_assigned",
    });
    expect(screen.getByRole("dialog")).toBeTruthy();
    await waitFor(() =>
      expect(
        within(screen.getByRole("dialog")).getByRole("combobox", { name: "Assignee" }).textContent,
      ).toBe("Cy Park"),
    );
    expect(
      (h.fake.callsTo("activity_logs", "insert")[0]!.payload as { summary: string }).summary,
    ).toBe('assigned "Draft outline" to Cy Park');
  });

  test("the card shows the new assignee after closing the panel", async () => {
    const t = task({ title: "Draft outline" });
    const { user, panel } = await openPanel([t], "Draft outline");
    await choose(user, within(panel).getByRole("combobox", { name: "Assignee" }), "Ben Ortiz");
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(within(column("To Do")).getByText("Ben Ortiz")).toBeTruthy();
  });

  test("a task can be unassigned", async () => {
    const t = task({ title: "Draft outline", assignee_id: "u2" });
    const { user, panel } = await openPanel([t], "Draft outline");
    await choose(user, within(panel).getByRole("combobox", { name: "Assignee" }), "Unassigned");
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Assignee updated"));
    expect(h.fake.callsTo("tasks", "update")[0]!.payload).toEqual({ assignee_id: null });
    expect(h.fake.callsTo("notifications", "insert")).toHaveLength(0);
  });

  test("assigning to yourself sends no notification", async () => {
    const t = task({ title: "Draft outline" });
    const { user, panel } = await openPanel([t], "Draft outline");
    await choose(user, within(panel).getByRole("combobox", { name: "Assignee" }), "Maya Chen");
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    expect(h.fake.callsTo("notifications", "insert")).toHaveLength(0);
  });

  test("a refused assignment shows the reason and nothing changes", async () => {
    h.fake.failTable("tasks", "update", {
      message: "A task can only be assigned to a member of its team",
    });
    const t = task({ title: "Draft outline" });
    const { user, panel } = await openPanel([t], "Draft outline");
    await choose(user, within(panel).getByRole("combobox", { name: "Assignee" }), "Ben Ortiz");
    await waitFor(() =>
      expect(h.toast.error).toHaveBeenCalledWith(
        "A task can only be assigned to a member of its team",
      ),
    );
    expect(h.toast.success).not.toHaveBeenCalled();
    expect(h.fake.callsTo("notifications", "insert")).toHaveLength(0);
  });
});

describe("Editing a task's details", () => {
  async function openEditor(t: Task) {
    const view = renderWithClient(<Board tasks={[t]} />);
    await loaded();
    await view.user.click(within(column("To Do")).getByText(t.title));
    const panel = await screen.findByRole("dialog");
    await view.user.click(within(panel).getByRole("button", { name: "Edit details" }));
    return { ...view, panel, form: within(panel).getByRole("form", { name: "Edit task details" }) };
  }
  const base = () =>
    task({
      title: "Draft outline",
      description: "Old text",
      assignee_id: "u2",
      priority: "medium",
      due_date: soon(5),
    });

  test("starts with the current values", async () => {
    const { form } = await openEditor(base());
    expect((within(form).getByLabelText("Title") as HTMLInputElement).value).toBe("Draft outline");
    expect((within(form).getByLabelText("Description") as HTMLTextAreaElement).value).toBe(
      "Old text",
    );
    expect((within(form).getByLabelText("Priority") as HTMLSelectElement).value).toBe("medium");
    expect((within(form).getByLabelText("Due date") as HTMLInputElement).value).toMatch(
      /^\d{4}-\d\d-\d\dT12:00$/,
    );
  });

  test("saves a new title, description, priority and due date", async () => {
    const { user, form } = await openEditor(base());
    const title = within(form).getByLabelText("Title");
    await user.clear(title);
    await user.type(title, "Final outline");
    const desc = within(form).getByLabelText("Description");
    await user.clear(desc);
    await user.type(desc, "New text");
    await user.selectOptions(within(form).getByLabelText("Priority"), "urgent");
    fireEvent.change(within(form).getByLabelText("Due date"), {
      target: { value: "2031-01-02T09:15" },
    });
    await user.click(within(form).getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Task updated"));
    const update = h.fake.callsTo("tasks", "update")[0]!.payload as Record<string, string>;
    expect(update).toMatchObject({
      title: "Final outline",
      description: "New text",
      priority: "urgent",
    });
    expect(new Date(update["due_date"]!).getTime()).toBe(new Date(2031, 0, 2, 9, 15).getTime());
    // the panel and the board both show the saved task
    expect(await screen.findByText("New text")).toBeTruthy();
    expect(screen.queryByRole("form", { name: "Edit task details" })).toBeNull();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(within(column("To Do")).getByText("Final outline")).toBeTruthy();
  });

  test("changing the due date tells the assignee and logs what changed", async () => {
    const { user, form } = await openEditor(base());
    fireEvent.change(within(form).getByLabelText("Due date"), {
      target: { value: "2031-01-02T09:15" },
    });
    await user.click(within(form).getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    expect(h.fake.callsTo("notifications", "insert")[0]!.payload).toMatchObject({
      user_id: "u2",
      type: "task_due_changed",
      title: "A task's due date changed",
    });
    expect(
      (h.fake.callsTo("activity_logs", "insert")[0]!.payload as { summary: string }).summary,
    ).toBe('edited "Draft outline" (due date)');
  });

  test("removing the due date works and says so", async () => {
    const { user, form } = await openEditor(base());
    await user.click(within(form).getByRole("button", { name: "Remove due date" }));
    await user.click(within(form).getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    expect(h.fake.callsTo("tasks", "update")[0]!.payload).toMatchObject({ due_date: null });
    expect(h.fake.callsTo("notifications", "insert")[0]!.payload).toMatchObject({
      title: "A task's due date was removed",
    });
  });

  test("changing only the title doesn't notify anyone", async () => {
    const { user, form } = await openEditor(base());
    const title = within(form).getByLabelText("Title");
    await user.clear(title);
    await user.type(title, "Renamed");
    await user.click(within(form).getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    expect(h.fake.callsTo("notifications", "insert")).toHaveLength(0);
  });

  test("saving with no changes does nothing", async () => {
    const { user, form } = await openEditor(base());
    await user.click(within(form).getByRole("button", { name: "Save changes" }));
    await waitFor(() =>
      expect(screen.queryByRole("form", { name: "Edit task details" })).toBeNull(),
    );
    expect(h.fake.callsTo("tasks", "update")).toHaveLength(0);
    expect(h.toast.success).not.toHaveBeenCalled();
  });

  test("an empty title is refused", async () => {
    const { user, form } = await openEditor(base());
    await user.clear(within(form).getByLabelText("Title"));
    await user.click(within(form).getByRole("button", { name: "Save changes" }));
    expect(await within(form).findByText("Give the task a title.")).toBeTruthy();
    expect(h.fake.callsTo("tasks", "update")).toHaveLength(0);
  });

  test("Cancel throws the edits away", async () => {
    const { user, form, panel } = await openEditor(base());
    await user.type(within(form).getByLabelText("Title"), " more");
    await user.click(within(form).getByRole("button", { name: "Cancel" }));
    expect(within(panel).queryByRole("form")).toBeNull();
    expect(within(panel).getByText("Old text")).toBeTruthy();
    expect(h.fake.callsTo("tasks", "update")).toHaveLength(0);
  });

  test("a failed save shows why and keeps the form open", async () => {
    h.fake.failTable("tasks", "update", { message: "permission denied", code: "42501" });
    const { user, form } = await openEditor(base());
    await user.type(within(form).getByLabelText("Title"), " more");
    await user.click(within(form).getByRole("button", { name: "Save changes" }));
    await waitFor(() =>
      expect(h.toast.error).toHaveBeenCalledWith(
        expect.stringContaining("You don't have permission"),
      ),
    );
    expect(screen.getByRole("form", { name: "Edit task details" })).toBeTruthy();
  });
});

describe("Who can do what in the panel", () => {
  test("a plain member sees someone else's task as view-only", async () => {
    setup("member");
    const t = task({ title: "Theirs", created_by: "u2", assignee_id: "u3" });
    const { user } = renderWithClient(<Board tasks={[t]} />);
    await loaded();
    await user.click(within(column("To Do")).getByText("Theirs"));
    const panel = await screen.findByRole("dialog");
    expect(within(panel).getByText(/View only/)).toBeTruthy();
    expect(within(panel).queryByRole("button", { name: "Edit details" })).toBeNull();
    expect(within(panel).queryByRole("button", { name: /delete task/i })).toBeNull();
    expect(
      (within(panel).getByRole("combobox", { name: "Status" }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(
      (within(panel).getByRole("combobox", { name: "Assignee" }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  test("the assignee can edit but not delete", async () => {
    setup("member");
    const t = task({ title: "Given", created_by: "u2", assignee_id: "user-1" });
    const { user } = renderWithClient(<Board tasks={[t]} />);
    await loaded();
    await user.click(within(column("To Do")).getByText("Given"));
    const panel = await screen.findByRole("dialog");
    expect(within(panel).getByRole("button", { name: "Edit details" })).toBeTruthy();
    expect(within(panel).queryByRole("button", { name: /delete task/i })).toBeNull();
  });

  test("the creator can delete, after confirming", async () => {
    const t = task({ title: "Throwaway" });
    const { user } = renderWithClient(<Board tasks={[t]} />);
    await loaded();
    await user.click(within(column("To Do")).getByText("Throwaway"));
    const panel = await screen.findByRole("dialog");
    await user.click(within(panel).getByRole("button", { name: /delete task/i }));
    const confirm = await screen.findByRole("alertdialog");
    expect(confirm.textContent).toContain("Delete this task?");
    await user.click(within(confirm).getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Task deleted"));
    expect(h.fake.callsTo("tasks", "delete")[0]!.filters).toEqual({ id: t.id });
  });

  test("cancelling the confirmation keeps the task", async () => {
    const t = task({ title: "Keep me" });
    const { user } = renderWithClient(<Board tasks={[t]} />);
    await loaded();
    await user.click(within(column("To Do")).getByText("Keep me"));
    const panel = await screen.findByRole("dialog");
    await user.click(within(panel).getByRole("button", { name: /delete task/i }));
    const confirm = await screen.findByRole("alertdialog");
    await user.click(within(confirm).getByRole("button", { name: "Cancel" }));
    expect(h.fake.callsTo("tasks", "delete")).toHaveLength(0);
  });
});

describe("Comments and checklist", () => {
  async function open(t: Task) {
    const view = renderWithClient(<Board tasks={[t]} />);
    await loaded();
    await view.user.click(within(column("To Do")).getByText(t.title));
    return { ...view, panel: await screen.findByRole("dialog") };
  }

  test("adds a comment", async () => {
    const { user, panel } = await open(task({ title: "Talk about it" }));
    await user.type(within(panel).getByPlaceholderText("Write a comment"), "Looks good");
    await user.click(within(panel).getByRole("button", { name: "Post" }));
    await waitFor(() => expect(h.fake.callsTo("task_comments", "insert")).toHaveLength(1));
    expect(h.fake.callsTo("task_comments", "insert")[0]!.payload).toMatchObject({
      author_id: "user-1",
      body: "Looks good",
    });
  });

  test("adds a checklist item", async () => {
    const { user, panel } = await open(task({ title: "Steps" }));
    await user.type(within(panel).getByPlaceholderText("Add a checklist item"), "Collect sources");
    await user.click(within(panel).getByRole("button", { name: "Add" }));
    await waitFor(() => expect(h.fake.callsTo("task_checklist_items", "insert")).toHaveLength(1));
    expect(h.fake.callsTo("task_checklist_items", "insert")[0]!.payload).toMatchObject({
      label: "Collect sources",
    });
  });

  test("a blank comment is not posted", async () => {
    const { user, panel } = await open(task({ title: "Quiet" }));
    await user.type(within(panel).getByPlaceholderText("Write a comment"), "   ");
    await user.click(within(panel).getByRole("button", { name: "Post" }));
    expect(h.fake.callsTo("task_comments", "insert")).toHaveLength(0);
  });
});
