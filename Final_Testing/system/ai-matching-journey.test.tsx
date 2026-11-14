// SYSTEM TEST: AI Teammate Matching from the first search to a booked group session.
// Maya finds a study partner, Ben accepts, Maya plans a session, Ben is invited and replies.
// The AI is replaced by fixed answers; requests, partners and sessions follow the real screens and rules.
import { beforeEach, describe, expect, mock, test } from "bun:test";
import { cleanup, screen, waitFor, within } from "@testing-library/react";
import { PartnerMatchTool, SessionPlanTool } from "../../src/components/app/ai/partner-tools";
import { Route as PartnersRoute } from "../../src/routes/_authenticated/partners";
import { h, resetHarness } from "../../tests/helpers/harness";
import { renderWithClient } from "../../tests/helpers/render";

const PartnersPage = (PartnersRoute as unknown as { component: () => JSX.Element }).component;
const BEN = { id: "u2", email: "ben@example.edu", user_metadata: { display_name: "Ben Ortiz" } };
const MAYA = { id: "user-1", email: "maya.chen@example.edu", user_metadata: { display_name: "Maya Chen" } };

type Req = { id: string; from: string; to: string; status: "pending" | "accepted" | "declined" };
let requests: Req[] = [];
let sessions: { id: string; title: string; starts_at: string; ends_at: string; host: string; invitees: string[]; status: Record<string, string> }[] = [];
const NAMES: Record<string, string> = { "user-1": "Maya Chen", u2: "Ben Ortiz" };

/** The database functions behind partner requests and study sessions, as simple rules. */
function install() {
  const me = () => h.user!.id;
  h.fake.rpcHandlers["send_partner_request"] = (a) => {
    const to = String(a["_to"]);
    if (requests.some((r) => (r.from === me() && r.to === to) || (r.from === to && r.to === me()))) {
      return { data: null, error: { message: "You already have a request with this student" } };
    }
    requests.push({ id: `req-${requests.length + 1}`, from: me(), to, status: "pending" });
    return { data: null, error: null };
  };
  h.fake.rpcHandlers["my_partner_requests"] = () => ({
    data: requests
      .filter((r) => r.from === me() || r.to === me())
      .map((r) => {
        const other = r.from === me() ? r.to : r.from;
        return {
          id: r.id,
          other_id: other,
          other_name: NAMES[other] ?? "Student",
          other_major: "Computer Science",
          direction: r.from === me() ? "outgoing" : "incoming",
          status: r.status,
          message: null,
          created_at: new Date().toISOString(),
          other_avatar: null,
        };
      }),
    error: null,
  });
  h.fake.rpcHandlers["respond_partner_request"] = (a) => {
    const r = requests.find((x) => x.id === a["_request"]);
    if (!r || r.to !== me()) return { data: null, error: { message: "That request isn't for you" } };
    r.status = a["_accept"] ? "accepted" : "declined";
    return { data: null, error: null };
  };
  h.fake.rpcHandlers["create_study_session"] = (a) => {
    const invitees = a["_invitees"] as string[];
    const partners = requests.filter((r) => r.status === "accepted").flatMap((r) => [r.from, r.to]);
    if (invitees.some((i) => !partners.includes(i))) {
      return { data: null, error: { message: "You can only invite your study partners" } };
    }
    sessions.push({
      id: `sess-${sessions.length + 1}`,
      title: String(a["_title"]),
      starts_at: String(a["_starts"]),
      ends_at: String(a["_ends"]),
      host: me(),
      invitees,
      status: Object.fromEntries(invitees.map((i) => [i, "invited"])),
    });
    return { data: `sess-${sessions.length}`, error: null };
  };
  h.fake.rpcHandlers["my_study_sessions"] = () => ({
    data: sessions
      .filter((s) => s.host === me() || s.invitees.includes(me()))
      .map((s) => ({
        id: s.id,
        title: s.title,
        note: null,
        starts_at: s.starts_at,
        ends_at: s.ends_at,
        host_id: s.host,
        host_name: NAMES[s.host],
        my_status: s.host === me() ? "accepted" : (s.status[me()] ?? "invited"),
        attendees: [],
      })),
    error: null,
  });
  h.fake.rpcHandlers["respond_study_session"] = (a) => {
    const s = sessions.find((x) => x.id === a["_session"]);
    if (s) s.status[me()] = a["_accept"] ? "accepted" : "declined";
    return { data: null, error: null };
  };
}
const becomes = (who: typeof BEN | typeof MAYA) => {
  cleanup();
  h.user = who;
  h.fake.setUserId(who.id);
  h.toast.success.mockClear();
  h.toast.error.mockClear();
};

beforeEach(() => {
  resetHarness();
  requests = [];
  sessions = [];
  install();
});

