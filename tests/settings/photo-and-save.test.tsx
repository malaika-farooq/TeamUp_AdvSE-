import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { screen, waitFor } from "@testing-library/react";
import { UserAvatar } from "../../src/components/app/profile/UserAvatar";
import { saveProfile } from "../../src/lib/profile-queries";
import { h, resetHarness } from "../helpers/harness";
import { renderWithClient } from "../helpers/render";

// A stand-in for the browser's Image that "loads" only the addresses a test allows.
const RealImage = (globalThis as unknown as { window: { Image: unknown } }).window.Image;
function fakeImages(loads: (src: string) => boolean) {
  class FakeImage {
    private handlers: Record<string, ((e: unknown) => void)[]> = {};
    referrerPolicy = "";
    crossOrigin: string | null = null;
    complete = false;
    naturalWidth = 0;
    addEventListener(type: string, fn: (e: unknown) => void) {
      (this.handlers[type] ??= []).push(fn);
    }
    removeEventListener(type: string, fn: (e: unknown) => void) {
      this.handlers[type] = (this.handlers[type] ?? []).filter((f) => f !== fn);
    }
    set src(value: string) {
      queueMicrotask(() => {
        const ok = loads(value);
        this.complete = true;
        this.naturalWidth = ok ? 16 : 0;
        (this.handlers[ok ? "load" : "error"] ?? []).forEach((f) =>
          f({ currentTarget: this, target: this }),
        );
      });
    }
  }
  (window as unknown as { Image: unknown }).Image = FakeImage;
}

beforeEach(() => resetHarness());
afterEach(() => {
  (window as unknown as { Image: unknown }).Image = RealImage;
});

describe("Profile photo in the circle", () => {
  test("shows the photo from the public address when it loads", async () => {
    fakeImages((src) => src.startsWith("https://files.test/avatars/"));
    renderWithClient(<UserAvatar name="Maya Chen" path="user-1/avatar-1.png" />);
    const img = await screen.findByRole("img");
    expect(img.getAttribute("src")).toBe("https://files.test/avatars/user-1/avatar-1.png");
  });

  test("falls back to a signed link when the public address fails (private bucket)", async () => {
    fakeImages((src) => src.startsWith("https://files.test/signed/"));
    renderWithClient(<UserAvatar name="Maya Chen" path="user-1/avatar-1.png" />);
    const img = await screen.findByRole("img");
    expect(img.getAttribute("src")).toBe("https://files.test/signed/user-1/avatar-1.png");
  });

  test("shows initials when no address works", async () => {
    fakeImages(() => false);
    renderWithClient(<UserAvatar name="Maya Chen" path="user-1/avatar-1.png" />);
    await waitFor(() => expect(screen.getByText("MC")).toBeTruthy());
    expect(screen.queryByRole("img")).toBeNull();
  });

  test("shows initials when there is no photo at all", () => {
    renderWithClient(<UserAvatar name="Maya Chen" path={null} />);
    expect(screen.getByText("MC")).toBeTruthy();
  });
});

describe("Saving the profile is verified", () => {
  const fields = {
    display_name: "Maya Chen",
    university: "Lakeside College",
    major: "Physics",
    bio: null,
    timezone: "UTC",
    discoverable: true,
  };

  test("accepts a save the database kept", async () => {
    await saveProfile("user-1", fields);
    expect(h.fake.tables["profiles"]![0]).toMatchObject({ university: "Lakeside College" });
  });

  test("reports it when the database kept something different (for example the university)", async () => {
    const real = h.fake.client.from;
    h.fake.client.from = (table: string) => {
      const b = real(table) as Record<string, (...a: unknown[]) => unknown>;
      if (table !== "profiles") return b as never;
      const upsert = b["upsert"]!;
      b["upsert"] = (...args: unknown[]) => {
        const chain = upsert(...args) as { then: (...a: unknown[]) => unknown };
        const then = chain.then.bind(chain);
        chain.then = (resolve: (v: { data: unknown; error: null }) => unknown) =>
          then((r: { data: Record<string, unknown> }) =>
            resolve({ data: { ...r.data, university: "OLD VALUE" }, error: null }),
          );
        return chain;
      };
      return b as never;
    };
    await expect(saveProfile("user-1", fields)).rejects.toThrow(/didn't keep your university/);
  });
});
