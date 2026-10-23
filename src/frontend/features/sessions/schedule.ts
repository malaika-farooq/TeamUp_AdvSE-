import type { StudySession } from "@/types/domain";

export type Occurrence = {
  session: StudySession;
  start: Date;
  end: Date;
  occurrenceKey: string;
};

/** Weekly availability a member saved: minutes from midnight, weekday 0 = Sunday. */
export type AvailabilitySlot = {
  user_id: string;
  weekday: number;
  start_minute: number;
  end_minute: number;
};

export type MeetingOption = { weekday: number; minute: number; count: number };

export function expandSessions(sessions: StudySession[], from: Date, to: Date): Occurrence[] {
  const out: Occurrence[] = [];
  for (const s of sessions) {
    const start = new Date(s.starts_at);
    const end = new Date(s.ends_at);
    const duration = end.getTime() - start.getTime();
    if (s.recurrence !== "weekly") {
      if (start >= from && start <= to)
        out.push({ session: s, start, end, occurrenceKey: `${s.id}:${start.toISOString()}` });
      continue;
    }
    const until = s.recurrence_end ? new Date(s.recurrence_end) : to;
    let cursor = new Date(start);
    while (cursor <= to && cursor <= until) {
      if (cursor >= from) {
        out.push({
          session: s,
          start: new Date(cursor),
          end: new Date(cursor.getTime() + duration),
          occurrenceKey: `${s.id}:${cursor.toISOString()}`,
        });
      }
      cursor = new Date(cursor.getTime() + 7 * 864e5);
    }
  }
  return out.sort((a, b) => a.start.getTime() - b.start.getTime());
}

/**
 * Availability overlap: every 30-minute start time at which a block of `need`
 * minutes fits inside a member's saved slot, ranked by how many members are free.
 */
export function findMeetingOptions(
  slots: AvailabilitySlot[],
  need: number,
  limit = 8,
): MeetingOption[] {
  const buckets = new Map<string, Set<string>>();
  slots.forEach((s) => {
    for (let m = s.start_minute; m + need <= s.end_minute; m += 30) {
      const key = `${s.weekday}:${m}`;
      if (!buckets.has(key)) buckets.set(key, new Set());
      buckets.get(key)!.add(s.user_id);
    }
  });
  return Array.from(buckets.entries())
    .map(([key, users]) => {
      const parts = key.split(":").map(Number);
      return { weekday: parts[0] ?? 0, minute: parts[1] ?? 0, count: users.size };
    })
    .sort((a, b) => b.count - a.count || a.weekday - b.weekday || a.minute - b.minute)
    .slice(0, limit);
}
