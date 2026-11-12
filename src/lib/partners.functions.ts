import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { aiJson, friendlyAIError, UNTRUSTED_NOTE } from "@/lib/ai-gateway";
import { matchWantedSkills } from "@/lib/teammate-ranking";
import {
  MAX_PARTNER_SUGGESTIONS,
  partnerReason,
  pickSessionSlots,
  rankPartners,
  type SessionSlot,
  type WorkloadLevel,
} from "@/lib/partner-ranking";

const LOAD_ERROR = "Couldn't load student profiles to compare. Please try again.";
const SETUP_ERROR =
  "Study partner matching isn't set up in the database yet. Run migrations 0005_study_partners.sql and 0006_partner_time_preferences.sql in Supabase, then try again.";

/** A missing database function means the migrations haven't been applied; say so instead of a vague error. */
function loadError(err: { code?: string; message?: string } | null | undefined): Error {
  const missing = err?.code === "PGRST202" || err?.code === "42883" || /Could not find the function|does not exist/i.test(err?.message ?? "");
  return new Error(missing ? SETUP_ERROR : LOAD_ERROR);
}

export type PartnerSuggestion = {
  id: string;
  rank: number;
  name: string;
  major: string | null;
  university: string | null;
  sharedCourses: string[];
  newSkills: string[];
  wantedSkills: string[];
  overlapHours: number;
  workload: WorkloadLevel;
  reason: string;
};

export type PartnerResult = {
  suggestions: PartnerSuggestion[];
  empty: "none_discoverable" | "no_matches" | "profile_empty" | null;
};

