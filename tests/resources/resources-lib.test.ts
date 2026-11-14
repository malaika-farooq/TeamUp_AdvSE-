// Functionality 5 (shared notes and links): the rules for what can be saved and how it is found again.
import { describe, expect, test } from "bun:test";
import {
  MAX_FILE_BYTES,
  MAX_TAGS,
  NOTE_MAX,
  NO_RESOURCE_FILTERS,
  TAG_MAX,
  TITLE_MAX,
  allTags,
  filterResources,
  formatFileSize,
  hostOf,
  isSafeHref,
  normalizeUrl,
  parseTags,
  sortResources,
  storagePathFor,
  validateResource,
  type ResourceForm,
  type ResourceLike,
} from "../../src/lib/resources";

describe("Web addresses", () => {
  test("accepts http and https", () => {
    expect(normalizeUrl("https://example.com/docs?q=1#top")).toEqual({
      ok: true,
      url: "https://example.com/docs?q=1#top",
    });
    expect(normalizeUrl("http://example.com")).toEqual({ ok: true, url: "http://example.com/" });
    expect(normalizeUrl("HTTPS://Example.COM/A")).toEqual({
      ok: true,
      url: "https://example.com/A",
    });
  });

  test("adds https:// to a bare address", () => {
    expect(normalizeUrl("example.com/page")).toEqual({ ok: true, url: "https://example.com/page" });
    expect(normalizeUrl("  docs.google.com/d/abc  ")).toEqual({
      ok: true,
      url: "https://docs.google.com/d/abc",
    });
    expect(normalizeUrl("localhost:3000/x")).toEqual({ ok: true, url: "https://localhost:3000/x" });
  });

  test("refuses addresses that could run code or open local files", () => {
    for (const bad of [
      "javascript:alert(1)",
      "JaVaScRiPt:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "vbscript:msgbox(1)",
      "file:///C:/secret.txt",
      "ftp://example.com/file",
      "mailto:a@b.com",
      "blob:https://example.com/abc",
    ]) {
      const r = normalizeUrl(bad);
      expect(r.ok).toBe(false);
      expect(!r.ok && r.reason).toContain("web links");
    }
  });

  test("refuses empty, spaced, hostless and credentialed addresses", () => {
    expect(normalizeUrl("")).toEqual({ ok: false, reason: "Paste the link's web address." });
    expect(normalizeUrl("   ").ok).toBe(false);
    expect(normalizeUrl("https://exa mple.com").ok).toBe(false);
    expect(normalizeUrl("https://").ok).toBe(false);
    expect(normalizeUrl("not a link").ok).toBe(false);
    expect(normalizeUrl("justoneword").ok).toBe(false);
    const cred = normalizeUrl("https://user:pass@example.com");
    expect(!cred.ok && cred.reason).toContain("username or password");
  });

  test("refuses very long addresses", () => {
    expect(normalizeUrl(`https://example.com/${"a".repeat(2000)}`).ok).toBe(false);
  });

  test("shows just the site name", () => {
    expect(hostOf("https://www.example.com/a/b?c=1")).toBe("example.com");
    expect(hostOf("https://docs.example.org/x")).toBe("docs.example.org");
    expect(hostOf("nonsense")).toBe("");
    expect(hostOf(null)).toBe("");
  });

  test("only safe stored links are ever opened", () => {
    expect(isSafeHref("https://example.com")).toBe(true);
    expect(isSafeHref("http://example.com")).toBe(true);
    expect(isSafeHref("javascript:alert(1)")).toBe(false);
    expect(isSafeHref("data:text/html,x")).toBe(false);
    expect(isSafeHref("https://a b.com")).toBe(false);
    expect(isSafeHref(null)).toBe(false);
    expect(isSafeHref("")).toBe(false);
  });
});

describe("Tags", () => {
  test("trims, lower-cases, removes repeats and leading #", () => {
    expect(parseTags("Exam, week 3 ,EXAM, #notes;  Week   3")).toEqual(["exam", "week 3", "notes"]);
  });
  test("nothing in, nothing out", () => {
    expect(parseTags("")).toEqual([]);
    expect(parseTags(" , ,, ")).toEqual([]);
  });
  test("limits count and length", () => {
    expect(parseTags(Array.from({ length: 25 }, (_, i) => `t${i}`).join(","))).toHaveLength(
      MAX_TAGS,
    );
    expect(parseTags("x".repeat(100))[0]).toHaveLength(TAG_MAX);
  });
  test("the tag list is the most-used first", () => {
    expect(
      allTags([{ tags: ["a", "b"] }, { tags: ["b"] }, { tags: null }, { tags: ["b", "c"] }]),
    ).toEqual(["b", "a", "c"]);
  });
});

const note = (over: Partial<ResourceForm> = {}): ResourceForm => ({
  kind: "note",
  title: "Exam notes",
  body: "# Week 1",
  url: "",
  tags: "",
  file: null,
  ...over,
});

