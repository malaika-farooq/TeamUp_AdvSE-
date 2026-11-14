import { beforeEach, describe, expect, test } from "bun:test";
import { screen, waitFor } from "@testing-library/react";
import { AvailabilityTab } from "../../src/components/app/settings/AvailabilityTab";
import { h, resetHarness } from "../helpers/harness";
import { renderWithClient } from "../helpers/render";

const saveButton = () =>
  screen.getByRole("button", { name: /save availability/i }) as HTMLButtonElement;
const block = (day: string, part: string) => screen.getByRole("button", { name: `${day} ${part}` });
const pressed = (el: HTMLElement) => el.getAttribute("aria-pressed") === "true";
const rpc = () => h.fake.rpcCalls.filter((c) => c.name === "set_my_availability");
const ready = () => screen.findByRole("list", { name: "Weekly availability" });
const savedSlots = (args: Record<string, unknown>) =>
  args["_slots"] as { weekday: number; start: number; end: number }[];

beforeEach(() => {
  resetHarness();
  // Monday 8:00-12:00 and Wednesday 18:00-21:00
  h.fake.seed("availability_slots", [
    { user_id: "user-1", weekday: 1, start_minute: 480, end_minute: 720 },
    { user_id: "user-1", weekday: 3, start_minute: 1080, end_minute: 1260 },
  ]);
});

