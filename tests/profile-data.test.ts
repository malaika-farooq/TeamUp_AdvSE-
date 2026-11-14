import { describe, expect, test } from "bun:test";
import {
  addCourses,
  addRange,
  addSkills,
  avatarPath,
  checkAvatarFile,
  checkRange,
  clampLevel,
  courseKey,
  courseLabel,
  covers,
  formatMinute,
  formatRange,
  initialsOf,
  mergeRanges,
  parseCourse,
  profileCompleteness,
  rangesFromRows,
  removeRange,
  splitList,
  subtractRange,
  timeOptions,
  toggleBlock,
  totalHours,
} from "../src/lib/profile-data";

describe("courses", () => {
  test("splits a code from the title", () => {
    expect(parseCourse("CS101 Intro to Programming")).toEqual({
      code: "CS101",
      title: "Intro to Programming",
    });
  });
  test("handles a spaced, lower-case code and a dash", () => {
    expect(parseCourse("math 201 - Linear Algebra")).toEqual({
      code: "MATH201",
      title: "Linear Algebra",
    });
    expect(parseCourse("CS-101: Data Structures")).toEqual({
      code: "CS101",
      title: "Data Structures",
    });
  });
  test("a bare code uses itself as the title", () => {
    expect(parseCourse("PHYS150")).toEqual({ code: "PHYS150", title: "PHYS150" });
  });
  test("a plain name has no code", () => {
    expect(parseCourse("Linear Algebra")).toEqual({ code: "", title: "Linear Algebra" });
    expect(parseCourse("Math")).toEqual({ code: "", title: "Math" });
  });
  test("does not mistake a word with trailing letters for a code", () => {
    expect(parseCourse("Intro 2 Python")).toEqual({ code: "", title: "Intro 2 Python" });
  });
  test("empty input is ignored", () => {
    expect(parseCourse("   ")).toBeNull();
  });
  test("labels read well", () => {
    expect(courseLabel({ code: "CS101", title: "Intro" })).toBe("CS101 · Intro");
    expect(courseLabel({ code: "Math", title: "math" })).toBe("math");
    expect(courseLabel({ code: "", title: "Math" })).toBe("Math");
  });
  test("adding is case-insensitive and skips duplicates", () => {
    const list = addCourses([], "CS101 Intro, cs101 INTRO, MATH210 Linear Algebra,  ");
    expect(list.map((c) => c.code)).toEqual(["CS101", "MATH210"]);
    expect(addCourses(list, "cs101 intro")).toHaveLength(2);
  });
  test("key ignores case and falls back to the title", () => {
    expect(courseKey({ code: "", title: "Math" })).toBe(courseKey({ code: "MATH", title: "math" }));
  });
  test("caps the list at 30", () => {
    const many = Array.from({ length: 40 }, (_, i) => `Course Number ${i}`).join(",");
    expect(addCourses([], many)).toHaveLength(30);
  });
});

describe("skills", () => {
  test("splitList trims and de-duplicates case-insensitively", () => {
    expect(splitList("Python, python ;  SQL\n sql,, React")).toEqual(["Python", "SQL", "React"]);
  });
  test("adds new skills at a level and skips existing", () => {
    const list = addSkills([{ name: "Python", level: 5 }], "python, React", 4);
    expect(list).toEqual([
      { name: "Python", level: 5 },
      { name: "React", level: 4 },
    ]);
  });
  test("ignores over-long names", () => {
    expect(addSkills([], "x".repeat(41))).toEqual([]);
  });
  test("clamps levels", () => {
    expect(clampLevel(9)).toBe(5);
    expect(clampLevel(0)).toBe(1);
    expect(clampLevel(2.6)).toBe(3);
    expect(clampLevel(Number.NaN)).toBe(3);
  });
});

