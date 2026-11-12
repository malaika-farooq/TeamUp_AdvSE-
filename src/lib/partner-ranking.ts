// Pure rules for individual study-partner matching and group-session planning.
// Kept separate from the backend so they can be unit tested.

export const MAX_PARTNER_SUGGESTIONS = 5;
export const MAX_SESSION_PROPOSALS = 3;
const SESSION_MINUTES = 90;
const MIN_SESSION_MINUTES = 30;

export type Workload = { openTasks: number; dueSoon: number; sessionsWeek: number };
export type WorkloadLevel = "light" | "moderate" | "heavy";

/** Tasks due soon and booked sessions weigh more than a long backlog. */
export function workloadScore(w: Workload): number {
  return w.openTasks + w.dueSoon * 2 + w.sessionsWeek;
}

export function workloadLevel(w: Workload): WorkloadLevel {
  const s = workloadScore(w);
  return s <= 3 ? "light" : s <= 8 ? "moderate" : "heavy";
}

const PENALTY: Record<WorkloadLevel, number> = { light: 0, moderate: 1, heavy: 2.5 };

export type PartnerFacts = {
  id: string;
  name: string;
  sharedCourses: string[];
  /** Skills they have that I don't. */
  newSkills: string[];
  /** Skills I asked for that they have. */
  wantedSkills: string[];
  overlapMinutes: number;
  /** Minutes they are free inside the times the student asked for (0 when no times were requested). */
  windowMinutes?: number;
  workload: Workload;
};

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const TIME_BLOCKS = [
  { label: "Morning", start: 8 * 60, end: 12 * 60 },
  { label: "Afternoon", start: 12 * 60, end: 17 * 60 },
  { label: "Evening", start: 17 * 60, end: 22 * 60 },
];
/** A candidate must be free for at least this long inside the requested times to count. */
export const MIN_WINDOW_MINUTES = 60;

/** Matches come from shared courses, complementary skills and free time; a heavy workload costs points. */
export function matchScore(p: PartnerFacts): number {
  return (
    p.sharedCourses.length * 3 +
    p.newSkills.length * 1.5 +
    p.wantedSkills.length * 5 +
    p.overlapMinutes / 120 +
    (p.windowMinutes ?? 0) / 60
  );
}

export function scorePartner(p: PartnerFacts): number {
  return matchScore(p) - PENALTY[workloadLevel(p.workload)];
}

/** Drops anyone with no positive match (workload alone never makes a match), then ranks the rest. */
export function rankPartners<T extends PartnerFacts>(
  people: T[],
  limit = MAX_PARTNER_SUGGESTIONS,
  opts: { requireWanted?: boolean; requireWindow?: boolean; avoidHeavy?: boolean } = {},
): (T & { score: number; level: WorkloadLevel })[] {
  return people
    .filter((p) => matchScore(p) > 0)
    .filter((p) => !opts.requireWanted || p.wantedSkills.length > 0)
    .filter((p) => !opts.requireWindow || (p.windowMinutes ?? 0) >= MIN_WINDOW_MINUTES)
    .filter((p) => !opts.avoidHeavy || workloadLevel(p.workload) !== "heavy")
    .map((p) => ({ ...p, score: scorePartner(p), level: workloadLevel(p.workload) }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);
}

/** Plain, fact-only reason used when the AI leaves one out. Never mentions a heavy workload or gaps. */
export function partnerReason(
  p: Pick<PartnerFacts, "sharedCourses" | "newSkills" | "wantedSkills" | "overlapMinutes" | "windowMinutes"> & {
    level: WorkloadLevel;
  },
): string {
  const parts: string[] = [];
  if (p.wantedSkills.length) parts.push(`has the ${p.wantedSkills.slice(0, 3).join(", ")} skills you asked for`);
  if ((p.windowMinutes ?? 0) >= MIN_WINDOW_MINUTES) parts.push("is free at the times you asked for");
  if (p.sharedCourses.length) parts.push(`takes ${p.sharedCourses.slice(0, 2).join(" and ")} with you`);
  if (p.newSkills.length) parts.push(`adds ${p.newSkills.slice(0, 3).join(", ")}`);
  const h = Math.round((p.overlapMinutes / 60) * 2) / 2;
  if (h > 0) parts.push(`shares about ${h} h/week of free time`);
  if (p.level !== "heavy") parts.push(`has a ${p.level} workload right now`);
  if (!parts.length) return "";
  const text = parts.join("; ");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

export type FreeWindow = { weekday: number; start_minute: number; end_minute: number; free_count: number };
export type SessionSlot = { weekday: number; startMinute: number; endMinute: number; freeCount: number };

/** Best windows first: more people free, then longer. Each proposal is at most 90 minutes. */
export function pickSessionSlots(windows: FreeWindow[], limit = MAX_SESSION_PROPOSALS): SessionSlot[] {
  return windows
    .filter((w) => w.end_minute - w.start_minute >= MIN_SESSION_MINUTES)
    .sort(
      (a, b) =>
        b.free_count - a.free_count ||
        b.end_minute - b.start_minute - (a.end_minute - a.start_minute) ||
        a.weekday - b.weekday ||
        a.start_minute - b.start_minute,
    )
    .slice(0, limit)
    .map((w) => ({
      weekday: w.weekday,
      startMinute: w.start_minute,
      endMinute: Math.min(w.end_minute, w.start_minute + SESSION_MINUTES),
      freeCount: w.free_count,
    }));
}

/** The next calendar date (local time) that falls on `weekday` at `minute`, strictly after `from`. */
export function nextOccurrence(weekday: number, minute: number, from: Date = new Date()): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(minute);
  let add = (weekday - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + add);
  if (d.getTime() <= from.getTime()) {
    add = 7;
    d.setDate(d.getDate() + add);
  }
  return d;
}