describe("Checking a note, link or file before saving", () => {
  test("a good note", () => {
    expect(validateResource(note({ title: "  Exam   notes ", tags: "Exam, week 1" }))).toEqual({
      ok: true,
      clean: {
        kind: "note",
        title: "Exam notes",
        content: "# Week 1",
        url: null,
        tags: ["exam", "week 1"],
      },
    });
  });

  test("an empty note is fine, an empty title is not", () => {
    expect(validateResource(note({ body: "" })).ok).toBe(true);
    for (const title of ["", "   "]) {
      const r = validateResource(note({ title }));
      expect(!r.ok && r.errors.title).toBe("Give it a title.");
    }
  });

  test("limits on title and note length", () => {
    expect(validateResource(note({ title: "x".repeat(TITLE_MAX) })).ok).toBe(true);
    expect(validateResource(note({ title: "x".repeat(TITLE_MAX + 1) })).ok).toBe(false);
    expect(validateResource(note({ body: "x".repeat(NOTE_MAX) })).ok).toBe(true);
    const long = validateResource(note({ body: "x".repeat(NOTE_MAX + 1) }));
    expect(!long.ok && long.errors.body).toContain("20,000");
  });

  test("a link is checked and cleaned; a note's content is ignored for a link", () => {
    const r = validateResource(note({ kind: "link", url: "example.com/docs", body: "ignored" }));
    expect(r).toMatchObject({
      ok: true,
      clean: { kind: "link", url: "https://example.com/docs", content: null },
    });
  });

  test("an unsafe or missing link is refused with a reason", () => {
    const js = validateResource(note({ kind: "link", url: "javascript:alert(1)" }));
    expect(!js.ok && js.errors.url).toContain("web links");
    const none = validateResource(note({ kind: "link", url: "" }));
    expect(!none.ok && none.errors.url).toContain("web address");
  });

  test("a file must be chosen, non-empty and at most 25 MB", () => {
    const f = (file: ResourceForm["file"]) => validateResource(note({ kind: "file", file }));
    expect(f(null)).toMatchObject({ ok: false, errors: { file: "Choose a file to upload." } });
    expect(f({ name: "a.pdf", size: 0 })).toMatchObject({
      ok: false,
      errors: { file: "That file is empty." },
    });
    expect(f({ name: "a.pdf", size: MAX_FILE_BYTES + 1 })).toMatchObject({
      ok: false,
      errors: { file: "Files must be 25 MB or smaller." },
    });
    expect(f({ name: "a.pdf", size: MAX_FILE_BYTES }).ok).toBe(true);
  });

  test("editing a file only needs a title (its contents can't be swapped)", () => {
    expect(validateResource(note({ kind: "file", file: null }), true).ok).toBe(true);
  });

  test("all the problems are reported together", () => {
    const r = validateResource(note({ kind: "link", title: "", url: "nope nope" }));
    expect(!r.ok && Object.keys(r.errors).sort()).toEqual(["title", "url"]);
  });
});

describe("Files", () => {
  test("stored under the team's folder with a safe name", () => {
    expect(storagePathFor("team-1", "My report (final).pdf", 1700000000000)).toBe(
      "team-1/1700000000000-My_report__final_.pdf",
    );
    expect(storagePathFor("t", "../../etc/passwd", 5)).toBe("t/5-_.._etc_passwd");
    expect(storagePathFor("t", "", 5)).toBe("t/5-file");
    expect(storagePathFor("t", "é.txt", 5)).toBe("t/5-_.txt");
  });
  test("sizes read naturally", () => {
    expect(formatFileSize(null)).toBe("");
    expect(formatFileSize(0)).toBe("");
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5 MB");
  });
});

let n = 0;
const res = (over: Partial<ResourceLike> = {}): ResourceLike => ({
  id: `r${++n}`,
  team_id: "t1",
  kind: "note",
  title: "Note",
  content: null,
  url: null,
  storage_path: null,
  file_size: null,
  tags: [],
  created_by: "me",
  updated_at: "2026-11-01T00:00:00Z",
  ...over,
});

describe("Finding things again", () => {
  const exam = res({ title: "Exam notes", content: "Chapter 3 recursion", tags: ["exam"] });
  const docs = res({
    kind: "link",
    title: "Course site",
    url: "https://uni.example.edu/cs201",
    tags: ["course"],
  });
  const file = res({ kind: "file", title: "Slides.pdf", tags: ["exam", "slides"], team_id: "t2" });
  const all = [exam, docs, file];
  const ids = (l: ResourceLike[]) => l.map((r) => r.id);
  const run = (f: Partial<typeof NO_RESOURCE_FILTERS>) =>
    ids(filterResources(all, { ...NO_RESOURCE_FILTERS, ...f }));

  test("everything with no filters", () => expect(run({})).toEqual(ids(all)));
  test("by kind", () => {
    expect(run({ kind: "note" })).toEqual([exam.id]);
    expect(run({ kind: "link" })).toEqual([docs.id]);
    expect(run({ kind: "file" })).toEqual([file.id]);
  });
  test("by team", () => expect(run({ team: "t2" })).toEqual([file.id]));
  test("by tag", () => {
    expect(run({ tag: "exam" })).toEqual([exam.id, file.id]);
    expect(run({ tag: "nothing" })).toEqual([]);
  });
  test("search looks in title, note text, link address and tags", () => {
    expect(run({ search: "RECURSION" })).toEqual([exam.id]);
    expect(run({ search: "uni.example" })).toEqual([docs.id]);
    expect(run({ search: "slides" })).toEqual([file.id]);
    expect(run({ search: "  course " })).toEqual([docs.id]);
    expect(run({ search: "zzz" })).toEqual([]);
  });
  test("filters combine", () => {
    expect(run({ tag: "exam", kind: "file" })).toEqual([file.id]);
    expect(run({ tag: "exam", team: "t1" })).toEqual([exam.id]);
  });
  test("most recently changed first, then by title", () => {
    const old = res({ title: "B old", updated_at: "2026-01-01T00:00:00Z" });
    const fresh = res({ title: "A fresh", updated_at: "2026-11-05T00:00:00Z" });
    const same = res({ title: "A old", updated_at: "2026-01-01T00:00:00Z" });
    expect(sortResources([old, fresh, same]).map((r) => r.title)).toEqual([
      "A fresh",
      "A old",
      "B old",
    ]);
  });
});
