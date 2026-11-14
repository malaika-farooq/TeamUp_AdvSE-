import { beforeEach, describe, expect, mock, test } from "bun:test";
import { screen, waitFor, within } from "@testing-library/react";
import { SessionPlanTool } from "../../src/components/app/ai/partner-tools";
import { nextOccurrence } from "../../src/lib/partner-ranking";
import { h, resetHarness } from "../helpers/harness";
import { deferred, renderWithClient } from "../helpers/render";

const request = (id: string, name: string, status = "accepted", direction = "outgoing") => ({
  id: `r-${id}`,
  other_id: id,
  other_name: name,
  other_major: "Computer Science",
  direction,
  status,
  message: null,
  created_at: "2026-11-01T00:00:00Z",
  other_avatar: null,
});

const proposal = (over = {}) => ({
  weekday: 2,
  startMinute: 600,
  endMinute: 690,
  freeCount: 3,
  title: "CS201 study session",
  agenda: "10 min goals · 60 min problems · 20 min recap",
  ...over,
});

function setPartners(rows: ReturnType<typeof request>[]) {
  h.fake.rpcHandlers["my_partner_requests"] = () => ({ data: rows, error: null });
}
const partnerBox = (name: RegExp) => screen.getByRole("checkbox", { name });
const suggestBtn = () => screen.getByRole("button", { name: /suggest session times/i });

beforeEach(() => {
  resetHarness();
  setPartners([request("p1", "Zara Ali"), request("p2", "Omar Reyes"), request("p3", "Lin Wei")]);
});

describe("AI Teammate Matching > Group sessions: choosing partners", () => {
  test("lists only accepted partners", async () => {
    setPartners([
      request("p1", "Zara Ali"),
      request("p2", "Pending Pat", "pending", "outgoing"),
      request("p3", "Declined Dee", "declined"),
    ]);
    renderWithClient(<SessionPlanTool />);
    expect(await screen.findByLabelText(/Zara Ali/)).toBeTruthy();
    expect(screen.queryByText(/Pending Pat/)).toBeNull();
    expect(screen.queryByText(/Declined Dee/)).toBeNull();
  });

  test("with no partners yet, explains what to do and links to Study Partners", async () => {
    setPartners([]);
    renderWithClient(<SessionPlanTool />);
    expect(await screen.findByText("No study partners yet")).toBeTruthy();
    expect(screen.getByRole("link", { name: /open study partners/i }).getAttribute("href")).toBe(
      "/partners",
    );
    expect(screen.queryByRole("button", { name: /suggest session times/i })).toBeNull();
  });

  test("shows an error with retry when partners can't be loaded", async () => {
    h.fake.failRpc("my_partner_requests", { message: "Network down" });
    const { user } = renderWithClient(<SessionPlanTool />);
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Couldn't load your partners");
    expect(alert.textContent).toContain("Network down");
    h.fake.clearRpcError("my_partner_requests");
    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(await screen.findByLabelText(/Zara Ali/)).toBeTruthy();
  });

  test("Suggest is disabled until at least one partner is ticked", async () => {
    const { user } = renderWithClient(<SessionPlanTool />);
    await screen.findByLabelText(/Zara Ali/);
    expect((suggestBtn() as HTMLButtonElement).disabled).toBe(true);
    await user.click(partnerBox(/Zara Ali/));
    expect((suggestBtn() as HTMLButtonElement).disabled).toBe(false);
    await user.click(partnerBox(/Zara Ali/));
    expect((suggestBtn() as HTMLButtonElement).disabled).toBe(true);
  });

  test("allows at most 5 partners in one session", async () => {
    setPartners(
      ["a", "b", "c", "d", "e", "f"].map((x) => request(`p-${x}`, `Student ${x.toUpperCase()}`)),
    );
    const { user } = renderWithClient(<SessionPlanTool />);
    await screen.findByLabelText(/Student A/);
    for (const x of ["A", "B", "C", "D", "E", "F"]) {
      await user.click(partnerBox(new RegExp(`Student ${x}`)));
    }
    h.ai.proposeSessions = mock(async () => ({ proposals: [] }));
    await user.click(suggestBtn());
    await waitFor(() => expect(h.ai.proposeSessions).toHaveBeenCalled());
    const ids = (h.ai.proposeSessions.mock.calls[0]![0] as { data: { partnerIds: string[] } }).data
      .partnerIds;
    expect(ids.length).toBe(5);
  });
});