/** Individual study-partner matching: ranks in code, the model only writes the reasons. */
export const suggestStudyPartners = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        wantedSkills: z.array(z.string().trim().min(1).max(40)).max(8).optional(),
        /** Times the student wants to study: weekday 0-6 and minutes from midnight. */
        windows: z
          .array(
            z.object({
              weekday: z.number().int().min(0).max(6),
              start: z.number().int().min(0).max(1410),
              end: z.number().int().min(30).max(1440),
            }),
          )
          .max(21)
          .optional(),
        avoidHeavy: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<PartnerResult> => {
    const sb = context.supabase;
    const me = context.userId;
    const wanted = data.wantedSkills ?? [];
    const windows = data.windows ?? [];

    const [requestsRes, candidatesRes, myCoursesRes, mySkillsRes] = await Promise.all([
      sb.rpc("my_partner_requests"),
      sb
        .from("profiles")
        .select("id, display_name, university, major, discoverable")
        .eq("discoverable", true)
        .neq("id", me)
        .limit(200),
      sb.from("user_courses").select("course_id").eq("user_id", me),
      sb.from("user_skills").select("level, skills(name)").eq("user_id", me),
    ]);
    if (requestsRes.error || candidatesRes.error || myCoursesRes.error || mySkillsRes.error) {
      const err = requestsRes.error ?? candidatesRes.error ?? myCoursesRes.error ?? mySkillsRes.error;
      console.error("[partners] load failed", err);
      throw loadError(err);
    }
    // Anyone you already have a request or partnership with is handled in the Requests tab.
    const engaged = new Set((requestsRes.data ?? []).map((r) => r.other_id));
    const pool = (candidatesRes.data ?? []).filter((c) => !engaged.has(c.id));
    if (!pool.length) return { suggestions: [], empty: "none_discoverable" };
    const poolIds = pool.map((p) => p.id);

    const myCourseIds = new Set((myCoursesRes.data ?? []).map((c) => c.course_id));
    const mySkills = new Set((mySkillsRes.data ?? []).flatMap((s) => (s.skills ? [s.skills.name.toLowerCase()] : [])));

    const [poolCoursesRes, poolSkillsRes, overlapRes, loadRes, windowRes] = await Promise.all([
      sb.from("user_courses").select("user_id, course_id, courses(code, title)").in("user_id", poolIds),
      sb.from("user_skills").select("user_id, skills(name)").in("user_id", poolIds),
      sb.rpc("partner_availability_overlap", { _candidates: poolIds }),
      sb.rpc("candidate_workload", { _candidates: poolIds }),
      windows.length
        ? sb.rpc("candidate_window_minutes", { _candidates: poolIds, _windows: windows })
        : Promise.resolve({ data: [] as { candidate_id: string; window_minutes: number }[], error: null }),
    ]);
    if (poolCoursesRes.error || poolSkillsRes.error || overlapRes.error || loadRes.error || windowRes.error) {
      const err = poolCoursesRes.error ?? poolSkillsRes.error ?? overlapRes.error ?? loadRes.error ?? windowRes.error;
      console.error("[partners] facts failed", err);
      throw loadError(err);
    }

    const ranked = rankPartners(
      pool.map((p) => {
        const theirSkills = (poolSkillsRes.data ?? [])
          .filter((s) => s.user_id === p.id && s.skills)
          .map((s) => s.skills!.name);
        const load = (loadRes.data ?? []).find((l) => l.candidate_id === p.id);
        return {
          id: p.id,
          name: p.display_name,
          major: p.major,
          university: p.university,
          sharedCourses: (poolCoursesRes.data ?? [])
            .filter((c) => c.user_id === p.id && myCourseIds.has(c.course_id))
            .map((c) => (c.courses ? `${c.courses.code} ${c.courses.title}` : "a shared course")),
          newSkills: [...new Set(theirSkills.filter((s) => !mySkills.has(s.toLowerCase())))],
          wantedSkills: matchWantedSkills(theirSkills, wanted),
          overlapMinutes: (overlapRes.data ?? []).find((o) => o.candidate_id === p.id)?.overlap_minutes ?? 0,
          windowMinutes: (windowRes.data ?? []).find((o) => o.candidate_id === p.id)?.window_minutes ?? 0,
          workload: {
            openTasks: load?.open_tasks ?? 0,
            dueSoon: load?.due_soon ?? 0,
            sessionsWeek: load?.sessions_week ?? 0,
          },
        };
      }),
      MAX_PARTNER_SUGGESTIONS,
      { requireWanted: wanted.length > 0, requireWindow: windows.length > 0, avoidHeavy: data.avoidHeavy === true },
    );
    if (!ranked.length) {
      return { suggestions: [], empty: !myCourseIds.size && !mySkills.size ? "profile_empty" : "no_matches" };
    }

    const keyed = ranked.map((p, i) => ({ key: `c${i + 1}`, p }));
    const facts = (p: (typeof ranked)[number]) => {
      const f: string[] = [];
      if (p.wantedSkills.length) f.push(`has the skills you asked for: ${p.wantedSkills.join(", ")}`);
      if (p.windowMinutes >= 60) f.push("free at the times you asked for");
      if (p.sharedCourses.length) f.push(`shared courses: ${p.sharedCourses.join(", ")}`);
      if (p.newSkills.length) f.push(`skills you don't have: ${p.newSkills.join(", ")}`);
      const h = Math.round((p.overlapMinutes / 60) * 2) / 2;
      if (h > 0) f.push(`overlapping free time: ${h} h/week`);
      // Only a positive workload fact is shared with the model; a heavy one is simply left out.
      if (p.level !== "heavy") f.push(`${p.level} workload this week`);
      return f.join(" | ");
    };

    let reasons: { suggestions: { key: string; reason: string }[] };
    try {
      reasons = await aiJson(
        [
          {
            role: "system",
            content: `For each candidate, write one short, friendly sentence (under 30 words) on why they would be a good study partner for this student. Name the most useful specific facts: skills the student asked for, shared courses, then skills they bring, overlapping free time, and a light or moderate workload as a sign they have time. Use only the listed facts. Do not mention facts that are not listed, and never say what a candidate lacks. Never invent courses, skills, times or personal details. Return one item per candidate key. ${UNTRUSTED_NOTE}`,
          },
          {
            role: "user",
            content: `<records>\nCANDIDATES:\n${keyed.map(({ key, p }) => `- ${key} | ${p.name} | ${facts(p)}`).join("\n")}\n</records>`,
          },
        ],
        "partner_reasons",
        {
          type: "object",
          additionalProperties: false,
          required: ["suggestions"],
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["key", "reason"],
                properties: {
                  key: { type: "string", enum: keyed.map((k) => k.key) },
                  reason: { type: "string" },
                },
              },
            },
          },
        },
      );
    } catch (e) {
      throw new Error(`Found matches, but couldn't write the reasons. ${friendlyAIError(e)}`);
    }

    return {
      empty: null,
      suggestions: keyed.map(({ key, p }, i) => ({
        id: p.id,
        rank: i + 1,
        name: p.name,
        major: p.major,
        university: p.university,
        sharedCourses: p.sharedCourses,
        newSkills: p.newSkills,
        wantedSkills: p.wantedSkills,
        overlapHours: Math.round((p.overlapMinutes / 60) * 2) / 2,
        workload: p.level,
        reason: reasons.suggestions?.find((r) => r.key === key)?.reason?.trim() || partnerReason(p),
      })),
    };
  });

