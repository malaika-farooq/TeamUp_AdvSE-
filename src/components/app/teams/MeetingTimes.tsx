import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BellRing, CalendarCheck, CalendarClock, Loader2, Pencil, Users } from "lucide-react";
import { UserAvatar } from "@/components/app/profile/UserAvatar";
import { AvailabilityEditor } from "@/components/app/profile/AvailabilityEditor";
import { EmptyState, ErrorState } from "@/components/app/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import {
  DEFAULT_DURATION,
  DURATIONS,
  GRID_ROWS,
  WEEK_DAYS,
  bestMeetingTimes,
  cellKey,
  formatWindow,
  freeByHalfHour,
  freeHours,
  heatLevel,
  inViewerZone,
  inWindow,
  membersWithoutAvailability,
  type MeetingWindow,
} from "@/lib/meeting-times";
import { nextOccurrence, DAY_LABELS } from "@/lib/partner-ranking";
import { formatMinute, mergeRanges, STEP_MINUTES, type Range } from "@/lib/profile-data";
import { loadMyAvailability, saveAvailability } from "@/lib/profile-queries";
import { loadTeamAvailability, nudgeMissing, scheduleMeeting } from "@/lib/team-availability";
import { cn } from "@/lib/utils";

const HEAT = [
  "bg-muted/40",
  "bg-teal/20",
  "bg-teal/40",
  "bg-teal/65",
  "bg-teal text-white",
] as const;

const selectClass = "h-9 rounded-md border border-input bg-background px-2 text-sm";

