import { test } from "node:test";
import assert from "node:assert/strict";
import {
  expandSessions,
  findMeetingOptions,
} from "../../../src/frontend/features/sessions/schedule.ts";
import { taskErrorMessage } from "../../../src/frontend/features/tasks/errors.ts";

const DAY = 864e5;
const session = (over = {}) => ({
  id: "s1",
  starts_at: "2026-10-05T15:00:00.000Z",
  ends_at: "2026-10-05T16:00:00.000Z",
  recurrence: "none",
  recurrence_end: null,
  ...over,
});
const range = (from, to) => [new Date(from), new Date(to)];

// ---- expandSessions (PB-03 shared calendar, recurrence) ----
test("one-off session inside the range appears once with its own times", () => {
  const out = expandSessions([session()], ...range("2026-10-01", "2026-10-31"));
  assert.equal(out.length, 1);
  assert.equal(out[0].occurrenceKey, "s1:2026-10-05T15:00:00.000Z");
  assert.equal(out[0].end.toISOString(), "2026-10-05T16:00:00.000Z");
});
test("one-off session outside the range is excluded", () => {
  assert.equal(expandSessions([session()], ...range("2026-11-01", "2026-11-30")).length, 0);
});
test("weekly session repeats every 7 days and keeps its duration", () => {
  const out = expandSessions(
    [session({ recurrence: "weekly" })],
    ...range("2026-10-01", "2026-10-31"),
  );
  assert.deepEqual(
    out.map((o) => o.start.toISOString().slice(0, 10)),
    ["2026-10-05", "2026-10-12", "2026-10-19", "2026-10-26"],
  );
  for (const o of out) assert.equal(o.end - o.start, 3600e3);
});
test("weekly session stops at recurrence_end (inclusive)", () => {
  const out = expandSessions(
    [session({ recurrence: "weekly", recurrence_end: "2026-10-12T15:00:00.000Z" })],
    ...range("2026-10-01", "2026-10-31"),
  );
  assert.equal(out.length, 2);
});
test("weekly session that began before the range only returns in-range occurrences", () => {
  const out = expandSessions(
    [session({ recurrence: "weekly" })],
    ...range("2026-10-15", "2026-10-31"),
  );
  assert.deepEqual(
    out.map((o) => o.start.toISOString().slice(0, 10)),
    ["2026-10-19", "2026-10-26"],
  );
});
test("occurrence keys are unique per occurrence", () => {
  const out = expandSessions(
    [session({ recurrence: "weekly" })],
    ...range("2026-10-01", "2026-10-31"),
  );
  assert.equal(new Set(out.map((o) => o.occurrenceKey)).size, out.length);
});
test("occurrences from several sessions are sorted by start time", () => {
  const a = session({
    id: "a",
    starts_at: "2026-10-09T10:00:00.000Z",
    ends_at: "2026-10-09T11:00:00.000Z",
  });
  const b = session({
    id: "b",
    starts_at: "2026-10-02T10:00:00.000Z",
    ends_at: "2026-10-02T11:00:00.000Z",
  });
  const out = expandSessions([a, b], ...range("2026-10-01", "2026-10-31"));
  assert.deepEqual(
    out.map((o) => o.session.id),
    ["b", "a"],
  );
});
test("no sessions gives no occurrences", () => {
  assert.deepEqual(expandSessions([], ...range("2026-10-01", "2026-10-31")), []);
});
test("weekly steps are exactly seven days apart", () => {
  const out = expandSessions(
    [session({ recurrence: "weekly" })],
    ...range("2026-10-01", "2026-10-31"),
  );
  for (let i = 1; i < out.length; i++) assert.equal(out[i].start - out[i - 1].start, 7 * DAY);
});

// ---- findMeetingOptions (availability-overlap calculation) ----
const slot = (user_id, weekday, start_minute, end_minute) => ({
  user_id,
  weekday,
  start_minute,
  end_minute,
});
test("no availability gives no options", () => {
  assert.deepEqual(findMeetingOptions([], 60), []);
});
test("a slot shorter than the meeting length gives no options", () => {
  assert.deepEqual(findMeetingOptions([slot("u1", 1, 600, 630)], 60), []);
});
test("start times advance in 30-minute steps and the meeting must fit", () => {
  const out = findMeetingOptions([slot("u1", 1, 600, 720)], 60);
  assert.deepEqual(
    out.map((o) => o.minute),
    [600, 630, 660],
  );
});
test("overlap of two members ranks the shared window first", () => {
  const out = findMeetingOptions([slot("u1", 2, 540, 660), slot("u2", 2, 600, 720)], 60);
  assert.equal(out[0].count, 2);
  assert.equal(out[0].minute, 600);
  assert.ok(out.some((o) => o.count === 1));
});
test("the same member with two overlapping slots is counted once", () => {
  const out = findMeetingOptions([slot("u1", 3, 600, 720), slot("u1", 3, 600, 720)], 60);
  assert.ok(out.every((o) => o.count === 1));
});
test("different weekdays never overlap", () => {
  const out = findMeetingOptions([slot("u1", 1, 600, 720), slot("u2", 2, 600, 720)], 60);
  assert.ok(out.every((o) => o.count === 1));
});
test("ties are ordered by weekday then time, and results are capped at 8", () => {
  const out = findMeetingOptions([slot("u1", 4, 0, 1440), slot("u1", 1, 0, 1440)], 30);
  assert.equal(out.length, 8);
  assert.equal(out[0].weekday, 1);
  assert.equal(out[0].minute, 0);
});
test("limit parameter is honoured", () => {
  assert.equal(findMeetingOptions([slot("u1", 1, 0, 1440)], 30, 3).length, 3);
});

// ---- taskErrorMessage (PB-04 task permissions feedback) ----
test("row-level-security denial gets a permission explanation", () => {
  assert.match(taskErrorMessage({ message: "x", code: "42501" }), /permission to change this task/);
});
test("other errors pass the database message through", () => {
  assert.equal(taskErrorMessage({ message: "network down" }), "network down");
  assert.equal(taskErrorMessage({ message: "dup", code: "23505" }), "dup");
});
