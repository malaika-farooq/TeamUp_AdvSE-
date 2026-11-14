import { beforeEach, describe, expect, test } from "bun:test";
import { screen, waitFor, within } from "@testing-library/react";
import { MeetingTimes } from "../../src/components/app/teams/MeetingTimes";
import { h, resetHarness } from "../helpers/harness";
import { renderWithClient } from "../helpers/render";

// Everyone's saved times are in this device's zone, so the screen shows them exactly as saved.
const ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
const MON = 1;
const hr = (hours: number, minutes = 0) => hours * 60 + minutes;

type Slot = [user: string, weekday: number, start: number, end: number];

/** Maya (you), Ben and Cy are on the team. Maya is free Mon 10-12, Ben Mon 11-13; Cy has marked nothing. */
function setup(
  slots: Slot[] = [
    ["user-1", MON, hr(10), hr(12)],
    ["u2", MON, hr(11), hr(13)],
  ],
) {
  resetHarness();
  h.fake.seed("team_members", [
    { team_id: "t1", user_id: "user-1", role: "owner" },
    { team_id: "t1", user_id: "u2", role: "member" },
    { team_id: "t1", user_id: "u3", role: "member" },
  ]);
  h.fake.seed("profiles", [
    { id: "user-1", display_name: "Maya Chen", timezone: ZONE },
    { id: "u2", display_name: "Ben Ortiz", timezone: ZONE },
    { id: "u3", display_name: "Cy Park", timezone: ZONE },
  ]);
  h.fake.seed(
    "availability_slots",
    slots.map(([user_id, weekday, start_minute, end_minute]) => ({
      user_id,
      weekday,
      start_minute,
      end_minute,
    })),
  );
  h.fake.rpcHandlers["team_availability"] = () => ({
    data: h.fake.tables["availability_slots"] ?? [],
    error: null,
  });
  h.fake.rpcHandlers["nudge_team_availability"] = () => ({ data: 1, error: null });
}

const view = () => renderWithClient(<MeetingTimes teamId="t1" teamName="Capstone Crew" />);
const cell = (label: string) => screen.getByRole("button", { name: label });
const bestList = () => screen.getByRole("list", { name: "Best meeting times" });

beforeEach(() => setup());

describe("Meeting times: overview", () => {
  test("says how many members have marked free time and who is missing", async () => {
    view();
    expect(await screen.findByText("2 of 3 members have marked free time")).toBeTruthy();
    expect(screen.getByText(/Still to add/).textContent).toContain("Cy Park");
  });

  test("states the time zone and who can see it", async () => {
    view();
    await screen.findByText(/members have marked/);
    expect(
      screen.getByText(new RegExp(`your time zone \\(${ZONE.replace("/", "\\/")}\\)`)),
    ).toBeTruthy();
    expect(screen.getByText(/Only members of Capstone Crew can see this/)).toBeTruthy();
  });

  test("lists each member's free hours, and who has nothing yet", async () => {
    view();
    await screen.findByText(/members have marked/);
    const row = (name: string) =>
      screen
        .getAllByText(name)
        .map((e) => e.closest("li"))
        .find(Boolean)!.textContent;
    expect(row("Maya Chen (you)")).toContain("2 h free / week"); // Mon 10-12
    expect(row("Ben Ortiz")).toContain("2 h free / week"); // Mon 11-13
    expect(row("Cy Park")).toContain("Nothing marked yet");
  });

  test("says everyone has marked time when they all have", async () => {
    setup([
      ["user-1", MON, hr(10), hr(12)],
      ["u2", MON, hr(10), hr(12)],
      ["u3", MON, hr(10), hr(12)],
    ]);
    view();
    expect(await screen.findByText("3 of 3 members have marked free time")).toBeTruthy();
    expect(screen.queryByText(/Still to add/)).toBeNull();
    expect(screen.queryByRole("button", { name: /remind them/i })).toBeNull();
  });
});

