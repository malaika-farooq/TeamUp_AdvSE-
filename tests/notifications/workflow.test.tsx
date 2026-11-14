// End to end: something happens in the app -> the other student gets a notification -> they open it from the bell.
import { beforeEach, describe, expect, test } from "bun:test";
import { useState } from "react";
import { cleanup, screen, waitFor, within } from "@testing-library/react";
import { NotificationsBell } from "../../src/components/app/notifications/NotificationCenter";
import { ResourcesPanel } from "../../src/components/app/ResourcesPanel";
import { TaskBoard } from "../../src/components/app/TaskBoard";
import type { Task } from "../../src/lib/queries";
import { h, resetHarness } from "../helpers/harness";
import { renderWithClient } from "../helpers/render";

const TEAM = { id: "t1", name: "Capstone Crew" };
const BEN = { id: "u2", email: "ben@example.edu", user_metadata: { display_name: "Ben Ortiz" } };

function setup() {
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
}
beforeEach(setup);

/** The same database, seen by another signed-in student. */
function switchTo(user: typeof BEN) {
  cleanup();
  h.user = user;
}

const openBell = async (user: ReturnType<typeof renderWithClient>["user"]) => {
  await screen.findByTestId("unread-count");
  await user.click(screen.getByRole("button", { name: /^Notifications/ }));
  return within(await screen.findByRole("dialog"));
};

describe("Task assigned -> notification", () => {
  test("Maya assigns a task to Ben; Ben sees it in his bell and opens the board", async () => {
    const task = {
      id: "task-1",
      team_id: "t1",
      title: "Draft outline",
      description: null,
      status: "todo",
      priority: "medium",
      assignee_id: null,
      created_by: "user-1",
      due_date: null,
      position: 1,
      completed_at: null,
      created_at: "2026-11-01T00:00:00Z",
      updated_at: "2026-11-01T00:00:00Z",
    } as Task;
    function Board() {
      const [open, setOpen] = useState(false);
      return (
        <TaskBoard
          tasks={[task]}
          teams={[TEAM]}
          defaultTeamId="t1"
          createOpen={open}
          onCreateOpenChange={setOpen}
        />
      );
    }
    const maya = renderWithClient(<Board />);
    await maya.user.click(await screen.findByText("Draft outline"));
    const panel = await screen.findByRole("dialog");
    await maya.user.click(within(panel).getByRole("combobox", { name: "Assignee" }));
    await maya.user.click(await screen.findByRole("option", { name: "Ben Ortiz" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Assignee updated"));

    // Ben's turn
    switchTo(BEN);
    const ben = renderWithClient(<NotificationsBell />);
    const list = await openBell(ben.user);
    const item = list.getAllByRole("listitem")[0]!;
    expect(item.textContent).toContain("New task assigned to you");
    expect(item.textContent).toContain("Draft outline");
    expect(item.textContent).toContain("Task assigned");
    await ben.user.click(list.getByRole("button", { name: /New task assigned to you/ }));
    await waitFor(() => expect(h.navigate).toHaveBeenCalledWith({ to: "/tasks" }));
    expect(h.fake.tables["notifications"]![0]!["read_at"]).toBeTruthy();
  });
});

describe("Note or link shared -> notification", () => {
  test("Maya shares a note; Ben is told and can open Resources from the bell", async () => {
    const maya = renderWithClient(
      <ResourcesPanel resources={[]} teams={[TEAM]} defaultTeamId="t1" />,
    );
    await maya.user.click(screen.getByRole("button", { name: /add resource/i }));
    const dialog = await screen.findByRole("dialog");
    await maya.user.type(within(dialog).getByLabelText("Title"), "Exam notes");
    await maya.user.type(within(dialog).getByLabelText("Note (Markdown supported)"), "Recursion");
    await maya.user.click(within(dialog).getByRole("button", { name: "Add resource" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Resource added"));

    switchTo(BEN);
    const ben = renderWithClient(<NotificationsBell />);
    const list = await openBell(ben.user);
    const item = list.getAllByRole("listitem")[0]!;
    expect(item.textContent).toContain("New note shared in Capstone Crew");
    expect(item.textContent).toContain("Exam notes");
    expect(item.getAttribute("data-type")).toBe("resource_shared");
    await ben.user.click(list.getByRole("button", { name: /New note shared in Capstone Crew/ }));
    await waitFor(() => expect(h.navigate).toHaveBeenCalledWith({ to: "/resources" }));
  });

  test("Maya shares a link and a file; Ben gets one notification for each", async () => {
    const maya = renderWithClient(
      <ResourcesPanel resources={[]} teams={[TEAM]} defaultTeamId="t1" />,
    );
    await maya.user.click(screen.getByRole("button", { name: /add resource/i }));
    let dialog = await screen.findByRole("dialog");
    await maya.user.click(within(dialog).getByRole("tab", { name: "Link" }));
    await maya.user.type(within(dialog).getByLabelText("Title"), "Course site");
    await maya.user.type(within(dialog).getByLabelText("Web address"), "uni.example.edu");
    await maya.user.click(within(dialog).getByRole("button", { name: "Add resource" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    await maya.user.click(screen.getByRole("button", { name: /add resource/i }));
    dialog = await screen.findByRole("dialog");
    await maya.user.click(within(dialog).getByRole("tab", { name: "File" }));
    await maya.user.type(within(dialog).getByLabelText("Title"), "Slides");
    await maya.user.upload(
      within(dialog).getByLabelText("File (max 25 MB)"),
      new File([new Uint8Array(10)], "slides.pdf", { type: "application/pdf" }),
    );
    await maya.user.click(within(dialog).getByRole("button", { name: "Add resource" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledTimes(2));

    const titles = (h.fake.tables["notifications"] ?? []).map((r) => r["title"]);
    expect(titles).toEqual([
      "New link shared in Capstone Crew",
      "New file shared in Capstone Crew",
    ]);
    expect((h.fake.tables["notifications"] ?? []).every((r) => r["user_id"] === "u2")).toBe(true);
  });
});
