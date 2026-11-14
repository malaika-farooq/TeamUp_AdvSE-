// Checking a team session (meeting) before it is saved. Pure, so it can be unit tested.
export type SessionForm = {
  title: string;
  /** Values of date-time inputs ("2026-11-20T15:00"), or "". */
  start: string;
  end: string;
  weekly: boolean;
  /** Value of a date input for "repeat until", or "". */
  recurrenceEnd: string;
};

export type SessionCheck =
  | {
      ok: true;
      clean: { title: string; startsAt: string; endsAt: string; recurrenceEnd: string | null };
    }
  | { ok: false; errors: Partial<Record<"title" | "start" | "end" | "recurrenceEnd", string>> };

export const MAX_SESSION_HOURS = 12;

export function validateSessionForm(f: SessionForm): SessionCheck {
  const errors: Partial<Record<"title" | "start" | "end" | "recurrenceEnd", string>> = {};
  const title = f.title.replace(/\s+/g, " ").trim();
  if (!title) errors.title = "Give the session a title.";
  else if (title.length > 150) errors.title = "Keep the title under 150 characters.";
  const start = f.start ? new Date(f.start) : null;
  const end = f.end ? new Date(f.end) : null;
  if (!start || Number.isNaN(start.getTime())) errors.start = "Choose when it starts.";
  if (!end || Number.isNaN(end.getTime())) errors.end = "Choose when it ends.";
  if (!errors.start && !errors.end && start && end) {
    if (end.getTime() <= start.getTime()) errors.end = "The end must be after the start.";
    else if (end.getTime() - start.getTime() > MAX_SESSION_HOURS * 3600_000)
      errors.end = `A session can be at most ${MAX_SESSION_HOURS} hours long.`;
  }
  let recurrenceEnd: string | null = null;
  if (f.weekly && f.recurrenceEnd) {
    const r = new Date(f.recurrenceEnd);
    if (Number.isNaN(r.getTime())) errors.recurrenceEnd = "That date isn't valid.";
    else if (
      start &&
      r.getTime() < new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
    )
      errors.recurrenceEnd = "Repeat until a date on or after the first session.";
    else recurrenceEnd = r.toISOString();
  }
  if (Object.keys(errors).length || !start || !end) return { ok: false, errors };
  return {
    ok: true,
    clean: { title, startsAt: start.toISOString(), endsAt: end.toISOString(), recurrenceEnd },
  };
}
