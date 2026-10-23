import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Activity,
  CalendarDays,
  Copy,
  FolderOpen,
  ListChecks,
  LogOut,
  Trash2,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/frontend/components/layout/AppShell";
import { TaskBoard } from "@/frontend/features/tasks/components/TaskBoard";
import { SessionsPanel } from "@/frontend/features/sessions/components/SessionsPanel";
import { ResourcesPanel } from "@/frontend/features/resources/components/ResourcesPanel";
import { CardSkeletons, EmptyState, ErrorState } from "@/frontend/components/shared/states";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/frontend/components/ui/tabs";
import { Button } from "@/frontend/components/ui/button";
import { Badge } from "@/frontend/components/ui/badge";
import { Progress } from "@/frontend/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/frontend/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/frontend/features/auth/providers/AuthProvider";
import { STATUSES } from "@/frontend/features/tasks/constants";
import { fetchActivity, logActivity } from "@/frontend/features/activity/api/queries";
import { fetchResources } from "@/frontend/features/resources/api/queries";
import { fetchSessions } from "@/frontend/features/sessions/api/queries";
import { fetchTasks } from "@/frontend/features/tasks/api/queries";
import { fetchTeamMembers } from "@/frontend/features/teams/api/queries";
import { notify } from "@/frontend/features/notifications/api/queries";
import { type TeamRole } from "@/types/domain";

export const Route = createFileRoute("/_authenticated/teams/$teamId")({
  head: () => ({
    meta: [
      { title: "Team workspace — TeamUp" },
      { name: "description", content: "Tasks, sessions, resources and members for your team." },
      { property: "og:title", content: "Team workspace — TeamUp" },
      {
        property: "og:description",
        content: "Tasks, sessions, resources and members for your team.",
      },
    ],
  }),
  component: TeamWorkspace,
});

