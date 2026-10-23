import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { toast } from "sonner";
import { CalendarDays, Clock, Loader2, MapPin, Plus, Search } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Badge } from "@/frontend/components/ui/badge";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";
import { Switch } from "@/frontend/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/frontend/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/frontend/features/auth/providers/AuthProvider";
import { EmptyState } from "@/frontend/components/shared/states";
import { fetchTeamMembers } from "@/frontend/features/teams/api/queries";
import { logActivity } from "@/frontend/features/activity/api/queries";
import { notify } from "@/frontend/features/notifications/api/queries";
import { type StudySession, type Task, type TaskStatus, type Team } from "@/types/domain";
import { TaskPanel, taskErrorMessage } from "@/frontend/features/tasks/components/TaskBoard";
import { cn } from "@/lib/utils";

type TeamLike = Pick<Team, "id" | "name">;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type Occurrence = {
  session: StudySession;
  start: Date;
  end: Date;
  occurrenceKey: string;
};

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

export function SessionsPanel({
  sessions,
  tasks,
  teams,
  defaultTeamId,
}: {
  sessions: StudySession[];
  tasks: Task[];
  teams: TeamLike[];
  defaultTeamId?: string | undefined;
}) {
  const [view, setView] = useState<"month" | "week" | "agenda">("month");
  const [anchor, setAnchor] = useState(() => new Date());
  const [createOpen, setCreateOpen] = useState(false);
  const [finderOpen, setFinderOpen] = useState(false);
  const [openTask, setOpenTask] = useState<Task | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const openTaskMembersQuery = useQuery({
    queryKey: ["members", openTask?.team_id],
    queryFn: () => fetchTeamMembers(openTask!.team_id),
    enabled: !!openTask,
  });
  const openTaskMembers = openTaskMembersQuery.data ?? [];
  const nameOf = (id: string | null) =>
    id
      ? (openTaskMembers.find((m) => m.user_id === id)?.profile?.display_name ?? "Teammate")
      : "Unassigned";

  async function changeTaskStatus(task: Task, status: TaskStatus) {
    if (task.status === status) return;
    const { error } = await supabase
      .from("tasks")
      .update({
        status,
        completed_at: status === "done" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", task.id);
    if (error) return void toast.error(`Couldn't save that change. ${taskErrorMessage(error)}`);
    if (user) {
      await logActivity(
        task.team_id,
        user.id,
        "task_updated",
        `moved "${task.title}" to ${status.replace("_", " ")}`,
        task.id,
      );
    }
    setOpenTask({ ...task, status });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["activity"] });
  }

  const range = useMemo(() => {
    if (view === "week") {
      const start = new Date(anchor);
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start.getTime() + 7 * 864e5);
      return { start, end };
    }
    if (view === "agenda") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      return { start, end: new Date(start.getTime() + 60 * 864e5) };
    }
    const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 23, 59, 59);
    return { start, end };
  }, [view, anchor]);

  const occurrences = useMemo(
    () => expandSessions(sessions, range.start, range.end),
    [sessions, range],
  );

  const deadlines = useMemo(
    () =>
      tasks
        .filter(
          (t) =>
            t.due_date && new Date(t.due_date) >= range.start && new Date(t.due_date) <= range.end,
        )
        .map((t) => ({ task: t, date: new Date(t.due_date!) })),
    [tasks, range],
  );

  const overlaps = useMemo(() => {
    const keys = new Set<string>();
    for (let i = 0; i < occurrences.length; i++) {
      for (let j = i + 1; j < occurrences.length; j++) {
        const a = occurrences[i];
        const b = occurrences[j];
        if (a && b && a.end > b.start && a.start < b.end) {
          keys.add(a.occurrenceKey);
          keys.add(b.occurrenceKey);
        }
      }
    }
    return keys;
  }, [occurrences]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
          </TabsList>
        </Tabs>
        {view !== "agenda" && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setAnchor((d) =>
                  view === "week"
                    ? new Date(d.getTime() - 7 * 864e5)
                    : new Date(d.getFullYear(), d.getMonth() - 1, 1),
                )
              }
            >
              Prev
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAnchor(new Date())}>
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setAnchor((d) =>
                  view === "week"
                    ? new Date(d.getTime() + 7 * 864e5)
                    : new Date(d.getFullYear(), d.getMonth() + 1, 1),
                )
              }
            >
              Next
            </Button>
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          {anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" })} · times shown
          in {tz}
        </p>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => setFinderOpen(true)}>
            <Search className="mr-1.5 size-4" />
            Find a meeting time
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 size-4" />
            Schedule session
          </Button>
        </div>
      </div>

      {view === "month" && (
        <MonthGrid
          anchor={anchor}
          occurrences={occurrences}
          deadlines={deadlines}
          overlaps={overlaps}
          onOpenTask={setOpenTask}
        />
      )}

      {view !== "month" && (
        <div className="space-y-2">
          {occurrences.length === 0 && deadlines.length === 0 && (
            <EmptyState
              icon={CalendarDays}
              title="Nothing scheduled"
              description="Create a study session or add task due dates to see them here."
            />
          )}
          {occurrences.map((o) => (
            <motion.div
              key={o.occurrenceKey}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="surface-card flex flex-wrap items-center justify-between gap-2 p-4"
            >
              <div>
                <p className="font-medium">{o.session.title}</p>
                <p className="text-xs text-muted-foreground">
                  {o.start.toLocaleString()} –{" "}
                  {o.end.toLocaleTimeString([], { timeStyle: "short" })}
                  {o.session.location ? ` · ${o.session.location}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {overlaps.has(o.occurrenceKey) && <Badge variant="destructive">Overlaps</Badge>}
                {o.session.recurrence === "weekly" && <Badge variant="secondary">Weekly</Badge>}
                <RsvpButtons sessionId={o.session.id} />
              </div>
            </motion.div>
          ))}
          {deadlines.map((d) => (
            <button
              key={d.task.id}
              onClick={() => setOpenTask(d.task)}
              className="flex w-full items-center justify-between rounded-xl border border-dashed border-border p-4 text-left transition-colors hover:border-lavender/50 hover:bg-lavender/5"
            >
              <div>
                <p className="font-medium">{d.task.title}</p>
                <p className="text-xs text-muted-foreground">{d.date.toLocaleString()}</p>
              </div>
              <Badge className="bg-lavender/15 text-lavender" variant="outline">
                Task deadline
              </Badge>
            </button>
          ))}
        </div>
      )}

      <CreateSessionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        teams={teams}
        defaultTeamId={defaultTeamId}
      />
      <MeetingFinder
        open={finderOpen}
        onOpenChange={setFinderOpen}
        teams={teams}
        defaultTeamId={defaultTeamId}
      />
      <TaskPanel
        task={openTask}
        onClose={() => setOpenTask(null)}
        onStatusChange={changeTaskStatus}
        nameOf={nameOf}
        members={openTaskMembers}
      />
    </div>
  );
}

function MonthGrid({
  anchor,
  occurrences,
  deadlines,
  overlaps,
  onOpenTask,
}: {
  anchor: Date;
  occurrences: Occurrence[];
  deadlines: { task: Task; date: Date }[];
  overlaps: Set<string>;
  onOpenTask: (t: Task) => void;
}) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: startPad + daysInMonth }, (_, i) =>
    i < startPad ? null : i - startPad + 1,
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className="grid grid-cols-7 bg-muted/60 text-xs font-semibold text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <div key={d} className="p-2 text-center">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          const date = day ? new Date(anchor.getFullYear(), anchor.getMonth(), day) : null;
          const dayOcc = date
            ? occurrences.filter((o) => o.start.toDateString() === date.toDateString())
            : [];
          const dayDl = date
            ? deadlines.filter((d) => d.date.toDateString() === date.toDateString())
            : [];
          const isToday = date && date.toDateString() === new Date().toDateString();
          return (
            <div
              key={i}
              className={cn(
                "min-h-24 border-b border-r border-border p-1.5 text-xs",
                !day && "bg-muted/30",
                isToday && "bg-primary/5",
              )}
            >
              {day && <p className={cn("mb-1 font-medium", isToday && "text-primary")}>{day}</p>}
              <div className="space-y-1">
                {dayOcc.slice(0, 3).map((o) => (
                  <p
                    key={o.occurrenceKey}
                    className={cn(
                      "truncate rounded bg-teal/15 px-1 py-0.5 text-teal",
                      overlaps.has(o.occurrenceKey) && "bg-destructive/15 text-destructive",
                    )}
                    title={o.session.title}
                  >
                    {o.start.toLocaleTimeString([], { timeStyle: "short" })} {o.session.title}
                  </p>
                ))}
                {dayDl.slice(0, 2).map((d) => (
                  <button
                    key={d.task.id}
                    onClick={() => onOpenTask(d.task)}
                    className="block w-full truncate rounded bg-lavender/15 px-1 py-0.5 text-left text-lavender transition-colors hover:bg-lavender/30"
                    title={d.task.title}
                  >
                    Due: {d.task.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RsvpButtons({ sessionId }: { sessionId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string | null>(null);

  async function rsvp(value: "accepted" | "declined" | "tentative") {
    if (!user) return;
    const { error } = await supabase
      .from("session_attendees")
      .upsert(
        { session_id: sessionId, user_id: user.id, status: value },
        { onConflict: "session_id,user_id" },
      );
    if (error) return void toast.error(error.message);
    setStatus(value);
    toast.success(`Marked as ${value}`);
    queryClient.invalidateQueries({ queryKey: ["sessions"] });
  }

  return (
    <Select value={status ?? ""} onValueChange={(v) => rsvp(v as "accepted")}>
      <SelectTrigger className="h-8 w-[130px] text-xs" aria-label="Your response">
        <SelectValue placeholder="RSVP" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="accepted">Going</SelectItem>
        <SelectItem value="tentative">Maybe</SelectItem>
        <SelectItem value="declined">Can't make it</SelectItem>
      </SelectContent>
    </Select>
  );
}

function CreateSessionDialog({
  open,
  onOpenChange,
  teams,
  defaultTeamId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  teams: TeamLike[];
  defaultTeamId?: string | undefined;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [teamId, setTeamId] = useState(defaultTeamId ?? teams[0]?.id ?? "");
  const [weekly, setWeekly] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    location: "",
    recurrenceEnd: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !teamId) return;
    setBusy(true);
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        team_id: teamId,
        title: form.title,
        description: form.description || null,
        starts_at: new Date(form.start).toISOString(),
        ends_at: new Date(form.end).toISOString(),
        location: form.location || null,
        created_by: user.id,
        recurrence: weekly ? "weekly" : "none",
        recurrence_end:
          weekly && form.recurrenceEnd ? new Date(form.recurrenceEnd).toISOString() : null,
      })
      .select("id")
      .single();
    if (error) {
      setBusy(false);
      return void toast.error(error.message);
    }
    const members = await fetchTeamMembers(teamId);
    await supabase.from("session_attendees").insert(
      members.map((m) => ({
        session_id: data.id,
        user_id: m.user_id,
        status: m.user_id === user.id ? "accepted" : "invited",
      })) as never,
    );
    await logActivity(teamId, user.id, "session_created", `scheduled "${form.title}"`, data.id);
    await Promise.all(
      members
        .filter((m) => m.user_id !== user.id)
        .map((m) =>
          notify(m.user_id, "session_scheduled", "New study session", form.title, "/calendar"),
        ),
    );
    setBusy(false);
    toast.success("Session scheduled");
    onOpenChange(false);
    queryClient.invalidateQueries();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule a session</DialogTitle>
          <DialogDescription>
            Times are stored in UTC and shown in each member's timezone.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="st">Title</Label>
            <Input
              id="st"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Team</Label>
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ss">Starts</Label>
              <Input
                id="ss"
                type="datetime-local"
                required
                value={form.start}
                onChange={(e) => setForm({ ...form, start: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="se">Ends</Label>
              <Input
                id="se"
                type="datetime-local"
                required
                value={form.end}
                onChange={(e) => setForm({ ...form, end: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sl">Location or link</Label>
            <Input
              id="sl"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Library room 3B or a meeting link"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sd">Description</Label>
            <Textarea
              id="sd"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div>
              <p className="text-sm font-medium">Repeat weekly</p>
              <p className="text-xs text-muted-foreground">Same day and time each week.</p>
            </div>
            <Switch checked={weekly} onCheckedChange={setWeekly} />
          </div>
          {weekly && (
            <div className="space-y-1.5">
              <Label htmlFor="sre">Repeat until</Label>
              <Input
                id="sre"
                type="date"
                value={form.recurrenceEnd}
                onChange={(e) => setForm({ ...form, recurrenceEnd: e.target.value })}
              />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !teamId}>
              {busy && <Loader2 className="mr-2 size-4 animate-spin" />}Schedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MeetingFinder({
  open,
  onOpenChange,
  teams,
  defaultTeamId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  teams: TeamLike[];
  defaultTeamId?: string | undefined;
}) {
  const [teamId, setTeamId] = useState(defaultTeamId ?? teams[0]?.id ?? "");
  const [duration, setDuration] = useState("60");

  const result = useQuery({
    queryKey: ["find-time", teamId, duration],
    enabled: open && !!teamId,
    queryFn: async () => {
      const members = await fetchTeamMembers(teamId);
      const ids = members.map((m) => m.user_id);
      const { data: slots, error } = await supabase
        .from("availability_slots")
        .select("*")
        .in("user_id", ids);
      if (error) throw new Error(error.message);
      const need = Number(duration);
      const buckets = new Map<string, Set<string>>();
      (slots ?? []).forEach((s) => {
        for (let m = s.start_minute; m + need <= s.end_minute; m += 30) {
          const key = `${s.weekday}:${m}`;
          if (!buckets.has(key)) buckets.set(key, new Set());
          buckets.get(key)!.add(s.user_id);
        }
      });
      const options = Array.from(buckets.entries())
        .map(([key, users]) => {
          const parts = key.split(":").map(Number);
          return { weekday: parts[0] ?? 0, minute: parts[1] ?? 0, count: users.size };
        })
        .sort((a, b) => b.count - a.count || a.weekday - b.weekday || a.minute - b.minute)
        .slice(0, 8);
      return {
        options,
        total: ids.length,
        withAvailability: new Set((slots ?? []).map((s) => s.user_id)).size,
      };
    },
  });

  const fmt = (minute: number) =>
    `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Find a meeting time</DialogTitle>
          <DialogDescription>
            Based only on the weekly availability teammates saved themselves.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Select value={teamId} onValueChange={setTeamId}>
            <SelectTrigger aria-label="Team">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger aria-label="Duration">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          {result.isLoading && (
            <p className="text-sm text-muted-foreground">
              <Loader2 className="mr-2 inline size-4 animate-spin" />
              Checking availability…
            </p>
          )}
          {result.data && result.data.options.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No shared availability yet. Ask teammates to fill in their weekly availability in
              Settings.
            </p>
          )}
          {result.data?.options.map((o) => {
            const everyone = o.count === result.data!.total;
            return (
              <div
                key={`${o.weekday}-${o.minute}`}
                className="flex items-center justify-between rounded-xl border border-border p-3 text-sm"
              >
                <span className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" />
                  {WEEKDAYS[o.weekday] ?? ""} at {fmt(o.minute)}
                </span>
                <Badge variant={everyone ? "default" : "secondary"}>
                  {everyone ? "Everyone free" : `${o.count} of ${result.data!.total} free`}
                </Badge>
              </div>
            );
          })}
          {result.data && result.data.withAvailability < result.data.total && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3" />
              {result.data.total - result.data.withAvailability} member(s) haven't shared
              availability, so these are partial matches.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
