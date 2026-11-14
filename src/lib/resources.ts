// Rules for a team's shared notes, links and files: checking what is typed, safe web addresses, tags,
// searching and ordering. Pure functions (no React, no network) so they can be unit tested.

export type ResourceKind = "note" | "link" | "file";

export const TITLE_MAX = 150;
export const NOTE_MAX = 20000;
export const URL_MAX = 2000;
export const MAX_TAGS = 10;
export const TAG_MAX = 30;
export const MAX_FILE_BYTES = 25 * 1024 * 1024;

export type ResourceLike = {
  id: string;
  team_id: string;
  kind: string;
  title: string;
  content: string | null;
  url: string | null;
  storage_path: string | null;
  file_size: number | null;
  tags: string[] | null;
  created_by: string;
  updated_at: string;
  version?: number;
};

/* ------------------------------- Web addresses ------------------------------ */

export type UrlCheck = { ok: true; url: string } | { ok: false; reason: string };

/**
 * Turns what a student typed into a safe web address. Only http and https are accepted: other kinds
 * (javascript:, data:, file:, ...) could run code or open local files when a teammate clicks the link.
 * A bare "example.com/page" gets "https://" added.
 */
export function normalizeUrl(input: string): UrlCheck {
  const text = input.trim();
  if (!text) return { ok: false, reason: "Paste the link's web address." };
  if (text.length > URL_MAX) return { ok: false, reason: "That address is too long." };
  if (/\s/.test(text)) return { ok: false, reason: "A web address can't contain spaces." };
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(text) && !/^[^/]*:\d+(\/|$)/.test(text);
  if (hasScheme && !/^https?:\/\//i.test(text)) {
    return { ok: false, reason: "Only web links (http or https) can be saved." };
  }
  const withScheme = /^https?:\/\//i.test(text) ? text : `https://${text}`;
  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    return { ok: false, reason: "That doesn't look like a web address." };
  }
  if (!/^https?:$/.test(parsed.protocol)) {
    return { ok: false, reason: "Only web links (http or https) can be saved." };
  }
  const host = parsed.hostname;
  if (
    !host ||
    (!host.includes(".") && host !== "localhost") ||
    host.startsWith(".") ||
    host.endsWith(".")
  ) {
    return { ok: false, reason: "That doesn't look like a web address." };
  }
  if (parsed.username || parsed.password) {
    return { ok: false, reason: "Links with a username or password in them can't be saved." };
  }
  return { ok: true, url: parsed.href };
}

/** `https://www.example.com/a/b` -> `example.com` (for showing under a link's title). */
export function hostOf(url: string | null | undefined): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** A stored link is only ever opened if it is still a web address. */
export function isSafeHref(url: string | null | undefined): url is string {
  return !!url && /^https?:\/\//i.test(url) && !/\s/.test(url);
}

/* ----------------------------------- Tags ---------------------------------- */

/** "Exam, week 3 ,EXAM, notes" -> ["exam", "week 3", "notes"] (lower case, no repeats, limited). */
export function parseTags(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of text.split(/[,;\n]/)) {
    const tag = raw.replace(/\s+/g, " ").trim().toLowerCase().replace(/^#/, "").slice(0, TAG_MAX);
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
    if (out.length >= MAX_TAGS) break;
  }
  return out;
}

export function allTags(resources: Pick<ResourceLike, "tags">[]): string[] {
  const counts = new Map<string, number>();
  for (const r of resources) for (const t of r.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([t]) => t);
}

/* -------------------------------- Checking a form --------------------------- */

export type ResourceForm = {
  kind: ResourceKind;
  title: string;
  body: string;
  url: string;
  tags: string;
  file: { name: string; size: number } | null;
};

export type CleanResource = {
  kind: ResourceKind;
  title: string;
  content: string | null;
  url: string | null;
  tags: string[];
};

export type ResourceResult =
  | { ok: true; clean: CleanResource }
  | { ok: false; errors: Partial<Record<"title" | "body" | "url" | "file", string>> };

/** `editing` skips the file check (a file's contents can't be replaced, only its title and tags). */
export function validateResource(form: ResourceForm, editing = false): ResourceResult {
  const errors: Partial<Record<"title" | "body" | "url" | "file", string>> = {};
  const title = form.title.replace(/\s+/g, " ").trim();
  if (!title) errors.title = "Give it a title.";
  else if (title.length > TITLE_MAX) errors.title = `Keep the title under ${TITLE_MAX} characters.`;

  let content: string | null = null;
  if (form.kind === "note") {
    if (form.body.length > NOTE_MAX)
      errors.body = `Notes can be up to ${NOTE_MAX.toLocaleString("en-US")} characters.`;
    content = form.body;
  }

  let url: string | null = null;
  if (form.kind === "link") {
    const checked = normalizeUrl(form.url);
    if (checked.ok) url = checked.url;
    else errors.url = checked.reason;
  }

  if (form.kind === "file" && !editing) {
    if (!form.file) errors.file = "Choose a file to upload.";
    else if (form.file.size === 0) errors.file = "That file is empty.";
    else if (form.file.size > MAX_FILE_BYTES) errors.file = "Files must be 25 MB or smaller.";
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, clean: { kind: form.kind, title, content, url, tags: parseTags(form.tags) } };
}

/* ------------------------------- Files ------------------------------------- */

/** A storage path that keeps the team's folder first, and no odd characters in the name. */
export function storagePathFor(teamId: string, fileName: string, now: number = Date.now()): string {
  const clean =
    fileName
      .replace(/[^\w.-]/g, "_")
      .replace(/^\.+/, "")
      .slice(-120) || "file";
  return `${teamId}/${now}-${clean}`;
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 102.4) / 10} KB`;
  return `${Math.round(bytes / (1024 * 102.4)) / 10} MB`;
}

/* ------------------------------ Filtering & order --------------------------- */

export type ResourceFilters = {
  kind: "all" | ResourceKind;
  team: string;
  tag: string;
  search: string;
};
export const NO_RESOURCE_FILTERS: ResourceFilters = {
  kind: "all",
  team: "all",
  tag: "all",
  search: "",
};

export function filterResources<T extends ResourceLike>(items: T[], f: ResourceFilters): T[] {
  const q = f.search.trim().toLowerCase();
  return items.filter((r) => {
    if (f.kind !== "all" && r.kind !== f.kind) return false;
    if (f.team !== "all" && r.team_id !== f.team) return false;
    if (f.tag !== "all" && !(r.tags ?? []).includes(f.tag)) return false;
    if (!q) return true;
    return (
      r.title.toLowerCase().includes(q) ||
      (r.content ?? "").toLowerCase().includes(q) ||
      (r.url ?? "").toLowerCase().includes(q) ||
      (r.tags ?? []).some((t) => t.toLowerCase().includes(q))
    );
  });
}

/** Most recently changed first. */
export function sortResources<T extends Pick<ResourceLike, "updated_at" | "title">>(
  items: T[],
): T[] {
  return [...items].sort(
    (a, b) => b.updated_at.localeCompare(a.updated_at) || a.title.localeCompare(b.title),
  );
}

export function kindLabel(kind: string): string {
  return kind === "note" ? "note" : kind === "link" ? "link" : "file";
}
