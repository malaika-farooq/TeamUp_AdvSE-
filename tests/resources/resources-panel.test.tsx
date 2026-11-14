import { beforeEach, describe, expect, spyOn, test } from "bun:test";
import { screen, waitFor, within } from "@testing-library/react";
import { ResourcesPanel } from "../../src/components/app/ResourcesPanel";
import type { Resource } from "../../src/lib/queries";
import { h, resetHarness } from "../helpers/harness";
import { renderWithClient } from "../helpers/render";

const TEAM = { id: "t1", name: "Capstone Crew" };
const TEAM2 = { id: "t2", name: "Study Circle" };
type User = ReturnType<typeof renderWithClient>["user"];

let n = 0;
function resource(over: Partial<Resource> = {}): Resource {
  n++;
  return {
    id: `res-${n}`,
    team_id: "t1",
    kind: "note",
    title: `Resource ${n}`,
    content: null,
    url: null,
    storage_path: null,
    file_size: null,
    mime_type: null,
    tags: [],
    version: 1,
    created_by: "user-1",
    updated_by: "user-1",
    created_at: "2026-11-01T00:00:00Z",
    updated_at: `2026-11-0${(n % 9) + 1}T00:00:00Z`,
    ...over,
  } as Resource;
}

function setup(role: "owner" | "admin" | "member" = "owner", teams = [TEAM]) {
  resetHarness();
  h.fake.seed("team_members", [
    ...teams.map((t) => ({ team_id: t.id, user_id: "user-1", role, joined_at: "2026-01-01" })),
    ...teams.map((t) => ({
      team_id: t.id,
      user_id: "u2",
      role: "member",
      joined_at: "2026-01-02",
    })),
    { team_id: "t1", user_id: "u3", role: "member", joined_at: "2026-01-03" },
  ]);
  h.fake.seed(
    "teams",
    teams.map((t) => ({ id: t.id, name: t.name, created_at: "2026-01-01" })),
  );
  h.fake.seed("profiles", [
    { id: "user-1", display_name: "Maya Chen", avatar_url: null },
    { id: "u2", display_name: "Ben Ortiz", avatar_url: null },
    { id: "u3", display_name: "Cy Park", avatar_url: null },
  ]);
}

function show(
  resources: Resource[],
  opts: { teams?: (typeof TEAM)[]; defaultTeamId?: string } = {},
) {
  h.fake.seed("resources", resources as never);
  return renderWithClient(
    <ResourcesPanel
      resources={resources}
      teams={opts.teams ?? [TEAM]}
      defaultTeamId={opts.defaultTeamId}
    />,
  );
}
const cards = () =>
  within(screen.getByRole("list", { name: "Shared resources" })).getAllByRole("listitem");
const card = (title: string) => screen.getByText(title).closest("li")!;
const inserted = () => h.fake.callsTo("resources", "insert")[0]?.payload as Record<string, unknown>;
const updated = () => h.fake.callsTo("resources", "update")[0];
const choose = async (user: User, combo: HTMLElement, option: string) => {
  await user.click(combo);
  await user.click(await screen.findByRole("option", { name: option }));
};

beforeEach(() => {
  n = 0;
  setup();
});