describe("System: AI Teammate Matching, start to finish", () => {
  test("find a partner -> request -> accept -> plan a session -> invitation -> reply", async () => {
    // 1. Maya searches for a partner who knows SQL and is free on Monday evenings.
    h.ai.suggestPartners = mock(async () => ({
      empty: null,
      suggestions: [
        {
          id: "u2", rank: 1, name: "Ben Ortiz", avatar: null, major: "Computer Science", university: "Northbridge",
          sharedCourses: ["CS201 Data Structures"], newSkills: ["SQL"], wantedSkills: ["SQL"], overlapHours: 5,
          workload: "light", reason: "Has the SQL skills you asked for and shares CS201 with you.",
        },
      ],
    }));
    let view = renderWithClient(<PartnerMatchTool />);
    await view.user.type(screen.getByLabelText(/what kind of partner/i), "SQL{Enter}");
    await view.user.click(screen.getByRole("button", { name: "Mon Evening" }));
    await view.user.click(screen.getByRole("button", { name: "Find study partners" }));
    await screen.findByText(/Ben Ortiz/);
    expect(h.ai.suggestPartners.mock.calls[0]![0]).toEqual({
      data: { wantedSkills: ["SQL"], windows: [{ weekday: 1, start: 1020, end: 1320 }], avoidHeavy: undefined },
    });
    const card = screen.getByRole("list", { name: /suggested study partners/i });
    expect(card.textContent).toContain("light workload");

    // 2. She sends a request.
    await view.user.click(within(card).getByRole("button", { name: /send request/i }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Request sent to Ben Ortiz."));
    expect(requests).toEqual([{ id: "req-1", from: "user-1", to: "u2", status: "pending" }]);

    // 3. Sending again is refused by the database rules (no duplicate requests).
    expect((await (await import("../../tests/helpers/harness")).h.fake.client.rpc("send_partner_request", { _to: "u2" })).error?.message).toContain("already");

    // 4. Ben opens Study Partners, sees the request, and accepts.
    becomes(BEN);
    view = renderWithClient(<PartnersPage />);
    const asked = await screen.findByText(/Wants to study with you/);
    expect(asked.closest("li")!.textContent).toContain("Maya Chen");
    await view.user.click(within(asked.closest("li")!).getByRole("button", { name: "Accept" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("You're now study partners."));
    expect(requests[0]!.status).toBe("accepted");

    // 5. Back as Maya: Ben is now a partner she can plan a session with.
    becomes(MAYA);
    h.ai.proposeSessions = mock(async () => ({
      proposals: [{ weekday: 1, startMinute: 1080, endMinute: 1170, freeCount: 2, title: "CS201 study session", agenda: "10 min goals · 60 min problems · 20 min recap" }],
    }));
    view = renderWithClient(<SessionPlanTool />);
    await view.user.click(await screen.findByLabelText(/Ben Ortiz/));
    await view.user.click(screen.getByRole("button", { name: /suggest session times/i }));
    await screen.findByText("CS201 study session");
    expect(h.ai.proposeSessions.mock.calls[0]![0]).toEqual({ data: { partnerIds: ["u2"] } });
    await view.user.click(screen.getByRole("button", { name: /create & invite/i }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Session created. Your partners were invited."));
    expect(sessions).toHaveLength(1);
    expect(sessions[0]).toMatchObject({ title: "CS201 study session", host: "user-1", invitees: ["u2"] });
    expect(new Date(sessions[0]!.starts_at).getTime()).toBeGreaterThan(Date.now());

    // 6. Ben sees the invitation in his sessions tab and joins.
    becomes(BEN);
    view = renderWithClient(<PartnersPage />);
    await view.user.click(await screen.findByRole("tab", { name: "Study sessions" }));
    expect(await screen.findByText("CS201 study session")).toBeTruthy();
    const accept = await screen.findByRole("button", { name: /accept|join|i'm in|yes/i });
    await view.user.click(accept);
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("You're in."));
    expect(sessions[0]!.status["u2"]).toBe("accepted");
  }, 60_000);

  test("a session can only be created with real study partners", async () => {
    const res = await h.fake.client.rpc("create_study_session", {
      _title: "Sneaky",
      _note: "",
      _starts: new Date(Date.now() + 864e5).toISOString(),
      _ends: new Date(Date.now() + 864e5 + 3600e3).toISOString(),
      _invitees: ["u2"],
    });
    expect(res.error?.message).toBe("You can only invite your study partners");
    expect(sessions).toHaveLength(0);
  });

  test("the session planner is closed to someone with no partners", async () => {
    renderWithClient(<SessionPlanTool />);
    expect(await screen.findByText("No study partners yet")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /suggest session times/i })).toBeNull();
  });
});
