import { beforeEach, describe, expect, test } from "bun:test";
import { screen, waitFor } from "@testing-library/react";
import { ProfileTab } from "../../src/components/app/settings/ProfileTab";
import { h, profileRow, resetHarness } from "../helpers/harness";
import { deferred, renderWithClient } from "../helpers/render";

const input = (label: string) => screen.getByLabelText(label) as HTMLInputElement;
const loaded = () => waitFor(() => expect(input("Display name").value).not.toBe(""));
const saveButton = () => screen.getByRole("button", { name: /save profile/i }) as HTMLButtonElement;
const savedProfile = () => h.fake.tables["profiles"]![0]!;
const upserts = () => h.fake.callsTo("profiles", "upsert");

async function retype(
  user: ReturnType<typeof renderWithClient>["user"],
  label: string,
  text: string,
) {
  const el = input(label);
  await user.clear(el);
  if (text) await user.type(el, text);
}

beforeEach(() => {
  resetHarness();
  h.fake.seed("profiles", [profileRow()]);
});

describe("Settings > Profile: loading", () => {
  test("shows the saved profile in every field", async () => {
    renderWithClient(<ProfileTab />);
    await loaded();
    expect(input("Display name").value).toBe("Maya Chen");
    expect(input("University").value).toBe("Northbridge University");
    expect(input("Major").value).toBe("Computer Science");
    expect(input("Time zone").value).toBe("America/Toronto");
    expect(input("About you").value).toBe("Loves databases.");
    expect(
      screen.getByRole("switch", { name: /show me in discover/i }).getAttribute("aria-checked"),
    ).toBe("true");
  });

  test("shows an unchecked Discover switch for a private profile", async () => {
    h.fake.seed("profiles", [profileRow({ discoverable: false })]);
    renderWithClient(<ProfileTab />);
    await loaded();
    expect(
      screen.getByRole("switch", { name: /show me in discover/i }).getAttribute("aria-checked"),
    ).toBe("false");
  });

  test("shows a live character count for the bio", async () => {
    renderWithClient(<ProfileTab />);
    await loaded();
    expect(screen.getByText("16/500")).toBeTruthy();
  });

  test("limits how much can be typed", async () => {
    renderWithClient(<ProfileTab />);
    await loaded();
    expect(input("Display name").maxLength).toBe(80);
    expect(input("University").maxLength).toBe(120);
    expect(input("Major").maxLength).toBe(120);
    expect(input("About you").maxLength).toBe(500);
  });

  test("shows an error with a retry button when the profile can't be loaded", async () => {
    h.fake.failTable("profiles", "select", { message: "Network down" });
    const { user } = renderWithClient(<ProfileTab />);
    expect(await screen.findByText("Couldn't load your profile")).toBeTruthy();
    expect(screen.getByText("Network down")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /try again/i }));
    await waitFor(() => expect(input("Display name").value).toBe("Maya Chen"));
  });

  test("fields are disabled while the profile is loading", async () => {
    renderWithClient(<ProfileTab />);
    expect(input("Display name").disabled).toBe(true);
    expect(saveButton().disabled).toBe(true);
    await loaded();
    expect(input("Display name").disabled).toBe(false);
    expect(saveButton().disabled).toBe(false);
  });
});