describe("AI Teammate Matching > Group sessions: suggesting times", () => {
  async function pickAndSuggest() {
    const view = renderWithClient(<SessionPlanTool />);
    await screen.findByLabelText(/Zara Ali/);
    await view.user.click(partnerBox(/Zara Ali/));
    await view.user.click(partnerBox(/Lin Wei/));
    await view.user.click(suggestBtn());
    return view;
  }

  test("sends the chosen partners and shows each proposed slot", async () => {
    h.ai.proposeSessions = mock(async () => ({
      proposals: [
        proposal(),
        proposal({
          weekday: 4,
          startMinute: 1080,
          endMinute: 1140,
          freeCount: 2,
          title: "Evening review",
        }),
      ],
    }));
    await pickAndSuggest();
    await screen.findByText("CS201 study session");
    expect(h.ai.proposeSessions.mock.calls[0]![0]).toEqual({ data: { partnerIds: ["p1", "p3"] } });
    expect(screen.getByText("Evening review")).toBeTruthy();
    expect(screen.getByText("90 min", { exact: false })).toBeTruthy();
    expect(screen.getByText("3 of 3 free")).toBeTruthy();
    expect(screen.getByText("2 of 3 free")).toBeTruthy();
    expect(screen.getAllByText(/10 min goals/).length).toBe(2);
    expect(screen.getAllByRole("button", { name: /create & invite/i }).length).toBe(2);
  });

  test("says so when nobody shares free time", async () => {
    h.ai.proposeSessions = mock(async () => ({ proposals: [] }));
    await pickAndSuggest();
    expect(await screen.findByText("No shared free time")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /create & invite/i })).toBeNull();
  });

  test("the button is disabled while looking", async () => {
    const gate = deferred<{ proposals: never[] }>();
    h.ai.proposeSessions = mock(() => gate.promise);
    await pickAndSuggest();
    await waitFor(() => expect((suggestBtn() as HTMLButtonElement).disabled).toBe(true));
    gate.resolve({ proposals: [] });
    await screen.findByText("No shared free time");
  });

  test("shows what went wrong and can retry", async () => {
    h.ai.proposeSessions = mock(async () => {
      throw new Error("Couldn't load availability");
    });
    const { user } = await pickAndSuggest();
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Couldn't plan a session");
    expect(alert.textContent).toContain("Couldn't load availability");
    h.ai.proposeSessions = mock(async () => ({ proposals: [proposal()] }));
    await user.click(within(alert).getByRole("button", { name: /try again/i }));
    expect(await screen.findByText("CS201 study session")).toBeTruthy();
  });
});

describe("AI Teammate Matching > Group sessions: creating the session", () => {
  async function withProposal() {
    h.ai.proposeSessions = mock(async () => ({ proposals: [proposal()] }));
    const view = renderWithClient(<SessionPlanTool />);
    await screen.findByLabelText(/Zara Ali/);
    await view.user.click(partnerBox(/Zara Ali/));
    await view.user.click(partnerBox(/Omar Reyes/));
    await view.user.click(suggestBtn());
    await screen.findByText("CS201 study session");
    return view;
  }

  test("creates the session on the next matching day and invites the chosen partners", async () => {
    const { user } = await withProposal();
    await user.click(screen.getByRole("button", { name: /create & invite/i }));
    await waitFor(() =>
      expect(h.toast.success).toHaveBeenCalledWith("Session created. Your partners were invited."),
    );
    const call = h.fake.rpcCalls.find((c) => c.name === "create_study_session")!;
    const args = call.args as Record<string, string | string[]>;
    expect(args["_title"]).toBe("CS201 study session");
    expect(args["_note"]).toContain("10 min goals");
    expect(args["_invitees"]).toEqual(["p1", "p2"]);
    const start = new Date(String(args["_starts"]));
    const end = new Date(String(args["_ends"]));
    expect(start.getDay()).toBe(2); // Tuesday
    expect(start.getHours() * 60 + start.getMinutes()).toBe(600);
    expect(start.getTime()).toBeGreaterThan(Date.now());
    expect(start.getTime()).toBeLessThanOrEqual(nextOccurrence(2, 600).getTime());
    expect((end.getTime() - start.getTime()) / 60000).toBe(90);
  });

  test("clears the proposals after creating", async () => {
    const { user } = await withProposal();
    await user.click(screen.getByRole("button", { name: /create & invite/i }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    expect(screen.queryByText("CS201 study session")).toBeNull();
  });

  test("shows the reason when the database refuses and keeps the proposal", async () => {
    h.fake.failRpc("create_study_session", { message: "You can only invite your study partners" });
    const { user } = await withProposal();
    await user.click(screen.getByRole("button", { name: /create & invite/i }));
    await waitFor(() =>
      expect(h.toast.error).toHaveBeenCalledWith("You can only invite your study partners"),
    );
    expect(h.toast.success).not.toHaveBeenCalled();
    expect(screen.getByText("CS201 study session")).toBeTruthy();
  });
});
