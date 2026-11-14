// Availability-overlap meeting scheduling: finds the times when most of a team is free.
// Pure functions only (no React, no network) so every rule can be unit tested.
import { DAY_END, STEP_MINUTES, formatMinute, isValidTimeZone, type Range } from "./profile-data";

export const DURATIONS = [30, 60, 90, 120] as const;
export const DEFAULT_DURATION = 60;
export const MAX_BEST_TIMES = 5;
/** Meetings are only suggested between these times, so nobody is offered 3 a.m. */
export const DAY_START_MINUTE = 7 * 60;
export const DAY_LAST_MINUTE = 23 * 60;
export const WEEK_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export type MemberAvailability = {
  id: string;
  name: string;
  /** The time zone the member's saved times are in (their profile's), if known. */
  timeZone?: string | null;
  ranges: Range[];
};

export type SlotRow = {
  user_id: string;
  weekday: number;
  start_minute: number;
  end_minute: number;
};

/** Groups the rows the database returns into one list per member, in the order of `people`. */
export function groupAvailability(
  rows: SlotRow[],
  people: { id: string; name: string; timeZone?: string | null }[],
): MemberAvailability[] {
  return people.map((p) => ({
    ...p,
    ranges: rows
      .filter((r) => r.user_id === p.id)
      .map((r) => ({ weekday: r.weekday, start: r.start_minute, end: r.end_minute })),
  }));
}

/* ------------------------------- Time zones ------------------------------- */

/** How many minutes `timeZone` is ahead of UTC at the given moment (can be negative). */
export function tzOffsetMinutes(timeZone: string, at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  return Math.round((asUtc - Math.floor(at.getTime() / 60000) * 60000) / 60000);
}

/**
 * Moves weekly free time from one time zone to another. A range that crosses midnight in the new zone is
 * split into two, and the weekday wraps around the week. The same zone (or an unknown one) changes nothing.
 */
export function shiftRanges(
  ranges: Range[],
  fromZone: string | null | undefined,
  toZone: string | null | undefined,
  at: Date = new Date(),
): Range[] {
  if (!fromZone || !toZone || fromZone === toZone) return ranges;
  if (!isValidTimeZone(fromZone) || !isValidTimeZone(toZone)) return ranges;
  const delta = tzOffsetMinutes(toZone, at) - tzOffsetMinutes(fromZone, at);
  if (delta === 0) return ranges;
  const week = 7 * DAY_END;
  const out: Range[] = [];
  for (const r of ranges) {
    let start = r.weekday * DAY_END + r.start + delta;
    const length = r.end - r.start;
    start = ((start % week) + week) % week;
    let remaining = length;
    let cursor = start;
    while (remaining > 0) {
      const day = Math.floor(cursor / DAY_END) % 7;
      const minute = cursor % DAY_END;
      const take = Math.min(remaining, DAY_END - minute);
      out.push({ weekday: day, start: minute, end: minute + take });
      remaining -= take;
      cursor = (cursor + take) % week;
    }
  }
  return out;
}

/** Everyone's free time, expressed in one viewer's time zone. */
export function inViewerZone(
  members: MemberAvailability[],
  viewerZone: string | null | undefined,
  at: Date = new Date(),
): MemberAvailability[] {
  return members.map((m) => ({ ...m, ranges: shiftRanges(m.ranges, m.timeZone, viewerZone, at) }));
}

/* --------------------------------- Free grid -------------------------------- */

/** Who is free in each half hour: key `${weekday}:${startMinute}`. */
export function freeByHalfHour(members: MemberAvailability[]): Map<string, Set<string>> {
  const grid = new Map<string, Set<string>>();
  for (const m of members) {
    for (const r of m.ranges) {
      for (let t = r.start; t + STEP_MINUTES <= r.end; t += STEP_MINUTES) {
        const key = `${r.weekday}:${t}`;
        const set = grid.get(key) ?? new Set<string>();
        set.add(m.id);
        grid.set(key, set);
      }
    }
  }
  return grid;
}

export const cellKey = (weekday: number, minute: number) => `${weekday}:${minute}`;

/* ---------------------------------- Best times ------------------------------- */

export type MeetingWindow = {
  weekday: number;
  /** The earliest the meeting can start and the latest it can end, all still inside the free time. */
  start: number;
  end: number;
  duration: number;
  freeIds: string[];
  missingIds: string[];
  everyone: boolean;
};

