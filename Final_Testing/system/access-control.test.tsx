// SYSTEM TEST: who can get in, and what happens when they can't.
import { beforeEach, describe, expect, test } from "bun:test";
import { screen } from "@testing-library/react";
import { Route as GuardRoute } from "../../src/routes/_authenticated/route";
import { Route as TeamRoute } from "../../src/routes/_authenticated/teams.$teamId";
import { h, resetHarness } from "../../tests/helpers/harness";
import { renderWithClient } from "../../tests/helpers/render";

type Guard = { beforeLoad: (ctx: { location: { href: string } }) => Promise<unknown> };
const guard = GuardRoute as unknown as Guard;
const attempt = async (href: string) => {
  try {
    return { passed: await guard.beforeLoad({ location: { href } }) };
  } catch (e) {
    return { redirect: (e as { redirect?: Record<string, unknown> }).redirect };
  }
};

beforeEach(() => resetHarness());

describe("System: pages that need a sign-in", () => {
  test("a signed-out visitor is sent to the sign-in page and brought back afterwards", async () => {
    h.fake.setSessionMode("signed-out");
    for (const page of ["/dashboard", "/tasks", "/teams/abc", "/assistant", "/settings", "/notifications", "/resources", "/calendar"]) {
      const r = await attempt(page);
      expect(r.redirect).toEqual({ to: "/auth", search: { mode: "signin", redirect: page } });
    }
  });

  test("a signed-in student goes straight through", async () => {
    const r = await attempt("/tasks");
    expect(r.redirect).toBeUndefined();
    expect((r.passed as { user: { id: string } }).user.id).toBe("user-1");
  });

  test("if the sign-in can't be checked the student is asked to sign in again, not shown an empty page", async () => {
    h.fake.setSessionMode("error");
    expect((await attempt("/dashboard")).redirect).toMatchObject({ to: "/auth" });
  });
});

describe("System: a team the student can't open", () => {
  test("shows a clear message with ways forward, not a blank page", async () => {
    h.params = { teamId: "not-my-team" };
    const Page = (TeamRoute as unknown as { component: () => JSX.Element }).component;
    renderWithClient(<Page />);
    expect(await screen.findByText("Team not available")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Back to My Teams" }).getAttribute("href")).toBe("/teams");
    expect(screen.getByRole("link", { name: "Find a team to join" }).getAttribute("href")).toBe("/discover");
  });
});
