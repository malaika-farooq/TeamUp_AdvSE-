// REGRESSION TESTS: each one is a real bug found during testing. If one fails, an old bug has come back.
import { beforeEach, describe, expect, mock, test } from "bun:test";
import { fireEvent, screen } from "@testing-library/react";
import { BreakdownTool } from "../../src/components/app/ai/tools";
import { fetchMyTeams } from "../../src/lib/queries";
import { h, resetHarness } from "../../tests/helpers/harness";
import { renderWithClient } from "../../tests/helpers/render";

beforeEach(() => resetHarness());

describe("Regression: a member was shown the owner's role", () => {
  // Bug: the list of "my teams" read every teammate's membership row too, and took the first one's role.
  test("my role is my own, even when the owner's row comes first", async () => {
    h.fake.seed("team_members", [
      { team_id: "t1", user_id: "owner-1", role: "owner", joined_at: "2026-01-01" },
      { team_id: "t1", user_id: "admin-1", role: "admin", joined_at: "2026-01-02" },
      { team_id: "t1", user_id: "user-1", role: "member", joined_at: "2026-01-03" },
    ]);
    h.fake.seed("teams", [{ id: "t1", name: "Crew", created_at: "2026-01-01" }]);
    const teams = await fetchMyTeams();
    expect(teams).toHaveLength(1);
    expect(teams[0]!.role).toBe("member");
  });

  test("a student in no team has no teams (and signed-out has none either)", async () => {
    h.fake.seed("team_members", [
      { team_id: "t1", user_id: "someone-else", role: "owner", joined_at: "2026-01-01" },
    ]);
    expect(await fetchMyTeams()).toEqual([]);
    h.fake.setSessionMode("signed-out");
    expect(await fetchMyTeams()).toEqual([]);
  });
});

describe("Regression: typing in a step also ticked or unticked its box", () => {
  // Bug: the checkbox and the text box shared one <label>, so clicking the text toggled the checkbox.
  test("editing a step's text leaves its checkbox alone", async () => {
    h.fake.seed("team_members", [
      { team_id: "t1", user_id: "user-1", role: "owner", joined_at: "2026-01-01" },
    ]);
    h.fake.seed("teams", [{ id: "t1", name: "Crew", created_at: "2026-01-01" }]);
    h.fake.seed("tasks", [
      {
        id: "task-1",
        team_id: "t1",
        title: "Build it",
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
      },
    ] as never);
    h.ai.breakdown = mock(async () => ({ steps: ["First", "Second"], tip: "" }));
    const { user } = renderWithClient(<BreakdownTool teamId="t1" />);
    await user.click(await screen.findByRole("combobox", { name: "Task to break down" }));
    await user.click(await screen.findByRole("option", { name: "Build it" }));
    await user.click(screen.getByRole("button", { name: "Break it down" }));
    const step = await screen.findByLabelText("Step 1");
    const box = screen.getByRole("checkbox", { name: "Include step 1" });
    expect(box.getAttribute("aria-checked")).toBe("true");
    await user.click(step);
    fireEvent.change(step, { target: { value: "First (edited)" } });
    expect(box.getAttribute("aria-checked")).toBe("true");
  });
});