describe("Settings > Profile: saving", () => {
  test("saves every edited field", async () => {
    const { user } = renderWithClient(<ProfileTab />);
    await loaded();
    await retype(user, "Display name", "Maya C. Chen");
    await retype(user, "University", "Lakeside College");
    await retype(user, "Major", "Data Science");
    await retype(user, "Time zone", "Europe/London");
    await retype(user, "About you", "Now into machine learning.");
    await user.click(saveButton());

    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Profile saved"));
    expect(savedProfile()).toMatchObject({
      id: "user-1",
      display_name: "Maya C. Chen",
      university: "Lakeside College",
      major: "Data Science",
      timezone: "Europe/London",
      bio: "Now into machine learning.",
      discoverable: true,
    });
    expect(h.toast.error).not.toHaveBeenCalled();
  });

  test("sends the profile to the database as an upsert for the signed-in student", async () => {
    const { user } = renderWithClient(<ProfileTab />);
    await loaded();
    await user.click(saveButton());
    await waitFor(() => expect(upserts().length).toBe(1));
    const call = upserts()[0]!;
    expect(call.onConflict).toBe("id");
    expect(call.payload).toMatchObject({ id: "user-1", display_name: "Maya Chen" });
    expect(typeof (call.payload as { updated_at: string }).updated_at).toBe("string");
  });

  test("shows the saved values again after saving", async () => {
    const { user } = renderWithClient(<ProfileTab />);
    await loaded();
    await retype(user, "Display name", "  Maya    Chen   ");
    await user.click(saveButton());
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    await waitFor(() => expect(input("Display name").value).toBe("Maya Chen"));
  });

  test("turns blank optional fields into nothing, not empty text", async () => {
    const { user } = renderWithClient(<ProfileTab />);
    await loaded();
    await retype(user, "University", "   ");
    await retype(user, "Major", "");
    await retype(user, "About you", "");
    await user.click(saveButton());
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    expect(savedProfile()).toMatchObject({ university: null, major: null, bio: null });
  });

  test("an empty time zone is saved as UTC", async () => {
    const { user } = renderWithClient(<ProfileTab />);
    await loaded();
    await retype(user, "Time zone", "");
    await user.click(saveButton());
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    expect(savedProfile()["timezone"]).toBe("UTC");
  });

  test("the Discover switch is saved", async () => {
    const { user } = renderWithClient(<ProfileTab />);
    await loaded();
    await user.click(screen.getByRole("switch", { name: /show me in discover/i }));
    await user.click(saveButton());
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    expect(savedProfile()["discoverable"]).toBe(false);
  });

  test("keeps other saved columns, like onboarding status, untouched", async () => {
    const { user } = renderWithClient(<ProfileTab />);
    await loaded();
    await user.click(saveButton());
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    expect(savedProfile()["onboarded"]).toBe(true);
  });

  test("shows 'saving' state and blocks a second click while saving", async () => {
    const gate = deferred();
    const real = h.fake.client.from;
    // hold back only the write, so the form itself still loads normally
    h.fake.client.from = (table: string) => {
      const b = real(table) as Record<string, (...a: unknown[]) => unknown>;
      if (table === "profiles") {
        const upsert = b["upsert"]!;
        b["upsert"] = (...args: unknown[]) => {
          const chain = upsert(...args) as { then: (...a: unknown[]) => unknown };
          const originalThen = chain.then.bind(chain);
          chain.then = (resolve: unknown, reject: unknown) =>
            gate.promise.then(() => originalThen(resolve, reject));
          return chain;
        };
      }
      return b as never;
    };
    const { user } = renderWithClient(<ProfileTab />);
    await loaded();
    await user.click(saveButton());
    await waitFor(() => expect(saveButton().disabled).toBe(true));
    expect(h.toast.success).not.toHaveBeenCalled();
    gate.resolve();
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Profile saved"));
    await waitFor(() => expect(saveButton().disabled).toBe(false));
    expect(upserts().length).toBe(1);
  });
});

describe("Settings > Profile: validation", () => {
  test("won't save an empty name", async () => {
    const { user } = renderWithClient(<ProfileTab />);
    await loaded();
    await retype(user, "Display name", "   ");
    await user.click(saveButton());
    expect(h.toast.error).toHaveBeenCalledWith("Please enter your name.");
    expect(upserts().length).toBe(0);
    expect(h.toast.success).not.toHaveBeenCalled();
  });

  test("won't save an unknown time zone", async () => {
    const { user } = renderWithClient(<ProfileTab />);
    await loaded();
    await retype(user, "Time zone", "Mars/Olympus");
    await user.click(saveButton());
    expect(h.toast.error).toHaveBeenCalledWith(
      expect.stringContaining("time zone isn't recognised"),
    );
    expect(upserts().length).toBe(0);
  });

  test("accepts a real time zone typed with extra spaces", async () => {
    const { user } = renderWithClient(<ProfileTab />);
    await loaded();
    await retype(user, "Time zone", "  Asia/Tokyo ");
    await user.click(saveButton());
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    expect(savedProfile()["timezone"]).toBe("Asia/Tokyo");
  });
});

