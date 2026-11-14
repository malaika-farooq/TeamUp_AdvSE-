// Functionality 5 (in-app notifications): what each notification says, where it leads, and the database calls.
import { beforeEach, describe, expect, test } from "bun:test";
import {
  deleteNotifications,
  fetchAllNotifications,
  groupByDay,
  markRead,
  markUnread,
  notificationMeta,
  notifyMany,
  refreshDeadlineNotifications,
  safeLink,
  sortNotifications,
  timeAgo,
  unreadOf,
  type NotificationRow,
} from "../../src/lib/notifications";
import { h, resetHarness } from "../helpers/harness";

const NOW = new Date(2026, 10, 13, 15, 0, 0); // Fri 13 Nov 2026, 3 pm
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();
let n = 0;
const note = (over: Partial<NotificationRow> = {}): NotificationRow => ({
  id: `n${++n}`,
  user_id: "user-1",
  type: "task_assigned",
  title: "New task assigned to you",
  body: "Draft outline",
  link: "/tasks",
  read_at: null,
  created_at: ago(60_000),
  ...over,
});

beforeEach(() => resetHarness());

describe("What each kind of notification is", () => {
  test("the ones the app sends have a plain label", () => {
    expect(notificationMeta("task_assigned")).toEqual({ label: "Task assigned", tone: "task" });
    expect(notificationMeta("task_due_soon")).toEqual({ label: "Due soon", tone: "deadline" });
    expect(notificationMeta("task_overdue")).toEqual({ label: "Overdue", tone: "deadline" });
    expect(notificationMeta("task_due_changed").tone).toBe("deadline");
    expect(notificationMeta("session_soon").tone).toBe("meeting");
    expect(notificationMeta("resource_shared")).toEqual({
      label: "Shared with the team",
      tone: "share",
    });
    expect(notificationMeta("join_approved").tone).toBe("team");
    expect(notificationMeta("partner_request").tone).toBe("partner");
  });
  test("an unknown kind still shows something sensible", () => {
    expect(notificationMeta("brand_new_kind")).toEqual({ label: "Notification", tone: "general" });
  });
});

describe("Where a notification leads", () => {
  test("pages inside the app are fine", () => {
    expect(safeLink("/tasks")).toBe("/tasks");
    expect(safeLink("/teams/abc-123")).toBe("/teams/abc-123");
    expect(safeLink("/partners")).toBe("/partners");
  });
  test("anything that leaves the app is ignored", () => {
    for (const bad of [
      "https://evil.example",
      "//evil.example",
      "javascript:alert(1)",
      "tasks",
      "/a b",
      "/\\evil",
      "",
      null,
      undefined,
    ]) {
      expect(safeLink(bad as string | null)).toBeNull();
    }
  });
});

describe("Ordering and counting", () => {
  test("newest first", () => {
    const a = note({ created_at: ago(5000) });
    const b = note({ created_at: ago(1000) });
    const c = note({ created_at: ago(9000) });
    expect(sortNotifications([a, b, c]).map((x) => x.id)).toEqual([b.id, a.id, c.id]);
  });
  test("unread are the ones not yet read", () => {
    const read = note({ read_at: ago(1) });
    const fresh = note();
    expect(unreadOf([read, fresh]).map((x) => x.id)).toEqual([fresh.id]);
  });
  test("grouped into Today, Yesterday and Earlier, leaving out empty groups", () => {
    const today = note({ created_at: new Date(2026, 10, 13, 9, 0).toISOString() });
    const yesterday = note({ created_at: new Date(2026, 10, 12, 22, 0).toISOString() });
    const old = note({ created_at: new Date(2026, 10, 1, 8, 0).toISOString() });
    const groups = groupByDay([today, yesterday, old], NOW);
    expect(groups.map((g) => g.label)).toEqual(["Today", "Yesterday", "Earlier"]);
    expect(groups.map((g) => g.items.length)).toEqual([1, 1, 1]);
    expect(groupByDay([today], NOW).map((g) => g.label)).toEqual(["Today"]);
    expect(groupByDay([], NOW)).toEqual([]);
  });
  test("how long ago", () => {
    expect(timeAgo(ago(10_000), NOW)).toBe("just now");
    expect(timeAgo(ago(5 * 60_000), NOW)).toBe("5 min ago");
    expect(timeAgo(ago(3 * 3_600_000), NOW)).toBe("3 h ago");
    expect(timeAgo(ago(30 * 3_600_000), NOW)).toBe("Yesterday");
    expect(timeAgo(ago(10 * 86_400_000), NOW)).toMatch(/\w/);
    expect(timeAgo("garbage", NOW)).toBe("");
  });
});