function TeamWorkspace() {
  const { teamId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [confirm, setConfirm] = useState<null | "leave" | "delete">(null);

  const teamQuery = useQuery({
    queryKey: ["team", teamId],
    queryFn: async () => {
      const { data, error } = await supabase.from("teams").select("*").eq("id", teamId).single();
      if (error) throw new Error(error.message);
      return data;
    },
  });
  const membersQuery = useQuery({
    queryKey: ["members", teamId],
    queryFn: () => fetchTeamMembers(teamId),
  });
  const tasksQuery = useQuery({
    queryKey: ["tasks", [teamId]],
    queryFn: () => fetchTasks([teamId]),
  });
  const sessionsQuery = useQuery({
    queryKey: ["sessions", [teamId]],
    queryFn: () => fetchSessions([teamId]),
  });
  const resourcesQuery = useQuery({
    queryKey: ["resources", [teamId]],
    queryFn: () => fetchResources([teamId]),
  });
  const activityQuery = useQuery({
    queryKey: ["activity", [teamId]],
    queryFn: () => fetchActivity([teamId], 50),
  });
  const invitationsQuery = useQuery({
    queryKey: ["invitations", teamId],
    queryFn: async () => {
      const { data } = await supabase
        .from("invitations")
        .select("*")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const requestsQuery = useQuery({
    queryKey: ["join-requests", teamId],
    queryFn: async () => {
      const { data } = await supabase
        .from("join_requests")
        .select("*")
        .eq("team_id", teamId)
        .eq("status", "pending");
      return data ?? [];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel(`team-${teamId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () =>
        queryClient.invalidateQueries({ queryKey: ["tasks"] }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_logs" }, () =>
        queryClient.invalidateQueries({ queryKey: ["activity"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId, queryClient]);

  const members = membersQuery.data ?? [];
  const myRole = (members.find((m) => m.user_id === user?.id)?.role ?? "member") as TeamRole;
  const canManage = myRole === "owner" || myRole === "admin";
  const isOwner = myRole === "owner";
  const owners = members.filter((m) => m.role === "owner");
  const tasks = tasksQuery.data ?? [];
  const done = tasks.filter((t) => t.status === "done").length;
  const completion = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const workload = useMemo(
    () =>
      members.map((m) => ({
        name: (m.profile?.display_name ?? "Teammate").split(" ")[0],
        open: tasks.filter((t) => t.assignee_id === m.user_id && t.status !== "done").length,
        done: tasks.filter((t) => t.assignee_id === m.user_id && t.status === "done").length,
      })),
    [members, tasks],
  );

  async function createInvite(role: TeamRole) {
    if (!user) return;
    const token = crypto.randomUUID().replace(/-/g, "");
    const { error } = await supabase.from("invitations").insert({
      team_id: teamId,
      token,
      role,
      created_by: user.id,
      expires_at: new Date(Date.now() + 7 * 864e5).toISOString(),
    });
    if (error) return void toast.error(error.message);
    const link = `${window.location.origin}/invite/${token}`;
    await navigator.clipboard.writeText(link).catch(() => undefined);
    toast.success("Invitation link created and copied. It expires in 7 days.");
    invitationsQuery.refetch();
  }

  async function revokeInvite(id: string) {
    const { error } = await supabase.from("invitations").update({ status: "revoked" }).eq("id", id);
    if (error) return void toast.error(error.message);
    toast.success("Invitation revoked");
    invitationsQuery.refetch();
  }

  async function decide(requestId: string, approve: boolean) {
    const { error } = await supabase.rpc("decide_join_request", {
      _request: requestId,
      _approve: approve,
    });
    if (error) return void toast.error(error.message);
    toast.success(approve ? "Request approved" : "Request declined");
    requestsQuery.refetch();
    membersQuery.refetch();
  }

  async function changeRole(userId: string, role: TeamRole) {
    const { error } = await supabase
      .from("team_members")
      .update({ role })
      .eq("team_id", teamId)
      .eq("user_id", userId);
    if (error) return void toast.error(error.message);
    if (role === "owner" && user) {
      await supabase
        .from("team_members")
        .update({ role: "admin" })
        .eq("team_id", teamId)
        .eq("user_id", user.id);
      await notify(
        userId,
        "team_update",
        "You are now a team owner",
        teamQuery.data?.name ?? "",
        `/teams`,
      );
    }
    toast.success("Role updated");
    membersQuery.refetch();
  }

  async function removeMember(userId: string) {
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", teamId)
      .eq("user_id", userId);
    if (error) return void toast.error(error.message);
    if (user) await logActivity(teamId, user.id, "member_removed", "removed a member");
    toast.success("Member removed");
    membersQuery.refetch();
  }

  async function leave() {
    if (!user) return;
    if (isOwner && owners.length === 1 && members.length > 1) {
      setConfirm(null);
      return void toast.error("Transfer ownership to another member before leaving this team.");
    }
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", teamId)
      .eq("user_id", user.id);
    if (error) return void toast.error(error.message);
    toast.success("You left the team");
    navigate({ to: "/teams" });
  }

  async function deleteTeam() {
    const { error } = await supabase.from("teams").delete().eq("id", teamId);
    if (error) return void toast.error(error.message);
    toast.success("Team deleted");
    navigate({ to: "/teams" });
  }

  if (teamQuery.isLoading) {
    return (
      <AppShell title="Team workspace">
        <CardSkeletons count={3} />
      </AppShell>
    );
  }
  if (teamQuery.error || !teamQuery.data) {
    return (
      <AppShell title="Team workspace">
        <ErrorState message="You don't have access to this team, or it no longer exists." />
      </AppShell>
    );
  }

  const team = teamQuery.data;

  return (
    <AppShell
      title={team.name}
      description={team.description ?? "Your shared workspace."}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setConfirm("leave")}>
            <LogOut className="mr-1.5 size-4" />
            Leave
          </Button>
          {isOwner && (
            <Button variant="destructive" onClick={() => setConfirm("delete")}>
              <Trash2 className="mr-1.5 size-4" />
              Delete
            </Button>
          )}
        </div>
      }
    >
      <Tabs defaultValue="overview" className="space-y-5">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Task Board</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Tasks" value={String(tasks.length)} icon={ListChecks} />
            <StatCard label="Completed" value={`${completion}%`} icon={Activity} />
            <StatCard label="Members" value={String(members.length)} icon={Users} />
            <StatCard
              label="Sessions"
              value={String((sessionsQuery.data ?? []).length)}
              icon={CalendarDays}
            />
          </div>

          <div className="surface-card space-y-3 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Project progress</h3>
              <span className="text-sm text-muted-foreground">
                {done} of {tasks.length} done
              </span>
            </div>
            <Progress value={completion} className="h-2.5" />
            <div className="grid gap-3 sm:grid-cols-4">
              {STATUSES.map((s) => (
                <div key={s.key} className="rounded-xl border border-border p-3">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-semibold">
                    {tasks.filter((t) => t.status === s.key).length}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <h3 className="mb-3 font-semibold">Workload by member</h3>
            {workload.length === 0 ? (
              <p className="text-sm text-muted-foreground">No members yet.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workload}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis allowDecimals={false} fontSize={12} />
                    <ReTooltip />
                    <Bar dataKey="open" fill="var(--color-blue)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="done" fill="var(--color-teal)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {team.project_goal && (
            <div className="surface-card p-5">
              <h3 className="font-semibold">Project goal</h3>
              <p className="mt-1 text-sm text-muted-foreground">{team.project_goal}</p>
              {team.deadline && (
                <Badge className="mt-3" variant="secondary">
                  Deadline {new Date(team.deadline).toLocaleDateString()}
                </Badge>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks">
          <TaskBoard
            tasks={tasks}
            teams={[team]}
            defaultTeamId={teamId}
            createOpen={createTaskOpen}
            onCreateOpenChange={setCreateTaskOpen}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <SessionsPanel
            sessions={sessionsQuery.data ?? []}
            tasks={tasks}
            teams={[team]}
            defaultTeamId={teamId}
          />
        </TabsContent>

        <TabsContent value="resources">
          <ResourcesPanel
            resources={resourcesQuery.data ?? []}
            teams={[team]}
            defaultTeamId={teamId}
          />
        </TabsContent>

        <TabsContent value="members" className="space-y-5">
          <div className="surface-card divide-y divide-border">
            {members.map((m) => (
              <div key={m.user_id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{m.profile?.display_name ?? "Teammate"}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.profile?.university ?? "—"} · joined{" "}
                    {new Date(m.joined_at).toLocaleDateString()}
                  </p>
                </div>
                {canManage && m.user_id !== user?.id ? (
                  <Select
                    value={m.role}
                    onValueChange={(v) => changeRole(m.user_id, v as TeamRole)}
                  >
                    <SelectTrigger className="w-[150px]" aria-label="Role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      {isOwner && <SelectItem value="owner">Transfer ownership</SelectItem>}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="secondary">{m.role}</Badge>
                )}
                {canManage && m.user_id !== user?.id && m.role !== "owner" && (
                  <Button variant="ghost" size="sm" onClick={() => removeMember(m.user_id)}>
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>

          {canManage && (
            <>
              <div className="surface-card space-y-3 p-5">
                <h3 className="font-semibold">Invitation links</h3>
                <p className="text-sm text-muted-foreground">
                  Links expire after 7 days and can be revoked at any time. Share them yourself —
                  TeamUp does not send email.
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => createInvite("member")}>Create member link</Button>
                  <Button variant="outline" onClick={() => createInvite("admin")}>
                    Create admin link
                  </Button>
                </div>
                <ul className="space-y-2">
                  {(invitationsQuery.data ?? []).map((inv) => (
                    <li
                      key={inv.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3 text-sm"
                    >
                      <span className="truncate font-mono text-xs">
                        /invite/{inv.token.slice(0, 12)}…
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{inv.role}</Badge>
                        <Badge variant={inv.status === "pending" ? "default" : "outline"}>
                          {inv.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${window.location.origin}/invite/${inv.token}`,
                            );
                            toast.success("Link copied");
                          }}
                        >
                          <Copy className="size-4" />
                        </Button>
                        {inv.status === "pending" && (
                          <Button size="sm" variant="ghost" onClick={() => revokeInvite(inv.id)}>
                            Revoke
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="surface-card space-y-3 p-5">
                <h3 className="font-semibold">Join requests</h3>
                {(requestsQuery.data ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending requests.</p>
                ) : (
                  <ul className="space-y-2">
                    {(requestsQuery.data ?? []).map((r) => (
                      <li
                        key={r.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-border p-3 text-sm"
                      >
                        <span>{r.message || "Wants to join this team"}</span>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => decide(r.id, true)}>
                            Approve
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => decide(r.id, false)}>
                            Decline
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="activity">
          {(activityQuery.data ?? []).length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="No activity yet"
              description="Actions like task updates and new resources appear here."
            />
          ) : (
            <ol className="surface-card divide-y divide-border">
              {(activityQuery.data ?? []).map((a, i) => (
                <motion.li
                  key={a.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18, delay: i * 0.02 }}
                  className="p-4 text-sm"
                >
                  <p>
                    {members.find((m) => m.user_id === a.actor_id)?.profile?.display_name ??
                      "Someone"}{" "}
                    {a.summary}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleString()}
                  </p>
                </motion.li>
              ))}
            </ol>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!confirm} onOpenChange={(v) => !v && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "delete" ? "Delete this team?" : "Leave this team?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "delete"
                ? "All tasks, sessions, resources and files for this team will be permanently removed."
                : "You'll lose access to this team's tasks, files and sessions."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirm === "delete" ? deleteTeam : leave}>
              {confirm === "delete" ? "Delete team" : "Leave team"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="surface-card hover-lift flex items-center gap-3 p-5"
    >
      <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </motion.div>
  );
}
