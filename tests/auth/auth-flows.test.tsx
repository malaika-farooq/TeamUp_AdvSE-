import { beforeEach, describe, expect, test } from "bun:test";
import { screen, waitFor } from "@testing-library/react";
import { AuthPage } from "../../src/routes/auth";
import { Landing } from "../../src/routes/index";
import { readAuthUrlError, withoutAuthError } from "../../src/lib/auth-url";
import { h, resetHarness } from "../helpers/harness";
import { renderWithClient } from "../helpers/render";

const email = () => screen.getByLabelText("Email") as HTMLInputElement;
const password = () => screen.getByLabelText("Password") as HTMLInputElement;
const calls = (op: string) => h.fake.authCalls.filter((c) => c.op === op);
type U = ReturnType<typeof renderWithClient>["user"];

async function fill(user: U, mail = "maya@example.edu", pass = "secret-pass-1") {
  await user.type(email(), mail);
  await user.type(password(), pass);
}

beforeEach(() => resetHarness(null)); // nobody signed in

describe("Sign up (email confirmation on)", () => {
  test("creates the account, then moves itself to the sign-in form with the email kept", async () => {
    h.search = { mode: "signup" };
    const { user } = renderWithClient(<AuthPage />);
    expect(screen.getByRole("heading", { name: "Create your account" })).toBeTruthy();
    await user.type(screen.getByLabelText("Full name"), "Maya Chen");
    await fill(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => expect(screen.getByRole("heading", { name: "Welcome back" })).toBeTruthy());
    expect(email().value).toBe("maya@example.edu");
    expect(password().value).toBe("");
    expect(screen.getByRole("button", { name: "Sign in" })).toBeTruthy();
    expect(screen.getByText(/confirmation link to maya@example.edu/i)).toBeTruthy();
    expect(h.toast.success).toHaveBeenCalled();
    expect(h.navigate).not.toHaveBeenCalled();
  });

  test("sends the name and the right return address to Supabase", async () => {
    h.search = { mode: "signup" };
    const { user } = renderWithClient(<AuthPage />);
    await user.type(screen.getByLabelText("Full name"), "Maya Chen");
    await fill(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));
    await waitFor(() => expect(calls("signUp").length).toBe(1));
    expect(calls("signUp")[0]!.args).toMatchObject({
      email: "maya@example.edu",
      options: { emailRedirectTo: window.location.origin, data: { display_name: "Maya Chen" } },
    });
  });

  test("uses the start of the email as the name when none is typed", async () => {
    h.search = { mode: "signup" };
    const { user } = renderWithClient(<AuthPage />);
    await fill(user, "sam.lee@example.edu");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    await waitFor(() => expect(calls("signUp").length).toBe(1));
    expect(
      (calls("signUp")[0]!.args as { options: { data: { display_name: string } } }).options.data
        .display_name,
    ).toBe("sam.lee");
  });

  test("shows the reason when sign-up fails and stays on the form", async () => {
    h.search = { mode: "signup" };
    h.fake.failAuth("signUp", { message: "User already registered" });
    const { user } = renderWithClient(<AuthPage />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));
    await waitFor(() => expect(h.toast.error).toHaveBeenCalledWith("User already registered"));
    expect(screen.getByRole("heading", { name: "Create your account" })).toBeTruthy();
  });

  test("a failed network call says to check the Supabase settings", async () => {
    h.search = { mode: "signup" };
    h.fake.failAuth("signUp", { message: "Failed to fetch" });
    const { user } = renderWithClient(<AuthPage />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));
    await waitFor(() =>
      expect(h.toast.error).toHaveBeenCalledWith(expect.stringContaining("Supabase settings")),
    );
  });
});

describe("Sign up (email confirmation off)", () => {
  test("goes straight to onboarding", async () => {
    h.search = { mode: "signup" };
    h.fake.signUpReturnsSession();
    const { user } = renderWithClient(<AuthPage />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));
    await waitFor(() =>
      expect(h.navigate).toHaveBeenCalledWith({ to: "/onboarding", replace: true }),
    );
  });
});

describe("Sign in", () => {
  test("signs in and goes to the dashboard, replacing the sign-in page in history", async () => {
    const { user } = renderWithClient(<AuthPage />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() =>
      expect(h.navigate).toHaveBeenCalledWith({ to: "/dashboard", replace: true }),
    );
    expect(calls("signInWithPassword")[0]!.args).toEqual({
      email: "maya@example.edu",
      password: "secret-pass-1",
    });
  });

  test("returns to the page the student was trying to open", async () => {
    h.search = { redirect: "/invite/abc123" };
    const { user } = renderWithClient(<AuthPage />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() =>
      expect(h.navigate).toHaveBeenCalledWith({ to: "/invite/abc123", replace: true }),
    );
  });

  test("ignores an outside address in the redirect", async () => {
    h.search = { redirect: "https://evil.example/steal" };
    const { user } = renderWithClient(<AuthPage />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() =>
      expect(h.navigate).toHaveBeenCalledWith({ to: "/dashboard", replace: true }),
    );
  });

  test("wrong password shows the message and doesn't leave the page", async () => {
    h.fake.failAuth("signInWithPassword", { message: "Invalid login credentials" });
    const { user } = renderWithClient(<AuthPage />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(h.toast.error).toHaveBeenCalledWith("Invalid login credentials"));
    expect(h.navigate).not.toHaveBeenCalled();
  });

  test("an unconfirmed email is explained", async () => {
    h.fake.failAuth("signInWithPassword", { message: "Email not confirmed" });
    const { user } = renderWithClient(<AuthPage />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() =>
      expect(screen.getByText(/please confirm maya@example.edu first/i)).toBeTruthy(),
    );
  });

  test("a signed-in student visiting /auth is sent to the dashboard", async () => {
    resetHarness({ id: "user-1", email: "maya@example.edu", user_metadata: {} });
    renderWithClient(<AuthPage />);
    await waitFor(() =>
      expect(h.navigate).toHaveBeenCalledWith({ to: "/dashboard", replace: true }),
    );
  });

  test("switches between sign in and create account", async () => {
    const { user } = renderWithClient(<AuthPage />);
    await user.click(screen.getByRole("button", { name: /new here\? create an account/i }));
    expect(screen.getByRole("heading", { name: "Create your account" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /already have an account/i }));
    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeTruthy();
  });
});

