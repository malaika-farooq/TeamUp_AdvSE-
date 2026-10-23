import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "motion/react";
import {
  AlarmClock,
  CalendarPlus,
  FolderPlus,
  ListPlus,
  Sparkles,
  Users,
  UserPlus,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/frontend/components/layout/AppShell";
import { CardSkeletons, EmptyState, ErrorState } from "@/frontend/components/shared/states";
import { Button } from "@/frontend/components/ui/button";
import { Badge } from "@/frontend/components/ui/badge";
import { Progress } from "@/frontend/components/ui/progress";
import { useAuth } from "@/frontend/features/auth/providers/AuthProvider";
import { fetchActivity } from "@/frontend/features/activity/api/queries";
import { fetchMyTeams } from "@/frontend/features/teams/api/queries";
import { fetchNotifications } from "@/frontend/features/notifications/api/queries";
import { fetchSessions } from "@/frontend/features/sessions/api/queries";
import { fetchTasks } from "@/frontend/features/tasks/api/queries";
import { accentClasses } from "@/frontend/features/teams/presentation";
import { fadeUp, stagger } from "@/lib/motion";
import { createSampleWorkspace } from "@/backend/api/settings/sample.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — TeamUp" },
      { name: "description", content: "Your tasks, sessions, teams and progress at a glance." },
      { property: "og:title", content: "Dashboard — TeamUp" },
      {
        property: "og:description",
        content: "Tasks due soon, upcoming sessions and team activity.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const makeSample = useServerFn(createSampleWorkspace);

  const teamsQuery = useQuery({ queryKey: ["teams"], queryFn: fetchMyTeams, enabled: !!user });
  const teamIds = (teamsQuery.data ?? []).map((t) => t.id);

  const tasksQuery = useQuery({
    queryKey: ["tasks", teamIds],
    queryFn: () => fetchTasks(teamIds),
    enabled: teamsQuery.isSuccess,
  });
  const sessionsQuery = useQuery({
    queryKey: ["sessions", teamIds],
    queryFn: () => fetchSessions(teamIds),
    enabled: teamsQuery.isSuccess,
  });
  const activityQuery = useQuery({
    queryKey: ["activity", teamIds],
    queryFn: () => fetchActivity(teamIds, 8),
    enabled: teamsQuery.isSuccess,
  });
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: !!user,
  });

  const teams = teamsQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];
  const now = Date.now();
  const myTasks = tasks.filter((t) => t.assignee_id === user?.id || t.created_by === user?.id);
  const overdue = myTasks.filter(
    (t) => t.status !== "done" && t.due_date && new Date(t.due_date).getTime() < now,
  );
  const dueSoon = myTasks.filter(
    (t) =>
      t.status !== "done" &&
      t.due_date &&
      new Date(t.due_date).getTime() >= now &&
      new Date(t.due_date).getTime() < now + 7 * 864e5,
  );
  const done = tasks.filter((t) => t.status === "done").length;
  const completion = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const upcoming = (sessionsQuery.data ?? []).filter(
    (s) => new Date(s.starts_at).getTime() > now - 3600e3,
  );
  const unread = (notificationsQuery.data ?? []).filter((n) => !n.read_at);

  async function handleSample() {
    try {
      const res = await makeSample({ data: undefined });
      toast.success(res.created ? "Sample workspace created" : "Sample workspace already exists");
      queryClient.invalidateQueries();
      navigate({ to: "/teams/$teamId", params: { teamId: res.teamId } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create sample workspace");
    }
  }

  if (teamsQuery.isError) {
    return (
      <AppShell title="Dashboard">
        <ErrorState
          message={(teamsQuery.error as Error).message}
          onRetry={() => teamsQuery.refetch()}
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Dashboard"
      description="Everything your study groups need this week."
      actions={
        <>
          <Button asChild variant="outline">
            <Link to="/discover">
              <UserPlus className="mr-1.5 size-4" />
              Join Team
            </Link>
          </Button>
          <Button asChild>
            <Link to="/teams" search={{ create: true }}>
              <Users className="mr-1.5 size-4" />
              Create Team
            </Link>
          </Button>
        </>
      }
    >
      {teamsQuery.isLoading ? (
        <CardSkeletons count={4} />
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
          <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Due in 7 days"
              value={dueSoon.length}
              tone="text-primary"
              icon={AlarmClock}
            />
            <StatCard
              label="Overdue"
              value={overdue.length}
              tone="text-destructive"
              icon={AlarmClock}
            />
            <StatCard label="Active teams" value={teams.length} tone="text-teal" icon={Users} />
            <StatCard
              label="Needs attention"
              value={unread.length}
              tone="text-lavender"
              icon={Activity}
            />
          </motion.div>

          <motion.div variants={fadeUp} className="surface-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Overall completion</p>
                <p className="text-xs text-muted-foreground">
                  {done} of {tasks.length} tasks across your teams
                </p>
              </div>
              <span className="text-2xl font-bold">{completion}%</span>
            </div>
            <Progress value={completion} className="mt-4" />
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
            <QuickAction
              to="/tasks"
              search={{ create: true }}
              icon={ListPlus}
              label="Create Task"
            />
            <QuickAction
              to="/calendar"
              search={{ create: true }}
              icon={CalendarPlus}
              label="Schedule Session"
            />
            <QuickAction
              to="/resources"
              search={{ create: true }}
              icon={FolderPlus}
              label="Add Resource"
            />
            <QuickAction to="/assistant" icon={Sparkles} label="Ask the AI assistant" />
          </motion.div>

          {teams.length === 0 ? (
            <motion.div variants={fadeUp}>
              <EmptyState
                icon={Users}
                title="No teams yet"
                description="Create your first study team, join a public one, or load a sample workspace to see how TeamUp works."
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button asChild>
                      <Link to="/teams" search={{ create: true }}>
                        Create a team
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={handleSample}>
                      Create Sample Workspace
                    </Button>
                  </div>
                }
              />
            </motion.div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <motion.section variants={fadeUp} className="surface-card p-5">
                <h2 className="text-sm font-semibold">Tasks needing you</h2>
                <ul className="mt-3 space-y-2">
                  {[...overdue, ...dueSoon].slice(0, 6).map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm"
                    >
                      <span className="truncate">{t.title}</span>
                      <Badge
                        variant={
                          t.due_date && new Date(t.due_date).getTime() < now
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {t.due_date ? new Date(t.due_date).toLocaleDateString() : "No date"}
                      </Badge>
                    </li>
                  ))}
                  {overdue.length + dueSoon.length === 0 && (
                    <li className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="size-4 text-success" /> Nothing due in the next week.
                    </li>
                  )}
                </ul>
              </motion.section>

              <motion.section variants={fadeUp} className="surface-card p-5">
                <h2 className="text-sm font-semibold">Upcoming sessions</h2>
                <ul className="mt-3 space-y-2">
                  {upcoming.slice(0, 5).map((s) => (
                    <li key={s.id} className="rounded-lg border border-border p-3 text-sm">
                      <p className="font-medium">{s.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(s.starts_at).toLocaleString()} · {s.location ?? "Online"}
                      </p>
                    </li>
                  ))}
                  {upcoming.length === 0 && (
                    <li className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                      No sessions scheduled yet.
                    </li>
                  )}
                </ul>
              </motion.section>

              <motion.section variants={fadeUp} className="surface-card p-5">
                <h2 className="text-sm font-semibold">Your teams</h2>
                <ul className="mt-3 space-y-2">
                  {teams.map((t) => (
                    <li key={t.id}>
                      <Link
                        to="/teams/$teamId"
                        params={{ teamId: t.id }}
                        className="hover-lift flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                      >
                        <span className="truncate font-medium">{t.name}</span>
                        <Badge className={accentClasses(t.accent)} variant="outline">
                          {t.role}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.section>

              <motion.section variants={fadeUp} className="surface-card p-5">
                <h2 className="text-sm font-semibold">Recent team activity</h2>
                <ul className="mt-3 space-y-2">
                  {(activityQuery.data ?? []).map((a) => (
                    <li key={a.id} className="rounded-lg border border-border p-3 text-sm">
                      <p>{a.summary}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(a.created_at).toLocaleString()}
                      </p>
                    </li>
                  ))}
                  {(activityQuery.data ?? []).length === 0 && (
                    <li className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                      Activity will appear here as your team works.
                    </li>
                  )}
                </ul>
              </motion.section>
            </div>
          )}
        </motion.div>
      )}
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: string;
  icon: React.ElementType;
}) {
  return (
    <div className="surface-card hover-lift p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <Icon className={`size-4 ${tone}`} />
      </div>
      <p className={`mt-2 text-3xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}

function QuickAction({
  to,
  search,
  icon: Icon,
  label,
}: {
  to: string;
  search?: Record<string, unknown>;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <Button asChild variant="outline" size="sm" className="hover-lift">
      <Link to={to} search={search as never}>
        <Icon className="mr-1.5 size-4" />
        {label}
      </Link>
    </Button>
  );
}
