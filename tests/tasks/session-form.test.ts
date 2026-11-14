import { describe, expect, test } from "bun:test";
import { validateSessionForm, type SessionForm } from "../../src/lib/session-form";

const form = (over: Partial<SessionForm> = {}): SessionForm => ({
  title: "Sprint planning",
  start: "2030-05-06T14:00",
  end: "2030-05-06T15:30",
  weekly: false,
  recurrenceEnd: "",
  ...over,
});

describe("Checking a session before saving", () => {
  test("a good session is cleaned up", () => {
    const r = validateSessionForm(form({ title: "  Sprint   planning " }));
    expect(r.ok && r.clean.title).toBe("Sprint planning");
    expect(r.ok && new Date(r.clean.endsAt).getTime() - new Date(r.clean.startsAt).getTime()).toBe(
      90 * 60_000,
    );
    expect(r.ok && r.clean.recurrenceEnd).toBeNull();
  });
  test("the title is required", () => {
    const r = validateSessionForm(form({ title: "   " }));
    expect(!r.ok && r.errors.title).toBe("Give the session a title.");
  });
  test("both times are required", () => {
    const r = validateSessionForm(form({ start: "", end: "" }));
    expect(!r.ok && Object.keys(r.errors).sort()).toEqual(["end", "start"]);
  });
  test("it can't end before or when it starts", () => {
    for (const end of ["2030-05-06T14:00", "2030-05-06T13:00"]) {
      const r = validateSessionForm(form({ end }));
      expect(!r.ok && r.errors.end).toBe("The end must be after the start.");
    }
  });
  test("it can't last more than 12 hours", () => {
    const r = validateSessionForm(form({ end: "2030-05-07T09:00" }));
    expect(!r.ok && r.errors.end).toContain("12 hours");
    expect(validateSessionForm(form({ end: "2030-05-07T02:00" })).ok).toBe(true);
  });
  test("a weekly session can repeat until a later date", () => {
    const r = validateSessionForm(form({ weekly: true, recurrenceEnd: "2030-08-01" }));
    expect(r.ok && r.clean.recurrenceEnd).toBeTruthy();
  });
  test("the repeat date can't be before the first session", () => {
    const r = validateSessionForm(form({ weekly: true, recurrenceEnd: "2030-05-01" }));
    expect(!r.ok && r.errors.recurrenceEnd).toContain("on or after");
  });
  test("a repeat date is ignored when the session doesn't repeat", () => {
    const r = validateSessionForm(form({ weekly: false, recurrenceEnd: "2020-01-01" }));
    expect(r.ok && r.clean.recurrenceEnd).toBeNull();
  });
});
