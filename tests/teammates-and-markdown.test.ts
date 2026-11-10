import { describe, expect, test } from "bun:test";
import { factualReason, rankCandidates, type CandidateFacts } from "../src/lib/teammate-ranking";
import { tidyMarkdown } from "../src/lib/markdown";

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
