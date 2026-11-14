import { beforeEach, describe, expect, test } from "bun:test";
import { screen, waitFor, within } from "@testing-library/react";
import { NotificationsBell } from "../../src/components/app/notifications/NotificationCenter";
import { NotificationsPage } from "../../src/routes/_authenticated/notifications";
import { h, resetHarness } from "../helpers/harness";
import { renderWithClient } from "../helpers/render";

let n = 0;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
function row(over: Record<string, unknown> = {}) {
  n++;
  return {
    id: `n${n}`,
    user_id: "user-1",
    type: "task_assigned",
    title: `Notification ${n}`,
    body: null,
    link: "/tasks",
    read_at: null,
    created_at: ago(60_000 * n),
    ...over,
  };
}
const seed = (...rows: ReturnType<typeof row>[]) => h.fake.seed("notifications", rows as never);
const stored = () => h.fake.tables["notifications"] ?? [];

beforeEach(() => {
  n = 0;
  resetHarness();
});

describe("The bell", () => {
  const bell = () => screen.getByRole("button", { name: /^Notifications/ });

  test("shows how many are unread", async () => {
    seed(row(), row(), row({ read_at: ago(1) }));
    renderWithClient(<NotificationsBell />);
    expect((await screen.findByTestId("unread-count")).textContent).toBe("2");
    expect(bell().getAttribute("aria-label")).toBe("Notifications (2 unread)");
  });

  test("shows 9+ when there are many", async () => {
    seed(...Array.from({ length: 12 }, () => row()));
    renderWithClient(<NotificationsBell />);
    expect((await screen.findByTestId("unread-count")).textContent).toBe("9+");
  });

  test("no badge when everything is read", async () => {
    seed(row({ read_at: ago(1) }));
    renderWithClient(<NotificationsBell />);
    await waitFor(() =>
      expect(h.fake.callsTo("notifications", "select").length).toBeGreaterThan(0),
    );
    expect(screen.queryByTestId("unread-count")).toBeNull();
    expect(bell().getAttribute("aria-label")).toBe("Notifications");
  });

  test("opens a list with the newest first, with what each one is", async () => {
    seed(
      row({ title: "Older one", created_at: ago(5 * 3600_000) }),
      row({
        title: "Task due within 24 hours",
        type: "task_due_soon",
        body: "Draft outline",
        created_at: ago(60_000),
      }),
    );
    const { user } = renderWithClient(<NotificationsBell />);
    await screen.findByTestId("unread-count");
    await user.click(bell());
    const items = within(await screen.findByRole("dialog")).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]!.textContent).toContain("Task due within 24 hours");
    expect(items[0]!.textContent).toContain("Draft outline");
    expect(items[0]!.textContent).toContain("Due soon");
    expect(items[0]!.textContent).toContain("New");
    expect(items[1]!.textContent).toContain("Older one");
  });

  test("an empty bell says you're caught up", async () => {
    const { user } = renderWithClient(<NotificationsBell />);
    await user.click(bell());
    expect(await screen.findByText("You're all caught up.")).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: /mark all read/i }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  test("shows at most eight, and links to all of them", async () => {
    seed(...Array.from({ length: 11 }, () => row()));
    const { user } = renderWithClient(<NotificationsBell />);
    await screen.findByTestId("unread-count");
    await user.click(bell());
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getAllByRole("listitem")).toHaveLength(8);
    expect(
      within(dialog)
        .getByRole("link", { name: /view all notifications/i })
        .getAttribute("href"),
    ).toBe("/notifications");
  });

  test("a load error is shown instead of a blank list", async () => {
    h.fake.failTable("notifications", "select", { message: "Network down" });
    const { user } = renderWithClient(<NotificationsBell />);
    await waitFor(() => expect(h.fake.callsTo("notifications", "select").length).toBe(1));
    await user.click(bell());
    expect((await screen.findByRole("alert")).textContent).toContain("Network down");
  });
});

