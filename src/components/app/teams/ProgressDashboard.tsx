import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ListChecks,
  Trophy,
  UserX,
} from "lucide-react";
import { UserAvatar } from "@/components/app/profile/UserAvatar";
import { ErrorState } from "@/components/app/states";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { MemberWithProfile, Resource, StudySession, Task } from "@/lib/queries";
import { dueState, columnLabel } from "@/lib/task-board";
import {
  memberContributions,
  overviewStats,
  statusBreakdown,
  topContributor,
  upcomingDeadlines,
} from "@/lib/progress";
import { fetchCommentAuthors, fetchRecentActivity } from "@/lib/team-progress";
import { timeAgo } from "@/lib/notifications";
import { cn } from "@/lib/utils";

const BAR: Record<string, string> = {
  todo: "bg-muted-foreground/40",
  in_progress: "bg-blue",
  done: "bg-teal",
};

function Stat({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  tone?: string;
}) {
  return (
    <div className="surface-card flex items-center gap-3 p-4">
      <span className={cn("grid size-10 place-items-center rounded-xl bg-muted", tone)}>
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-display text-2xl font-bold" data-testid={`stat-${label}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

/** A team's progress at a glance: tasks by status, what is due, and what each member has contributed. */
export function ProgressDashboard({
  teamId,
  tasks,
  members,
  resources,
  sessions,
}: {
  teamId: string;
  tasks: Task[];
  members: MemberWithProfile[];
  resources: Resource[];
  sessions: StudySession[];
}) {
  const taskIds = tasks.map((t) => t.id);
  const comments = useQuery({
    queryKey: ["team-comments", teamId, taskIds.length],
    queryFn: () => fetchCommentAuthors(taskIds),
  });
  const activity = useQuery({
    queryKey: ["activity", "recent", teamId],
    queryFn: () => fetchRecentActivity(teamId),
  });

  const people = useMemo(
    () => members.map((m) => ({ id: m.user_id, name: m.profile?.display_name ?? "Teammate" })),
    [members],
  );
  const nameOf = (id: string | null) =>
    id ? (people.find((p) => p.id === id)?.name ?? "Former member") : "Unassigned";
  const avatarOf = (id: string) =>
    members.find((m) => m.user_id === id)?.profile?.avatar_url ?? null;

  const now = new Date();
  const stats = overviewStats(tasks, now);
  const byStatus = statusBreakdown(tasks);
  const deadlines = upcomingDeadlines(tasks, now, 6);
  const contributions = memberContributions({
    members: people,
    tasks,
    resources,
    comments: comments.data ?? [],
    sessions,
    activity: activity.data ?? [],
    now,
  });
  const top = topContributor(contributions);

  if (comments.isError || activity.isError) {
    const err = (comments.error ?? activity.error) as Error;
    return (
      <ErrorState
        title="Couldn't load the progress details"
        message={err.message}
        onRetry={() => {
          void comments.refetch();
          void activity.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section aria-label="Summary" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat
          label="Completed"
          value={`${stats.completionPercent}%`}
          icon={CheckCircle2}
          tone="text-teal"
        />
        <Stat label="Open tasks" value={stats.open} icon={ListChecks} />
        <Stat
          label="Overdue"
          value={stats.overdue}
          icon={AlertTriangle}
          tone={stats.overdue ? "text-destructive" : ""}
        />
        <Stat
          label="Due this week"
          value={stats.dueThisWeek}
          icon={CalendarClock}
          tone="text-blue"
        />
        <Stat label="Unassigned" value={stats.unassigned} icon={UserX} />
      </section>

      <section aria-labelledby="status-heading" className="surface-card space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 id="status-heading" className="font-display font-semibold">
            Tasks by status
          </h3>
          <span className="text-sm text-muted-foreground">
            {stats.done} of {stats.total} done
          </span>
        </div>
        <Progress
          value={stats.completionPercent}
          className="h-2.5"
          aria-label="Overall completion"
        />
        {stats.total === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks yet. Add one on the Task Board.</p>
        ) : (
          <ul className="space-y-2">
            {byStatus.map((s) => (
              <li
                key={s.key}
                className="grid grid-cols-[6.5rem_1fr_4.5rem] items-center gap-3 text-sm"
              >
                <span>{s.label}</span>
                <div
                  role="img"
                  aria-label={`${s.label}: ${s.count} of ${stats.total} tasks (${s.percent}%)`}
                  className="h-3 overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className={cn("h-full rounded-full", BAR[s.key])}
                    style={{ width: `${s.percent}%` }}
                  />
                </div>
                <span className="text-right tabular-nums text-muted-foreground">
                  {s.count} · {s.percent}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="deadline-heading" className="surface-card space-y-4 p-5">
        <h3 id="deadline-heading" className="font-display font-semibold">
          Deadlines
        </h3>
        {deadlines.overdue.length === 0 && deadlines.upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No open tasks have a due date. Add dates to tasks and they will show up here.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-destructive">
                Overdue ({deadlines.overdue.length})
              </h4>
              {deadlines.overdue.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing is overdue.</p>
              ) : (
                <ul className="space-y-2" aria-label="Overdue tasks">
                  {deadlines.overdue.map((t) => (
                    <DeadlineRow key={t.id} t={t} who={nameOf(t.assignee_id)} />
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Coming up ({deadlines.upcoming.length})
              </h4>
              {deadlines.upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
              ) : (
                <ul className="space-y-2" aria-label="Upcoming deadlines">
                  {deadlines.upcoming.map((t) => (
                    <DeadlineRow key={t.id} t={t} who={nameOf(t.assignee_id)} />
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="contrib-heading" className="surface-card space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id="contrib-heading" className="font-display font-semibold">
            Contributions
          </h3>
          {top && (
            <Badge className="gap-1 bg-teal/15 text-foreground hover:bg-teal/15">
              <Trophy className="size-3.5" />
              Most tasks finished: {top.name} ({top.done})
            </Badge>
          )}
        </div>
        {contributions.length === 0 ? (
          <p className="text-sm text-muted-foreground">This team has no members.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <caption className="sr-only">What each member has contributed</caption>
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Member
                  </th>
                  <th scope="col" className="px-2 text-right font-medium">
                    Assigned
                  </th>
                  <th scope="col" className="px-2 text-right font-medium">
                    Done
                  </th>
                  <th scope="col" className="px-2 text-right font-medium">
                    Open
                  </th>
                  <th scope="col" className="px-2 text-right font-medium">
                    Overdue
                  </th>
                  <th scope="col" className="px-2 text-right font-medium">
                    Comments
                  </th>
                  <th scope="col" className="px-2 text-right font-medium">
                    Shared
                  </th>
                  <th scope="col" className="px-2 font-medium">
                    Share of finished work
                  </th>
                  <th scope="col" className="pl-2 text-right font-medium">
                    Last active
                  </th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border/60 last:border-0"
                    data-member={c.id}
                  >
                    <th scope="row" className="py-2 pr-3 text-left font-medium">
                      <span className="inline-flex items-center gap-2">
                        <UserAvatar name={c.name} path={avatarOf(c.id)} className="size-6" />
                        {c.name}
                      </span>
                    </th>
                    <td className="px-2 text-right tabular-nums">{c.assigned}</td>
                    <td className="px-2 text-right tabular-nums">{c.done}</td>
                    <td className="px-2 text-right tabular-nums">{c.open}</td>
                    <td
                      className={cn(
                        "px-2 text-right tabular-nums",
                        c.overdue > 0 && "font-semibold text-destructive",
                      )}
                    >
                      {c.overdue}
                    </td>
                    <td className="px-2 text-right tabular-nums">{c.comments}</td>
                    <td className="px-2 text-right tabular-nums">{c.resources}</td>
                    <td className="px-2">
                      <div className="flex items-center gap-2">
                        <div
                          role="img"
                          aria-label={`${c.name} finished ${c.sharePercent}% of the team's completed tasks`}
                          className="h-2 w-20 overflow-hidden rounded-full bg-muted"
                        >
                          <div
                            className="h-full rounded-full bg-teal"
                            style={{ width: `${c.sharePercent}%` }}
                          />
                        </div>
                        <span className="tabular-nums text-muted-foreground">
                          {c.sharePercent}%
                        </span>
                      </div>
                    </td>
                    <td className="pl-2 text-right text-muted-foreground">
                      {c.lastActive ? timeAgo(c.lastActive) : "No activity"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Assigned, done, open and overdue count tasks assigned to the person. Shared counts notes,
          links and files.
        </p>
      </section>
    </div>
  );
}

function DeadlineRow({ t, who }: { t: Task; who: string }) {
  const due = dueState(t.due_date, t.status);
  return (
    <li
      className="flex items-start justify-between gap-3 rounded-xl border border-border p-3 text-sm"
      data-due={due.kind}
    >
      <div className="min-w-0">
        <p className="truncate font-medium">{t.title}</p>
        <p className="text-xs text-muted-foreground">
          {who} · {columnLabel(t.status)}
        </p>
      </div>
      <Badge variant={due.kind === "overdue" ? "destructive" : "secondary"} className="shrink-0">
        {due.label}
      </Badge>
    </li>
  );
}
