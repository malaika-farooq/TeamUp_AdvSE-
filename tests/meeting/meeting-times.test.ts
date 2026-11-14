// Functionality 3: the rules behind "best common times for the group".
import { describe, expect, test } from "bun:test";
import {
  DAY_LAST_MINUTE,
  DAY_START_MINUTE,
  GRID_ROWS,
  bestMeetingTimes,
  cellKey,
  formatWindow,
  freeByHalfHour,
  freeHours,
  groupAvailability,
  heatLevel,
  inViewerZone,
  inWindow,
  membersWithoutAvailability,
  shiftRanges,
  tzOffsetMinutes,
  type MemberAvailability,
} from "../../src/lib/meeting-times";

const MON = 1;
const WED = 3;
const h = (hours: number, minutes = 0) => hours * 60 + minutes;
const member = (
  id: string,
  ranges: [number, number, number][],
  timeZone: string | null = null,
): MemberAvailability => ({
  id,
  name: id.toUpperCase(),
  timeZone,
  ranges: ranges.map(([weekday, start, end]) => ({ weekday, start, end })),
});
const WINTER = new Date("2026-01-15T12:00:00Z");
const SUMMER = new Date("2026-07-15T12:00:00Z");

describe("Time zones", () => {
  test("offsets from UTC, including daylight saving", () => {
    expect(tzOffsetMinutes("UTC", WINTER)).toBe(0);
    expect(tzOffsetMinutes("Asia/Tokyo", WINTER)).toBe(540);
    expect(tzOffsetMinutes("America/Toronto", WINTER)).toBe(-300);
    expect(tzOffsetMinutes("America/Toronto", SUMMER)).toBe(-240);
    expect(tzOffsetMinutes("Asia/Kolkata", WINTER)).toBe(330);
  });

  test("the same zone, a missing zone or a made-up zone changes nothing", () => {
    const r = [{ weekday: MON, start: h(9), end: h(11) }];
    expect(shiftRanges(r, "UTC", "UTC", WINTER)).toEqual(r);
    expect(shiftRanges(r, null, "UTC", WINTER)).toEqual(r);
    expect(shiftRanges(r, "UTC", undefined, WINTER)).toEqual(r);
    expect(shiftRanges(r, "Mars/Olympus", "UTC", WINTER)).toEqual(r);
  });

  test("moves a range forward and back", () => {
    const r = [{ weekday: MON, start: h(9), end: h(11) }];
    expect(shiftRanges(r, "UTC", "Asia/Tokyo", WINTER)).toEqual([
      { weekday: MON, start: h(18), end: h(20) },
    ]);
    expect(shiftRanges(r, "America/Toronto", "UTC", WINTER)).toEqual([
      { weekday: MON, start: h(14), end: h(16) },
    ]);
  });

  test("a range that crosses midnight is split across two days", () => {
    const r = [{ weekday: MON, start: h(10), end: h(20) }];
    expect(shiftRanges(r, "UTC", "Asia/Tokyo", WINTER)).toEqual([
      { weekday: MON, start: h(19), end: h(24) },
      { weekday: 2, start: 0, end: h(5) },
    ]);
  });

  test("the week wraps from Saturday night to Sunday and back", () => {
    expect(
      shiftRanges([{ weekday: 6, start: h(20), end: h(23) }], "UTC", "Asia/Tokyo", WINTER),
    ).toEqual([{ weekday: 0, start: h(5), end: h(8) }]);
    expect(
      shiftRanges([{ weekday: 0, start: h(2), end: h(4) }], "UTC", "America/Toronto", WINTER),
    ).toEqual([{ weekday: 6, start: h(21), end: h(23) }]);
  });

  test("shifting keeps the total amount of free time", () => {
    const r = [
      { weekday: 0, start: 0, end: h(24) },
      { weekday: 3, start: h(5), end: h(19, 30) },
    ];
    const total = (x: { start: number; end: number }[]) =>
      x.reduce((s, y) => s + y.end - y.start, 0);
    for (const zone of ["Asia/Tokyo", "America/Los_Angeles", "Asia/Kolkata", "Pacific/Auckland"]) {
      expect(total(shiftRanges(r, "UTC", zone, WINTER))).toBe(total(r));
    }
  });

  test("members in different zones line up in the viewer's zone", () => {
    const ann = member("ann", [[MON, h(10), h(12)]], "UTC");
    const kei = member("kei", [[MON, h(19), h(21)]], "Asia/Tokyo"); // 10:00-12:00 UTC
    const out = inViewerZone([ann, kei], "UTC", WINTER);
    expect(out[0]!.ranges).toEqual(ann.ranges);
    expect(out[1]!.ranges).toEqual([{ weekday: MON, start: h(10), end: h(12) }]);
    const best = bestMeetingTimes(out, 120);
    expect(best[0]).toMatchObject({ weekday: MON, start: h(10), end: h(12), everyone: true });
  });
});