describe("Shared resources: what the team sees", () => {
  const mixed = () => [
    resource({
      kind: "note",
      title: "Exam notes",
      content: "# Chapter 3\nRecursion",
      tags: ["exam"],
      created_by: "u2",
    }),
    resource({
      kind: "link",
      title: "Course site",
      url: "https://www.uni.example.edu/cs201",
      tags: ["course"],
    }),
    resource({
      kind: "file",
      title: "Slides.pdf",
      storage_path: "t1/1-Slides.pdf",
      file_size: 1536,
      tags: ["exam"],
    }),
  ];

  test("shows notes, links and files", async () => {
    show(mixed());
    expect(cards()).toHaveLength(3);
    expect(card("Exam notes").getAttribute("data-kind")).toBe("note");
    expect(card("Course site").getAttribute("data-kind")).toBe("link");
    expect(card("Slides.pdf").getAttribute("data-kind")).toBe("file");
  });

  test("a note shows a preview of its text", async () => {
    show(mixed());
    expect(await within(card("Exam notes")).findByText("Recursion")).toBeTruthy();
  });

  test("a link shows its site and opens safely in a new tab", async () => {
    show(mixed());
    const a = within(card("Course site")).getByRole("link", { name: /uni\.example\.edu/ });
    expect(a.getAttribute("href")).toBe("https://www.uni.example.edu/cs201");
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toContain("noopener");
  });

  test("a stored link that isn't a web address is never made clickable", async () => {
    show([resource({ kind: "link", title: "Old bad link", url: "javascript:alert(1)" })]);
    const c = card("Old bad link");
    expect(within(c).queryByRole("link")).toBeNull();
    expect(c.textContent).toContain("This link can't be opened.");
  });

  test("a file shows its size", async () => {
    show(mixed());
    expect(card("Slides.pdf").textContent).toContain("1.5 KB");
  });

  test("shows who shared it and when", async () => {
    show(mixed());
    await waitFor(() => expect(card("Exam notes").textContent).toContain("Ben Ortiz"));
    expect(card("Course site").textContent).toContain("Maya Chen");
    expect(card("Course site").textContent).toContain("Updated");
  });

  test("the most recently changed comes first", async () => {
    show([
      resource({ title: "Old", updated_at: "2026-01-01T00:00:00Z" }),
      resource({ title: "Fresh", updated_at: "2026-11-09T00:00:00Z" }),
    ]);
    expect(cards().map((c) => c.textContent)).toEqual([
      expect.stringContaining("Fresh"),
      expect.stringContaining("Old"),
    ]);
  });

  test("an empty team invites you to share something", () => {
    show([]);
    expect(screen.getByText("No resources yet")).toBeTruthy();
  });
});