describe("Reading and changing notifications", () => {
  test("loads the student's notifications", async () => {
    h.fake.seed("notifications", [note(), note({ title: "Second" })] as never);
    const rows = await fetchAllNotifications();
    expect(rows).toHaveLength(2);
  });
  test("a load error is reported", async () => {
    h.fake.failTable("notifications", "select", { message: "Network down" });
    await expect(fetchAllNotifications()).rejects.toThrow("Network down");
  });
  test("marking read stamps the time, only on the chosen ones", async () => {
    const a = note();
    const b = note();
    h.fake.seed("notifications", [a, b] as never);
    await markRead([a.id]);
    const rows = h.fake.tables["notifications"]!;
    expect(rows.find((r) => r["id"] === a.id)!["read_at"]).toBeTruthy();
    expect(rows.find((r) => r["id"] === b.id)!["read_at"]).toBeNull();
  });
  test("marking unread clears the time", async () => {
    const a = note({ read_at: ago(1) });
    h.fake.seed("notifications", [a] as never);
    await markUnread([a.id]);
    expect(h.fake.tables["notifications"]![0]!["read_at"]).toBeNull();
  });
  test("nothing to change means no database call", async () => {
    await markRead([]);
    await deleteNotifications([]);
    expect(h.fake.calls).toHaveLength(0);
  });
  test("deleting removes only the chosen ones", async () => {
    const a = note();
    const b = note();
    h.fake.seed("notifications", [a, b] as never);
    await deleteNotifications([a.id]);
    expect(h.fake.tables["notifications"]!.map((r) => r["id"])).toEqual([b.id]);
  });
  test("a refused change is reported", async () => {
    h.fake.failTable("notifications", "update", {
      message: "A notification can only be marked read or unread",
    });
    await expect(markRead(["x"])).rejects.toThrow("marked read or unread");
  });
});

describe("Deadline reminders", () => {
  test("returns how many new reminders the database created", async () => {
    h.fake.rpcHandlers["refresh_deadline_notifications"] = () => ({ data: 3, error: null });
    expect(await refreshDeadlineNotifications()).toBe(3);
  });
  test("none created is zero", async () => {
    expect(await refreshDeadlineNotifications()).toBe(0);
  });
  test("a database without migration 0012 just has no reminders (not an error)", async () => {
    h.fake.failRpc("refresh_deadline_notifications", { message: "schema cache", code: "PGRST202" });
    expect(await refreshDeadlineNotifications()).toBe(0);
  });
  test("a real failure is reported", async () => {
    h.fake.failRpc("refresh_deadline_notifications", { message: "boom" });
    await expect(refreshDeadlineNotifications()).rejects.toThrow("boom");
  });
});

describe("Telling teammates", () => {
  const msg = {
    type: "resource_shared",
    title: "New note shared in Crew",
    body: "Exam notes",
    link: "/resources",
  };
  test("one insert for everyone, no repeats", async () => {
    await notifyMany(["u2", "u3", "u2"], msg);
    const inserts = h.fake.callsTo("notifications", "insert");
    expect(inserts).toHaveLength(1);
    expect(inserts[0]!.payload).toEqual([
      { user_id: "u2", ...msg },
      { user_id: "u3", ...msg },
    ]);
  });
  test("nobody to tell means no call", async () => {
    await notifyMany([], msg);
    expect(h.fake.callsTo("notifications", "insert")).toHaveLength(0);
  });
  test("a failure is reported", async () => {
    h.fake.failTable("notifications", "insert", { message: "blocked" });
    await expect(notifyMany(["u2"], msg)).rejects.toThrow("blocked");
  });
});