describe("Settings > Availability: loading", () => {
  test("shows saved free time as pressed blocks and time chips", async () => {
    renderWithClient(<AvailabilityTab />);
    await ready();
    await waitFor(() => expect(pressed(block("Monday", "Morning"))).toBe(true));
    expect(pressed(block("Monday", "Afternoon"))).toBe(false);
    expect(pressed(block("Tuesday", "Morning"))).toBe(false);
    expect(screen.getByRole("button", { name: "Remove Monday 8:00 AM – 12:00 PM" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Remove Wednesday 6:00 PM – 9:00 PM" })).toBeTruthy();
  });

  test("shows the weekly total", async () => {
    renderWithClient(<AvailabilityTab />);
    expect(await screen.findByText("You're free about 7 h a week.")).toBeTruthy();
  });

  test("says so when nothing is marked", async () => {
    h.fake.seed("availability_slots", []);
    renderWithClient(<AvailabilityTab />);
    expect(await screen.findByText("No free time marked yet.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Clear all" })).toBeNull();
  });

  test("shows an error and a retry when saved times can't be loaded", async () => {
    h.fake.failTable("availability_slots", "select", { message: "Network down" });
    const { user } = renderWithClient(<AvailabilityTab />);
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Network down");
    await user.click(screen.getByRole("button", { name: /try again/i }));
    await waitFor(() => expect(pressed(block("Monday", "Morning"))).toBe(true));
  });
});

describe("Settings > Availability: editing", () => {
  test("Save is disabled until something changes", async () => {
    const { user } = renderWithClient(<AvailabilityTab />);
    await waitFor(() => expect(pressed(block("Monday", "Morning"))).toBe(true));
    expect(saveButton().disabled).toBe(true);
    await user.click(block("Tuesday", "Afternoon"));
    expect(saveButton().disabled).toBe(false);
    expect(screen.getByText(/you have unsaved changes/i)).toBeTruthy();
  });

  test("tapping a block turns it on and off", async () => {
    const { user } = renderWithClient(<AvailabilityTab />);
    await waitFor(() => expect(pressed(block("Monday", "Morning"))).toBe(true));
    await user.click(block("Friday", "Evening"));
    expect(pressed(block("Friday", "Evening"))).toBe(true);
    await user.click(block("Friday", "Evening"));
    expect(pressed(block("Friday", "Evening"))).toBe(false);
    expect(saveButton().disabled).toBe(true);
  });

  test("turning off a saved block removes its time", async () => {
    const { user } = renderWithClient(<AvailabilityTab />);
    await waitFor(() => expect(pressed(block("Monday", "Morning"))).toBe(true));
    await user.click(block("Monday", "Morning"));
    expect(screen.queryByRole("button", { name: "Remove Monday 8:00 AM – 12:00 PM" })).toBeNull();
  });

  test("adds exact times to one day", async () => {
    const { user } = renderWithClient(<AvailabilityTab />);
    await waitFor(() => expect(pressed(block("Monday", "Morning"))).toBe(true));
    await user.selectOptions(screen.getByLabelText("Day"), "5");
    await user.selectOptions(screen.getByLabelText("From"), "600");
    await user.selectOptions(screen.getByLabelText("To"), "690");
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByRole("button", { name: "Remove Friday 10:00 AM – 11:30 AM" })).toBeTruthy();
  });

  test("adds the same exact times to every weekday at once", async () => {
    const { user } = renderWithClient(<AvailabilityTab />);
    await waitFor(() => expect(pressed(block("Monday", "Morning"))).toBe(true));
    await user.selectOptions(screen.getByLabelText("Day"), "weekdays");
    await user.selectOptions(screen.getByLabelText("From"), "1140");
    await user.selectOptions(screen.getByLabelText("To"), "1260");
    await user.click(screen.getByRole("button", { name: "Add" }));
    for (const day of ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]) {
      expect(
        screen.getAllByRole("button", { name: new RegExp(`Remove ${day} .*9:00 PM`) }).length,
      ).toBeGreaterThan(0);
    }
    expect(screen.queryByRole("button", { name: /Remove Saturday/ })).toBeNull();
  });

  test("merges overlapping times into one range", async () => {
    const { user } = renderWithClient(<AvailabilityTab />);
    await waitFor(() => expect(pressed(block("Monday", "Morning"))).toBe(true));
    await user.selectOptions(screen.getByLabelText("Day"), "1");
    await user.selectOptions(screen.getByLabelText("From"), "660"); // 11:00 inside Monday 8-12
    await user.selectOptions(screen.getByLabelText("To"), "780"); // 13:00
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByRole("button", { name: "Remove Monday 8:00 AM – 1:00 PM" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Remove Monday 8:00 AM – 12:00 PM" })).toBeNull();
  });

  test("refuses a range that ends before it starts", async () => {
    const { user } = renderWithClient(<AvailabilityTab />);
    await waitFor(() => expect(pressed(block("Monday", "Morning"))).toBe(true));
    await user.selectOptions(screen.getByLabelText("From"), "660");
    await user.selectOptions(screen.getByLabelText("To"), "540");
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(h.toast.error).toHaveBeenCalledWith("The end time must be after the start time.");
    expect(saveButton().disabled).toBe(true);
  });

  test("a range can be removed with its x", async () => {
    const { user } = renderWithClient(<AvailabilityTab />);
    await waitFor(() => expect(pressed(block("Wednesday", "Evening"))).toBe(false)); // 18:00-21:00 is inside 17-22
    await user.click(
      await screen.findByRole("button", { name: "Remove Wednesday 6:00 PM – 9:00 PM" }),
    );
    expect(screen.queryByRole("button", { name: "Remove Wednesday 6:00 PM – 9:00 PM" })).toBeNull();
    expect(saveButton().disabled).toBe(false);
  });

  test("Clear all removes everything", async () => {
    const { user } = renderWithClient(<AvailabilityTab />);
    await waitFor(() => expect(pressed(block("Monday", "Morning"))).toBe(true));
    await user.click(screen.getByRole("button", { name: "Clear all" }));
    expect(screen.getByText("No free time marked yet.")).toBeTruthy();
    expect(saveButton().disabled).toBe(false);
  });

  test("a block the student only partly covers is marked as partial, not on", async () => {
    const { user } = renderWithClient(<AvailabilityTab />);
    await waitFor(() => expect(pressed(block("Monday", "Morning"))).toBe(true));
    // Wednesday 18:00-21:00 lies inside "Evening" 17:00-22:00 but doesn't fill it
    expect(pressed(block("Wednesday", "Evening"))).toBe(false);
    expect(block("Wednesday", "Evening").className).toContain("border-dashed");
    await user.click(block("Wednesday", "Evening"));
    expect(pressed(block("Wednesday", "Evening"))).toBe(true);
  });
});

describe("Settings > Availability: saving", () => {
  test("saves the exact ranges, ordered by day", async () => {
    const { user } = renderWithClient(<AvailabilityTab />);
    await waitFor(() => expect(pressed(block("Monday", "Morning"))).toBe(true));
    await user.click(block("Tuesday", "Afternoon"));
    await user.click(block("Sunday", "Morning"));
    await user.click(saveButton());
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Availability saved"));
    expect(savedSlots(rpc()[0]!.args)).toEqual([
      { weekday: 0, start: 480, end: 720 },
      { weekday: 1, start: 480, end: 720 },
      { weekday: 2, start: 720, end: 1020 },
      { weekday: 3, start: 1080, end: 1260 },
    ]);
  });

  test("saves an empty week", async () => {
    const { user } = renderWithClient(<AvailabilityTab />);
    await waitFor(() => expect(pressed(block("Monday", "Morning"))).toBe(true));
    await user.click(screen.getByRole("button", { name: "Clear all" }));
    await user.click(saveButton());
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    expect(savedSlots(rpc()[0]!.args)).toEqual([]);
    expect(h.fake.tables["availability_slots"]).toEqual([]);
  });

  test("after saving, the page matches what was saved and nothing is 'unsaved'", async () => {
    const { user } = renderWithClient(<AvailabilityTab />);
    await waitFor(() => expect(pressed(block("Monday", "Morning"))).toBe(true));
    await user.click(block("Thursday", "Morning"));
    await user.click(saveButton());
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    await waitFor(() => expect(saveButton().disabled).toBe(true));
    expect(pressed(block("Thursday", "Morning"))).toBe(true);
    expect(screen.queryByText(/unsaved changes/i)).toBeNull();
  });

  test("Save is disabled while saving", async () => {
    const { user } = renderWithClient(<AvailabilityTab />);
    await waitFor(() => expect(pressed(block("Monday", "Morning"))).toBe(true));
    await user.click(block("Thursday", "Morning"));
    await user.click(saveButton());
    expect(saveButton().disabled).toBe(true);
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
  });

  test("shows what went wrong and keeps the edits", async () => {
    h.fake.failRpc("set_my_availability", { message: "Times must be on the hour or half hour" });
    const { user } = renderWithClient(<AvailabilityTab />);
    await waitFor(() => expect(pressed(block("Monday", "Morning"))).toBe(true));
    await user.click(block("Thursday", "Morning"));
    await user.click(saveButton());
    await waitFor(() =>
      expect(h.toast.error).toHaveBeenCalledWith("Times must be on the hour or half hour"),
    );
    expect(h.toast.success).not.toHaveBeenCalled();
    expect(pressed(block("Thursday", "Morning"))).toBe(true);
    expect(saveButton().disabled).toBe(false);
  });

  test("explains a database that hasn't been set up", async () => {
    h.fake.failRpc("set_my_availability", { message: "schema cache", code: "PGRST202" });
    const { user } = renderWithClient(<AvailabilityTab />);
    await waitFor(() => expect(pressed(block("Monday", "Morning"))).toBe(true));
    await user.click(block("Thursday", "Morning"));
    await user.click(saveButton());
    await waitFor(() =>
      expect(h.toast.error).toHaveBeenCalledWith(
        expect.stringContaining("0007_profile_completion.sql"),
      ),
    );
  });
});