describe("Meeting times: best common times", () => {
  test("highlights the time the most people are free", async () => {
    view();
    await screen.findByRole("list", { name: "Best meeting times" });
    const first = within(bestList()).getAllByRole("listitem")[0]!;
    expect(first.textContent).toContain("1. Monday 11:00 AM – 12:00 PM");
    expect(first.textContent).toContain("2 of 3 free");
    expect(first.textContent).toContain("Can't make it: Cy Park");
  });

  test("shows 'Everyone free' when nobody is missing", async () => {
    setup([
      ["user-1", MON, hr(10), hr(12)],
      ["u2", MON, hr(10), hr(12)],
      ["u3", MON, hr(10), hr(12)],
    ]);
    view();
    await screen.findByRole("list", { name: "Best meeting times" });
    const first = within(bestList()).getAllByRole("listitem")[0]!;
    expect(first.textContent).toContain("Everyone free");
    expect(first.textContent).not.toContain("Can't make it");
  });

  test("a longer meeting means fewer options", async () => {
    setup([
      ["user-1", MON, hr(10), hr(12)],
      ["u2", MON, hr(10), hr(11)],
    ]);
    const { user } = view();
    await screen.findByRole("list", { name: "Best meeting times" });
    await user.selectOptions(screen.getByLabelText("Meeting length"), "120");
    expect(await screen.findByText("No common time yet")).toBeTruthy();
    expect(screen.getByText(/No 120-minute time/)).toBeTruthy();
    await user.selectOptions(screen.getByLabelText("Meeting length"), "30");
    expect(await screen.findByRole("list", { name: "Best meeting times" })).toBeTruthy();
  });

  test("offers 30 minutes, 1, 1.5 and 2 hours", async () => {
    view();
    await screen.findByLabelText("Meeting length");
    const options = within(screen.getByLabelText("Meeting length")).getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual([
      "30 minutes",
      "1 hour",
      "1.5 hours",
      "2 hours",
    ]);
  });

  test("tells the team to mark time when nobody has", async () => {
    setup([]);
    view();
    expect(await screen.findByText("Nobody has marked free time yet")).toBeTruthy();
    expect(screen.queryByRole("list", { name: "Best meeting times" })).toBeNull();
  });
});

describe("Meeting times: the free-time map", () => {
  test("every half hour has a cell that says how many are free", async () => {
    view();
    await screen.findByText(/members have marked/);
    expect(cell("Monday 10:00 AM: 1 of 3 free").getAttribute("data-level")).toBe("1");
    expect(cell("Monday 11:00 AM: 2 of 3 free").getAttribute("data-level")).toBe("2");
    expect(cell("Monday 1:00 PM: 0 of 3 free").getAttribute("data-level")).toBe("0");
    expect(cell("Tuesday 11:00 AM: 0 of 3 free")).toBeTruthy();
  });

  test("the best times are marked on the map", async () => {
    view();
    await screen.findByText(/members have marked/);
    expect(cell("Monday 11:00 AM: 2 of 3 free").getAttribute("data-best")).toBe("true");
    expect(cell("Monday 11:30 AM: 2 of 3 free").getAttribute("data-best")).toBe("true");
    expect(cell("Monday 10:00 AM: 1 of 3 free").getAttribute("data-best")).toBeNull();
  });

  test("selecting a cell says who is free and who isn't", async () => {
    const { user } = view();
    await screen.findByText(/members have marked/);
    await user.click(cell("Monday 11:00 AM: 2 of 3 free"));
    const panel = screen.getByRole("status");
    expect(panel.textContent).toContain("Monday 11:00 AM – 11:30 AM");
    expect(panel.textContent).toContain("Free: Maya Chen, Ben Ortiz");
    expect(panel.textContent).toContain("Not free: Cy Park");
    expect(cell("Monday 11:00 AM: 2 of 3 free").getAttribute("aria-pressed")).toBe("true");
  });

  test("an empty cell says nobody is free", async () => {
    const { user } = view();
    await screen.findByText(/members have marked/);
    await user.click(cell("Friday 3:00 PM: 0 of 3 free"));
    expect(screen.getByRole("status").textContent).toContain("Free: nobody");
  });

  test("covers seven days from 7 am to 11 pm", async () => {
    view();
    await screen.findByText(/members have marked/);
    const cells = screen
      .getAllByRole("button")
      .filter((b) => / free$/.test(b.getAttribute("aria-label") ?? ""));
    expect(cells).toHaveLength(7 * 32);
  });
});

