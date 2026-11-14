import { beforeEach, describe, expect, test } from "bun:test";
import { screen, waitFor } from "@testing-library/react";
import { AccountTab } from "../../src/components/app/settings/AccountTab";
import { h, resetHarness } from "../helpers/harness";
import { deferred, renderWithClient } from "../helpers/render";

const current = () => screen.getByLabelText("Current password") as HTMLInputElement;
const next = () => screen.getByLabelText("New password") as HTMLInputElement;
const update = () => screen.getByRole("button", { name: /update password/i }) as HTMLButtonElement;
const create = () =>
  screen.getByRole("button", { name: /create sample workspace/i }) as HTMLButtonElement;
const remove = () => screen.getByRole("button", { name: /remove sample/i }) as HTMLButtonElement;

beforeEach(() => resetHarness());

describe("Settings > Account: change password", () => {
  test("won't accept a short password", async () => {
    const { user } = renderWithClient(<AccountTab />);
    await user.type(next(), "short");
    await user.click(update());
    expect(h.toast.error).toHaveBeenCalledWith("Use at least 8 characters.");
    expect(h.fake.authCalls.length).toBe(0);
  });

  test("won't accept an empty password", async () => {
    const { user } = renderWithClient(<AccountTab />);
    await user.click(update());
    expect(h.toast.error).toHaveBeenCalledWith("Use at least 8 characters.");
    expect(h.fake.authCalls.length).toBe(0);
  });

  test("changes the password and clears the fields", async () => {
    const { user } = renderWithClient(<AccountTab />);
    await user.type(next(), "a-much-longer-password");
    await user.click(update());
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Password updated"));
    expect(h.fake.authCalls).toEqual([
      { op: "updateUser", args: { password: "a-much-longer-password" } },
    ]);
    expect(next().value).toBe("");
    expect(current().value).toBe("");
  });

  test("sends the current password too when one is given", async () => {
    const { user } = renderWithClient(<AccountTab />);
    await user.type(current(), "old-password-1");
    await user.type(next(), "new-password-22");
    await user.click(update());
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    expect(h.fake.authCalls[0]!.args).toEqual({
      password: "new-password-22",
      current_password: "old-password-1",
    });
  });

  test("rejects a new password that equals the current one", async () => {
    const { user } = renderWithClient(<AccountTab />);
    await user.type(current(), "same-password-1");
    await user.type(next(), "same-password-1");
    await user.click(update());
    expect(h.toast.error).toHaveBeenCalledWith(
      expect.stringContaining("different from the current one"),
    );
    expect(h.fake.authCalls.length).toBe(0);
  });

  test("shows the reason when the server refuses, and keeps what was typed", async () => {
    h.fake.failAuth("updateUser", {
      message: "New password should be different from the old password.",
    });
    const { user } = renderWithClient(<AccountTab />);
    await user.type(next(), "a-much-longer-password");
    await user.click(update());
    await waitFor(() =>
      expect(h.toast.error).toHaveBeenCalledWith(
        "New password should be different from the old password.",
      ),
    );
    expect(h.toast.success).not.toHaveBeenCalled();
    expect(next().value).toBe("a-much-longer-password");
    expect(update().disabled).toBe(false);
  });

  test("hides what is typed", () => {
    renderWithClient(<AccountTab />);
    expect(current().type).toBe("password");
    expect(next().type).toBe("password");
  });

  test("is disabled while updating", async () => {
    const gate = deferred();
    const realUpdate = h.fake.client.auth.updateUser;
    h.fake.client.auth.updateUser = async (args: unknown) => {
      await gate.promise;
      return realUpdate(args);
    };
    const { user } = renderWithClient(<AccountTab />);
    await user.type(next(), "a-much-longer-password");
    await user.click(update());
    await waitFor(() => expect(update().disabled).toBe(true));
    gate.resolve();
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    await waitFor(() => expect(update().disabled).toBe(false));
  });
});

describe("Settings > Account: sample workspace", () => {
  test("creates the sample workspace", async () => {
    const { user } = renderWithClient(<AccountTab />);
    await user.click(create());
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Sample workspace created"));
    expect(h.sample.create).toHaveBeenCalledTimes(1);
    expect(h.sample.remove).not.toHaveBeenCalled();
  });

  test("removes the sample workspace", async () => {
    const { user } = renderWithClient(<AccountTab />);
    await user.click(remove());
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Sample workspace removed"));
    expect(h.sample.remove).toHaveBeenCalledTimes(1);
  });

  test("shows the reason when creating fails", async () => {
    h.sample.create = Object.assign(async () => {
      throw new Error("Couldn't reach the database");
    }, h.sample.create) as never;
    const { user } = renderWithClient(<AccountTab />);
    await user.click(create());
    await waitFor(() => expect(h.toast.error).toHaveBeenCalledWith("Couldn't reach the database"));
    expect(h.toast.success).not.toHaveBeenCalled();
    expect(create().disabled).toBe(false);
  });

  test("has a plain fallback message when the failure has no text", async () => {
    h.sample.remove = (async () => {
      throw "boom";
    }) as never;
    const { user } = renderWithClient(<AccountTab />);
    await user.click(remove());
    await waitFor(() => expect(h.toast.error).toHaveBeenCalledWith("Couldn't remove the sample."));
  });

  test("both buttons are disabled while one is working (no double clicks)", async () => {
    const gate = deferred();
    h.sample.create = (async () => {
      await gate.promise;
      return {};
    }) as never;
    const { user } = renderWithClient(<AccountTab />);
    await user.click(create());
    await waitFor(() => expect(create().disabled).toBe(true));
    expect(remove().disabled).toBe(true);
    gate.resolve();
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    await waitFor(() => expect(create().disabled).toBe(false));
    expect(remove().disabled).toBe(false);
  });
});

describe("Settings > Account: sign out", () => {
  test("signs out and goes to the sign-in page", async () => {
    const { user } = renderWithClient(<AccountTab />);
    await user.click(screen.getByRole("button", { name: /sign out/i }));
    await waitFor(() => expect(h.signOut).toHaveBeenCalledTimes(1));
    expect(h.navigate).toHaveBeenCalledWith({ to: "/auth", replace: true });
  });
});