describe("Using a notification from the bell", () => {
  test("clicking one marks it read and goes to the page it is about", async () => {
    seed(row({ title: "New task assigned to you", link: "/tasks" }), row({ title: "Other" }));
    const { user } = renderWithClient(<NotificationsBell />);
    await screen.findByTestId("unread-count");
    await user.click(screen.getByRole("button", { name: /^Notifications/ }));
    await user.click(await screen.findByRole("button", { name: /New task assigned to you/ }));
    await waitFor(() => expect(h.navigate).toHaveBeenCalledWith({ to: "/tasks" }));
    expect(
      stored().find((r) => r["title"] === "New task assigned to you")!["read_at"],
    ).toBeTruthy();
    expect(stored().find((r) => r["title"] === "Other")!["read_at"]).toBeNull();
    await waitFor(() => expect(screen.getByTestId("unread-count").textContent).toBe("1"));
  });

  test("an already-read one just navigates", async () => {
    seed(row({ title: "Seen", read_at: ago(1), link: "/calendar" }));
    const { user } = renderWithClient(<NotificationsBell />);
    await waitFor(() => expect(h.fake.callsTo("notifications", "select").length).toBe(1));
    await user.click(screen.getByRole("button", { name: /^Notifications/ }));
    await user.click(await screen.findByRole("button", { name: /Seen/ }));
    await waitFor(() => expect(h.navigate).toHaveBeenCalledWith({ to: "/calendar" }));
    expect(h.fake.callsTo("notifications", "update")).toHaveLength(0);
  });

  test("one that leads nowhere is only marked read", async () => {
    seed(row({ title: "Just news", link: null }));
    const { user } = renderWithClient(<NotificationsBell />);
    await screen.findByTestId("unread-count");
    await user.click(screen.getByRole("button", { name: /^Notifications/ }));
    await user.click(await screen.findByRole("button", { name: "Just news" }));
    await waitFor(() => expect(stored()[0]!["read_at"]).toBeTruthy());
    expect(h.navigate).not.toHaveBeenCalled();
  });

  test("an address outside the app is never followed", async () => {
    seed(row({ title: "Sneaky", link: "https://evil.example/phish" }));
    const { user } = renderWithClient(<NotificationsBell />);
    await screen.findByTestId("unread-count");
    await user.click(screen.getByRole("button", { name: /^Notifications/ }));
    await user.click(await screen.findByRole("button", { name: "Sneaky" }));
    await waitFor(() => expect(stored()[0]!["read_at"]).toBeTruthy());
    expect(h.navigate).not.toHaveBeenCalled();
  });

  test("'Mark all read' clears the badge", async () => {
    seed(row(), row(), row());
    const { user } = renderWithClient(<NotificationsBell />);
    await screen.findByTestId("unread-count");
    await user.click(screen.getByRole("button", { name: /^Notifications/ }));
    await user.click(await screen.findByRole("button", { name: /mark all read/i }));
    await waitFor(() => expect(screen.queryByTestId("unread-count")).toBeNull());
    expect(stored().every((r) => r["read_at"])).toBe(true);
  });

  test("a failed update shows why", async () => {
    seed(row());
    h.fake.failTable("notifications", "update", { message: "Couldn't reach the database" });
    const { user } = renderWithClient(<NotificationsBell />);
    await screen.findByTestId("unread-count");
    await user.click(screen.getByRole("button", { name: /^Notifications/ }));
    await user.click(await screen.findByRole("button", { name: /mark all read/i }));
    await waitFor(() => expect(h.toast.error).toHaveBeenCalledWith("Couldn't reach the database"));
  });
});

describe("Deadline reminders arrive on their own", () => {
  test("the app asks for reminders when it opens, and they show up in the bell", async () => {
    h.fake.rpcHandlers["refresh_deadline_notifications"] = () => {
      (h.fake.tables["notifications"] ??= []).push(
        row({
          type: "task_due_soon",
          title: "Task due within 24 hours",
          body: "Write report",
          created_at: new Date().toISOString(),
        }),
      );
      return { data: 1, error: null };
    };
    const { user } = renderWithClient(<NotificationsBell />);
    expect((await screen.findByTestId("unread-count")).textContent).toBe("1");
    expect(h.fake.rpcCalls.filter((c) => c.name === "refresh_deadline_notifications")).toHaveLength(
      1,
    );
    await user.click(screen.getByRole("button", { name: /^Notifications/ }));
    const item = within(await screen.findByRole("dialog")).getAllByRole("listitem")[0]!;
    expect(item.textContent).toContain("Task due within 24 hours");
    expect(item.textContent).toContain("Write report");
    expect(item.getAttribute("data-type")).toBe("task_due_soon");
  });

  test("no new reminders leaves the bell as it was", async () => {
    seed(row({ read_at: ago(1) }));
    renderWithClient(<NotificationsBell />);
    await waitFor(() =>
      expect(h.fake.rpcCalls.some((c) => c.name === "refresh_deadline_notifications")).toBe(true),
    );
    expect(screen.queryByTestId("unread-count")).toBeNull();
  });

  test("a failing reminder check never breaks the bell", async () => {
    seed(row());
    h.fake.failRpc("refresh_deadline_notifications", { message: "boom" });
    renderWithClient(<NotificationsBell />);
    expect((await screen.findByTestId("unread-count")).textContent).toBe("1");
  });

  test("nobody signed in means no reminder request", async () => {
    resetHarness(null);
    renderWithClient(<NotificationsBell />);
    await new Promise((r) => setTimeout(r, 50));
    expect(h.fake.rpcCalls).toHaveLength(0);
  });
});

