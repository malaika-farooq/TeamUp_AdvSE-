// Builds the team records the assistant is allowed to see. Every query runs as the
// signed-in student (row-level security applies), after confirming membership.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;

export type ContextMember = { id: string; name: string; role: string; skills: string[] };

const DAY = 864e5;

export async function assertTeamMember(supabase: Client, userId: string, teamId: string) {
  const { data } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) throw new Error("You need to be a member of this team to use the assistant with it.");
  return data.role;
}

function fmtDate(iso: string | null | undefined) {
  return iso ? iso.slice(0, 10) : "none";
}

export function fmtDateTime(iso: string, timeZone: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export async function userTimezone(supabase: Client, userId: string) {
  const { data } = await supabase.from("profiles").select("timezone").eq("id", userId).maybeSingle();
  return data?.timezone || "UTC";
}

export async function buildTeamContext(
  supabase: Client,
  userId: string,
  teamId: string,
  opts: { noteIds?: string[]; noteChars?: number } = {},
) {
  await assertTeamMember(supabase, userId, teamId);
  const tz = await userTimezone(supabase, userId);
  const now = Date.now();

  const [teamRes, membersRes, skillsRes, tasksRes, sessionsRes, notesRes, activityRes] =
    await Promise.all([
      supabase
        .from("teams")
        .select("id, name, description, project_goal, deadline, course_id")
        .eq("id", teamId)
        .single(),
      supabase.from("team_members").select("user_id, role").eq("team_id", teamId),
      supabase.rpc("team_member_skills", { _team: teamId }),
      supabase
        .from("tasks")
        .select("id, title, description, status, priority, due_date, assignee_id, completed_at, updated_at")
        .eq("team_id", teamId)
        .order("position"),
      supabase
        .from("sessions")
        .select("id, title, description, starts_at, ends_at, location, recurrence, recurrence_end")
        .eq("team_id", teamId)
        .order("starts_at"),
      (() => {
        let q = supabase
          .from("resources")
          .select("id, title, content, tags, updated_at")
          .eq("team_id", teamId)
          .eq("kind", "note")
          .order("updated_at", { ascending: false });
        if (opts.noteIds?.length) q = q.in("id", opts.noteIds);
        return q.limit(12);
      })(),
      supabase
        .from("activity_logs")
        .select("summary, created_at, actor_id")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  const team = teamRes.data;
  if (!team) throw new Error("This team could not be found.");

  const memberRows = membersRes.data ?? [];
  const ids = memberRows.map((m) => m.user_id);
  const { data: profiles } = ids.length
    ? await supabase.from("profiles").select("id, display_name").in("id", ids)
    : { data: [] as { id: string; display_name: string }[] };

  let course: string | null = null;
  if (team.course_id) {
    const { data } = await supabase
      .from("courses")
      .select("code, title")
      .eq("id", team.course_id)
      .maybeSingle();
    if (data) course = `${data.code} ${data.title}`;
  }

  const nameOf = (id: string | null) =>
    id ? (profiles ?? []).find((p) => p.id === id)?.display_name ?? "a teammate" : "unassigned";

  const members: ContextMember[] = memberRows.map((m) => ({
    id: m.user_id,
    name: nameOf(m.user_id),
    role: m.role,
    skills: (skillsRes.data ?? [])
      .filter((s) => s.user_id === m.user_id)
      .map((s) => `${s.skill} (level ${s.level}/5)`),
  }));

  const tasks = tasksRes.data ?? [];
  const sessions = sessionsRes.data ?? [];
  const upcoming = sessions.filter(
    (s) => new Date(s.ends_at).getTime() > now || s.recurrence === "weekly",
  );
  const notes = notesRes.data ?? [];
  const noteChars = opts.noteChars ?? 700;

  const done = tasks.filter((t) => t.status === "done").length;
  const overdue = tasks.filter(
    (t) => t.status !== "done" && t.due_date && new Date(t.due_date).getTime() < now,
  );

  const lines: string[] = [];
  lines.push(`TEAM: ${team.name}`);
  if (course) lines.push(`COURSE: ${course}`);
  lines.push(`GOAL: ${team.project_goal || "not specified"}`);
  if (team.description) lines.push(`DESCRIPTION: ${team.description}`);
  lines.push(`DEADLINE: ${fmtDate(team.deadline)}`);
  lines.push(`TODAY: ${new Date(now).toISOString().slice(0, 10)} (viewer time zone ${tz})`);
  lines.push(
    `PROGRESS: ${done}/${tasks.length} tasks done, ${overdue.length} overdue`,
  );
  lines.push("", "MEMBERS:");
  for (const m of members) {
    lines.push(`- ${m.name} [${m.role}] skills: ${m.skills.join(", ") || "none recorded"}`);
  }
  lines.push("", "TASKS:");
  if (!tasks.length) lines.push("- none yet");
  for (const t of tasks) {
    const late =
      t.status !== "done" && t.due_date && new Date(t.due_date).getTime() < now ? " OVERDUE" : "";
    lines.push(
      `- "${t.title.trim()}" | status ${t.status} | priority ${t.priority} | due ${fmtDate(t.due_date)}${late} | assignee ${nameOf(t.assignee_id)}${t.description ? ` | ${t.description.slice(0, 160)}` : ""}`,
    );
  }
  lines.push("", "UPCOMING SESSIONS:");
  if (!upcoming.length) lines.push("- none scheduled");
  for (const s of upcoming.slice(0, 8)) {
    const mins = Math.round((new Date(s.ends_at).getTime() - new Date(s.starts_at).getTime()) / 6e4);
    lines.push(
      `- "${s.title.trim()}" | ${fmtDateTime(s.starts_at, tz)} (${mins} min)${s.recurrence === "weekly" ? ` | weekly until ${s.recurrence_end ?? "no end date"}` : ""}${s.location ? ` | ${s.location}` : ""}`,
    );
  }
  lines.push("", "NOTES:");
  if (!notes.length) lines.push("- none yet");
  for (const n of notes) {
    lines.push(
      `- "${n.title.trim()}" (updated ${fmtDate(n.updated_at)}${n.tags.length ? `, tags ${n.tags.join(", ")}` : ""}):\n${(n.content ?? "").slice(0, noteChars)}`,
    );
  }
  lines.push("", "RECENT ACTIVITY:");
  for (const a of (activityRes.data ?? []).slice(0, 15)) {
    lines.push(`- ${fmtDate(a.created_at)} ${nameOf(a.actor_id)} ${a.summary}`);
  }

  return {
    team,
    course,
    members,
    tasks,
    sessions,
    upcoming,
    notes,
    overdue,
    tz,
    nameOf,
    now,
    text: `<records>\n${lines.join("\n")}\n</records>`,
    DAY,
  };
}

/** A lighter overview across all of the student's teams for general chats. */
export async function buildPersonalContext(supabase: Client, userId: string) {
  const tz = await userTimezone(supabase, userId);
  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id, role")
    .eq("user_id", userId);
  const teamIds = (memberships ?? []).map((m) => m.team_id);
  if (!teamIds.length) {
    return `<records>\nThe student is not in any team yet. TODAY: ${new Date().toISOString().slice(0, 10)}\n</records>`;
  }
  const [teams, myTasks, sessions] = await Promise.all([
    supabase.from("teams").select("id, name, deadline, project_goal").in("id", teamIds),
    supabase
      .from("tasks")
      .select("title, status, priority, due_date, team_id")
      .in("team_id", teamIds)
      .eq("assignee_id", userId)
      .neq("status", "done")
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(25),
    supabase
      .from("sessions")
      .select("title, starts_at, team_id, recurrence")
      .in("team_id", teamIds)
      .gte("ends_at", new Date().toISOString())
      .order("starts_at")
      .limit(10),
  ]);
  const teamName = (id: string) => teams.data?.find((t) => t.id === id)?.name ?? "a team";
  const lines = [
    `TODAY: ${new Date().toISOString().slice(0, 10)} (time zone ${tz})`,
    "MY TEAMS:",
    ...(teams.data ?? []).map(
      (t) => `- ${t.name} | deadline ${fmtDate(t.deadline)} | goal ${t.project_goal || "not specified"}`,
    ),
    "",
    "MY OPEN TASKS:",
    ...((myTasks.data ?? []).length
      ? (myTasks.data ?? []).map(
          (t) =>
            `- "${t.title.trim()}" (${teamName(t.team_id)}) | ${t.status} | ${t.priority} | due ${fmtDate(t.due_date)}`,
        )
      : ["- none assigned"]),
    "",
    "UPCOMING SESSIONS:",
    ...((sessions.data ?? []).length
      ? (sessions.data ?? []).map(
          (s) => `- "${s.title.trim()}" (${teamName(s.team_id)}) ${fmtDateTime(s.starts_at, tz)}`,
        )
      : ["- none scheduled"]),
  ];
  return `<records>\n${lines.join("\n")}\n</records>`;
}