describe("weekly availability", () => {
  const morning = { start: 8 * 60, end: 12 * 60 };
  test("merges overlapping and touching ranges per day", () => {
    const merged = mergeRanges([
      { weekday: 1, start: 540, end: 600 },
      { weekday: 1, start: 600, end: 660 },
      { weekday: 1, start: 630, end: 720 },
      { weekday: 2, start: 540, end: 600 },
    ]);
    expect(merged).toEqual([
      { weekday: 1, start: 540, end: 720 },
      { weekday: 2, start: 540, end: 600 },
    ]);
  });
  test("subtracting from the middle splits a range", () => {
    expect(subtractRange([{ weekday: 1, start: 480, end: 720 }], 1, 540, 600)).toEqual([
      { weekday: 1, start: 480, end: 540 },
      { weekday: 1, start: 600, end: 720 },
    ]);
  });
  test("subtracting other days or non-overlapping times changes nothing", () => {
    const r = [{ weekday: 1, start: 480, end: 720 }];
    expect(subtractRange(r, 2, 480, 720)).toEqual(r);
    expect(subtractRange(r, 1, 720, 800)).toEqual(r);
  });
  test("toggling a block turns it on, then off", () => {
    const on = toggleBlock([], 3, morning.start, morning.end);
    expect(on).toEqual([{ weekday: 3, start: 480, end: 720 }]);
    expect(covers(on, 3, morning.start, morning.end)).toBe(true);
    expect(toggleBlock(on, 3, morning.start, morning.end)).toEqual([]);
  });
  test("a block inside a longer custom range turns off just that part", () => {
    const custom = [{ weekday: 3, start: 420, end: 780 }]; // 7:00-13:00
    expect(toggleBlock(custom, 3, 480, 720)).toEqual([
      { weekday: 3, start: 420, end: 480 },
      { weekday: 3, start: 720, end: 780 },
    ]);
  });
  test("a partly covered block is completed, not removed", () => {
    const part = [{ weekday: 3, start: 480, end: 600 }];
    expect(toggleBlock(part, 3, 480, 720)).toEqual([{ weekday: 3, start: 480, end: 720 }]);
  });
  test("range validation", () => {
    expect(checkRange(540, 600)).toEqual({ ok: true });
    expect(checkRange(600, 600).ok).toBe(false);
    expect(checkRange(700, 600).ok).toBe(false);
    expect(checkRange(545, 600).ok).toBe(false);
    expect(checkRange(0, 1500).ok).toBe(false);
    expect(checkRange(-30, 60).ok).toBe(false);
    expect(checkRange(0, 1440)).toEqual({ ok: true });
  });
  test("adding and removing a custom range", () => {
    const list = addRange([{ weekday: 1, start: 480, end: 540 }], 1, 540, 600);
    expect(list).toEqual([{ weekday: 1, start: 480, end: 600 }]);
    expect(removeRange(list, { weekday: 1, start: 480, end: 600 })).toEqual([]);
  });
  test("formats times", () => {
    expect(formatMinute(0)).toBe("12:00 AM");
    expect(formatMinute(540)).toBe("9:00 AM");
    expect(formatMinute(750)).toBe("12:30 PM");
    expect(formatMinute(1320)).toBe("10:00 PM");
    expect(formatMinute(1440)).toBe("12:00 AM");
    expect(formatRange({ start: 540, end: 720 })).toBe("9:00 AM – 12:00 PM");
  });
  test("totals hours without double counting overlaps", () => {
    expect(
      totalHours([
        { weekday: 1, start: 480, end: 720 },
        { weekday: 1, start: 600, end: 780 },
      ]),
    ).toBe(5);
  });
  test("converts database rows", () => {
    expect(rangesFromRows([{ weekday: 2, start_minute: 480, end_minute: 720 }])).toEqual([
      { weekday: 2, start: 480, end: 720 },
    ]);
  });
  test("time options run from midnight to midnight in half hours", () => {
    const opts = timeOptions();
    expect(opts[0]).toEqual({ value: 0, label: "12:00 AM" });
    expect(opts).toHaveLength(49);
    expect(opts[opts.length - 1]?.value).toBe(1440);
  });
});

describe("profile photo", () => {
  test("accepts normal images and rejects others", () => {
    expect(checkAvatarFile({ type: "image/png", size: 1000 })).toEqual({ ok: true });
    expect(checkAvatarFile({ type: "application/pdf", size: 1000 }).ok).toBe(false);
    expect(checkAvatarFile({ type: "image/svg+xml", size: 1000 }).ok).toBe(false);
    expect(checkAvatarFile({ type: "image/png", size: 3 * 1024 * 1024 }).ok).toBe(false);
    expect(checkAvatarFile({ type: "image/png", size: 0 }).ok).toBe(false);
  });
  test("path stays inside the user's folder with a safe name", () => {
    expect(avatarPath("u1", "My Photo (1).JPEG", 5)).toBe("u1/avatar-5.jpg");
    expect(avatarPath("u1", "../../x.png", 7)).toBe("u1/avatar-7.png");
    expect(avatarPath("u1", "noext", 9)).toBe("u1/avatar-9.jpg");
  });
  test("initials", () => {
    expect(initialsOf("Zara Khan")).toBe("ZK");
    expect(initialsOf("liam")).toBe("LI");
    expect(initialsOf("  ")).toBe("S");
    expect(initialsOf(null, "ab")).toBe("AB");
    expect(initialsOf("Mary Jane Watson")).toBe("MW");
  });
});

