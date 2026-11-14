import { beforeEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { screen, waitFor, within } from "@testing-library/react";
import {
  ADDITIONAL_FEATURES,
  MATCH_FACTORS,
  TeammateMatchingHub,
} from "../../src/components/app/ai/TeammateMatchingHub";
import { h, resetHarness } from "../helpers/harness";
import { renderWithClient } from "../helpers/render";

function seedTeams(...names: string[]) {
  h.fake.seed(
    "team_members",
    names.map((_, i) => ({ team_id: `t${i + 1}`, role: "owner", joined_at: "2026-01-01" })),
  );
  h.fake.seed(
    "teams",
    names.map((name, i) => ({ id: `t${i + 1}`, name, created_at: "2026-01-01" })),
  );
}
const additional = () => screen.getByRole("list", { name: "Additional AI features" });
const feature = (name: string) =>
  within(additional()).getByRole("button", { name: new RegExp(name) });

beforeEach(() => resetHarness());

describe("AI Teammate Matching page: naming and layout", () => {
  test("the page is called AI Teammate Matching, not Assistant", async () => {
    renderWithClient(<TeammateMatchingHub />);
    expect(screen.getByRole("heading", { level: 1, name: "AI Teammate Matching" })).toBeTruthy();
    expect(screen.queryByText(/^AI Assistant$/)).toBeNull();
  });

  test("states what the feature does, in the requirement's words", () => {
    renderWithClient(<TeammateMatchingHub />);
    const text = screen.getByTestId("page-description").textContent ?? "";
    expect(text).toContain("study partners and group sessions");
    for (const word of ["profile", "skills", "availability", "workload"]) {
      expect(text).toContain(word);
    }
  });

  test("shows the four things matching looks at", () => {
    renderWithClient(<TeammateMatchingHub />);
    const factors = within(
      screen.getByRole("list", { name: "What matching looks at" }),
    ).getAllByRole("listitem");
    expect(factors.map((f) => f.textContent)).toEqual(
      MATCH_FACTORS.map((f) => expect.stringContaining(f.name)) as unknown as string[],
    );
    expect(MATCH_FACTORS.map((f) => f.name)).toEqual([
      "Profile",
      "Skills",
      "Availability",
      "Academic workload",
    ]);
  });

  test("matching comes first and works without any team", () => {
    renderWithClient(<TeammateMatchingHub />);
    const matching = screen.getByRole("region", { name: /find your best-fit study partners/i });
    const extra = screen.getByRole("region", { name: "Additional AI features" });
    expect(matching.compareDocumentPosition(extra) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(matching).getByRole("button", { name: /find study partners/i })).toBeTruthy();
  });

  test("the sidebar entry is renamed too", () => {
    const shell = readFileSync("src/components/app/AppShell.tsx", "utf8");
    expect(shell).toContain('label: "AI Teammate Matching"');
    expect(shell).not.toContain('label: "AI Assistant"');
  });
});

describe("AI Teammate Matching page: the two matching tabs", () => {
  test("opens on Study partners", () => {
    renderWithClient(<TeammateMatchingHub />);
    expect(screen.getByRole("tab", { name: /study partners/i }).getAttribute("aria-selected")).toBe(
      "true",
    );
    expect(screen.getByRole("button", { name: /find study partners/i })).toBeTruthy();
  });

  test("Group sessions tab shows the session planner", async () => {
    h.fake.rpcHandlers["my_partner_requests"] = () => ({ data: [], error: null });
    const { user } = renderWithClient(<TeammateMatchingHub />);
    await user.click(screen.getByRole("tab", { name: /group sessions/i }));
    expect(await screen.findByText("No study partners yet")).toBeTruthy();
    expect(screen.getByRole("tab", { name: /group sessions/i }).getAttribute("aria-selected")).toBe(
      "true",
    );
  });

  test("switching back keeps working", async () => {
    h.fake.rpcHandlers["my_partner_requests"] = () => ({ data: [], error: null });
    const { user } = renderWithClient(<TeammateMatchingHub />);
    await user.click(screen.getByRole("tab", { name: /group sessions/i }));
    await user.click(screen.getByRole("tab", { name: /study partners/i }));
    expect(screen.getByRole("button", { name: /find study partners/i })).toBeTruthy();
  });
});

describe("AI Teammate Matching page: Additional AI features grid", () => {
  test("every other AI feature is in the grid", async () => {
    seedTeams("Capstone Crew");
    renderWithClient(<TeammateMatchingHub />);
    await screen.findByText(/for Capstone Crew/);
    const names = within(additional())
      .getAllByRole("button")
      .map((b) => b.textContent ?? "");
    for (const f of [
      "Plan tasks",
      "Break down a task",
      "Progress summary",
      "Weekly check-in",
      "Meeting agenda",
      "Study guide",
      "Practice quiz",
      "Teammate ideas",
    ]) {
      expect(names.some((n) => n.includes(f))).toBe(true);
    }
    expect(names.length).toBe(ADDITIONAL_FEATURES.length);
  });

  test("the matching tools are not repeated in the grid", () => {
    renderWithClient(<TeammateMatchingHub />);
    const grid = additional().textContent ?? "";
    expect(grid).not.toContain("Find study partners");
    expect(grid).not.toContain("Plan a study session");
  });

  test("grid tools are off, with an explanation, until the student has a team", async () => {
    renderWithClient(<TeammateMatchingHub />);
    expect(await screen.findByRole("note")).toBeTruthy();
    for (const b of within(additional()).getAllByRole("button")) {
      expect((b as HTMLButtonElement).disabled).toBe(true);
    }
    expect(screen.queryByRole("combobox", { name: "Team" })).toBeNull();
  });

  test("with a team the buttons work and no 'join a team' note shows", async () => {
    seedTeams("Capstone Crew");
    renderWithClient(<TeammateMatchingHub />);
    await screen.findByText(/for Capstone Crew/);
    expect(screen.queryByRole("note")).toBeNull();
    expect((feature("Plan tasks") as HTMLButtonElement).disabled).toBe(false);
  });

  test("choosing a feature marks it and opens it for the team", async () => {
    seedTeams("Capstone Crew");
    const { user } = renderWithClient(<TeammateMatchingHub />);
    await screen.findByText(/for Capstone Crew/);
    await user.click(feature("Study guide"));
    expect(feature("Study guide").getAttribute("aria-pressed")).toBe("true");
    const panel = await screen.findByRole("region", { name: "Study guide" });
    expect(panel.textContent).toContain("Capstone Crew");
  });

  test("choosing another feature replaces the open one", async () => {
    seedTeams("Capstone Crew");
    const { user } = renderWithClient(<TeammateMatchingHub />);
    await screen.findByText(/for Capstone Crew/);
    await user.click(feature("Study guide"));
    await screen.findByRole("region", { name: "Study guide" });
    await user.click(feature("Practice quiz"));
    await screen.findByRole("region", { name: "Practice quiz" });
    expect(feature("Study guide").getAttribute("aria-pressed")).toBe("false");
    expect(screen.queryByRole("region", { name: "Study guide" })).toBeNull();
  });

  for (const name of [
    "Plan tasks",
    "Break down a task",
    "Progress summary",
    "Weekly check-in",
    "Meeting agenda",
    "Study guide",
    "Practice quiz",
    "Teammate ideas",
  ]) {
    test(`"${name}" opens its own panel`, async () => {
      seedTeams("Capstone Crew");
      const { user } = renderWithClient(<TeammateMatchingHub />);
      await screen.findByText(/for Capstone Crew/);
      await user.click(feature(name));
      const panel = await screen.findByRole("region", { name });
      expect(within(panel).getByRole("heading", { name })).toBeTruthy();
    });
  }
});

describe("AI Teammate Matching page: team picker", () => {
  test("lists the student's teams and switches the tools to the chosen one", async () => {
    seedTeams("Capstone Crew", "Study Circle");
    const { user } = renderWithClient(<TeammateMatchingHub />);
    await screen.findByText(/for Capstone Crew/);
    await user.click(feature("Study guide"));
    await screen.findByRole("region", { name: "Study guide" });
    await user.click(screen.getByRole("combobox", { name: "Team" }));
    await user.click(await screen.findByRole("option", { name: "Study Circle" }));
    await waitFor(() =>
      expect(screen.getByRole("region", { name: "Study guide" }).textContent).toContain(
        "Study Circle",
      ),
    );
  });
});

describe("AI Teammate Matching page: Ask TeamUp AI", () => {
  test("Ask is disabled until something is typed", async () => {
    seedTeams("Capstone Crew");
    const { user } = renderWithClient(<TeammateMatchingHub />);
    const ask = screen.getByRole("button", { name: /^ask$/i }) as HTMLButtonElement;
    expect(ask.disabled).toBe(true);
    await user.type(screen.getByLabelText("Ask TeamUp AI"), "What next?");
    expect(ask.disabled).toBe(false);
  });

  test("starts a chat with the question for the selected team", async () => {
    seedTeams("Capstone Crew");
    const { user } = renderWithClient(<TeammateMatchingHub />);
    await screen.findByPlaceholderText(/Capstone Crew/);
    await user.type(screen.getByLabelText("Ask TeamUp AI"), "What should we do next?{Enter}");
    await waitFor(() => expect(h.navigate).toHaveBeenCalled());
    expect(h.navigate.mock.calls[0]![0]).toMatchObject({
      to: "/assistant/chat/$threadId",
      search: { q: "What should we do next?" },
    });
    expect(h.fake.callsTo("ai_threads", "insert")[0]!.payload).toEqual({
      user_id: "user-1",
      team_id: "t1",
    });
  });

  test("suggested questions start a chat straight away", async () => {
    seedTeams("Capstone Crew");
    const { user } = renderWithClient(<TeammateMatchingHub />);
    await screen.findByPlaceholderText(/Capstone Crew/);
    await user.click(
      screen.getByRole("button", { name: "Summarize where this team stands right now" }),
    );
    await waitFor(() => expect(h.navigate).toHaveBeenCalled());
    expect(h.navigate.mock.calls[0]![0]).toMatchObject({
      search: { q: "Summarize where this team stands right now" },
    });
  });

  test("'New' in Recent chats starts an empty chat", async () => {
    const { user } = renderWithClient(<TeammateMatchingHub />);
    await user.click(screen.getByRole("button", { name: /new/i }));
    await waitFor(() => expect(h.navigate).toHaveBeenCalled());
    expect(h.navigate.mock.calls[0]![0]).toMatchObject({ search: {} });
    expect(h.fake.callsTo("ai_threads", "insert")[0]!.payload).toEqual({
      user_id: "user-1",
      team_id: null,
    });
  });

  test("a chat that can't be started shows why and lets the student try again", async () => {
    h.fake.failTable("ai_threads", "insert", { message: "Row-level security blocked it" });
    const { user } = renderWithClient(<TeammateMatchingHub />);
    await user.type(screen.getByLabelText("Ask TeamUp AI"), "Hi{Enter}");
    await waitFor(() =>
      expect(h.toast.error).toHaveBeenCalledWith("Row-level security blocked it"),
    );
    expect(h.navigate).not.toHaveBeenCalled();
    expect((screen.getByRole("button", { name: /^ask$/i }) as HTMLButtonElement).disabled).toBe(
      false,
    );
  });

  test("Recent chats lists saved conversations", async () => {
    h.fake.seed("ai_threads", [
      { id: "c1", title: "Exam plan", team_id: null, updated_at: "2026-11-10T00:00:00Z" },
    ]);
    renderWithClient(<TeammateMatchingHub />);
    expect(await screen.findByText("Exam plan")).toBeTruthy();
  });
});
