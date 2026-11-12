// Pure ranking rules for "Teammate ideas". Kept separate so they can be tested without the backend.

export const MAX_TEAMMATE_SUGGESTIONS = 4;

export type CandidateFacts = {
  id: string;
  name: string;
  discoverable: boolean;
  sharedCourses: string[];
  newSkills: string[];
  overlapMinutes: number;
  /** Skills the asker explicitly wants that this candidate has (empty when nothing was asked for). */
  wantedSkills?: string[];
};

/** Shared courses count most, then skills the team lacks, then hours of overlapping free time. */
export function scoreCandidate(c: CandidateFacts): number {
  return (
    c.sharedCourses.length * 3 +
    c.newSkills.length * 1.5 +
    c.overlapMinutes / 120 +
    (c.wantedSkills?.length ?? 0) * 5
  );
}

/**
 * Keeps only discoverable students who are not on the team and match on at least one fact,
 * then returns the best few, highest score first (name breaks ties).
 */
export function rankCandidates<T extends CandidateFacts>(
  candidates: T[],
  memberIds: readonly string[],
  limit = MAX_TEAMMATE_SUGGESTIONS,
  opts: { requireWanted?: boolean } = {},
): (T & { score: number })[] {
  const members = new Set(memberIds);
  return candidates
    .filter((c) => c.discoverable && !members.has(c.id))
    .filter((c) => !opts.requireWanted || (c.wantedSkills?.length ?? 0) > 0)
    .map((c) => ({ ...c, score: scoreCandidate(c) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);
}

/** Skills from `have` that match any wanted skill (case-insensitive, either name may contain the other). */
export function matchWantedSkills(have: readonly string[], wanted: readonly string[]): string[] {
  const w = wanted.map((x) => x.trim().toLowerCase()).filter(Boolean);
  if (!w.length) return [];
  return [...new Set(have)].filter((h) => {
    const n = h.toLowerCase();
    return w.some((x) => n === x || n.includes(x) || x.includes(n));
  });
}

/** A plain, fact-only reason used when the AI leaves one out. Mentions only facts that exist. */
export function factualReason(
  c: Pick<CandidateFacts, "sharedCourses" | "newSkills" | "overlapMinutes" | "wantedSkills">,
): string {
  const parts: string[] = [];
  if (c.wantedSkills?.length) parts.push(`has the ${c.wantedSkills.slice(0, 3).join(", ")} skills you asked for`);
  if (c.sharedCourses.length) parts.push(`shares ${c.sharedCourses.slice(0, 2).join(" and ")} with your team`);
  if (c.newSkills.length) parts.push(`adds ${c.newSkills.slice(0, 3).join(", ")}`);
  const hours = Math.round((c.overlapMinutes / 60) * 2) / 2;
  if (hours > 0) parts.push(`has about ${hours} h/week of free time that overlaps with yours`);
  if (!parts.length) return "";
  const text = parts.join("; ");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}