describe("profile completeness", () => {
  const empty = {
    hasPhoto: false,
    university: "",
    major: null,
    bio: undefined,
    courseCount: 0,
    skillCount: 0,
    availableMinutes: 0,
  };
  test("empty profile is 0% and lists everything", () => {
    const c = profileCompleteness(empty);
    expect(c.percent).toBe(0);
    expect(c.missing).toHaveLength(7);
  });
  test("full profile is 100%", () => {
    const c = profileCompleteness({
      hasPhoto: true,
      university: "UBC",
      major: "CS",
      bio: "Hi",
      courseCount: 3,
      skillCount: 4,
      availableMinutes: 600,
    });
    expect(c).toEqual({ percent: 100, missing: [] });
  });
  test("very little free time does not count", () => {
    expect(profileCompleteness({ ...empty, availableMinutes: 60 }).missing).toContain(
      "Mark when you are free each week",
    );
  });
  test("partial progress", () => {
    const c = profileCompleteness({ ...empty, courseCount: 1, skillCount: 1 });
    expect(c.percent).toBe(29);
  });
});

import {
  PROFILE_LIMITS,
  isValidTimeZone,
  validateProfile,
  type ProfileForm,
} from "../src/lib/profile-data";

describe("profile form validation", () => {
  const form = (over: Partial<ProfileForm> = {}): ProfileForm => ({
    display_name: "Maya Chen",
    university: "Northbridge University",
    major: "Computer Science",
    bio: "Loves databases.",
    timezone: "America/Toronto",
    discoverable: true,
    ...over,
  });
  const ok = (over: Partial<ProfileForm> = {}) => {
    const r = validateProfile(form(over));
    if (!r.ok) throw new Error(r.error);
    return r.value;
  };
  const error = (over: Partial<ProfileForm> = {}) => {
    const r = validateProfile(form(over));
    return r.ok ? null : r.error;
  };

  test("accepts a complete profile unchanged", () => {
    expect(ok()).toEqual({
      display_name: "Maya Chen",
      university: "Northbridge University",
      major: "Computer Science",
      bio: "Loves databases.",
      timezone: "America/Toronto",
      discoverable: true,
    });
  });

  test("tidies spaces in names, university and major", () => {
    const v = ok({
      display_name: "  Maya    Chen ",
      university: " UBC  ",
      major: "Data   Science",
    });
    expect(v.display_name).toBe("Maya Chen");
    expect(v.university).toBe("UBC");
    expect(v.major).toBe("Data Science");
  });

  test("blank optional fields become null", () => {
    const v = ok({ university: "  ", major: "", bio: "\n  " });
    expect(v).toMatchObject({ university: null, major: null, bio: null });
  });

  test("keeps line breaks inside a bio", () => {
    expect(ok({ bio: "Line one\nLine two" }).bio).toBe("Line one\nLine two");
  });

  test("a name is required", () => {
    expect(error({ display_name: "   " })).toBe("Please enter your name.");
    expect(error({ display_name: "" })).toBe("Please enter your name.");
  });

  test("enforces the length limits", () => {
    expect(error({ display_name: "x".repeat(PROFILE_LIMITS.name + 1) })).toContain("name");
    expect(error({ university: "x".repeat(PROFILE_LIMITS.university + 1) })).toContain(
      "University",
    );
    expect(error({ major: "x".repeat(PROFILE_LIMITS.major + 1) })).toContain("Major");
    expect(error({ bio: "x".repeat(PROFILE_LIMITS.bio + 1) })).toContain("bio");
    expect(error({ bio: "x".repeat(PROFILE_LIMITS.bio) })).toBeNull();
  });

  test("an empty time zone means UTC", () => {
    expect(ok({ timezone: "" }).timezone).toBe("UTC");
    expect(ok({ timezone: "   " }).timezone).toBe("UTC");
  });

  test("rejects a time zone that doesn't exist", () => {
    expect(error({ timezone: "Mars/Olympus" })).toContain("time zone");
    expect(error({ timezone: "not a zone" })).toContain("time zone");
  });

  test("recognises real time zones", () => {
    for (const z of ["UTC", "America/Toronto", "Europe/London", "Asia/Tokyo", "Australia/Sydney"]) {
      expect(isValidTimeZone(z)).toBe(true);
    }
    expect(isValidTimeZone("Nope/Nowhere")).toBe(false);
  });

  test("passes the Discover choice through", () => {
    expect(ok({ discoverable: false }).discoverable).toBe(false);
  });
});
