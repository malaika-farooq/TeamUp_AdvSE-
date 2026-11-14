import { describe, expect, test } from "bun:test";
import { SETUP_MESSAGE, avatarSrc, profileError } from "../src/lib/profile-queries";

describe("explaining database errors to students", () => {
  test("a missing database function becomes a setup instruction", () => {
    expect(profileError({ code: "PGRST202", message: "x" }).message).toBe(SETUP_MESSAGE);
    expect(
      profileError({ message: "Could not find the function public.set_my_courses" }).message,
    ).toBe(SETUP_MESSAGE);
    expect(profileError({ message: "relation not in the schema cache" }).message).toBe(
      SETUP_MESSAGE,
    );
    expect(SETUP_MESSAGE).toContain("0007_profile_completion.sql");
  });

  test("a missing photo bucket becomes a setup instruction", () => {
    expect(profileError({ message: "Bucket not found" }).message).toContain(
      "0007_profile_completion.sql",
    );
  });

  test("permission errors ask the student to sign in again", () => {
    expect(
      profileError({ message: "new row violates row-level security policy" }).message,
    ).toContain("sign in again");
    expect(profileError({ message: "permission denied for table profiles" }).message).toContain(
      "sign in again",
    );
  });

  test("other messages pass through untouched", () => {
    expect(profileError({ message: "Course title is too long (max 120 characters)" }).message).toBe(
      "Course title is too long (max 120 characters)",
    );
  });

  test("an empty error still says something useful", () => {
    expect(profileError(null).message).toContain("Something went wrong");
    expect(profileError({}).message).toContain("Something went wrong");
  });
});

describe("profile photo addresses", () => {
  test("no photo means no address", () => {
    expect(avatarSrc(null)).toBeUndefined();
    expect(avatarSrc(undefined)).toBeUndefined();
    expect(avatarSrc("")).toBeUndefined();
  });

  test("a full web address is used as it is", () => {
    expect(avatarSrc("https://example.com/me.png")).toBe("https://example.com/me.png");
  });

  test("a stored path becomes a public address in the avatars bucket", () => {
    expect(avatarSrc("user-1/avatar-5.png")).toBe("https://files.test/avatars/user-1/avatar-5.png");
  });
});