describe("Free time per half hour", () => {
  test("lists who is free in each half hour", () => {
    const grid = freeByHalfHour([
      member("a", [[MON, h(9), h(10)]]),
      member("b", [[MON, h(9, 30), h(10, 30)]]),
    ]);
    expect([...grid.get(cellKey(MON, h(9)))!]).toEqual(["a"]);
    expect([...grid.get(cellKey(MON, h(9, 30)))!].sort()).toEqual(["a", "b"]);
    expect([...grid.get(cellKey(MON, h(10)))!]).toEqual(["b"]);
    expect(grid.get(cellKey(MON, h(10, 30)))).toBeUndefined();
  });

  test("free hours in a week", () => {
    expect(freeHours([{ weekday: MON, start: h(9), end: h(11, 30) }])).toBe(2.5);
    expect(freeHours([])).toBe(0);
    expect(
      freeHours([
        { weekday: MON, start: h(9), end: h(10) },
        { weekday: MON, start: h(9, 30), end: h(11) },
      ]),
    ).toBe(2);
  });
});

describe("Best meeting times", () => {
  const ann = member("ann", [[MON, h(9), h(12)]]);
  const ben = member("ben", [[MON, h(10), h(13)]]);
  const cy = member("cy", [
    [MON, h(10), h(11, 30)],
    [WED, h(14), h(16)],
  ]);

  test("joins neighbouring start times into one window and ranks by people free", () => {
    const out = bestMeetingTimes([ann, ben, cy], 60);
    expect(out[0]).toMatchObject({
      weekday: MON,
      start: h(10),
      end: h(11, 30),
      freeIds: ["ann", "ben", "cy"],
      missingIds: [],
      everyone: true,
    });
    expect(out[1]).toMatchObject({
      weekday: MON,
      start: h(11),
      end: h(12),
      freeIds: ["ann", "ben"],
      missingIds: ["cy"],
      everyone: false,
    });
  });

  test("a meeting only counts for people free for all of it", () => {
    // 2-hour meeting: ann 9-12, ben 10-13 -> only 10-12 works, cy (until 11:30) is out
    const out = bestMeetingTimes([ann, ben, cy], 120);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ start: h(10), end: h(12), freeIds: ["ann", "ben"] });
  });

  test("nobody is suggested alone", () => {
    const out = bestMeetingTimes([ann, ben, cy], 30);
    expect(out.every((w) => w.freeIds.length >= 2)).toBe(true);
    expect(out.some((w) => w.weekday === WED)).toBe(false);
  });

  test("a one-person team still gets that person's times", () => {
    const out = bestMeetingTimes([ann], 60);
    expect(out[0]).toMatchObject({ weekday: MON, start: h(9), end: h(12), everyone: true });
  });

  test("no members, or nobody with free time, gives nothing", () => {
    expect(bestMeetingTimes([], 60)).toEqual([]);
    expect(bestMeetingTimes([member("a", []), member("b", [])], 60)).toEqual([]);
  });

  test("no overlap at all gives nothing", () => {
    const out = bestMeetingTimes(
      [member("a", [[MON, h(9), h(10)]]), member("b", [[MON, h(11), h(12)]])],
      30,
    );
    expect(out).toEqual([]);
  });

  test("free time too short for the meeting is ignored", () => {
    const out = bestMeetingTimes(
      [member("a", [[MON, h(9), h(9, 30)]]), member("b", [[MON, h(9), h(9, 30)]])],
      60,
    );
    expect(out).toEqual([]);
  });

  test("lengths are rounded up to the next half hour", () => {
    const two = [member("a", [[MON, h(9), h(10, 30)]]), member("b", [[MON, h(9), h(10, 30)]])];
    expect(bestMeetingTimes(two, 45)[0]).toMatchObject({
      duration: 60,
      start: h(9),
      end: h(10, 30),
    });
    expect(bestMeetingTimes(two, 10)[0]!.duration).toBe(30);
  });

  test("nothing is suggested in the middle of the night", () => {
    const night = [
      member("a", [
        [MON, h(2), h(5)],
        [MON, h(23, 30), h(24)],
      ]),
      member("b", [
        [MON, h(2), h(5)],
        [MON, h(23, 30), h(24)],
      ]),
    ];
    expect(bestMeetingTimes(night, 30)).toEqual([]);
    expect(DAY_START_MINUTE).toBe(h(7));
    expect(DAY_LAST_MINUTE).toBe(h(23));
  });

  test("a window never runs past 11 pm", () => {
    const late = [member("a", [[MON, h(21), h(24)]]), member("b", [[MON, h(21), h(24)]])];
    expect(bestMeetingTimes(late, 60)[0]).toMatchObject({ start: h(21), end: h(23) });
  });

  test("ties go to the longer window, then the earlier day", () => {
    const both = (r: [number, number, number][]) => [member("a", r), member("b", r)];
    const out = bestMeetingTimes(
      both([
        [3, h(9), h(10)],
        [1, h(9), h(11)],
        [2, h(9), h(11)],
      ]),
      60,
    );
    expect(out.map((w) => w.weekday)).toEqual([1, 2, 3]);
  });

  test("limits the list", () => {
    const days = [0, 1, 2, 3, 4, 5, 6].map((d) => [d, h(9), h(10)] as [number, number, number]);
    const everyone = [member("a", days), member("b", days)];
    expect(bestMeetingTimes(everyone, 60)).toHaveLength(5);
    expect(bestMeetingTimes(everyone, 60, 2)).toHaveLength(2);
  });

  test("can insist that certain people are free", () => {
    const out = bestMeetingTimes([ann, ben, cy], 60, 5, { requiredIds: ["cy"] });
    expect(out.every((w) => w.freeIds.includes("cy"))).toBe(true);
    expect(out).toHaveLength(1);
    expect(
      bestMeetingTimes([ann, ben, cy], 60, 5, { requiredIds: ["nobody"] }).length,
    ).toBeGreaterThan(0);
  });

  test("two separate runs on one day stay separate", () => {
    const r: [number, number, number][] = [
      [MON, h(9), h(10)],
      [MON, h(14), h(15)],
    ];
    const out = bestMeetingTimes([member("a", r), member("b", r)], 60);
    expect(out.map((w) => [w.start, w.end])).toEqual([
      [h(9), h(10)],
      [h(14), h(15)],
    ]);
  });
});

