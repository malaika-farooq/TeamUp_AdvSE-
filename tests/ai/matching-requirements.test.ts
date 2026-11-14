// The four things AI Teammate Matching must weigh: profile, skills, availability and academic workload.
import { describe, expect, test } from "bun:test";
import {
  MAX_PARTNER_SUGGESTIONS,
  MAX_SESSION_PROPOSALS,
  MIN_WINDOW_MINUTES,
  TIME_BLOCKS,
  matchScore,
  nextOccurrence,
  partnerReason,
  pickSessionSlots,
  rankPartners,
  scorePartner,
  workloadLevel,
  workloadScore,
  type PartnerFacts,
} from "../../src/lib/partner-ranking";
import { matchWantedSkills } from "../../src/lib/teammate-ranking";
import { readableError } from "../../src/lib/ai-client";

const none = { openTasks: 0, dueSoon: 0, sessionsWeek: 0 };
const who = (id: string, over: Partial<PartnerFacts> = {}): PartnerFacts => ({
  id,
  name: id,
  sharedCourses: [],
  newSkills: [],
  wantedSkills: [],
  overlapMinutes: 0,
  workload: none,
  ...over,
});
const ids = (list: { id: string }[]) => list.map((x) => x.id);

describe("Matching on the profile (courses)", () => {
  test("a shared course is enough to be suggested", () => {
    expect(ids(rankPartners([who("a", { sharedCourses: ["CS201"] })]))).toEqual(["a"]);
  });
  test("more shared courses rank higher", () => {
    const out = rankPartners([
      who("one", { sharedCourses: ["CS201"] }),
      who("two", { sharedCourses: ["CS201", "MATH210"] }),
    ]);
    expect(ids(out)).toEqual(["two", "one"]);
  });
  test("nothing in common means not suggested at all", () => {
    expect(rankPartners([who("stranger")])).toEqual([]);
  });
});

describe("Matching on skills", () => {
  test("a skill the student asked for outweighs a shared course", () => {
    const out = rankPartners([
      who("course", { sharedCourses: ["CS201"] }),
      who("skill", { wantedSkills: ["SQL"] }),
    ]);
    expect(ids(out)).toEqual(["skill", "course"]);
  });
  test("skills the student lacks add to the score", () => {
    const out = rankPartners([
      who("plain", { sharedCourses: ["CS201"] }),
      who("skilled", { sharedCourses: ["CS201"], newSkills: ["Python", "Figma"] }),
    ]);
    expect(ids(out)).toEqual(["skilled", "plain"]);
  });
  test("asking for a skill removes everyone who doesn't have it", () => {
    const out = rankPartners(
      [who("has", { wantedSkills: ["SQL"] }), who("lacks", { sharedCourses: ["CS201"] })],
      5,
      { requireWanted: true },
    );
    expect(ids(out)).toEqual(["has"]);
  });
  test("skill words match loosely (case and spacing) but not unrelated skills", () => {
    expect(matchWantedSkills(["SQL", "Public Speaking"], ["sql", "public speaking"])).toEqual([
      "SQL",
      "Public Speaking",
    ]);
    expect(matchWantedSkills(["React"], ["Python"])).toEqual([]);
  });
});

describe("Matching on availability", () => {
  test("shared free hours alone can create a match, and more hours rank higher", () => {
    const out = rankPartners([
      who("little", { overlapMinutes: 120 }),
      who("lots", { overlapMinutes: 600 }),
    ]);
    expect(ids(out)).toEqual(["lots", "little"]);
  });
  test("times the student asked for count more than their general overlap", () => {
    expect(matchScore(who("a", { windowMinutes: 180 }))).toBeGreaterThan(
      matchScore(who("b", { overlapMinutes: 180 })),
    );
  });
  test("when times are requested, anyone free under an hour in them is left out", () => {
    const out = rankPartners(
      [
        who("long", { overlapMinutes: 60, windowMinutes: MIN_WINDOW_MINUTES }),
        who("short", { overlapMinutes: 600, windowMinutes: MIN_WINDOW_MINUTES - 30 }),
        who("never", { overlapMinutes: 600 }),
      ],
      5,
      { requireWindow: true },
    );
    expect(ids(out)).toEqual(["long"]);
  });
  test("the three time blocks cover the day from 8:00 to 22:00 without gaps", () => {
    expect(TIME_BLOCKS.map((b) => [b.start, b.end])).toEqual([
      [480, 720],
      [720, 1020],
      [1020, 1320],
    ]);
  });
});