describe("Settings > Profile: when saving goes wrong", () => {
  test("tells the student what the database said and keeps their edits", async () => {
    h.fake.failTable("profiles", "upsert", { message: "permission denied for table profiles" });
    const { user } = renderWithClient(<ProfileTab />);
    await loaded();
    await retype(user, "Major", "Physics");
    await user.click(saveButton());
    await waitFor(() => expect(h.toast.error).toHaveBeenCalled());
    expect(h.toast.success).not.toHaveBeenCalled();
    expect(input("Major").value).toBe("Physics");
    expect(saveButton().disabled).toBe(false);
  });

  test("a missing storage/database setup is explained in plain words", async () => {
    h.fake.failTable("profiles", "upsert", {
      message: "Could not find the function",
      code: "PGRST202",
    });
    const { user } = renderWithClient(<ProfileTab />);
    await loaded();
    await user.click(saveButton());
    await waitFor(() =>
      expect(h.toast.error).toHaveBeenCalledWith(expect.stringContaining("0007")),
    );
  });

  test("never says 'saved' when nothing came back from the database", async () => {
    const real = h.fake.client.from;
    h.fake.client.from = (table: string) => {
      if (table === "profiles" && h.fake.callsTo("profiles", "select").length > 0) {
        const empty: Record<string, unknown> = {};
        for (const m of ["upsert", "select", "maybeSingle", "eq"]) empty[m] = () => empty;
        empty["then"] = (res: (v: unknown) => unknown) =>
          Promise.resolve({ data: null, error: null }).then(res);
        return empty as never;
      }
      return real(table);
    };
    const { user } = renderWithClient(<ProfileTab />);
    await loaded();
    await user.click(saveButton());
    await waitFor(() =>
      expect(h.toast.error).toHaveBeenCalledWith(expect.stringContaining("couldn't be saved")),
    );
    expect(h.toast.success).not.toHaveBeenCalled();
  });
});

describe("Settings > Profile: an account whose profile row is missing", () => {
  beforeEach(() => {
    h.fake.seed("profiles", []);
  });

  test("starts the form with the name from sign-up instead of a blank page", async () => {
    renderWithClient(<ProfileTab />);
    await waitFor(() => expect(input("Display name").value).toBe("Maya Chen"));
    expect(input("University").value).toBe("");
  });

  test("falls back to the email name when sign-up gave none", async () => {
    resetHarness({ id: "user-1", email: "sam.lee@example.edu", user_metadata: {} });
    h.fake.seed("profiles", []);
    renderWithClient(<ProfileTab />);
    await waitFor(() => expect(input("Display name").value).toBe("sam.lee"));
  });

  test("saving creates the missing profile", async () => {
    const { user } = renderWithClient(<ProfileTab />);
    await waitFor(() => expect(input("Display name").value).toBe("Maya Chen"));
    await retype(user, "University", "Riverside Institute");
    await user.click(saveButton());
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Profile saved"));
    expect(h.fake.tables["profiles"]).toHaveLength(1);
    expect(savedProfile()).toMatchObject({
      id: "user-1",
      display_name: "Maya Chen",
      university: "Riverside Institute",
    });
  });
});

describe("Settings > Profile: completeness", () => {
  test("lists what is still missing", async () => {
    h.fake.seed("profiles", [profileRow({ bio: null })]);
    renderWithClient(<ProfileTab />);
    await loaded();
    await screen.findByText("Write a short bio");
    expect(screen.getByText("Add a profile photo")).toBeTruthy();
    expect(screen.getByText("Add your enrolled courses")).toBeTruthy();
    expect(screen.getByText("Add your skills")).toBeTruthy();
    expect(screen.getByText("Mark when you are free each week")).toBeTruthy();
    expect(screen.queryByText("Add your university")).toBeNull();
  });

  test("reaches 100% when everything is filled in", async () => {
    h.fake.seed("profiles", [profileRow({ avatar_url: "user-1/avatar-1.png" })]);
    h.fake.seed("user_courses", [
      { user_id: "user-1", courses: { code: "CS101", title: "Intro" } },
    ]);
    h.fake.seed("user_skills", [{ user_id: "user-1", level: 4, skills: { name: "Python" } }]);
    h.fake.seed("availability_slots", [
      { user_id: "user-1", weekday: 1, start_minute: 480, end_minute: 720 },
    ]);
    renderWithClient(<ProfileTab />);
    expect(await screen.findByText("100%")).toBeTruthy();
    expect(screen.getByText(/profile is complete/i)).toBeTruthy();
  });
});