describe("Meeting times: marking your own free time", () => {
  const open = async () => {
    const view_ = view();
    await screen.findByText(/members have marked/);
    await view_.user.click(screen.getByRole("button", { name: /mark my free time/i }));
    return view_;
  };

  test("opens the editor with your saved times, and Save starts off", async () => {
    await open();
    const editor = await screen.findByRole("region", { name: "Mark my free time" });
    expect(within(editor).getByRole("button", { name: "Save my free time" })).toHaveProperty(
      "disabled",
      true,
    );
    await waitFor(() =>
      expect(within(editor).getByRole("button", { name: "Monday Morning" })).toBeTruthy(),
    );
  });

  test("saves new free time, closes the editor and updates the team's times", async () => {
    const { user } = await open();
    const editor = await screen.findByRole("region", { name: "Mark my free time" });
    await waitFor(() =>
      expect(
        within(editor).getByRole("button", { name: "Monday Morning" }).getAttribute("aria-pressed"),
      ).toBeDefined(),
    );
    await user.click(within(editor).getByRole("button", { name: "Wednesday Evening" }));
    const save = within(editor).getByRole("button", { name: "Save my free time" });
    expect((save as HTMLButtonElement).disabled).toBe(false);
    await user.click(save);
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Availability saved"));
    const call = h.fake.rpcCalls.find((c) => c.name === "set_my_availability")!;
    const slots = call.args["_slots"] as { weekday: number; start: number; end: number }[];
    expect(slots).toContainEqual({ weekday: 3, start: hr(17), end: hr(22) });
    expect(slots).toContainEqual({ weekday: MON, start: hr(10), end: hr(12) });
    await waitFor(() =>
      expect(screen.queryByRole("region", { name: "Mark my free time" })).toBeNull(),
    );
  });

  test("shows why a save failed and keeps the editor open", async () => {
    h.fake.failRpc("set_my_availability", { message: "Times must be on the hour or half hour" });
    const { user } = await open();
    const editor = await screen.findByRole("region", { name: "Mark my free time" });
    await waitFor(() => within(editor).getByRole("button", { name: "Monday Morning" }));
    await user.click(within(editor).getByRole("button", { name: "Friday Evening" }));
    await user.click(within(editor).getByRole("button", { name: "Save my free time" }));
    await waitFor(() =>
      expect(h.toast.error).toHaveBeenCalledWith("Times must be on the hour or half hour"),
    );
    expect(screen.getByRole("region", { name: "Mark my free time" })).toBeTruthy();
  });

  test("the button closes the editor again", async () => {
    const { user } = await open();
    await screen.findByRole("region", { name: "Mark my free time" });
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("region", { name: "Mark my free time" })).toBeNull();
  });
});