describe("Continue with Google", () => {
  const google = () => screen.getByRole("button", { name: /continue with google/i });

  test("asks Supabase for Google and returns to this site's own address", async () => {
    const { user } = renderWithClient(<AuthPage />);
    await user.click(google());
    await waitFor(() => expect(calls("signInWithOAuth").length).toBe(1));
    expect(calls("signInWithOAuth")[0]!.args).toEqual({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    expect(h.toast.error).not.toHaveBeenCalled();
  });

  test("works from the sign-up form too (Get started, then Google)", async () => {
    h.search = { mode: "signup" };
    const { user } = renderWithClient(<AuthPage />);
    await user.click(google());
    await waitFor(() => expect(calls("signInWithOAuth").length).toBe(1));
  });

  test("shows Supabase's reason when Google isn't available", async () => {
    h.fake.failAuth("signInWithOAuth", {
      message: "Unsupported provider: provider is not enabled",
    });
    const { user } = renderWithClient(<AuthPage />);
    await user.click(google());
    await waitFor(() =>
      expect(h.toast.error).toHaveBeenCalledWith(
        expect.stringContaining("provider is not enabled"),
      ),
    );
  });

  test("a network failure points at the deployment's Supabase settings", async () => {
    h.fake.throwAuth("signInWithOAuth", new Error("Failed to fetch"));
    const { user } = renderWithClient(<AuthPage />);
    await user.click(google());
    await waitFor(() =>
      expect(h.toast.error).toHaveBeenCalledWith(expect.stringContaining("Supabase settings")),
    );
  });
});

describe("Landing page", () => {
  test("a visitor sees Get Started and Sign In going to the right forms", () => {
    renderWithClient(<Landing />);
    const started = screen.getAllByRole("link", { name: /get started/i })[0] as HTMLAnchorElement;
    expect(started.getAttribute("href")).toBe("/auth?mode=signup");
    const signIn = screen.getAllByRole("link", { name: /^sign in$/i })[0] as HTMLAnchorElement;
    expect(signIn.getAttribute("href")).toBe("/auth?mode=signin");
    expect(h.navigate).not.toHaveBeenCalled();
  });

  test("a signed-in student is sent to the dashboard and isn't offered sign in", async () => {
    resetHarness({ id: "user-1", email: "maya@example.edu", user_metadata: {} });
    renderWithClient(<Landing />);
    await waitFor(() =>
      expect(h.navigate).toHaveBeenCalledWith({ to: "/dashboard", replace: true }),
    );
    expect(screen.queryByRole("link", { name: /get started/i })).toBeNull();
    expect(screen.getAllByRole("link", { name: /open dashboard/i }).length).toBeGreaterThan(0);
  });
});

describe("Reading a failed sign-in from the address", () => {
  const base = "https://teamup.vercel.app/";

  test("no error means nothing to show", () => {
    expect(readAuthUrlError(base)).toBeNull();
    expect(readAuthUrlError(`${base}#access_token=abc&type=signup`)).toBeNull();
    expect(readAuthUrlError("not a url")).toBeNull();
  });

  test("a cancelled Google sign-in is friendly", () => {
    const e = readAuthUrlError(
      `${base}#error=access_denied&error_description=The+user+denied+access`,
    );
    expect(e?.message).toContain("cancelled");
  });

  test("a redirect problem explains the Supabase setting to change", () => {
    const e = readAuthUrlError(
      `${base}?error=invalid_request&error_description=redirect+URL+not+allowed`,
    );
    expect(e?.message).toContain("URL Configuration");
  });

  test("other errors show Supabase's own wording", () => {
    const e = readAuthUrlError(
      `${base}#error=server_error&error_code=unexpected_failure&error_description=Unable+to+exchange+external+code`,
    );
    expect(e?.message).toBe("Sign-in didn't complete: Unable to exchange external code");
  });

  test("the error is removed from the address afterwards", () => {
    const cleaned = withoutAuthError(
      `${base}?keep=1&error=x#error=access_denied&error_description=d&other=2`,
    );
    expect(cleaned).toBe("/?keep=1#other=2");
  });
});
