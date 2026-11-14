// The "Additional AI features": plan tasks, break down a task, written drafts, teammate ideas.
// The AI itself is replaced by fixed answers; everything the student sees and every save is real.
import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  BreakdownTool,
  PlanTool,
  TeammatesTool,
  WriterTool,
} from "../../src/components/app/ai/tools";
import { h, resetHarness } from "../helpers/harness";
import { renderWithClient } from "../helpers/render";

type User = ReturnType<typeof renderWithClient>["user"];
const choose = async (user: User, combo: HTMLElement, option: string) => {
  await user.click(combo);
  await user.click(await screen.findByRole("option", { name: option }));
};

function team() {
  resetHarness();
  h.fake.seed("team_members", [
    { team_id: "t1", user_id: "user-1", role: "owner", joined_at: "2026-01-01" },
    { team_id: "t1", user_id: "u2", role: "member", joined_at: "2026-01-02" },
  ]);
  h.fake.seed("teams", [{ id: "t1", name: "Capstone Crew", created_at: "2026-01-01" }]);
  h.fake.seed("profiles", [
    { id: "user-1", display_name: "Maya Chen" },
    { id: "u2", display_name: "Ben Ortiz" },
  ]);
}

const planned = (over = {}) => ({
  title: "Write the introduction",
  description: "Two pages",
  priority: "high",
  dueDate: new Date(Date.now() + 5 * 864e5).toISOString(),
  assigneeId: "u2",
  assigneeName: "Ben Ortiz",
  assigneeReason: "Strong writer",
  checklist: ["Outline", "Draft"],
  ...over,
});

beforeEach(team);