describe("Meeting times: reminding teammates", () => {
  test("reminds the people who haven't marked anything", async () => {
    const { user } = view();
    await user.click(await screen.findByRole("button", { name: /remind them/i }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Reminded 1 teammate."));
    expect(h.fake.rpcCalls.find((c) => c.name === "nudge_team_availability")!.args).toEqual({
      _team: "t1",
    });
  });

  test("says so when everyone was already reminded today", async () => {
    h.fake.rpcHandlers["nudge_team_availability"] = () => ({ data: 0, error: null });
    const { user } = view();
    await user.click(await screen.findByRole("button", { name: /remind them/i }));
    await waitFor(() =>
      expect(h.toast.success).toHaveBeenCalledWith(
        "Everyone without free time was already reminded today.",
      ),
    );
  });

  test("shows the reason when the reminder fails", async () => {
    h.fake.failRpc("nudge_team_availability", { message: "Only team members can send reminders" });
    const { user } = view();
    await user.click(await screen.findByRole("button", { name: /remind them/i }));
    await waitFor(() =>
      expect(h.toast.error).toHaveBeenCalledWith("Only team members can send reminders"),
    );
  });
});

describe("Meeting times: scheduling a meeting", () => {
  async function openBooking() {
    const v = view();
    await screen.findByRole("list", { name: "Best meeting times" });
    await v.user.click(
      within(bestList()).getAllByRole("button", { name: /schedule meeting/i })[0]!,
    );
    return { ...v, dialog: await screen.findByRole("dialog") };
  }

  test("the dialog names the day and how many are free", async () => {
    const { dialog } = await openBooking();
    expect(dialog.textContent).toContain("Monday, 60 minutes");
    expect(dialog.textContent).toContain("2 of 3 members are free then");
    expect(dialog.textContent).toContain("Everyone is invited");
  });

  test("books the session at the next Monday 11:00 and invites the whole team", async () => {
    const { user, dialog } = await openBooking();
    await user.type(within(dialog).getByLabelText("Title"), "Sprint planning");
    await user.click(within(dialog).getByRole("button", { name: "Schedule" }));
    await waitFor(() =>
      expect(h.toast.success).toHaveBeenCalledWith("Meeting scheduled. Your team was invited."),
    );
    const session = h.fake.callsTo("sessions", "insert")[0]!.payload as Record<string, string>;
    expect(session["team_id"]).toBe("t1");
    expect(session["title"]).toBe("Sprint planning");
    expect(session["created_by"]).toBe("user-1");
    const starts = new Date(session["starts_at"]!);
    const ends = new Date(session["ends_at"]!);
    expect(starts.getDay()).toBe(MON);
    expect(starts.getHours() * 60 + starts.getMinutes()).toBe(hr(11));
    expect(starts.getTime()).toBeGreaterThan(Date.now());
    expect((ends.getTime() - starts.getTime()) / 60000).toBe(60);

    const attendees = h.fake.callsTo("session_attendees", "insert")[0]!.payload as {
      user_id: string;
      status: string;
    }[];
    expect(attendees.map((a) => a.user_id).sort()).toEqual(["u2", "u3", "user-1"]);
    expect(attendees.find((a) => a.user_id === "user-1")!.status).toBe("accepted");
    expect(attendees.find((a) => a.user_id === "u2")!.status).toBe("invited");

    const notes = h.fake
      .callsTo("notifications", "insert")
      .map((c) => c.payload as { user_id: string });
    expect(notes.map((n) => n.user_id).sort()).toEqual(["u2", "u3"]);
    expect(h.fake.callsTo("activity_logs", "insert")).toHaveLength(1);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  test("names the meeting after the team when no title is typed", async () => {
    const { user, dialog } = await openBooking();
    await user.click(within(dialog).getByRole("button", { name: "Schedule" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    expect((h.fake.callsTo("sessions", "insert")[0]!.payload as { title: string }).title).toBe(
      "Capstone Crew meeting",
    );
  });

  test("lets you start later inside the window", async () => {
    setup([
      ["user-1", MON, hr(10), hr(13)],
      ["u2", MON, hr(10), hr(13)],
    ]);
    const { user, dialog } = await openBooking();
    const start = within(dialog).getByLabelText("Starts at");
    const options = within(start).getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual([
      "10:00 AM – 11:00 AM",
      "10:30 AM – 11:30 AM",
      "11:00 AM – 12:00 PM",
      "11:30 AM – 12:30 PM",
      "12:00 PM – 1:00 PM",
    ]);
    await user.selectOptions(start, String(hr(11, 30)));
    await user.click(within(dialog).getByRole("button", { name: "Schedule" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    const starts = new Date(
      (h.fake.callsTo("sessions", "insert")[0]!.payload as { starts_at: string }).starts_at,
    );
    expect(starts.getHours() * 60 + starts.getMinutes()).toBe(hr(11, 30));
  });

  test("shows why booking failed and keeps the dialog open", async () => {
    h.fake.failTable("sessions", "insert", {
      message: "new row violates row-level security policy",
    });
    const { user, dialog } = await openBooking();
    await user.click(within(dialog).getByRole("button", { name: "Schedule" }));
    await waitFor(() =>
      expect(h.toast.error).toHaveBeenCalledWith("new row violates row-level security policy"),
    );
    expect(h.toast.success).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(h.fake.callsTo("session_attendees", "insert")).toHaveLength(0);
  });

  test("Cancel closes without booking anything", async () => {
    const { user, dialog } = await openBooking();
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(h.fake.callsTo("sessions", "insert")).toHaveLength(0);
  });
});

describe("Meeting times: when something is wrong", () => {
  test("a database that hasn't been updated points to the migration", async () => {
    h.fake.failRpc("team_availability", { message: "schema cache", code: "PGRST202" });
    const { user } = view();
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("0010_team_availability.sql");
    h.fake.clearRpcError("team_availability");
    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(await screen.findByText(/members have marked/)).toBeTruthy();
  });

  test("any other error is shown with a retry", async () => {
    h.fake.failRpc("team_availability", {
      message: "Only team members can see the team's availability",
    });
    view();
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Couldn't load meeting times");
    expect(alert.textContent).toContain("Only team members can see");
  });

  test("shows a loading message first", () => {
    view();
    expect(screen.getByRole("status").textContent).toContain("Checking everyone's free time");
  });
});

describe("Meeting times: teammates in other time zones", () => {
  test("a teammate's times are converted to yours before comparing", async () => {
    // Both are free Monday 10-12 on their own clocks. If Ben's clock is a different zone, those are
    // different moments, so the two don't line up exactly.
    setup([
      ["user-1", MON, hr(10), hr(12)],
      ["u2", MON, hr(10), hr(12)],
    ]);
    h.fake.seed("profiles", [
      { id: "user-1", display_name: "Maya Chen", timezone: ZONE },
      {
        id: "u2",
        display_name: "Ben Ortiz",
        timezone: ZONE === "Asia/Tokyo" ? "UTC" : "Asia/Tokyo",
      },
      { id: "u3", display_name: "Cy Park", timezone: ZONE },
    ]);
    view();
    await screen.findByText(/members have marked/);
    const list = screen.queryByRole("list", { name: "Best meeting times" });
    const everyoneFree = list ? within(list).queryAllByText("Everyone free") : [];
    expect(everyoneFree).toHaveLength(0);
    expect(screen.queryByText("1. Monday 10:00 AM – 12:00 PM")).toBeNull();
  });

  test("teammates in the same zone line up exactly", async () => {
    setup([
      ["user-1", MON, hr(10), hr(12)],
      ["u2", MON, hr(10), hr(12)],
    ]);
    view();
    await screen.findByRole("list", { name: "Best meeting times" });
    expect(within(bestList()).getAllByRole("listitem")[0]!.textContent).toContain(
      "Monday 10:00 AM – 12:00 PM",
    );
  });
});