describe("Preparing the data", () => {
  test("rows become one list per member, keeping everyone, even with nothing marked", () => {
    const out = groupAvailability(
      [
        { user_id: "a", weekday: 1, start_minute: 540, end_minute: 600 },
        { user_id: "a", weekday: 2, start_minute: 600, end_minute: 660 },
        { user_id: "b", weekday: 1, start_minute: 540, end_minute: 600 },
        { user_id: "stranger", weekday: 1, start_minute: 0, end_minute: 60 },
      ],
      [
        { id: "a", name: "Ann", timeZone: "UTC" },
        { id: "b", name: "Ben" },
        { id: "c", name: "Cy" },
      ],
    );
    expect(out.map((m) => m.ranges.length)).toEqual([2, 1, 0]);
    expect(out[0]!.timeZone).toBe("UTC");
    expect(membersWithoutAvailability(out).map((m) => m.id)).toEqual(["c"]);
  });
});

describe("Showing the results", () => {
  test("heat level from how many are free", () => {
    expect(heatLevel(0, 4)).toBe(0);
    expect(heatLevel(1, 4)).toBe(1);
    expect(heatLevel(2, 4)).toBe(2);
    expect(heatLevel(3, 4)).toBe(3);
    expect(heatLevel(4, 4)).toBe(4);
    expect(heatLevel(1, 1)).toBe(4);
    expect(heatLevel(0, 0)).toBe(0);
    expect(heatLevel(3, 0)).toBe(0);
  });

  test("the grid runs 7:00 am to 11:00 pm in half hours", () => {
    expect(GRID_ROWS[0]).toBe(h(7));
    expect(GRID_ROWS.at(-1)).toBe(h(22, 30));
    expect(GRID_ROWS).toHaveLength(32);
  });

  test("which cells belong to a best window", () => {
    const w = [{ weekday: MON, start: h(10), end: h(11) }];
    expect(inWindow(w, MON, h(10))).toBe(true);
    expect(inWindow(w, MON, h(10, 30))).toBe(true);
    expect(inWindow(w, MON, h(11))).toBe(false);
    expect(inWindow(w, WED, h(10))).toBe(false);
  });

  test("window wording", () => {
    expect(formatWindow({ weekday: MON, start: h(18), end: h(19, 30) })).toBe(
      "Monday 6:00 PM – 7:30 PM",
    );
  });
});
