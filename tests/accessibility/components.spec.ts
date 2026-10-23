import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

for (const theme of ["light", "dark"]) {
  test(`${theme} components satisfy automated WCAG A/AA checks`, async ({ page }) => {
    await page
      .locator("html")
      .evaluate((element, dark) => element.classList.toggle("dark", dark), theme === "dark");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("input has an accessible label and description", async ({ page }) => {
  const input = page.getByRole("textbox", { name: "Task title", exact: true });
  await expect(input).toHaveAccessibleDescription("Give your task a descriptive title.");
  await input.fill("Prepare project report");
  await expect(input).toHaveValue("Prepare project report");
});

test("checkbox works with keyboard and exposes checked state", async ({ page }) => {
  const checkbox = page.getByRole("checkbox", { name: "Mark complete" });
  await checkbox.focus();
  await page.keyboard.press("Space");
  await expect(checkbox).toBeChecked();
  await page.keyboard.press("Space");
  await expect(checkbox).not.toBeChecked();
});

test("switch works with keyboard and exposes checked state", async ({ page }) => {
  const control = page.getByRole("switch", { name: "Session reminders" });
  await control.focus();
  await page.keyboard.press("Space");
  await expect(control).toBeChecked();
});

test("disabled button is skipped in keyboard tab order", async ({ page }) => {
  await expect(page.getByRole("button", { name: "Unavailable action" })).toBeDisabled();
  await page.getByRole("switch", { name: "Session reminders" }).focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Edit task", exact: true })).toBeFocused();
});

test("dialog has a name and description and passes automated checks", async ({ page }) => {
  await page.getByRole("button", { name: "Edit task", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Edit task details" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAccessibleDescription(
    "Update the task title before closing this dialog.",
  );
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("dialog traps focus and Escape restores focus to its trigger", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "Edit task", exact: true });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const input = page.getByRole("textbox", { name: "Updated title" });
  await expect(input).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Close", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(input).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("tabs support arrow-key navigation and identify their panel", async ({ page }) => {
  await page.getByRole("tab", { name: "Tasks", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  const resources = page.getByRole("tab", { name: "Resources", exact: true });
  await expect(resources).toBeFocused();
  await expect(resources).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "Resources", exact: true })).toHaveText(
    "Your shared resources",
  );
});

test("loading and error states are announced and retry works by keyboard", async ({ page }) => {
  await expect(page.getByRole("status", { name: "Loading content" })).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("Your tasks could not be loaded.");
  await expect(page.getByRole("heading", { name: "No resources yet" })).toBeVisible();
  await page.getByRole("button", { name: "Try again" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status", { name: "Retry result" })).toHaveText("Retry count: 1");
});

test("content reflows without horizontal scrolling", async ({ page }) => {
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.width);
});
