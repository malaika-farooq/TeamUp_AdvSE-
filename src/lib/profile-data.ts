// Pure helpers for the student profile: enrolled courses, skills, weekly availability, photo checks
// and profile completeness. No React, no network, so the rules are easy to test.
import { DAY_LABELS, TIME_BLOCKS } from "./partner-ranking";

export { DAY_LABELS, TIME_BLOCKS };

/* --------------------------------- Lists ---------------------------------- */

export const MAX_COURSES = 30;
export const MAX_SKILLS = 40;
export const MAX_SKILL_LENGTH = 40;

/** Collapses runs of whitespace and trims. */
export function tidy(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** Case-insensitive identity used to avoid duplicates ("python" and " Python " are the same). */
export function keyOf(text: string): string {
  return tidy(text).toLowerCase();
}

/** Splits "a, b; c\nd" into trimmed, de-duplicated entries (first spelling wins). */
export function splitList(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of text.split(/[,;\n]/)) {
    const value = tidy(raw);
    const key = value.toLowerCase();
    if (!value || seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

/* --------------------------------- Courses -------------------------------- */

export type CourseInput = { code: string; title: string };

/**
 * Turns what a student types into a course.
 *   "CS101 Intro to Programming" -> CS101 / Intro to Programming
 *   "math 201 - Linear Algebra"  -> MATH201 / Linear Algebra
 *   "Linear Algebra"             -> no code (code stays empty; the database then reuses the title)
 * Returns null for empty input.
 */
export function parseCourse(input: string): CourseInput | null {
  const text = tidy(input);
  if (!text) return null;
  const match = /^([A-Za-z]{2,8})[ -]?(\d{2,4}[A-Za-z]?)(?![\w])\s*[-:–—]?\s*(.*)$/.exec(text);
  if (!match) return { code: "", title: text };
  const code = `${match[1]}${match[2]}`.toUpperCase();
  const title = tidy(match[3] ?? "");
  return { code, title: title || code };
}

export function courseKey(c: CourseInput): string {
  const title = keyOf(c.title);
  const code = keyOf(c.code) || title;
  return `${code}|${title}`;
}

/** How a course is shown: "CS101 · Intro to Programming", or just the title when there is no code. */
export function courseLabel(c: CourseInput): string {
  const code = tidy(c.code);
  const title = tidy(c.title);
  if (!code || keyOf(code) === keyOf(title)) return title;
  return `${code} · ${title}`;
}

/** Adds courses typed as free text (comma-separated); skips ones already in the list. */
export function addCourses(current: CourseInput[], typed: string): CourseInput[] {
  const next = [...current];
  const seen = new Set(next.map(courseKey));
  for (const part of typed.split(/[,;\n]/)) {
    const course = parseCourse(part);
    if (!course) continue;
    const key = courseKey(course);
    if (seen.has(key)) continue;
    seen.add(key);
    next.push(course);
  }
  return next.slice(0, MAX_COURSES);
}

/* --------------------------------- Skills --------------------------------- */

export type SkillInput = { name: string; level: number };

export const SKILL_LEVELS = [
  { value: 1, label: "Beginner" },
  { value: 2, label: "Basic" },
  { value: 3, label: "Comfortable" },
  { value: 4, label: "Strong" },
  { value: 5, label: "Expert" },
];

export function clampLevel(value: number): number {
  if (!Number.isFinite(value)) return 3;
  return Math.min(5, Math.max(1, Math.round(value)));
}

/** Adds skills typed as free text (comma-separated) at the default level; skips duplicates. */
export function addSkills(current: SkillInput[], typed: string, level = 3): SkillInput[] {
  const next = [...current];
  const seen = new Set(next.map((s) => keyOf(s.name)));
  for (const name of splitList(typed)) {
    if (name.length > MAX_SKILL_LENGTH) continue;
    const key = keyOf(name);
    if (seen.has(key)) continue;
    seen.add(key);
    next.push({ name, level: clampLevel(level) });
  }
  return next.slice(0, MAX_SKILLS);
}

/* ------------------------------ Availability ------------------------------ */

export type Range = { weekday: number; start: number; end: number };

export const STEP_MINUTES = 30;
export const DAY_END = 24 * 60;

/** Sorts and merges overlapping or touching ranges on the same weekday. */
export function mergeRanges(ranges: Range[]): Range[] {
  const sorted = ranges
    .filter((r) => r.end > r.start)
    .map((r) => ({ ...r }))
    .sort((a, b) => a.weekday - b.weekday || a.start - b.start);
  const out: Range[] = [];
  for (const r of sorted) {
    const last = out[out.length - 1];
    if (last && last.weekday === r.weekday && r.start <= last.end) {
      last.end = Math.max(last.end, r.end);
    } else {
      out.push(r);
    }
  }
  return out;
}

/** Removes the interval [start, end) from every range on that weekday. */
export function subtractRange(
  ranges: Range[],
  weekday: number,
  start: number,
  end: number,
): Range[] {
  const out: Range[] = [];
  for (const r of ranges) {
    if (r.weekday !== weekday || r.end <= start || r.start >= end) {
      out.push(r);
      continue;
    }
    if (r.start < start) out.push({ weekday, start: r.start, end: start });
    if (r.end > end) out.push({ weekday, start: end, end: r.end });
  }
  return out;
}

/** True when the whole interval is free. */
export function covers(ranges: Range[], weekday: number, start: number, end: number): boolean {
  return mergeRanges(ranges).some((r) => r.weekday === weekday && r.start <= start && r.end >= end);
}

/** Turns a time block (e.g. Morning) on or off for a day. */
export function toggleBlock(ranges: Range[], weekday: number, start: number, end: number): Range[] {
  if (covers(ranges, weekday, start, end))
    return mergeRanges(subtractRange(ranges, weekday, start, end));
  return mergeRanges([...ranges, { weekday, start, end }]);
}

export type RangeCheck = { ok: true } | { ok: false; reason: string };

/** Checks a custom time range typed or picked by the student. */
export function checkRange(start: number, end: number): RangeCheck {
  if (!Number.isInteger(start) || !Number.isInteger(end))
    return { ok: false, reason: "Pick a start and an end time." };
  if (start < 0 || end > DAY_END) return { ok: false, reason: "Times must be within one day." };
  if (end <= start) return { ok: false, reason: "The end time must be after the start time." };
  if (start % STEP_MINUTES !== 0 || end % STEP_MINUTES !== 0) {
    return { ok: false, reason: "Times must be on the hour or half hour." };
  }
  return { ok: true };
}

export function addRange(ranges: Range[], weekday: number, start: number, end: number): Range[] {
  return mergeRanges([...ranges, { weekday, start, end }]);
}

export function removeRange(ranges: Range[], target: Range): Range[] {
  return ranges.filter(
    (r) => !(r.weekday === target.weekday && r.start === target.start && r.end === target.end),
  );
}

/** "9:00 AM", "12:30 PM", "12:00 AM" (and 1440 shows as midnight). */
export function formatMinute(minute: number): string {
  const total = minute % DAY_END;
  const h = Math.floor(total / 60);
  const m = total % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatRange(r: { start: number; end: number }): string {
  return `${formatMinute(r.start)} – ${formatMinute(r.end)}`;
}

export function totalHours(ranges: Range[]): number {
  const minutes = mergeRanges(ranges).reduce((sum, r) => sum + (r.end - r.start), 0);
  return Math.round((minutes / 60) * 10) / 10;
}

/** Every 30-minute time of day as a picker option (00:00 up to and including 24:00). */
export function timeOptions(): { value: number; label: string }[] {
  const out: { value: number; label: string }[] = [];
  for (let m = 0; m <= DAY_END; m += STEP_MINUTES) out.push({ value: m, label: formatMinute(m) });
  return out;
}

/** Rows as stored in the database -> ranges. */
export function rangesFromRows(
  rows: { weekday: number; start_minute: number; end_minute: number }[],
): Range[] {
  return mergeRanges(
    rows.map((r) => ({ weekday: r.weekday, start: r.start_minute, end: r.end_minute })),
  );
}

/* --------------------------------- Photo ---------------------------------- */

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function checkAvatarFile(file: { type: string; size: number }): RangeCheck {
  if (!AVATAR_TYPES.includes(file.type)) {
    return { ok: false, reason: "Use a JPG, PNG, WebP or GIF image." };
  }
  if (file.size > AVATAR_MAX_BYTES)
    return { ok: false, reason: "The photo must be 2 MB or smaller." };
  if (file.size === 0) return { ok: false, reason: "That file is empty." };
  return { ok: true };
}

/** A safe storage path under the user's own folder. */
export function avatarPath(userId: string, fileName: string, now = Date.now()): string {
  const ext = /\.(jpe?g|png|webp|gif)$/i.exec(fileName)?.[1]?.toLowerCase() ?? "jpg";
  return `${userId}/avatar-${now}.${ext === "jpeg" ? "jpg" : ext}`;
}

export function initialsOf(name: string | null | undefined, fallback = "S"): string {
  const parts = tidy(name ?? "")
    .split(" ")
    .filter(Boolean);
  if (!parts.length) return fallback.slice(0, 2).toUpperCase();
  const first = parts[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1] ?? "") : "";
  return ((first[0] ?? "") + (last[0] ?? first[1] ?? "")).toUpperCase();
}

/* ------------------------------ Completeness ------------------------------ */

export type ProfileFacts = {
  hasPhoto: boolean;
  university: string | null | undefined;
  major: string | null | undefined;
  bio: string | null | undefined;
  courseCount: number;
  skillCount: number;
  availableMinutes: number;
};

export type Completeness = { percent: number; missing: string[] };

export function profileCompleteness(f: ProfileFacts): Completeness {
  const checks: [boolean, string][] = [
    [f.hasPhoto, "Add a profile photo"],
    [!!tidy(f.university ?? ""), "Add your university"],
    [!!tidy(f.major ?? ""), "Add your major"],
    [!!tidy(f.bio ?? ""), "Write a short bio"],
    [f.courseCount > 0, "Add your enrolled courses"],
    [f.skillCount > 0, "Add your skills"],
    [f.availableMinutes >= 120, "Mark when you are free each week"],
  ];
  const done = checks.filter(([ok]) => ok).length;
  return {
    percent: Math.round((done / checks.length) * 100),
    missing: checks.filter(([ok]) => !ok).map(([, label]) => label),
  };
}

/* ------------------------------ Profile form ------------------------------ */

export const PROFILE_LIMITS = { name: 80, university: 120, major: 120, bio: 500 } as const;

export type ProfileForm = {
  display_name: string;
  university: string;
  major: string;
  bio: string;
  timezone: string;
  discoverable: boolean;
};

export type CleanProfile = {
  display_name: string;
  university: string | null;
  major: string | null;
  bio: string | null;
  timezone: string;
  discoverable: boolean;
};

/** True for a real IANA time zone such as "America/Toronto" or "UTC". */
export function isValidTimeZone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

/** Checks and tidies the profile form before it is saved. Blank optional fields become null. */
export function validateProfile(
  form: ProfileForm,
): { ok: true; value: CleanProfile } | { ok: false; error: string } {
  const name = tidy(form.display_name);
  if (!name) return { ok: false, error: "Please enter your name." };
  if (name.length > PROFILE_LIMITS.name) {
    return { ok: false, error: `Your name can be at most ${PROFILE_LIMITS.name} characters.` };
  }
  const university = tidy(form.university);
  if (university.length > PROFILE_LIMITS.university) {
    return {
      ok: false,
      error: `University can be at most ${PROFILE_LIMITS.university} characters.`,
    };
  }
  const major = tidy(form.major);
  if (major.length > PROFILE_LIMITS.major) {
    return { ok: false, error: `Major can be at most ${PROFILE_LIMITS.major} characters.` };
  }
  const bio = form.bio.trim();
  if (bio.length > PROFILE_LIMITS.bio) {
    return { ok: false, error: `Your bio can be at most ${PROFILE_LIMITS.bio} characters.` };
  }
  const timezone = form.timezone.trim() || "UTC";
  if (!isValidTimeZone(timezone)) {
    return {
      ok: false,
      error: "That time zone isn't recognised. Try something like America/Toronto.",
    };
  }
  return {
    ok: true,
    value: {
      display_name: name,
      university: university || null,
      major: major || null,
      bio: bio || null,
      timezone,
      discoverable: form.discoverable,
    },
  };
}