export type SessionProposal = SessionSlot & { title: string; agenda: string };

/** Proposes up to three group study slots when you and your chosen partners are free together. */
export const proposeStudySessions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ partnerIds: z.array(z.string().uuid()).min(1).max(5) }).parse(d),
  )
  .handler(async ({ data, context }): Promise<{ proposals: SessionProposal[] }> => {
    const sb = context.supabase;
    const partnerIds = [...new Set(data.partnerIds)];

    const windowsRes = await sb.rpc("group_free_windows", { _users: partnerIds });
    if (windowsRes.error) throw new Error(windowsRes.error.message);
    const slots = pickSessionSlots(windowsRes.data ?? []);
    if (!slots.length) return { proposals: [] };

    const [coursesRes, namesRes] = await Promise.all([
      sb.from("user_courses").select("user_id, courses(code, title)").in("user_id", [context.userId, ...partnerIds]),
      sb.rpc("my_partner_requests"),
    ]);
    // Courses everyone in the group takes; used only to give the session a sensible title and agenda.
    const byUser = new Map<string, Set<string>>();
    for (const r of coursesRes.data ?? []) {
      if (!r.courses) continue;
      const set = byUser.get(r.user_id) ?? new Set<string>();
      set.add(`${r.courses.code} ${r.courses.title}`);
      byUser.set(r.user_id, set);
    }
    const everyone = [context.userId, ...partnerIds];
    const shared = [...(byUser.get(context.userId) ?? [])].filter((c) => everyone.every((u) => byUser.get(u)?.has(c)));
    const names = (namesRes.data ?? []).filter((r) => partnerIds.includes(r.other_id)).map((r) => r.other_name);

    const fallback = (): { title: string; agenda: string }[] =>
      slots.map(() => ({
        title: shared[0] ? `${shared[0]} study session` : "Study session",
        agenda: "10 min: set goals · 60 min: work through problems together · 20 min: recap and next steps",
      }));

    let texts = fallback();
    try {
      const res = await aiJson<{ sessions: { title: string; agenda: string }[] }>(
        [
          {
            role: "system",
            content: `You help students plan a group study session. For each numbered slot, write a short title (under 8 words) and a one-line time-boxed agenda (under 30 words). Base it only on the shared courses listed; if none are listed keep it general. Never invent course content. ${UNTRUSTED_NOTE}`,
          },
          {
            role: "user",
            content: `<records>\nGROUP: you and ${names.join(", ") || "your partners"}\nSHARED COURSES: ${shared.join("; ") || "none"}\nSLOTS: ${slots.map((s, i) => `${i + 1}. ${s.endMinute - s.startMinute} minutes`).join(" | ")}\n</records>`,
          },
        ],
        "session_text",
        {
          type: "object",
          additionalProperties: false,
          required: ["sessions"],
          properties: {
            sessions: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["title", "agenda"],
                properties: { title: { type: "string" }, agenda: { type: "string" } },
              },
            },
          },
        },
      );
      const base = texts;
      texts = slots.map((_, i) => ({
        title: res.sessions?.[i]?.title?.trim() || base[i]?.title || "Study session",
        agenda: res.sessions?.[i]?.agenda?.trim() || base[i]?.agenda || "",
      }));
    } catch (e) {
      // The times are real; fall back to generic text rather than failing the whole request.
      console.error("[partners] session text failed", e);
    }

    return { proposals: slots.map((s, i) => ({ ...s, title: texts[i]?.title ?? "Study session", agenda: texts[i]?.agenda ?? "" })) };
  });
