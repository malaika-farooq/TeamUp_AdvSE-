import { beforeEach, describe, expect, test } from "bun:test";
import {
  AVAILABILITY_SETUP_MESSAGE,
  loadTeamAvailability,
  nudgeMissing,
  scheduleMeeting,
} from "../../src/lib/team-availability";
import { h, resetHarness } from "../helpers/harness";

beforeEach(() => {
  resetHarness();
  h.fake.seed("team_members", [
    { team_id: "t1", user_id: "user-1", role: "owner" },
    { team_id: "t1", user_id: "u2", role: "member" },
  ]);
  h.fake.seed("profiles", [
    { id: "user-1", display_name: "Maya Chen", timezone: "America/Toronto" },
    { id: "u2", display_name: "", timezone: null },
  ]);
  h.fake.rpcHandlers["team_availability"] = () => ({
    data: [{ user_id: "u2", weekday: 2, start_minute: 600, end_minute: 660 }],
    error: null,
  });
});

describe("Loading the team's free time", () => {
  test("returns every member, with their zone, and only their own times", async () => {
    const out = await loadTeamAvailability("t1");
    expect(out.map((m) => m.id)).toEqual(["user-1", "u2"]);
    expect(out[0]).toMatchObject({ name: "Maya Chen", timeZone: "America/Toronto", ranges: [] });
    expect(out[1]!.ranges).toEqual([{ weekday: 2, start: 600, end: 660 }]);
  });

  test("a member with no name still shows up", async () => {
    expect((await loadTeamAvailability("t1"))[1]!.name).toBe("Teammate");
  });

  test("asks the database for this team only", async () => {
    await loadTeamAvailability("t1");
    expect(h.fake.rpcCalls.find((c) => c.name === "team_availability")!.args).toEqual({
      _team: "t1",
    });
  });

  test("a missing database function points to migration 0010", async () => {
    h.fake.failRpc("team_availability", { message: "schema cache", code: "PGRST202" });
    await expect(loadTeamAvailability("t1")).rejects.toThrow(AVAILABILITY_SETUP_MESSAGE);
  });

  test("other errors keep their message", async () => {
    h.fake.failRpc("team_availability", {
      message: "Only team members can see the team's availability",
    });
    await expect(loadTeamAvailability("t1")).rejects.toThrow("Only team members");
  });
});

describe("Reminding teammates", () => {
  test("returns how many were reminded", async () => {
    h.fake.rpcHandlers["nudge_team_availability"] = () => ({ data: 3, error: null });
    expect(await nudgeMissing("t1")).toBe(3);
  });
  test("treats an empty answer as nobody", async () => {
    expect(await nudgeMissing("t1")).toBe(0);
  });
  test("a missing function points to migration 0010", async () => {
    h.fake.failRpc("nudge_team_availability", { message: "x", code: "PGRST202" });
    await expect(nudgeMissing("t1")).rejects.toThrow("0010_team_availability.sql");
  });
});

describe("Scheduling a meeting", () => {
  const later = (hours: number) => new Date(Date.now() + hours * 3600_000);
  const args = (over = {}) => ({
    teamId: "t1",
    userId: "user-1",
    title: "Sprint planning",
    startsAt: later(24),
    endsAt: later(25),
    memberIds: ["user-1", "u2"],
    ...over,
  });

  test("won't schedule a meeting that ends before it starts", async () => {
    await expect(scheduleMeeting(args({ endsAt: later(23) }))).rejects.toThrow(
      "end after it starts",
    );
    expect(h.fake.callsTo("sessions", "insert")).toHaveLength(0);
  });

  test("won't schedule a meeting in the past", async () => {
    await expect(scheduleMeeting(args({ startsAt: later(-2), endsAt: later(-1) }))).rejects.toThrow(
      "future",
    );
  });

  test("falls back to a plain title", async () => {
    await scheduleMeeting(args({ title: "   " }));
    expect((h.fake.callsTo("sessions", "insert")[0]!.payload as { title: string }).title).toBe(
      "Team meeting",
    );
  });

  test("the creator is accepted once, everyone else invited and notified", async () => {
    await scheduleMeeting(args({ memberIds: ["u2", "u2", "user-1"] }));
    const attendees = h.fake.callsTo("session_attendees", "insert")[0]!.payload as {
      user_id: string;
      status: string;
    }[];
    expect(attendees).toHaveLength(2);
    expect(attendees.find((a) => a.user_id === "user-1")!.status).toBe("accepted");
    expect(h.fake.callsTo("notifications", "insert")).toHaveLength(1);
  });

  test("a refused session is reported and nobody is invited", async () => {
    h.fake.failTable("sessions", "insert", { message: "row-level security" });
    await expect(scheduleMeeting(args())).rejects.toThrow("row-level security");
    expect(h.fake.callsTo("session_attendees", "insert")).toHaveLength(0);
    expect(h.fake.callsTo("notifications", "insert")).toHaveLength(0);
  });

  test("failing to invite people is reported", async () => {
    h.fake.failTable("session_attendees", "insert", { message: "attendee insert blocked" });
    await expect(scheduleMeeting(args())).rejects.toThrow("attendee insert blocked");
  });
});