describe("Settings > Profile: photo", () => {
  const png = (bytes = 1024, name = "me.png", type = "image/png") =>
    new File([new Uint8Array(bytes)], name, { type });
  const chooser = () => screen.getByLabelText("Choose a profile photo") as HTMLInputElement;

  test("uploads a photo and points the profile at it", async () => {
    const { user } = renderWithClient(<ProfileTab />);
    await loaded();
    await user.upload(chooser(), png());
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Photo updated"));
    const upload = h.fake.storageCalls.find((c) => c.op === "upload")!;
    expect(upload.bucket).toBe("avatars");
    expect(String(upload.args[0])).toMatch(/^user-1\/avatar-\d+\.png$/);
    expect(String(savedProfile()["avatar_url"])).toMatch(/^user-1\/avatar-\d+\.png$/);
  });

  test("replacing a photo deletes the old file", async () => {
    h.fake.seed("profiles", [profileRow({ avatar_url: "user-1/avatar-OLD.png" })]);
    const { user } = renderWithClient(<ProfileTab />);
    await loaded();
    await user.upload(chooser(), png(2048, "new.png"));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Photo updated"));
    const removed = h.fake.storageCalls.find((c) => c.op === "remove")!;
    expect(removed.args[0]).toEqual(["user-1/avatar-OLD.png"]);
  });

  test("rejects a file that isn't a picture", async () => {
    const { user } = renderWithClient(<ProfileTab />);
    await loaded();
    await user.upload(chooser(), png(100, "notes.txt", "text/plain"));
    expect(h.toast.error).toHaveBeenCalledWith("Use a JPG, PNG, WebP or GIF image.");
    expect(h.fake.storageCalls.length).toBe(0);
  });

  test("rejects a picture over 2 MB", async () => {
    const { user } = renderWithClient(<ProfileTab />);
    await loaded();
    await user.upload(chooser(), png(3 * 1024 * 1024, "huge.png"));
    expect(h.toast.error).toHaveBeenCalledWith("The photo must be 2 MB or smaller.");
    expect(h.fake.storageCalls.length).toBe(0);
  });

  test("explains a missing photo bucket", async () => {
    h.fake.failStorage("upload", { message: "Bucket not found" });
    const { user } = renderWithClient(<ProfileTab />);
    await loaded();
    await user.upload(chooser(), png());
    await waitFor(() =>
      expect(h.toast.error).toHaveBeenCalledWith(expect.stringContaining("0007")),
    );
    expect(savedProfile()["avatar_url"]).toBeNull();
  });

  test("cleans up the uploaded file if the profile can't be updated", async () => {
    h.fake.failTable("profiles", "update", { message: "row-level security violation" });
    const { user } = renderWithClient(<ProfileTab />);
    await loaded();
    await user.upload(chooser(), png());
    await waitFor(() => expect(h.toast.error).toHaveBeenCalled());
    expect(h.fake.storageCalls.some((c) => c.op === "remove")).toBe(true);
    expect(h.toast.success).not.toHaveBeenCalledWith("Photo updated");
  });

  test("removes the photo", async () => {
    h.fake.seed("profiles", [profileRow({ avatar_url: "user-1/avatar-9.png" })]);
    const { user } = renderWithClient(<ProfileTab />);
    await loaded();
    await user.click(await screen.findByRole("button", { name: /remove/i }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Photo removed"));
    expect(savedProfile()["avatar_url"]).toBeNull();
    expect(h.fake.storageCalls.find((c) => c.op === "remove")!.args[0]).toEqual([
      "user-1/avatar-9.png",
    ]);
  });

  test("offers no Remove button when there is no photo", async () => {
    renderWithClient(<ProfileTab />);
    await loaded();
    expect(screen.queryByRole("button", { name: /remove/i })).toBeNull();
    expect(screen.getByRole("button", { name: /upload photo/i })).toBeTruthy();
  });
});
