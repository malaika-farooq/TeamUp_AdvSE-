import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { callAI, parseJsonBlock } from "./gateway.server";

async function assertMember(supabase: SupabaseClient<Database>, userId: string, teamId: string) {
  const { data } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) throw new Error("You are not a member of this team.");
  return data.role as string;
}

export const draftTaskPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ teamId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertMember(context.supabase, context.userId, data.teamId);
    const { data: team } = await context.supabase
      .from("teams")
      .select("name, project_goal, deadline, description")
      .eq("id", data.teamId)
      .single();
    const { data: members } = await context.supabase
      .from("team_members")
      .select("user_id")
      .eq("team_id", data.teamId);
    const ids = (members ?? []).map((m: { user_id: string }) => m.user_id);
    const { data: skills } = await context.supabase
      .from("user_skills")
      .select("skill_id, user_id")
      .in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);

    const content = await callAI([
      {
        role: "system",
        content:
          "You plan student group projects. Reply with ONLY a JSON array of up to 8 objects: {title, description, priority (low|medium|high|urgent), dueOffsetDays (integer)}. Never invent facts about people.",
      },
      {
        role: "user",
        content: `Team: ${team?.name}\nGoal: ${team?.project_goal ?? "not specified"}\nDescription: ${team?.description ?? "none"}\nDeadline: ${team?.deadline ?? "none"}\nMembers: ${ids.length}\nRecorded skills: ${(skills ?? []).length}`,
      },
    ]);

    const suggestions = parseJsonBlock<
      { title: string; description: string; priority: string; dueOffsetDays: number }[]
    >(content, []);
    return { suggestions };
  });

export const summarizeTeam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ teamId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertMember(context.supabase, context.userId, data.teamId);
    const [tasks, notes, activity] = await Promise.all([
      context.supabase
        .from("tasks")
        .select("title,status,priority,due_date")
        .eq("team_id", data.teamId),
      context.supabase
        .from("resources")
        .select("title,content")
        .eq("team_id", data.teamId)
        .eq("kind", "note")
        .limit(10),
      context.supabase
        .from("activity_logs")
        .select("summary,created_at")
        .eq("team_id", data.teamId)
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

    const summary = await callAI([
      {
        role: "system",
        content:
          "You summarize a student team's progress from records supplied by the app. Use only the supplied records. Produce markdown with sections: Decisions, Unfinished work, Blockers, Next steps. Reference specific task or note titles. If something is unknown, say the records do not show it.",
      },
      {
        role: "user",
        content: `TASKS:\n${JSON.stringify(tasks.data ?? [])}\n\nNOTES:\n${JSON.stringify(notes.data ?? [])}\n\nACTIVITY:\n${JSON.stringify(activity.data ?? [])}`,
      },
    ]);
    return { summary };
  });

export const suggestTeammates = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ teamId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertMember(context.supabase, context.userId, data.teamId);
    const { data: members } = await context.supabase
      .from("team_members")
      .select("user_id")
      .eq("team_id", data.teamId);
    const memberIds = (members ?? []).map((m: { user_id: string }) => m.user_id);

    const { data: candidates } = await context.supabase
      .from("profiles")
      .select("id, display_name, university, major, bio")
      .eq("discoverable", true)
      .limit(40);

    const pool = (candidates ?? []).filter((c: { id: string }) => !memberIds.includes(c.id));
    if (pool.length === 0) return { suggestions: [] as { name: string; reason: string }[] };

    const { data: teamCourses } = await context.supabase
      .from("user_courses")
      .select("course_id, user_id")
      .in("user_id", memberIds.length ? memberIds : ["00000000-0000-0000-0000-000000000000"]);
    const { data: poolCourses } = await context.supabase
      .from("user_courses")
      .select("course_id, user_id")
      .in(
        "user_id",
        pool.map((p: { id: string }) => p.id),
      );

    const content = await callAI([
      {
        role: "system",
        content:
          "You suggest up to 4 potential teammates for a student team, using only the supplied profile records. Reply with ONLY a JSON array of {name, reason}. Never invent courses, skills or availability times.",
      },
      {
        role: "user",
        content: `TEAM COURSES:\n${JSON.stringify(teamCourses ?? [])}\n\nCANDIDATES:\n${JSON.stringify(pool)}\n\nCANDIDATE COURSES:\n${JSON.stringify(poolCourses ?? [])}`,
      },
    ]);
    return { suggestions: parseJsonBlock<{ name: string; reason: string }[]>(content, []) };
  });
