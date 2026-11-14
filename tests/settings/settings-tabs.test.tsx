import { beforeEach, describe, expect, test } from "bun:test";
import { screen, waitFor, within } from "@testing-library/react";
import { SettingsTabs } from "../../src/components/app/settings/SettingsTabs";
import { h, profileRow, resetHarness } from "../helpers/harness";
import { renderWithClient } from "../helpers/render";

const tab = (name: RegExp | string) => screen.getByRole("tab", { name });
// Inactive sections stay mounted but are hidden with CSS, so pick the panel Radix marks as active.
const visiblePanel = () =>
  Array.from(document.querySelectorAll<HTMLElement>('[role="tabpanel"]')).find(
    (p) => p.getAttribute("data-state") === "active",
  ) as HTMLElement;

beforeEach(() => {
  resetHarness();
  h.fake.seed("profiles", [profileRow()]);
  h.fake.seed("user_courses", [{ user_id: "user-1", courses: { code: "CS101", title: "Intro" } }]);
});

describe("Settings: tabs", () => {
  test("has the five sections", () => {
    renderWithClient(<SettingsTabs />);
    const names = screen.getAllByRole("tab").map((t) => t.textContent);
    expect(names).toEqual(["Profile", "Courses & skills", "Availability", "Appearance", "Account"]);
  });

  test("opens on Profile", async () => {
    renderWithClient(<SettingsTabs />);
    expect(tab("Profile").getAttribute("aria-selected")).toBe("true");
    expect(await within(visiblePanel()).findByText("Profile completeness")).toBeTruthy();
  });

  test("each tab shows its own section", async () => {
    const { user } = renderWithClient(<SettingsTabs />);

    await user.click(tab(/courses/i));
    expect(await within(visiblePanel()).findByLabelText("Enrolled courses")).toBeTruthy();

    await user.click(tab("Availability"));
    expect(
      await within(visiblePanel()).findByRole("button", { name: /save availability/i }),
    ).toBeTruthy();

    await user.click(tab("Appearance"));
    expect(within(visiblePanel()).getByText("Dark theme")).toBeTruthy();

    await user.click(tab("Account"));
    expect(within(visiblePanel()).getByRole("button", { name: /update password/i })).toBeTruthy();

    await user.click(tab("Profile"));
    expect(within(visiblePanel()).getByLabelText("Display name")).toBeTruthy();
  });

  test("only the selected tab is marked selected", async () => {
    const { user } = renderWithClient(<SettingsTabs />);
    await user.click(tab("Account"));
    expect(tab("Account").getAttribute("aria-selected")).toBe("true");
    expect(tab("Profile").getAttribute("aria-selected")).toBe("false");
  });

  test("can start on another tab", async () => {
    renderWithClient(<SettingsTabs defaultTab="appearance" />);
    expect(tab("Appearance").getAttribute("aria-selected")).toBe("true");
  });

  test("keeps unsaved edits when you look at another tab and come back", async () => {
    const { user } = renderWithClient(<SettingsTabs />);
    const name = () => within(visiblePanel()).getByLabelText("Display name") as HTMLInputElement;
    await waitFor(() => expect(name().value).toBe("Maya Chen"));
    await user.clear(name());
    await user.type(name(), "Maya Q. Chen");

    await user.click(tab("Appearance"));
    await user.click(tab("Profile"));

    expect(name().value).toBe("Maya Q. Chen");
  });

  test("keeps unsaved course edits across tabs too", async () => {
    const { user } = renderWithClient(<SettingsTabs />);
    await user.click(tab(/courses/i));
    const box = () => within(visiblePanel()).getByLabelText("Enrolled courses") as HTMLInputElement;
    await within(visiblePanel()).findByRole("list", { name: "Your courses" });
    await user.type(box(), "CS201 Data Structures{Enter}");
    await user.click(tab("Account"));
    await user.click(tab(/courses/i));
    expect(within(visiblePanel()).getByText("CS201 · Data Structures")).toBeTruthy();
    expect(within(visiblePanel()).getByText(/unsaved changes/i)).toBeTruthy();
  });

  test("a save in one tab does not disturb another", async () => {
    const { user } = renderWithClient(<SettingsTabs />);
    await waitFor(() =>
      expect(
        (within(visiblePanel()).getByLabelText("Display name") as HTMLInputElement).value,
      ).toBe("Maya Chen"),
    );
    await user.click(within(visiblePanel()).getByRole("button", { name: /save profile/i }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Profile saved"));
    await user.click(tab("Availability"));
    expect(
      (
        within(visiblePanel()).getByRole("button", {
          name: /save availability/i,
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });
});