describe("Plan tasks", () => {
  const run = async (tasks = [planned(), planned({ title: "Make the slides", assigneeId: null, assigneeName: null, checklist: [] })]) => {
    h.ai.planTasks = mock(async () => ({
      members: [
        { id: "user-1", name: "Maya Chen" },
        { id: "u2", name: "Ben Ortiz" },
      ],
      tasks,
    }));
    const view = renderWithClient(<PlanTool teamId="t1" />);
    await view.user.click(screen.getByRole("button", { name: "Draft a plan" }));
    await screen.findByDisplayValue(tasks[0]?.title ?? "x").catch(() => undefined);
    return view;
  };

  test("asks for a plan with the focus and size chosen", async () => {
    const { user } = await run();
    expect(h.ai.planTasks.mock.calls[0]![0]).toEqual({ data: { teamId: "t1", count: 6 } });
    await user.type(screen.getByLabelText(/what should the plan focus on/i), "the final report");
    await user.click(screen.getByRole("button", { name: "Draft a new plan" }));
    await waitFor(() => expect(h.ai.planTasks).toHaveBeenCalledTimes(2));
    expect(h.ai.planTasks.mock.calls[1]![0]).toEqual({ data: { teamId: "t1", count: 6, focus: "the final report" } });
  });

  test("shows each suggestion as editable, with a reminder that nothing is saved yet", async () => {
    await run();
    expect(screen.getByText(/suggestions only/i)).toBeTruthy();
    expect(screen.getAllByLabelText("Task title")).toHaveLength(2);
    expect((screen.getAllByLabelText("Task title")[0] as HTMLInputElement).value).toBe("Write the introduction");
    expect(h.fake.callsTo("tasks", "insert")).toHaveLength(0);
  });

  test("saves the chosen tasks to the board, tells the assignee and logs it", async () => {
    const { user } = await run();
    const title = screen.getAllByLabelText("Task title")[0]!;
    fireEvent.change(title, { target: { value: "Write the intro (edited)" } });
    await user.click(screen.getByRole("button", { name: /save 2 selected tasks/i }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("2 tasks added to the board"));
    const rows = h.fake.callsTo("tasks", "insert")[0]!.payload as Record<string, unknown>[];
    expect(rows.map((r) => r["title"])).toEqual(["Write the intro (edited)", "Make the slides"]);
    expect(rows[0]).toMatchObject({ team_id: "t1", assignee_id: "u2", status: "todo", priority: "high", created_by: "user-1" });
    expect(rows[1]!["assignee_id"]).toBeNull();
    expect(h.fake.callsTo("notifications", "insert")).toHaveLength(1);
    expect(h.fake.callsTo("notifications", "insert")[0]!.payload).toMatchObject({ user_id: "u2", type: "task_assigned" });
    expect((h.fake.callsTo("activity_logs", "insert")[0]!.payload as { summary: string }).summary).toBe("added 2 planned tasks");
    await waitFor(() => expect(screen.queryAllByLabelText("Task title")).toHaveLength(0));
  });

  test("unticked suggestions are left out", async () => {
    const { user } = await run();
    await user.click(screen.getByRole("checkbox", { name: "Include Make the slides" }));
    await user.click(screen.getByRole("button", { name: /save 1 selected tasks/i }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("1 tasks added to the board"));
    expect((h.fake.callsTo("tasks", "insert")[0]!.payload as unknown[]).length).toBe(1);
  });

  test("saving with nothing ticked is refused", async () => {
    const { user } = await run();
    await user.click(screen.getByRole("checkbox", { name: "Include Write the introduction" }));
    await user.click(screen.getByRole("checkbox", { name: "Include Make the slides" }));
    await user.click(screen.getByRole("button", { name: /save 0 selected tasks/i }));
    expect(h.toast.error).toHaveBeenCalledWith("Select at least one task to save.");
    expect(h.fake.callsTo("tasks", "insert")).toHaveLength(0);
  });

  test("an overlong AI title is shortened to fit the database", async () => {
    const { user } = await run([planned({ title: "x".repeat(260) })]);
    await user.click(screen.getByRole("button", { name: /save 1 selected tasks/i }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    expect(((h.fake.callsTo("tasks", "insert")[0]!.payload as { title: string }[])[0]!.title).length).toBe(200);
  });

  test("checklists are saved with each task", async () => {
    const { user } = await run();
    await user.click(screen.getByRole("button", { name: /save 2 selected tasks/i }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    const items = h.fake.callsTo("task_checklist_items", "insert")[0]!.payload as { label: string; position: number }[];
    expect(items.map((i) => i.label)).toEqual(["Outline", "Draft"]);
    expect(items.map((i) => i.position)).toEqual([0, 1]);
  });

  test("an empty answer explains what to do", async () => {
    await run([]);
    expect(await screen.findByText(/didn't suggest any tasks/i)).toBeTruthy();
  });

  test("when the AI is unavailable the reason is shown with a retry", async () => {
    h.ai.planTasks = mock(async () => {
      throw new Error("NVIDIA_API_KEY is not configured.");
    });
    const { user } = renderWithClient(<PlanTool teamId="t1" />);
    await user.click(screen.getByRole("button", { name: "Draft a plan" }));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("NVIDIA_API_KEY is not configured.");
    h.ai.planTasks = mock(async () => ({ members: [], tasks: [planned()] }));
    await user.click(within(alert).getByRole("button", { name: /try again/i }));
    expect(await screen.findByDisplayValue("Write the introduction")).toBeTruthy();
  });

  test("a refused save shows why and keeps the plan", async () => {
    const { user } = await run();
    h.fake.failTable("tasks", "insert", { message: "row-level security" });
    await user.click(screen.getByRole("button", { name: /save 2 selected tasks/i }));
    await waitFor(() => expect(h.toast.error).toHaveBeenCalledWith("row-level security"));
    expect(screen.getAllByLabelText("Task title")).toHaveLength(2);
  });
});

describe("Break down a task", () => {
  const openTask = {
    id: "task-1",
    team_id: "t1",
    title: "Build the prototype",
    description: null,
    status: "in_progress",
    priority: "high",
    assignee_id: null,
    created_by: "user-1",
    due_date: null,
    position: 1,
    completed_at: null,
    created_at: "2026-11-01T00:00:00Z",
    updated_at: "2026-11-01T00:00:00Z",
  };
  const start = async () => {
    h.fake.seed("tasks", [openTask, { ...openTask, id: "task-2", title: "Already done", status: "done" }] as never);
    h.ai.breakdown = mock(async () => ({ steps: ["Sketch the screens", "Build the form", "Test it"], tip: "Start with the form." }));
    const view = renderWithClient(<BreakdownTool teamId="t1" />);
    await choose(view.user, await screen.findByRole("combobox", { name: "Task to break down" }), "Build the prototype");
    await view.user.click(screen.getByRole("button", { name: "Break it down" }));
    await screen.findByLabelText("Step 1");
    return view;
  };

  test("only open tasks can be chosen", async () => {
    h.fake.seed("tasks", [openTask, { ...openTask, id: "task-2", title: "Already done", status: "done" }] as never);
    const { user } = renderWithClient(<BreakdownTool teamId="t1" />);
    await user.click(await screen.findByRole("combobox", { name: "Task to break down" }));
    const options = (await screen.findAllByRole("option")).map((o) => o.textContent);
    expect(options).toEqual(["Build the prototype"]);
  });

  test("the button waits until a task is chosen", async () => {
    renderWithClient(<BreakdownTool teamId="t1" />);
    expect((screen.getByRole("button", { name: "Break it down" }) as HTMLButtonElement).disabled).toBe(true);
  });

  test("shows editable steps and a tip", async () => {
    await start();
    expect(h.ai.breakdown.mock.calls[0]![0]).toEqual({ data: { taskId: "task-1" } });
    expect((screen.getByLabelText("Step 2") as HTMLInputElement).value).toBe("Build the form");
    expect(screen.getByText("Start with the form.")).toBeTruthy();
  });

  test("adds the chosen steps to the task's checklist after the existing ones", async () => {
    h.fake.seed("task_checklist_items", [{ id: "c1", task_id: "task-1", label: "Existing", position: 0 }] as never);
    const { user } = await start();
    fireEvent.change(screen.getByLabelText("Step 1"), { target: { value: "Sketch the screens (edited)" } });
    await user.click(screen.getByRole("checkbox", { name: "Include step 3" })); // untick "Test it"
    await user.click(screen.getByRole("button", { name: /add to the task's checklist/i }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("2 steps added to the task's checklist"));
    const rows = h.fake.callsTo("task_checklist_items", "insert")[0]!.payload as { label: string; task_id: string }[];
    expect(rows.map((r) => r.label)).toEqual(["Sketch the screens (edited)", "Build the form"]);
    expect(rows.every((r) => r.task_id === "task-1")).toBe(true);
    await waitFor(() => expect(screen.queryByLabelText("Step 1")).toBeNull());
  });

  test("adding with nothing ticked is refused", async () => {
    const { user } = await start();
    for (const box of screen.getAllByRole("checkbox")) await user.click(box);
    await user.click(screen.getByRole("button", { name: /add to the task's checklist/i }));
    expect(h.toast.error).toHaveBeenCalledWith("Select at least one step.");
    expect(h.fake.callsTo("task_checklist_items", "insert")).toHaveLength(0);
  });

  test("an AI failure is shown", async () => {
    h.fake.seed("tasks", [openTask] as never);
    h.ai.breakdown = mock(async () => {
      throw new Error("The AI service is busy.");
    });
    const { user } = renderWithClient(<BreakdownTool teamId="t1" />);
    await choose(user, await screen.findByRole("combobox", { name: "Task to break down" }), "Build the prototype");
    await user.click(screen.getByRole("button", { name: "Break it down" }));
    expect((await screen.findByRole("alert")).textContent).toContain("The AI service is busy.");
  });
});

describe("Written drafts (summary, check-in, agenda, study guide, quiz)", () => {
  let fetchSpy: ReturnType<typeof spyOn>;
  const reply = (chunks: string[], init: { ok?: boolean; status?: number; json?: unknown } = {}) => {
    fetchSpy = spyOn(globalThis, "fetch").mockImplementation((async () => {
      if (init.ok === false) {
        return new Response(JSON.stringify(init.json ?? {}), { status: init.status ?? 500 });
      }
      const enc = new TextEncoder();
      const stream = new ReadableStream({
        start(c) {
          for (const ch of chunks) c.enqueue(enc.encode(ch));
          c.close();
        },
      });
      return new Response(stream, { status: 200 });
    }) as unknown as typeof fetch);
  };
  afterEach(() => fetchSpy?.mockRestore());

  test("streams the answer in and sends the team, tool and the student's sign-in", async () => {
    reply(["## Progress\n", "Two tasks are done."]);
    const { user } = renderWithClient(<WriterTool tool="summary" teamId="t1" />);
    await user.click(screen.getByRole("button", { name: "Summarize progress" }));
    expect(await screen.findByText(/Two tasks are done/)).toBeTruthy();
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/ai/write");
    expect(JSON.parse(String(init.body))).toEqual({ tool: "summary", teamId: "t1" });
    expect((init.headers as Record<string, string>)["Authorization"]).toBe("Bearer test-token");
    expect(screen.getByRole("button", { name: "Write it again" })).toBeTruthy();
  });

  test("sends the student's extra instructions", async () => {
    reply(["ok"]);
    const { user } = renderWithClient(<WriterTool tool="checkin" teamId="t1" />);
    await user.type(screen.getByLabelText(/anything to focus on/i), "  the demo  ");
    await user.click(screen.getByRole("button", { name: /weekly check-in|check-in/i }));
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    expect(JSON.parse(String((fetchSpy.mock.calls[0] as [string, RequestInit])[1].body))).toEqual({
      tool: "checkin",
      teamId: "t1",
      instructions: "the demo",
    });
  });

  test("saves the draft as a team note, tagged as AI-written", async () => {
    reply(["Weekly update: all good."]);
    const { user } = renderWithClient(<WriterTool tool="summary" teamId="t1" />);
    await user.click(screen.getByRole("button", { name: "Summarize progress" }));
    await screen.findByText(/all good/);
    await user.click(screen.getByRole("button", { name: "Save as team note" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Saved to your team's notes in Resources"));
    const note = h.fake.callsTo("resources", "insert")[0]!.payload as Record<string, unknown>;
    expect(note).toMatchObject({ team_id: "t1", kind: "note", created_by: "user-1", tags: ["ai", "summary"] });
    expect(String(note["title"])).toContain("Progress summary");
    expect(String(note["content"])).toContain("all good");
  });

  test("a server error is shown, and no save button appears", async () => {
    reply([], { ok: false, status: 503, json: { error: "The AI service isn't configured." } });
    const { user } = renderWithClient(<WriterTool tool="summary" teamId="t1" />);
    await user.click(screen.getByRole("button", { name: "Summarize progress" }));
    expect(await screen.findByText(/isn't configured/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Save as team note" })).toBeNull();
  });

  test("an error in the middle of an answer is reported", async () => {
    reply(["Half an answ", "\u0000ERR:The connection dropped."]);
    const { user } = renderWithClient(<WriterTool tool="summary" teamId="t1" />);
    await user.click(screen.getByRole("button", { name: "Summarize progress" }));
    expect(await screen.findByText(/connection dropped/)).toBeTruthy();
  });

  test("study guides and quizzes ask which notes to use, or say there are none", async () => {
    renderWithClient(<WriterTool tool="study_guide" teamId="t1" />);
    expect(await screen.findByText(/This team has no notes yet/)).toBeTruthy();
  });

  test("a study guide can be built from chosen notes", async () => {
    h.fake.seed("resources", [
      { id: "n1", team_id: "t1", kind: "note", title: "Recursion notes", content: "x", tags: [], created_by: "user-1", updated_at: "2026-11-01T00:00:00Z" },
    ] as never);
    reply(["Study guide text"]);
    const { user } = renderWithClient(<WriterTool tool="study_guide" teamId="t1" />);
    await user.click(await screen.findByRole("button", { name: /Recursion notes/ }));
    await user.click(screen.getByRole("button", { name: "Make a study guide" }));
    await screen.findByText(/Study guide text/);
    expect(JSON.parse(String((fetchSpy.mock.calls[0] as [string, RequestInit])[1].body))).toMatchObject({
      tool: "study_guide",
      noteIds: ["n1"],
    });
  });
});

describe("Teammate ideas", () => {
  const suggestion = (over = {}) => ({
    id: "u9",
    rank: 1,
    name: "Zara Ali",
    avatar: null,
    major: "Computer Science",
    university: "Northbridge",
    sharedCourses: ["CS201"],
    newSkills: ["SQL"],
    overlapHours: 4,
    reason: "Brings SQL skills your team is missing.",
    ...over,
  });
  const run = async () => {
    h.ai.suggestTeammates = mock(async () => ({ suggestions: [suggestion()], empty: null }));
    h.fake.rpcHandlers["invite_student"] = () => ({ data: "inv-1", error: null });
    h.fake.rpcHandlers["revoke_invitation"] = () => ({ data: null, error: null });
    const view = renderWithClient(<TeammatesTool teamId="t1" />);
    await view.user.click(screen.getByRole("button", { name: "Suggest teammates" }));
    await screen.findByText("Zara Ali");
    return view;
  };

  test("lists suggestions best first with the reason", async () => {
    await run();
    const list = screen.getByRole("list", { name: /suggested teammates/i });
    expect(list.textContent).toContain("Zara Ali");
    expect(list.textContent).toContain("Brings SQL skills");
  });

  test("sends the skills the team wants", async () => {
    h.ai.suggestTeammates = mock(async () => ({ suggestions: [], empty: "no_matches" }));
    const { user } = renderWithClient(<TeammatesTool teamId="t1" />);
    await user.type(screen.getByLabelText(/what kind of teammate/i), "SQL, React{Enter}");
    await user.click(screen.getByRole("button", { name: "Suggest teammates" }));
    await waitFor(() => expect(h.ai.suggestTeammates).toHaveBeenCalled());
    expect((h.ai.suggestTeammates.mock.calls[0]![0] as { data: { wantedSkills?: string[] } }).data.wantedSkills).toEqual(["SQL", "React"]);
  });

  test("Accept sends a real team invitation", async () => {
    const { user } = await run();
    await user.click(screen.getByRole("button", { name: "Accept" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Invitation sent to Zara Ali."));
    expect(h.fake.rpcCalls.find((c) => c.name === "invite_student")!.args).toEqual({ _team: "t1", _user: "u9", _role: "member" });
  });

  test("a refused invitation shows why", async () => {
    const { user } = await run();
    h.fake.failRpc("invite_student", { message: "Only owners and admins can invite students" });
    await user.click(screen.getByRole("button", { name: "Accept" }));
    await waitFor(() => expect(h.toast.error).toHaveBeenCalledWith("Only owners and admins can invite students"));
  });

  test("an invitation can be taken back", async () => {
    const { user } = await run();
    await user.click(screen.getByRole("button", { name: "Accept" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Invitation sent to Zara Ali."));
    await user.click(await screen.findByRole("button", { name: /undo|take back|cancel/i }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Invitation to Zara Ali cancelled."));
    expect(h.fake.rpcCalls.find((c) => c.name === "revoke_invitation")!.args).toEqual({ _id: "inv-1" });
  });

  test("an empty result says why", async () => {
    h.ai.suggestTeammates = mock(async () => ({ suggestions: [], empty: "all_members" }));
    const { user } = renderWithClient(<TeammatesTool teamId="t1" />);
    await user.click(screen.getByRole("button", { name: "Suggest teammates" }));
    expect(await screen.findByText("Everyone discoverable is already on this team")).toBeTruthy();
  });

  test("an AI failure shows the reason", async () => {
    h.ai.suggestTeammates = mock(async () => {
      throw new Error("The AI service is busy.");
    });
    const { user } = renderWithClient(<TeammatesTool teamId="t1" />);
    await user.click(screen.getByRole("button", { name: "Suggest teammates" }));
    expect((await screen.findByRole("alert")).textContent).toContain("The AI service is busy.");
  });
});
