import { describe, expect, test } from "bun:test";
import { factualReason, matchWantedSkills, rankCandidates, type CandidateFacts } from "../src/lib/teammate-ranking";
import { tidyMarkdown } from "../src/lib/markdown";
import { nextOccurrence, pickSessionSlots, rankPartners, workloadLevel } from "../src/lib/partner-ranking";

const person = (id: string, over: Partial<CandidateFacts> = {}): CandidateFacts => ({
  id,
  name: id,
  discoverable: true,
  sharedCourses: [],
  newSkills: ["Python"],
  overlapMinutes: 0,
  ...over,
});

describe("Teammate ideas ranking", () => {
  test("returns at most four candidates", () => {
    const ranked = rankCandidates(["a", "b", "c", "d", "e", "f"].map((id) => person(id)), []);
    expect(ranked).toHaveLength(4);
  });

  test("never suggests someone already on the team", () => {
    const ranked = rankCandidates([person("member"), person("outsider")], ["member"]);
    expect(ranked.map((c) => c.id)).toEqual(["outsider"]);
  });

  test("never suggests someone who isn't discoverable", () => {
    const ranked = rankCandidates([person("hidden", { discoverable: false }), person("open")], []);
    expect(ranked.map((c) => c.id)).toEqual(["open"]);
  });

  test("leaves out candidates with nothing in common", () => {
    const ranked = rankCandidates([person("none", { newSkills: [] })], []);
    expect(ranked).toEqual([]);
  });

  test("ranks a shared course above a single new skill", () => {
    const ranked = rankCandidates(
      [person("skill"), person("course", { newSkills: [], sharedCourses: ["CSE 6324"] })],
      [],
    );
    expect(ranked.map((c) => c.id)).toEqual(["course", "skill"]);
  });

  test("fallback reason only mentions facts that exist", () => {
    expect(factualReason({ sharedCourses: [], newSkills: ["Design"], overlapMinutes: 0 })).toBe("Adds Design.");
  });
});

describe("Progress summary Markdown", () => {
  test("bold with spaces inside the stars becomes real bold", () => {
    expect(tidyMarkdown("1 of 5 done (**Do Homework 1 **).")).toBe("1 of 5 done (**Do Homework 1**).");
  });

  test("a heading glued to the line above gets its own line", () => {
    expect(tidyMarkdown("Intro\n## Blockers")).toBe("Intro\n\n## Blockers");
  });
});

describe("wanted skills", () => {
  const base = { discoverable: true, sharedCourses: [], newSkills: [], overlapMinutes: 60 };
  test("matchWantedSkills is case-insensitive", () => {
    expect(matchWantedSkills(["SQL", "Python"], ["sql"])).toEqual(["SQL"]);
    expect(matchWantedSkills(["SQL"], [])).toEqual([]);
  });
  test("requireWanted drops candidates without a wanted skill and boosts those with one", () => {
    const list = [
      { ...base, id: "a", name: "A", wantedSkills: [] },
      { ...base, id: "b", name: "B", wantedSkills: ["SQL"] },
    ];
    expect(rankCandidates(list, [], 4, { requireWanted: true }).map((c) => c.id)).toEqual(["b"]);
    expect(rankCandidates(list, [], 4).map((c) => c.id)).toEqual(["b", "a"]);
  });
});

describe("study partner ranking", () => {
  const w = (openTasks: number, dueSoon = 0, sessionsWeek = 0) => ({ openTasks, dueSoon, sessionsWeek });
  const p = (id: string, over = {}) => ({
    id,
    name: id,
    sharedCourses: ["CS201"],
    newSkills: [],
    wantedSkills: [],
    overlapMinutes: 0,
    workload: w(0),
    ...over,
  });

  test("workload levels", () => {
    expect(workloadLevel(w(2))).toBe("light");
    expect(workloadLevel(w(3, 2))).toBe("moderate");
    expect(workloadLevel(w(5, 3, 2))).toBe("heavy");
  });

  test("a heavy workload ranks an otherwise equal student lower", () => {
    const out = rankPartners([p("busy", { workload: w(5, 3, 2) }), p("free")]);
    expect(out.map((x) => x.id)).toEqual(["free", "busy"]);
  });

  test("workload alone never creates a match", () => {
    expect(rankPartners([p("nobody", { sharedCourses: [], workload: w(0) })])).toEqual([]);
  });

  test("session slots prefer more people free, then longer, capped at 90 minutes", () => {
    const slots = pickSessionSlots([
      { weekday: 1, start_minute: 600, end_minute: 660, free_count: 2 },
      { weekday: 3, start_minute: 600, end_minute: 900, free_count: 3 },
      { weekday: 2, start_minute: 600, end_minute: 615, free_count: 3 },
    ]);
    expect(slots[0]).toMatchObject({ weekday: 3, startMinute: 600, endMinute: 690, freeCount: 3 });
    expect(slots).toHaveLength(2);
  });

  test("nextOccurrence is the next matching weekday in the future", () => {
    const from = new Date(2026, 10, 12, 12, 0); // Thursday
    const d = nextOccurrence(4, 9 * 60, from);
    expect(d.getDay()).toBe(4);
    expect(d.getTime()).toBeGreaterThan(from.getTime());
    expect(nextOccurrence(4, 15 * 60, from).getDate()).toBe(12);
  });

  test("requested times filter out students who are not free then, and avoidHeavy drops heavy loads", () => {
    const list = [p("free", { windowMinutes: 120 }), p("busyTime", { windowMinutes: 0 }), p("heavy", { windowMinutes: 120, workload: w(5, 3, 2) })];
    expect(rankPartners(list, 5, { requireWindow: true }).map((x) => x.id)).toEqual(["free", "heavy"]);
    expect(rankPartners(list, 5, { requireWindow: true, avoidHeavy: true }).map((x) => x.id)).toEqual(["free"]);
  });
});
