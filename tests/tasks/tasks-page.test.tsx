import { beforeEach, describe, expect, test } from "bun:test";
import { screen, waitFor, within } from "@testing-library/react";
import { Route } from "../../src/routes/_authenticated/tasks";
import { h, resetHarness } from "../helpers/harness";
import { renderWithClient } from "../helpers/render";

const Page = (Route as unknown as { component: () => JSX.Element }).component;
const validate = (Route as unknown as { validateSearch: (s: Record<string, unknown>) => unknown })
  .validateSearch;

function seed() {
  resetHarness();
  h.fake.seed("team_members", [
    { team_id: "t1", user_id: "user-1", role: "owner", joined_at: "2026-01-01" },
  ]);
  h.fake.seed("teams", [{ id: "t1", name: "Capstone Crew", created_at: "2026-01-01" }]);
  h.fake.seed("profiles", [{ id: "user-1", display_name: "Maya Chen" }]);
  const base = {
    team_id: "t1",
    description: null,
    priority: "medium",
    assignee_id: null,
    created_by: "user-1",
    due_date: null,
    position: 1,
    completed_at: null,
    created_at: "2026-11-01T00:00:00Z",
    updated_at: "2026-11-01T00:00:00Z",
  };
  h.fake.seed("tasks", [
    { ...base, id: "a", title: "Write report", status: "todo" },
    { ...base, id: "b", title: "Make slides", status: "in_progress" },
  ]);
}

beforeEach(seed);

describe("Tasks page address options", () => {
  test("reads ?q= and ?create=true, ignores anything else", () => {
    expect(validate({ q: "slides", create: true })).toEqual({ q: "slides", create: true });
    expect(validate({ create: "true" })).toEqual({ create: true });
    expect(validate({ q: "", create: false })).toEqual({});
    expect(validate({ q: 5, create: "yes", other: 1 })).toEqual({});
  });
});

describe("Tasks page", () => {
  test("shows the board with the team's tasks", async () => {
    renderWithClient(<Page />);
    expect(await screen.findByText("Write report")).toBeTruthy();
    expect(
      within(screen.getByRole("group", { name: "In Progress" })).getByText("Make slides"),
    ).toBeTruthy();
  });

  test("the dashboard's Create Task shortcut opens the New task form", async () => {
    h.search = { create: true };
    renderWithClient(<Page />);
    expect(await screen.findByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "New task" })).toBeTruthy();
  });

  test("the header search lands on a board that is already filtered", async () => {
    h.search = { q: "slides" };
    renderWithClient(<Page />);
    await screen.findByText("Make slides");
    expect((screen.getByLabelText("Search tasks") as HTMLInputElement).value).toBe("slides");
    expect(screen.queryByText("Write report")).toBeNull();
  });

  test("a failed load shows the reason and a retry", async () => {
    h.fake.failTable("tasks", "select", { message: "Network down" });
    renderWithClient(<Page />);
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Network down");
    await waitFor(() => expect(screen.getByRole("button", { name: /try again/i })).toBeTruthy());
  });
});