describe("Shared resources: finding things", () => {
  const set = () => [
    resource({ kind: "note", title: "Exam notes", content: "Recursion basics", tags: ["exam"] }),
    resource({
      kind: "link",
      title: "Course site",
      url: "https://uni.example.edu",
      tags: ["course"],
    }),
    resource({ kind: "file", title: "Slides.pdf", tags: ["exam", "slides"] }),
  ];

  test("kind tabs", async () => {
    const { user } = show(set());
    await user.click(screen.getByRole("tab", { name: "Links" }));
    expect(cards()).toHaveLength(1);
    expect(card("Course site")).toBeTruthy();
    await user.click(screen.getByRole("tab", { name: "Files" }));
    expect(card("Slides.pdf")).toBeTruthy();
    await user.click(screen.getByRole("tab", { name: "All" }));
    expect(cards()).toHaveLength(3);
  });

  test("search by title, text or address", async () => {
    const { user } = show(set());
    await user.type(screen.getByLabelText("Search resources"), "recursion");
    expect(cards()).toHaveLength(1);
    expect(card("Exam notes")).toBeTruthy();
    await user.clear(screen.getByLabelText("Search resources"));
    await user.type(screen.getByLabelText("Search resources"), "uni.example");
    expect(card("Course site")).toBeTruthy();
  });

  test("tags can be tapped to filter, and tapped again to clear", async () => {
    const { user } = show(set());
    const tagBar = screen.getByRole("group", { name: "Filter by tag" });
    await user.click(within(tagBar).getByRole("button", { name: "exam" }));
    expect(cards()).toHaveLength(2);
    expect(within(tagBar).getByRole("button", { name: "exam" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
    await user.click(within(tagBar).getByRole("button", { name: "exam" }));
    expect(cards()).toHaveLength(3);
  });

  test("a search with no results says so", async () => {
    const { user } = show(set());
    await user.type(screen.getByLabelText("Search resources"), "zzzz");
    expect(await screen.findByText("Nothing matches")).toBeTruthy();
  });

  test("with several teams there is a team filter and each card names its team", async () => {
    setup("owner", [TEAM, TEAM2]);
    const { user } = show(
      [resource({ title: "A note", team_id: "t1" }), resource({ title: "B note", team_id: "t2" })],
      { teams: [TEAM, TEAM2] },
    );
    expect(card("A note").textContent).toContain("Capstone Crew");
    expect(card("B note").textContent).toContain("Study Circle");
    await choose(user, screen.getByRole("combobox", { name: "Team" }), "Study Circle");
    expect(cards()).toHaveLength(1);
    expect(card("B note")).toBeTruthy();
  });

  test("on one team's own page there is no team filter", () => {
    show([resource()], { defaultTeamId: "t1" });
    expect(screen.queryByRole("combobox", { name: "Team" })).toBeNull();
  });
});

describe("Shared resources: reading a note", () => {
  test("opens the whole note with who wrote it", async () => {
    const long = `# Heading\n\n${"Line of text.\n\n".repeat(20)}Final line`;
    const { user } = show([
      resource({ title: "Long note", content: long, tags: ["exam"], created_by: "u2" }),
    ]);
    await user.click(within(card("Long note")).getByRole("button", { name: "Read Long note" }));
    const dialog = await screen.findByRole("dialog");
    expect(await within(dialog).findByText("Final line")).toBeTruthy();
    await waitFor(() => expect(dialog.textContent).toContain("Ben Ortiz"));
    expect(within(dialog).getByText("exam")).toBeTruthy();
  });

  test("an empty note says it is empty", async () => {
    const { user } = show([resource({ title: "Blank", content: "" })]);
    await user.click(within(card("Blank")).getByRole("button", { name: "Read Blank" }));
    expect(await screen.findByText("This note is empty.")).toBeTruthy();
  });

  test("links and files have no Read button", () => {
    show([resource({ kind: "link", title: "L", url: "https://a.example.com" })]);
    expect(screen.queryByRole("button", { name: /^Read / })).toBeNull();
  });
});

describe("Shared resources: who can change what", () => {
  const set = () => [
    resource({ title: "Mine", created_by: "user-1" }),
    resource({ title: "Theirs", created_by: "u2" }),
  ];
  test("a member can edit and delete only their own", async () => {
    setup("member");
    show(set());
    expect(await within(card("Mine")).findByRole("button", { name: "Edit Mine" })).toBeTruthy();
    expect(within(card("Mine")).getByRole("button", { name: "Delete Mine" })).toBeTruthy();
    expect(within(card("Theirs")).queryByRole("button", { name: /Edit|Delete/ })).toBeNull();
  });
  test("an admin can change anyone's", async () => {
    setup("admin");
    show(set());
    expect(await within(card("Theirs")).findByRole("button", { name: "Edit Theirs" })).toBeTruthy();
    expect(within(card("Theirs")).getByRole("button", { name: "Delete Theirs" })).toBeTruthy();
  });
  test("everyone can still read what others shared", () => {
    setup("member");
    show([resource({ title: "Theirs", created_by: "u2", content: "hello" })]);
    expect(within(card("Theirs")).getByRole("button", { name: "Read Theirs" })).toBeTruthy();
  });
});

describe("Adding a note", () => {
  async function openAdd(resources: Resource[] = [], opts = {}) {
    const view = show(resources, opts);
    await view.user.click(screen.getByRole("button", { name: /add resource/i }));
    return { ...view, dialog: await screen.findByRole("dialog") };
  }

  test("the form starts on Note", async () => {
    const { dialog } = await openAdd();
    expect(within(dialog).getByRole("tab", { name: "Note" }).getAttribute("aria-selected")).toBe(
      "true",
    );
    expect(within(dialog).getByLabelText("Note (Markdown supported)")).toBeTruthy();
  });

  test("saves the note, logs it, and tells the rest of the team", async () => {
    const { user, dialog } = await openAdd();
    await user.type(within(dialog).getByLabelText("Title"), "  Sprint   notes ");
    await user.type(
      within(dialog).getByLabelText("Note (Markdown supported)"),
      "Decisions go here",
    );
    await user.type(
      within(dialog).getByLabelText("Tags (comma separated)"),
      "Sprint, DECISIONS ,sprint",
    );
    await user.click(within(dialog).getByRole("button", { name: "Add resource" }));

    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Resource added"));
    expect(inserted()).toMatchObject({
      team_id: "t1",
      kind: "note",
      title: "Sprint notes",
      content: "Decisions go here",
      url: null,
      storage_path: null,
      tags: ["sprint", "decisions"],
      created_by: "user-1",
    });
    expect(
      (h.fake.callsTo("activity_logs", "insert")[0]!.payload as { summary: string }).summary,
    ).toBe('added "Sprint notes"');
    const note = h.fake.callsTo("notifications", "insert")[0]!.payload as {
      user_id: string;
      type: string;
      title: string;
      body: string;
      link: string;
    }[];
    expect(note.map((x) => x.user_id).sort()).toEqual(["u2", "u3"]);
    expect(note[0]).toMatchObject({
      type: "resource_shared",
      title: "New note shared in Capstone Crew",
      body: "Sprint notes",
      link: "/resources",
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  test("the person adding it is not notified", async () => {
    const { user, dialog } = await openAdd();
    await user.type(within(dialog).getByLabelText("Title"), "Mine");
    await user.click(within(dialog).getByRole("button", { name: "Add resource" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    const ids = (
      h.fake.callsTo("notifications", "insert")[0]!.payload as { user_id: string }[]
    ).map((x) => x.user_id);
    expect(ids).not.toContain("user-1");
  });

  test("a notification problem never stops the note being shared", async () => {
    h.fake.failTable("notifications", "insert", { message: "blocked" });
    const { user, dialog } = await openAdd();
    await user.type(within(dialog).getByLabelText("Title"), "Still saved");
    await user.click(within(dialog).getByRole("button", { name: "Add resource" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Resource added"));
    expect(h.toast.error).not.toHaveBeenCalled();
  });

  test("won't save without a title", async () => {
    const { user, dialog } = await openAdd();
    await user.click(within(dialog).getByRole("button", { name: "Add resource" }));
    expect(await within(dialog).findByText("Give it a title.")).toBeTruthy();
    expect(h.fake.callsTo("resources", "insert")).toHaveLength(0);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  test("shows why saving failed and keeps what was typed", async () => {
    h.fake.failTable("resources", "insert", {
      message: "new row violates row-level security policy",
    });
    const { user, dialog } = await openAdd();
    await user.type(within(dialog).getByLabelText("Title"), "Will fail");
    await user.click(within(dialog).getByRole("button", { name: "Add resource" }));
    await waitFor(() =>
      expect(h.toast.error).toHaveBeenCalledWith("new row violates row-level security policy"),
    );
    expect(
      (within(screen.getByRole("dialog")).getByLabelText("Title") as HTMLInputElement).value,
    ).toBe("Will fail");
  });

  test("Cancel closes without saving", async () => {
    const { user, dialog } = await openAdd();
    await user.type(within(dialog).getByLabelText("Title"), "Never mind");
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(h.fake.callsTo("resources", "insert")).toHaveLength(0);
  });

  test("the form is empty again next time", async () => {
    const { user, dialog } = await openAdd();
    await user.type(within(dialog).getByLabelText("Title"), "Leftover");
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await user.click(screen.getByRole("button", { name: /add resource/i }));
    expect(
      (within(await screen.findByRole("dialog")).getByLabelText("Title") as HTMLInputElement).value,
    ).toBe("");
  });

  test("with several teams you choose which one it is for", async () => {
    setup("owner", [TEAM, TEAM2]);
    const { user, dialog } = await openAdd([], { teams: [TEAM, TEAM2] });
    await choose(user, within(dialog).getByRole("combobox", { name: "Team" }), "Study Circle");
    await user.type(within(dialog).getByLabelText("Title"), "For the circle");
    await user.click(within(dialog).getByRole("button", { name: "Add resource" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    expect(inserted()["team_id"]).toBe("t2");
  });
});

describe("Adding a link", () => {
  async function openLink() {
    const view = show([]);
    await view.user.click(screen.getByRole("button", { name: /add resource/i }));
    const dialog = await screen.findByRole("dialog");
    await view.user.click(within(dialog).getByRole("tab", { name: "Link" }));
    return { ...view, dialog };
  }

  test("saves a link, adding https:// when it is missing", async () => {
    const { user, dialog } = await openLink();
    await user.type(within(dialog).getByLabelText("Title"), "Course site");
    await user.type(within(dialog).getByLabelText("Web address"), "uni.example.edu/cs201");
    await user.click(within(dialog).getByRole("button", { name: "Add resource" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    expect(inserted()).toMatchObject({
      kind: "link",
      url: "https://uni.example.edu/cs201",
      content: null,
    });
    const note = h.fake.callsTo("notifications", "insert")[0]!.payload as { title: string }[];
    expect(note[0]!.title).toBe("New link shared in Capstone Crew");
  });

  test("refuses a javascript: address and explains", async () => {
    const { user, dialog } = await openLink();
    await user.type(within(dialog).getByLabelText("Title"), "Sneaky");
    await user.type(within(dialog).getByLabelText("Web address"), "javascript:alert(1)");
    await user.click(within(dialog).getByRole("button", { name: "Add resource" }));
    expect(await within(dialog).findByText(/Only web links/)).toBeTruthy();
    expect(h.fake.callsTo("resources", "insert")).toHaveLength(0);
  });

  test("refuses an empty or nonsense address", async () => {
    const { user, dialog } = await openLink();
    await user.type(within(dialog).getByLabelText("Title"), "Empty");
    await user.click(within(dialog).getByRole("button", { name: "Add resource" }));
    expect(await within(dialog).findByText("Paste the link's web address.")).toBeTruthy();
    await user.type(within(dialog).getByLabelText("Web address"), "not a link");
    await user.click(within(dialog).getByRole("button", { name: "Add resource" }));
    await waitFor(() =>
      expect(within(dialog).queryByText("Paste the link's web address.")).toBeNull(),
    );
    expect(h.fake.callsTo("resources", "insert")).toHaveLength(0);
  });
});

describe("Adding a file", () => {
  async function openFile() {
    const view = show([]);
    await view.user.click(screen.getByRole("button", { name: /add resource/i }));
    const dialog = await screen.findByRole("dialog");
    await view.user.click(within(dialog).getByRole("tab", { name: "File" }));
    return { ...view, dialog };
  }
  const pdf = (bytes = 3) =>
    new File([new Uint8Array(bytes)], "My report (final).pdf", { type: "application/pdf" });

  test("uploads the file privately under the team folder, then records it", async () => {
    const { user, dialog } = await openFile();
    await user.type(within(dialog).getByLabelText("Title"), "Final report");
    await user.upload(within(dialog).getByLabelText("File (max 25 MB)"), pdf(2048));
    await user.click(within(dialog).getByRole("button", { name: "Add resource" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Resource added"));
    const up = h.fake.storageCalls.find((c) => c.op === "upload")!;
    expect(up.bucket).toBe("team-files");
    expect(String(up.args[0])).toMatch(/^t1\/\d+-My_report__final_\.pdf$/);
    expect(inserted()).toMatchObject({
      kind: "file",
      title: "Final report",
      storage_path: up.args[0],
      file_size: 2048,
      mime_type: "application/pdf",
    });
  });

  test("won't save without choosing a file", async () => {
    const { user, dialog } = await openFile();
    await user.type(within(dialog).getByLabelText("Title"), "No file");
    await user.click(within(dialog).getByRole("button", { name: "Add resource" }));
    expect(await within(dialog).findByText("Choose a file to upload.")).toBeTruthy();
    expect(h.fake.storageCalls).toHaveLength(0);
  });

  test("refuses a file over 25 MB without uploading it", async () => {
    const { user, dialog } = await openFile();
    await user.type(within(dialog).getByLabelText("Title"), "Huge");
    const big = new File(["x"], "huge.zip", { type: "application/zip" });
    Object.defineProperty(big, "size", { value: 26 * 1024 * 1024 });
    await user.upload(within(dialog).getByLabelText("File (max 25 MB)"), big);
    await user.click(within(dialog).getByRole("button", { name: "Add resource" }));
    expect(await within(dialog).findByText("Files must be 25 MB or smaller.")).toBeTruthy();
    expect(h.fake.storageCalls).toHaveLength(0);
  });

  test("an upload that fails shows why and records nothing", async () => {
    h.fake.failStorage("upload", { message: "Bucket not found" });
    const { user, dialog } = await openFile();
    await user.type(within(dialog).getByLabelText("Title"), "Doomed");
    await user.upload(within(dialog).getByLabelText("File (max 25 MB)"), pdf());
    await user.click(within(dialog).getByRole("button", { name: "Add resource" }));
    await waitFor(() => expect(h.toast.error).toHaveBeenCalledWith("Bucket not found"));
    expect(h.fake.callsTo("resources", "insert")).toHaveLength(0);
  });

  test("if recording it fails, the uploaded file is cleaned up", async () => {
    h.fake.failTable("resources", "insert", { message: "row-level security" });
    const { user, dialog } = await openFile();
    await user.type(within(dialog).getByLabelText("Title"), "Orphan");
    await user.upload(within(dialog).getByLabelText("File (max 25 MB)"), pdf());
    await user.click(within(dialog).getByRole("button", { name: "Add resource" }));
    await waitFor(() => expect(h.toast.error).toHaveBeenCalledWith("row-level security"));
    const removed = h.fake.storageCalls.find((c) => c.op === "remove")!;
    const up = h.fake.storageCalls.find((c) => c.op === "upload")!;
    expect(removed.args[0]).toEqual([up.args[0]]);
  });
});

describe("Editing", () => {
  async function openEdit(r: Resource, role: "owner" | "admin" | "member" = "owner") {
    setup(role);
    const view = show([r]);
    await view.user.click(within(card(r.title)).getByRole("button", { name: `Edit ${r.title}` }));
    return { ...view, dialog: await screen.findByRole("dialog") };
  }

  test("a note opens with its current text and saves the new version", async () => {
    const r = resource({ title: "Plan", content: "Old text", tags: ["a", "b"] });
    const { user, dialog } = await openEdit(r);
    expect((within(dialog).getByLabelText("Title") as HTMLInputElement).value).toBe("Plan");
    expect(
      (within(dialog).getByLabelText("Note (Markdown supported)") as HTMLTextAreaElement).value,
    ).toBe("Old text");
    expect(
      (within(dialog).getByLabelText("Tags (comma separated)") as HTMLInputElement).value,
    ).toBe("a, b");
    const body = within(dialog).getByLabelText("Note (Markdown supported)");
    await user.clear(body);
    await user.type(body, "New text");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Note updated"));
    expect(updated()!.filters).toEqual({ id: r.id, version: 1 });
    expect(updated()!.payload).toMatchObject({
      title: "Plan",
      content: "New text",
      tags: ["a", "b"],
      updated_by: "user-1",
    });
    expect(
      (h.fake.callsTo("activity_logs", "insert")[0]!.payload as { summary: string }).summary,
    ).toBe('edited "Plan"');
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  test("editing doesn't spam the team with notifications", async () => {
    const { user, dialog } = await openEdit(resource({ title: "Plan", content: "x" }));
    await user.type(within(dialog).getByLabelText("Title"), " v2");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    expect(h.fake.callsTo("notifications", "insert")).toHaveLength(0);
  });

  test("two people editing at once: the second save is refused, not silently overwritten", async () => {
    const r = resource({ title: "Shared plan", content: "v1" });
    const { user, dialog } = await openEdit(r);
    // meanwhile a teammate saved, so the stored version moved on
    h.fake.tables["resources"]![0]!["version"] = 2;
    await user.type(within(dialog).getByLabelText("Title"), " (mine)");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));
    await waitFor(() =>
      expect(h.toast.error).toHaveBeenCalledWith(
        expect.stringContaining("Someone else changed this"),
      ),
    );
    expect(h.toast.success).not.toHaveBeenCalled();
    expect(h.fake.tables["resources"]![0]!["title"]).toBe("Shared plan");
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  test("a link can be edited too, and is checked again", async () => {
    const r = resource({ kind: "link", title: "Docs", url: "https://old.example.com/" });
    const { user, dialog } = await openEdit(r);
    const url = within(dialog).getByLabelText("Web address");
    expect((url as HTMLInputElement).value).toBe("https://old.example.com/");
    await user.clear(url);
    await user.type(url, "javascript:alert(1)");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));
    expect(await within(dialog).findByText(/Only web links/)).toBeTruthy();
    expect(h.fake.callsTo("resources", "update")).toHaveLength(0);
    await user.clear(url);
    await user.type(url, "new.example.com/page");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Link updated"));
    expect(updated()!.payload).toMatchObject({ url: "https://new.example.com/page" });
  });

  test("a file's title and tags can change; there is no file box", async () => {
    const r = resource({ kind: "file", title: "slides.pdf", storage_path: "t1/1-slides.pdf" });
    const { user, dialog } = await openEdit(r);
    expect(within(dialog).queryByLabelText("File (max 25 MB)")).toBeNull();
    const title = within(dialog).getByLabelText("Title");
    await user.clear(title);
    await user.type(title, "Week 3 slides");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("File updated"));
    expect(updated()!.payload).toMatchObject({ title: "Week 3 slides" });
    expect(h.fake.storageCalls).toHaveLength(0);
  });

  test("an empty title is refused", async () => {
    const { user, dialog } = await openEdit(resource({ title: "Plan" }));
    await user.clear(within(dialog).getByLabelText("Title"));
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));
    expect(await within(dialog).findByText("Give it a title.")).toBeTruthy();
    expect(h.fake.callsTo("resources", "update")).toHaveLength(0);
  });

  test("a refused save shows why", async () => {
    const { user, dialog } = await openEdit(resource({ title: "Plan" }));
    h.fake.failTable("resources", "update", { message: "permission denied" });
    await user.type(within(dialog).getByLabelText("Title"), "!");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(h.toast.error).toHaveBeenCalledWith("permission denied"));
  });

  test("after editing, 'Add resource' starts blank, not with the old item", async () => {
    const r = resource({ title: "Plan" });
    const { user, dialog } = await openEdit(r);
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await user.click(screen.getByRole("button", { name: /add resource/i }));
    const fresh = await screen.findByRole("dialog");
    expect((within(fresh).getByLabelText("Title") as HTMLInputElement).value).toBe("");
    expect(within(fresh).getByRole("tab", { name: "Note" })).toBeTruthy();
  });
});

describe("Deleting and downloading", () => {
  test("deleting asks first, then removes it and logs it", async () => {
    const r = resource({ title: "Throwaway" });
    const { user } = show([r]);
    await user.click(within(card("Throwaway")).getByRole("button", { name: "Delete Throwaway" }));
    const confirm = await screen.findByRole("alertdialog");
    expect(confirm.textContent).toContain('Delete "Throwaway"?');
    await user.click(within(confirm).getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Note removed"));
    expect(h.fake.callsTo("resources", "delete")[0]!.filters).toEqual({ id: r.id });
    expect(
      (h.fake.callsTo("activity_logs", "insert")[0]!.payload as { summary: string }).summary,
    ).toBe('removed "Throwaway"');
  });

  test("cancelling keeps it", async () => {
    const { user } = show([resource({ title: "Keep" })]);
    await user.click(within(card("Keep")).getByRole("button", { name: "Delete Keep" }));
    await user.click(
      within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Cancel" }),
    );
    expect(h.fake.callsTo("resources", "delete")).toHaveLength(0);
    expect(card("Keep")).toBeTruthy();
  });

  test("deleting a file also removes the stored copy", async () => {
    const r = resource({ kind: "file", title: "old.pdf", storage_path: "t1/9-old.pdf" });
    const { user } = show([r]);
    await user.click(within(card("old.pdf")).getByRole("button", { name: "Delete old.pdf" }));
    await user.click(
      within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Delete" }),
    );
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("File removed"));
    expect(h.fake.storageCalls.find((c) => c.op === "remove")!.args[0]).toEqual(["t1/9-old.pdf"]);
  });

  test("if the stored copy can't be removed the person is told", async () => {
    h.fake.failStorage("remove", { message: "nope" });
    const r = resource({ kind: "file", title: "stuck.pdf", storage_path: "t1/9-stuck.pdf" });
    const { user } = show([r]);
    await user.click(within(card("stuck.pdf")).getByRole("button", { name: "Delete stuck.pdf" }));
    await user.click(
      within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Delete" }),
    );
    await waitFor(() =>
      expect(h.toast.warning).toHaveBeenCalledWith(
        "Removed, but the stored file couldn't be cleaned up.",
      ),
    );
  });

  test("a refused delete shows why and removes nothing from storage", async () => {
    h.fake.failTable("resources", "delete", { message: "permission denied" });
    const r = resource({ kind: "file", title: "safe.pdf", storage_path: "t1/9-safe.pdf" });
    const { user } = show([r]);
    await user.click(within(card("safe.pdf")).getByRole("button", { name: "Delete safe.pdf" }));
    await user.click(
      within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Delete" }),
    );
    await waitFor(() => expect(h.toast.error).toHaveBeenCalledWith("permission denied"));
    expect(h.fake.storageCalls.filter((c) => c.op === "remove")).toHaveLength(0);
  });

  test("Download opens a short-lived private link", async () => {
    const open = spyOn(window, "open").mockImplementation(() => null);
    const r = resource({ kind: "file", title: "notes.pdf", storage_path: "t1/5-notes.pdf" });
    const { user } = show([r]);
    await user.click(within(card("notes.pdf")).getByRole("button", { name: /download/i }));
    await waitFor(() => expect(open).toHaveBeenCalled());
    expect(String(open.mock.calls[0]![0])).toContain("t1/5-notes.pdf");
    expect(open.mock.calls[0]![2]).toBe("noopener");
    open.mockRestore();
  });
});
