import { beforeEach, describe, expect, test } from "bun:test";
import { screen } from "@testing-library/react";
import { AppearanceTab } from "../../src/components/app/settings/AppearanceTab";
import { h, resetHarness } from "../helpers/harness";
import { renderWithClient } from "../helpers/render";

const toggle = () => screen.getByRole("switch", { name: "Dark theme" });

beforeEach(() => resetHarness());

describe("Settings > Appearance", () => {
  test("explains the setting", () => {
    renderWithClient(<AppearanceTab />);
    expect(screen.getByText("Dark theme")).toBeTruthy();
    expect(screen.getByText(/remembered on this device/i)).toBeTruthy();
  });

  test("shows the switch off in the light theme", () => {
    h.theme.theme = "light";
    renderWithClient(<AppearanceTab />);
    expect(toggle().getAttribute("aria-checked")).toBe("false");
  });

  test("shows the switch on in the dark theme", () => {
    h.theme.theme = "dark";
    renderWithClient(<AppearanceTab />);
    expect(toggle().getAttribute("aria-checked")).toBe("true");
  });

  test("turning it on switches to dark", async () => {
    h.theme.theme = "light";
    const { user } = renderWithClient(<AppearanceTab />);
    await user.click(toggle());
    expect(h.theme.setTheme).toHaveBeenCalledWith("dark");
  });

  test("turning it off switches back to light", async () => {
    h.theme.theme = "dark";
    const { user } = renderWithClient(<AppearanceTab />);
    await user.click(toggle());
    expect(h.theme.setTheme).toHaveBeenCalledWith("light");
  });

  test("can be used from the keyboard", async () => {
    const { user } = renderWithClient(<AppearanceTab />);
    toggle().focus();
    await user.keyboard(" ");
    expect(h.theme.setTheme).toHaveBeenCalledWith("dark");
  });
});