describe("Matching on current academic workload", () => {
  test("levels: light, moderate, heavy", () => {
    expect(workloadLevel(none)).toBe("light");
    expect(workloadLevel({ openTasks: 3, dueSoon: 0, sessionsWeek: 0 })).toBe("light");
    expect(workloadLevel({ openTasks: 4, dueSoon: 0, sessionsWeek: 0 })).toBe("moderate");
    expect(workloadLevel({ openTasks: 8, dueSoon: 0, sessionsWeek: 0 })).toBe("moderate");
    expect(workloadLevel({ openTasks: 9, dueSoon: 0, sessionsWeek: 0 })).toBe("heavy");
  });
  test("work due soon and booked sessions count more than a long backlog", () => {
    expect(workloadScore({ openTasks: 1, dueSoon: 1, sessionsWeek: 1 })).toBe(4);
    expect(workloadLevel({ openTasks: 0, dueSoon: 5, sessionsWeek: 0 })).toBe("heavy");
  });
  test("a busier student scores lower than an equally matched free one", () => {
    const base = { sharedCourses: ["CS201"], wantedSkills: ["SQL"] };
    const light = scorePartner(who("l", base));
    const moderate = scorePartner(
      who("m", { ...base, workload: { openTasks: 5, dueSoon: 0, sessionsWeek: 0 } }),
    );
    const heavy = scorePartner(
      who("h", { ...base, workload: { openTasks: 9, dueSoon: 0, sessionsWeek: 0 } }),
    );
    expect(light).toBeGreaterThan(moderate);
    expect(moderate).toBeGreaterThan(heavy);
  });
  test("a strong match can still beat a lighter, weaker one", () => {
    const out = rankPartners([
      who("weak", { sharedCourses: ["CS201"] }),
      who("strong", {
        sharedCourses: ["CS201", "MATH210"],
        wantedSkills: ["SQL"],
        workload: { openTasks: 9, dueSoon: 0, sessionsWeek: 0 },
      }),
    ]);
    expect(ids(out)[0]).toBe("strong");
  });
  test("'only students who aren't overloaded' drops heavy workloads", () => {
    const out = rankPartners(
      [
        who("free", { sharedCourses: ["CS201"] }),
        who("busy", {
          sharedCourses: ["CS201"],
          workload: { openTasks: 12, dueSoon: 0, sessionsWeek: 0 },
        }),
      ],
      5,
      { avoidHeavy: true },
    );
    expect(ids(out)).toEqual(["free"]);
  });
  test("the workload shown with each match is its level", () => {
    const out = rankPartners([
      who("busy", {
        sharedCourses: ["CS201"],
        workload: { openTasks: 12, dueSoon: 0, sessionsWeek: 0 },
      }),
    ]);
    expect(out[0]!.level).toBe("heavy");
  });
});

describe("Ranking overall", () => {
  test("suggests at most five students", () => {
    const many = Array.from({ length: 12 }, (_, i) => who(`s${i}`, { sharedCourses: ["CS201"] }));
    expect(rankPartners(many).length).toBe(MAX_PARTNER_SUGGESTIONS);
    expect(MAX_PARTNER_SUGGESTIONS).toBe(5);
  });
  test("ties are broken by name so results are stable", () => {
    const out = rankPartners([
      who("Zed", { sharedCourses: ["CS201"] }),
      who("Amy", { sharedCourses: ["CS201"] }),
    ]);
    expect(ids(out)).toEqual(["Amy", "Zed"]);
  });
  test("an empty pool gives an empty list", () => {
    expect(rankPartners([])).toEqual([]);
  });
});

describe("The written reason", () => {
  const base = { sharedCourses: [], newSkills: [], wantedSkills: [], overlapMinutes: 0 };
  test("uses only real facts", () => {
    const text = partnerReason({
      ...base,
      sharedCourses: ["CS201"],
      newSkills: ["Python"],
      wantedSkills: ["SQL"],
      overlapMinutes: 390,
      level: "light",
    });
    expect(text).toContain("SQL");
    expect(text).toContain("CS201");
    expect(text).toContain("Python");
    expect(text).toContain("6.5 h/week");
    expect(text).toContain("light workload");
    expect(text.endsWith(".")).toBe(true);
  });
  test("never mentions a heavy workload", () => {
    const text = partnerReason({ ...base, sharedCourses: ["CS201"], level: "heavy" });
    expect(text.toLowerCase()).not.toContain("heavy");
    expect(text.toLowerCase()).not.toContain("workload");
  });
  test("says nothing when there is nothing to say", () => {
    expect(partnerReason({ ...base, level: "heavy" })).toBe("");
  });
});

describe("Group study sessions", () => {
  const win = (weekday: number, start: number, end: number, free: number) => ({
    weekday,
    start_minute: start,
    end_minute: end,
    free_count: free,
  });
  test("prefers times when more people are free", () => {
    const out = pickSessionSlots([win(1, 600, 720, 2), win(2, 600, 720, 4)]);
    expect(out[0]!.weekday).toBe(2);
  });
  test("ignores windows shorter than 30 minutes", () => {
    expect(pickSessionSlots([win(1, 600, 625, 5)])).toEqual([]);
  });
  test("a long free window becomes a 90 minute session at its start", () => {
    expect(pickSessionSlots([win(1, 540, 900, 3)])[0]).toEqual({
      weekday: 1,
      startMinute: 540,
      endMinute: 630,
      freeCount: 3,
    });
  });
  test("a short window keeps its own length", () => {
    const s = pickSessionSlots([win(1, 540, 600, 3)])[0]!;
    expect(s.endMinute - s.startMinute).toBe(60);
  });
  test("proposes at most three options", () => {
    const out = pickSessionSlots([1, 2, 3, 4, 5].map((d) => win(d, 600, 720, 3)));
    expect(out.length).toBe(MAX_SESSION_PROPOSALS);
  });
  test("with no shared time there is nothing to propose", () => {
    expect(pickSessionSlots([])).toEqual([]);
  });
  test("the session date is the next time that weekday and hour comes round", () => {
    const from = new Date(2026, 10, 13, 10, 0); // Friday 10:00
    const sameDayLater = nextOccurrence(5, 15 * 60, from);
    expect(sameDayLater.getDate()).toBe(13);
    const sameDayEarlier = nextOccurrence(5, 9 * 60, from);
    expect(sameDayEarlier.getDate()).toBe(20);
    expect(nextOccurrence(1, 600, from).getDay()).toBe(1);
  });
});

describe("Error wording shown on the page", () => {
  test("reads plain database errors, Error objects, JSON bodies and nothing", () => {
    expect(readableError({ message: "permission denied" })).toBe("permission denied");
    expect(readableError(new Error("busy"))).toBe("busy");
    expect(readableError(new Error(JSON.stringify({ error: "No API key" })))).toBe("No API key");
    expect(readableError(undefined)).toBe("The assistant is unavailable right now.");
  });
});
