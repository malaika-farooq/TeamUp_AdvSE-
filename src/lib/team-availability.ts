// Loading the team's shared free time, reminding teammates, and turning a chosen time into a team session.
// Needs migration 0010_team_availability.sql.
import { supabase } from "@/integrations/supabase/client";
import { fetchTeamMembers, logActivity, notify } from "./queries";
import { groupAvailability, type MemberAvailability, type SlotRow } from "./meeting-times";

export const AVAILABILITY_SETUP_MESSAGE =
  "Meeting times aren't set up in the database yet. Ask the project owner to run migration 0010_team_availability.sql in Supabase.";

function availabilityError(error: { message?: string; code?: string }): Error {
  const message = error.message ?? "";
  if (error.code === "PGRST202" || /could not find the function|schema cache/i.test(message)) {
    return new Error(AVAILABILITY_SETUP_MESSAGE);
  }
  return new Error(message || "Couldn't load the team's availability.");
}

/** Every member's weekly free time, in the members' own time zones. */
export async function loadTeamAvailability(teamId: string): Promise<MemberAvailability[]> {
  const [members, slots] = await Promise.all([
    fetchTeamMembers(teamId),
    supabase.rpc("team_availability", { _team: teamId }),
  ]);
  if (slots.error) throw availabilityError(slots.error);
  return groupAvailability(
    (slots.data ?? []) as SlotRow[],
    members.map((m) => ({
      id: m.user_id,
      name: m.profile?.display_name || "Teammate",
      timeZone: m.profile?.timezone ?? null,
    })),
  );
}

/** Reminds teammates with no free time marked. Returns how many people were reminded. */
export async function nudgeMissing(teamId: string): Promise<number> {
  const { data, error } = await supabase.rpc("nudge_team_availability", { _team: teamId });
  if (error) throw availabilityError(error);
  return Number(data ?? 0);
}

/** Creates a team session at the chosen time, invites everyone, and tells them. */
export async function scheduleMeeting(args: {
  teamId: string;
  userId: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  memberIds: string[];
}): Promise<string> {
  const title = args.title.trim() || "Team meeting";
  if (args.endsAt <= args.startsAt) throw new Error("The meeting must end after it starts.");
  if (args.startsAt.getTime() < Date.now()) throw new Error("Pick a time in the future.");
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      team_id: args.teamId,
      title,
      description: "Scheduled from the team's overlapping free time.",
      starts_at: args.startsAt.toISOString(),
      ends_at: args.endsAt.toISOString(),
      created_by: args.userId,
      recurrence: "none",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  const ids = [...new Set([args.userId, ...args.memberIds])];
  const { error: attendeeError } = await supabase.from("session_attendees").insert(
    ids.map((id) => ({
      session_id: data.id,
      user_id: id,
      status: id === args.userId ? "accepted" : "invited",
    })) as never,
  );
  if (attendeeError) throw new Error(attendeeError.message);
  await logActivity(args.teamId, args.userId, "session_created", `scheduled "${title}"`, data.id);
  await Promise.all(
    ids
      .filter((id) => id !== args.userId)
      .map((id) => notify(id, "session_scheduled", "New team meeting", title, "/calendar")),
  );
  return data.id;
}