describe("The Notifications page", () => {
  const page = async (...rows: ReturnType<typeof row>[]) => {
    if (rows.length) seed(...rows);
    const view = renderWithClient(<NotificationsPage />);
    await screen.findByRole("heading", { name: "Notifications" });
    return view;
  };

  test("lists everything grouped by day, with counts on the tabs", async () => {
    await page(
      row({ title: "Today one" }),
      row({ title: "Old one", created_at: ago(10 * 86_400_000) }),
      row({ title: "Read one", read_at: ago(1) }),
    );
    expect(await screen.findByRole("tab", { name: "All (3)" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Unread (2)" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Today" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Earlier" })).toBeTruthy();
    expect(
      within(screen.getByRole("region", { name: "Earlier" })).getByText("Old one"),
    ).toBeTruthy();
  });

  test("the Unread tab hides what has been read", async () => {
    const { user } = await page(row({ title: "Fresh" }), row({ title: "Seen", read_at: ago(1) }));
    await screen.findByText("Seen");
    await user.click(screen.getByRole("tab", { name: /Unread/ }));
    expect(screen.getByText("Fresh")).toBeTruthy();
    expect(screen.queryByText("Seen")).toBeNull();
  });

  test("says so when there is nothing at all, and nothing unread", async () => {
    const { user } = await page();
    expect(await screen.findByText("Nothing here yet")).toBeTruthy();
    await user.click(screen.getByRole("tab", { name: /Unread/ }));
    expect(await screen.findByText("No unread notifications")).toBeTruthy();
  });

  test("can mark one as read and back to unread", async () => {
    const { user } = await page(row({ title: "Flip me" }));
    const item = (await screen.findByText("Flip me")).closest("li")!;
    await user.click(within(item).getByRole("button", { name: "Mark as read" }));
    await waitFor(() => expect(stored()[0]!["read_at"]).toBeTruthy());
    await waitFor(() => expect(screen.getByRole("tab", { name: "Unread (0)" })).toBeTruthy());
    await user.click(
      within(screen.getByText("Flip me").closest("li")!).getByRole("button", {
        name: "Mark as unread",
      }),
    );
    await waitFor(() => expect(stored()[0]!["read_at"]).toBeNull());
  });

  test("can delete one", async () => {
    const { user } = await page(row({ title: "Delete me" }), row({ title: "Keep me" }));
    const item = (await screen.findByText("Delete me")).closest("li")!;
    await user.click(within(item).getByRole("button", { name: /delete notification: delete me/i }));
    await waitFor(() => expect(screen.queryByText("Delete me")).toBeNull());
    expect(stored().map((r) => r["title"])).toEqual(["Keep me"]);
  });

  test("'Mark all read' and 'Clear read' work together", async () => {
    const { user } = await page(
      row({ title: "A" }),
      row({ title: "B" }),
      row({ title: "C", read_at: ago(1) }),
    );
    await screen.findByText("A");
    await user.click(screen.getByRole("button", { name: /mark all read/i }));
    await waitFor(() => expect(screen.getByRole("tab", { name: "Unread (0)" })).toBeTruthy());
    expect(
      (screen.getByRole("button", { name: /mark all read/i }) as HTMLButtonElement).disabled,
    ).toBe(true);
    await user.click(screen.getByRole("button", { name: /clear read/i }));
    await waitFor(() => expect(screen.getByText("Nothing here yet")).toBeTruthy());
    expect(stored()).toHaveLength(0);
  });

  test("'Clear read' keeps unread ones", async () => {
    const { user } = await page(
      row({ title: "Unread stays" }),
      row({ title: "Read goes", read_at: ago(1) }),
    );
    await screen.findByText("Read goes");
    await user.click(screen.getByRole("button", { name: /clear read/i }));
    await waitFor(() => expect(screen.queryByText("Read goes")).toBeNull());
    expect(screen.getByText("Unread stays")).toBeTruthy();
  });

  test("'Clear read' is off when nothing has been read", async () => {
    await page(row());
    await screen.findByText(/^Notification \d+$/);
    expect(
      (screen.getByRole("button", { name: /clear read/i }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  test("clicking a notification opens what it is about", async () => {
    const { user } = await page(
      row({ title: "Meeting scheduled", type: "session_scheduled", link: "/calendar" }),
    );
    await user.click(await screen.findByRole("button", { name: "Meeting scheduled (open)" }));
    await waitFor(() => expect(h.navigate).toHaveBeenCalledWith({ to: "/calendar" }));
    expect(stored()[0]!["read_at"]).toBeTruthy();
  });

  test("a load error has a retry", async () => {
    h.fake.failTable("notifications", "select", { message: "Network down" });
    const { user } = await page();
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Network down");
    seed(row({ title: "Back again" }));
    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(await screen.findByText("Back again")).toBeTruthy();
  });
});