/** Where everyone's free time overlaps, the best times for a meeting, and a one-click way to book one. */
export function MeetingTimes({ teamId, teamName }: { teamId: string; teamName: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [duration, setDuration] = useState<number>(DEFAULT_DURATION);
  const [picked, setPicked] = useState<{ weekday: number; minute: number } | null>(null);
  const [booking, setBooking] = useState<MeetingWindow | null>(null);
  const [editing, setEditing] = useState(false);
  const [nudging, setNudging] = useState(false);

  const query = useQuery({
    queryKey: ["team-availability", teamId],
    queryFn: () => loadTeamAvailability(teamId),
  });

  // Show every time in this device's own time zone, whatever zone each teammate saved theirs in.
  const viewerZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const members = useMemo(
    () => inViewerZone(query.data ?? [], viewerZone),
    [query.data, viewerZone],
  );
  const best = useMemo(() => bestMeetingTimes(members, duration), [members, duration]);
  const grid = useMemo(() => freeByHalfHour(members), [members]);
  const missing = useMemo(() => membersWithoutAvailability(members), [members]);
  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? "Teammate";
  const total = members.length;

  async function remind() {
    setNudging(true);
    try {
      const n = await nudgeMissing(teamId);
      toast.success(
        n > 0
          ? `Reminded ${n} teammate${n === 1 ? "" : "s"}.`
          : "Everyone without free time was already reminded today.",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't send the reminder.");
    } finally {
      setNudging(false);
    }
  }

  if (query.isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
        <Loader2 className="size-4 animate-spin" /> Checking everyone's free time…
      </p>
    );
  }
  if (query.isError) {
    return (
      <ErrorState
        title="Couldn't load meeting times"
        message={(query.error as Error).message}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const pickedFree = picked
    ? (grid.get(cellKey(picked.weekday, picked.minute)) ?? new Set())
    : null;
  const sharedCount = members.length - missing.length;

  return (
    <div className="space-y-6">
      <div className="surface-card flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="font-display font-semibold">
            {sharedCount} of {total} {total === 1 ? "member has" : "members have"} marked free time
          </p>
          <p className="text-sm text-muted-foreground">
            Times are shown in your time zone ({viewerZone}). Only members of {teamName} can see
            this.
          </p>
          {missing.length > 0 && (
            <p className="mt-1 text-sm">
              Still to add:{" "}
              <span className="font-medium">{missing.map((m) => m.name).join(", ")}</span>
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {missing.length > 0 && (
            <Button variant="outline" onClick={remind} disabled={nudging}>
              {nudging ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <BellRing className="mr-2 size-4" />
              )}
              Remind them
            </Button>
          )}
          <Button variant={editing ? "secondary" : "default"} onClick={() => setEditing((v) => !v)}>
            <Pencil className="mr-2 size-4" />
            {editing ? "Close" : "Mark my free time"}
          </Button>
        </div>
      </div>

      {editing && user && (
        <MyFreeTime
          userId={user.id}
          onSaved={() => {
            void queryClient.invalidateQueries();
            setEditing(false);
          }}
        />
      )}

      {/* Best times */}
      <section aria-labelledby="best-times-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 id="best-times-heading" className="font-display text-lg font-semibold">
              Best times to meet
            </h3>
            <p className="text-sm text-muted-foreground">
              Most people free for the whole meeting come first.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="mt-length" className="text-sm">
              Meeting length
            </Label>
            <select
              id="mt-length"
              className={selectClass}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d < 60 ? `${d} minutes` : d === 60 ? "1 hour" : `${d / 60} hours`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {best.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title={sharedCount === 0 ? "Nobody has marked free time yet" : "No common time yet"}
            description={
              sharedCount === 0
                ? "Mark your free time, and ask your teammates to do the same. The best common times will appear here."
                : `No ${duration}-minute time when at least two people are free. Try a shorter meeting, or ask teammates to add more free time.`
            }
          />
        ) : (
          <ol className="grid gap-3 md:grid-cols-2" aria-label="Best meeting times">
            {best.map((w, i) => (
              <li
                key={`${w.weekday}-${w.start}`}
                className={cn("surface-card space-y-2 p-4", i === 0 && "ring-2 ring-teal")}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {i + 1}. {formatWindow(w)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      A {w.duration}-minute meeting fits anywhere in this time.
                    </p>
                  </div>
                  <Badge
                    className={cn("shrink-0", w.everyone && "bg-teal text-white hover:bg-teal")}
                    variant={w.everyone ? "default" : "secondary"}
                  >
                    {w.everyone ? "Everyone free" : `${w.freeIds.length} of ${total} free`}
                  </Badge>
                </div>
                {w.missingIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Can't make it: {w.missingIds.map(nameOf).join(", ")}
                  </p>
                )}
                <Button size="sm" onClick={() => setBooking(w)}>
                  <CalendarCheck className="mr-1.5 size-4" />
                  Schedule meeting
                </Button>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Heat map */}
      <section aria-labelledby="heat-heading" className="space-y-3">
        <div>
          <h3 id="heat-heading" className="font-display text-lg font-semibold">
            Everyone's free time
          </h3>
          <p className="text-sm text-muted-foreground">
            Darker means more people are free. A ringed cell is part of a best time. Select a cell
            to see who's free.
          </p>
        </div>
        {total === 0 ? (
          <EmptyState icon={Users} title="No members" description="This team has no members." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-separate border-spacing-0.5 text-xs">
              <caption className="sr-only">Number of team members free at each half hour</caption>
              <thead>
                <tr>
                  <th className="w-14" />
                  {DAY_LABELS.map((d) => (
                    <th key={d} scope="col" className="pb-1 font-medium text-muted-foreground">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GRID_ROWS.map((minute) => (
                  <tr key={minute}>
                    <th scope="row" className="pr-2 text-right font-normal text-muted-foreground">
                      {minute % 60 === 0 ? formatMinute(minute) : ""}
                    </th>
                    {DAY_LABELS.map((d, wd) => {
                      const n = grid.get(cellKey(wd, minute))?.size ?? 0;
                      const level = heatLevel(n, total);
                      const isBest = inWindow(best, wd, minute);
                      const isPicked = picked?.weekday === wd && picked.minute === minute;
                      return (
                        <td key={d} className="p-0">
                          <button
                            type="button"
                            aria-label={`${WEEK_DAYS[wd]} ${formatMinute(minute)}: ${n} of ${total} free`}
                            aria-pressed={isPicked}
                            data-level={level}
                            data-best={isBest || undefined}
                            onClick={() => setPicked({ weekday: wd, minute })}
                            className={cn(
                              "block h-4 w-full rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              HEAT[level],
                              isBest && "ring-2 ring-primary",
                              isPicked && "outline outline-2 outline-foreground",
                            )}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground" aria-hidden>
          Fewer
          {HEAT.map((c, i) => (
            <span key={i} className={cn("h-3 w-6 rounded-sm", c)} />
          ))}
          More
        </div>
        {picked && pickedFree && (
          <div className="surface-card space-y-2 p-4" role="status">
            <p className="font-semibold">
              {WEEK_DAYS[picked.weekday]} {formatMinute(picked.minute)} –{" "}
              {formatMinute(picked.minute + STEP_MINUTES)}
            </p>
            <p className="text-sm">
              <span className="font-medium">Free:</span>{" "}
              {pickedFree.size ? [...pickedFree].map(nameOf).join(", ") : "nobody"}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Not free:</span>{" "}
              {members
                .filter((m) => !pickedFree.has(m.id))
                .map((m) => m.name)
                .join(", ") || "nobody"}
            </p>
          </div>
        )}
      </section>

      {/* Who has shared how much */}
      <section aria-labelledby="who-heading" className="space-y-2">
        <h3 id="who-heading" className="font-display text-lg font-semibold">
          Members
        </h3>
        <ul className="grid gap-2 md:grid-cols-2">
          {members.map((m) => {
            const hours = freeHours(m.ranges);
            return (
              <li key={m.id} className="surface-card flex items-center gap-3 p-3">
                <UserAvatar name={m.name} className="size-8" />
                <span className="min-w-0 flex-1 truncate font-medium">
                  {m.name}
                  {m.id === user?.id ? " (you)" : ""}
                </span>
                <Badge variant={hours > 0 ? "secondary" : "outline"}>
                  {hours > 0 ? `${hours} h free / week` : "Nothing marked yet"}
                </Badge>
              </li>
            );
          })}
        </ul>
      </section>

      <BookDialog
        slot={booking}
        teamId={teamId}
        teamName={teamName}
        memberIds={members.map((m) => m.id)}
        freeIds={booking?.freeIds ?? []}
        onClose={() => setBooking(null)}
      />
    </div>
  );
}

/** The signed-in student's own weekly free time, saved with one button. */
function MyFreeTime({ userId, onSaved }: { userId: string; onSaved: () => void }) {
  const query = useQuery({
    queryKey: ["availability", userId],
    queryFn: () => loadMyAvailability(userId),
  });
  const [draft, setDraft] = useState<Range[] | null>(null);
  const [saving, setSaving] = useState(false);
  const ranges = draft ?? query.data ?? [];
  const dirty =
    draft !== null && JSON.stringify(mergeRanges(draft)) !== JSON.stringify(query.data ?? []);

  async function save() {
    setSaving(true);
    try {
      await saveAvailability(ranges);
      toast.success("Availability saved");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save your availability.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section aria-label="Mark my free time" className="surface-card space-y-4 p-5">
      <div>
        <h3 className="font-display text-lg font-semibold">Mark my free time</h3>
        <p className="text-sm text-muted-foreground">
          This is the same weekly availability as in Settings. Teammates can see when you're free,
          nothing else.
        </p>
      </div>
      {query.isLoading ? (
        <Loader2 className="size-5 animate-spin" />
      ) : query.isError ? (
        <ErrorState
          title="Couldn't load your free time"
          message={(query.error as Error).message}
          onRetry={() => void query.refetch()}
        />
      ) : (
        <AvailabilityEditor value={ranges} onChange={setDraft} />
      )}
      <Button onClick={save} disabled={!dirty || saving}>
        {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
        Save my free time
      </Button>
    </section>
  );
}

/** Pick the start inside a best window, name the meeting, and book it. */
function BookDialog({
  slot: w,
  teamId,
  teamName,
  memberIds,
  freeIds,
  onClose,
}: {
  slot: MeetingWindow | null;
  teamId: string;
  teamName: string;
  memberIds: string[];
  freeIds: string[];
  onClose: () => void;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [startChoice, setStartChoice] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const starts: number[] = [];
  if (w) for (let t = w.start; t + w.duration <= w.end; t += STEP_MINUTES) starts.push(t);
  const start =
    startChoice !== null && starts.includes(startChoice) ? startChoice : (starts[0] ?? 0);

  async function book() {
    if (!w || !user) return;
    setBusy(true);
    try {
      const startsAt = nextOccurrence(w.weekday, start);
      const endsAt = new Date(startsAt.getTime() + w.duration * 60000);
      await scheduleMeeting({
        teamId,
        userId: user.id,
        title: title || `${teamName} meeting`,
        startsAt,
        endsAt,
        // Everyone on the team is invited, so people who can't make it can say so.
        memberIds,
      });
      toast.success("Meeting scheduled. Your team was invited.");
      void queryClient.invalidateQueries();
      setTitle("");
      setStartChoice(null);
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't schedule the meeting.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={!!w} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule a meeting</DialogTitle>
          <DialogDescription>
            {w ? `${WEEK_DAYS[w.weekday]}, ${w.duration} minutes. ` : ""}
            {freeIds.length} of {memberIds.length} members are free then. Everyone is invited.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="bm-title">Title</Label>
            <Input
              id="bm-title"
              value={title}
              placeholder={`${teamName} meeting`}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bm-start">Starts at</Label>
            <select
              id="bm-start"
              className={cn(selectClass, "w-full")}
              value={start}
              onChange={(e) => setStartChoice(Number(e.target.value))}
            >
              {starts.map((t) => (
                <option key={t} value={t}>
                  {formatMinute(t)} – {formatMinute(t + (w?.duration ?? 0))}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={book} disabled={busy}>
            {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