/**
 * The best times for a meeting of `duration` minutes.
 * A start time works for a person only if they are free for the whole meeting. Neighbouring start times with the
 * same people are joined into one window ("Tue 6-9 pm") so the list isn't full of near-duplicates.
 * Ranked by: most people free, then the longer window, then earlier in the week. At least two people must be free
 * (unless the team is just one person).
 */
export function bestMeetingTimes(
  members: MemberAvailability[],
  duration: number = DEFAULT_DURATION,
  limit: number = MAX_BEST_TIMES,
  opts: { requiredIds?: string[] } = {},
): MeetingWindow[] {
  const dur = Math.max(STEP_MINUTES, Math.ceil(duration / STEP_MINUTES) * STEP_MINUTES);
  const grid = freeByHalfHour(members);
  const all = members.map((m) => m.id);
  const needed = Math.max(1, Math.min(2, all.length));
  const required = (opts.requiredIds ?? []).filter((id) => all.includes(id));

  type Start = { t: number; ids: string[] };
  const out: MeetingWindow[] = [];
  for (let weekday = 0; weekday < 7; weekday++) {
    const starts: Start[] = [];
    for (let t = DAY_START_MINUTE; t + dur <= DAY_LAST_MINUTE; t += STEP_MINUTES) {
      let ids: string[] | null = null;
      for (let s = t; s < t + dur; s += STEP_MINUTES) {
        const here = grid.get(cellKey(weekday, s));
        if (!here) {
          ids = [];
          break;
        }
        ids = ids === null ? [...here] : ids.filter((id) => here.has(id));
        if (!ids.length) break;
      }
      ids = (ids ?? []).sort();
      if (ids.length >= needed && required.every((id) => ids!.includes(id)))
        starts.push({ t, ids });
    }
    // Join neighbouring start times that have exactly the same people free.
    let i = 0;
    while (i < starts.length) {
      let j = i;
      while (
        j + 1 < starts.length &&
        starts[j + 1]!.t === starts[j]!.t + STEP_MINUTES &&
        starts[j + 1]!.ids.join() === starts[i]!.ids.join()
      )
        j++;
      const ids = starts[i]!.ids;
      out.push({
        weekday,
        start: starts[i]!.t,
        end: starts[j]!.t + dur,
        duration: dur,
        freeIds: ids,
        missingIds: all.filter((id) => !ids.includes(id)),
        everyone: ids.length === all.length,
      });
      i = j + 1;
    }
  }
  return out
    .sort(
      (a, b) =>
        b.freeIds.length - a.freeIds.length ||
        b.end - b.start - (a.end - a.start) ||
        a.weekday - b.weekday ||
        a.start - b.start,
    )
    .slice(0, limit);
}

/** Members with no free time marked at all. */
export function membersWithoutAvailability(members: MemberAvailability[]): MemberAvailability[] {
  return members.filter((m) => m.ranges.length === 0);
}

/** Total hours a member is free in a week (0.5 hour steps). */
export function freeHours(ranges: Range[]): number {
  const grid = freeByHalfHour([{ id: "x", name: "x", ranges }]);
  return grid.size / 2;
}

/* ------------------------------- Showing times ------------------------------ */

export function formatWindow(w: Pick<MeetingWindow, "weekday" | "start" | "end">): string {
  return `${WEEK_DAYS[w.weekday] ?? ""} ${formatMinute(w.start)} – ${formatMinute(w.end)}`;
}

/** The first half-hour row shown in the grid, and the last, for one day. */
export const GRID_ROWS: number[] = (() => {
  const rows: number[] = [];
  for (let t = DAY_START_MINUTE; t < DAY_LAST_MINUTE; t += STEP_MINUTES) rows.push(t);
  return rows;
})();

/** How strongly to color a cell: 0 (nobody) to 4 (everyone). */
export function heatLevel(free: number, total: number): 0 | 1 | 2 | 3 | 4 {
  if (free <= 0 || total <= 0) return 0;
  const ratio = free / total;
  if (ratio >= 1) return 4;
  if (ratio >= 0.67) return 3;
  if (ratio >= 0.34) return 2;
  return 1;
}

/** Is this half hour part of any of the best windows? */
export function inWindow(
  windows: Pick<MeetingWindow, "weekday" | "start" | "end">[],
  weekday: number,
  minute: number,
): boolean {
  return windows.some((w) => w.weekday === weekday && minute >= w.start && minute < w.end);
}
