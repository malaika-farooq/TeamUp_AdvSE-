import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Activity,
  CalendarDays,
  Check,
  Copy,
  FolderOpen,
  ListChecks,
  Loader2,
  LogOut,
  Trash2,
  Users,
  X,
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
import { AppShell } from "@/components/app/AppShell";
import { TaskBoard } from "@/components/app/TaskBoard";
import { columnOf } from "@/lib/task-board";
import { SessionsPanel } from "@/components/app/SessionsPanel";
import { MeetingTimes } from "@/components/app/teams/MeetingTimes";
import { ResourcesPanel } from "@/components/app/ResourcesPanel";
import { CardSkeletons, EmptyState, ErrorState } from "@/components/app/states";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { UserAvatar } from "@/components/app/profile/UserAvatar";
import { InviteStudentSearch } from "@/components/app/teams/InviteStudents";
import { PermissionTable } from "@/components/app/teams/PermissionTable";
import { TeamSettings } from "@/components/app/teams/TeamSettings";
import { useAuth } from "@/lib/auth";
import {
  createInviteLink,
  decideJoinRequest,
  leaveTeam,
  removeMember,
  revokeInvitation,
  setMemberRole,
  teamJoinRequests,
  transferOwnership,
} from "@/lib/team-queries";
import { ROLE_LABEL, expiresText, inviteRolesFor, memberActions } from "@/lib/team-rules";
import {
  STATUSES,
  fetchActivity,
  fetchResources,
  fetchSessions,
  fetchTasks,
  fetchTeamMembers,
  type TeamRole,
} from "@/lib/queries";

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
  const [memberConfirm, setMemberConfirm] = useState<null | {
    kind: "remove" | "transfer";
    userId: string;
    name: string;
  }>(null);
  const [busy, setBusy] = useState<string | null>(null);

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
  // Managers see who is asking; for everyone else this simply stays empty.
  const requestsQuery = useQuery({
    queryKey: ["join-requests", teamId],
    queryFn: async () => {
      try {
        return await teamJoinRequests(teamId);
      } catch {
        return [];
      }
    },
  });
  const inviteeIds = (invitationsQuery.data ?? [])
    .map((i) => i.invitee_id)
    .filter((id): id is string => !!id);
  const inviteesQuery = useQuery({
    queryKey: ["invitees", teamId, inviteeIds.join(",")],
    enabled: inviteeIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", inviteeIds);
      return new Map((data ?? []).map((p) => [p.id, p.display_name]));
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

  function refreshPeople() {
    void queryClient.invalidateQueries({ queryKey: ["members", teamId] });
    void queryClient.invalidateQueries({ queryKey: ["join-requests", teamId] });
    void queryClient.invalidateQueries({ queryKey: ["invitations", teamId] });
    void queryClient.invalidateQueries({ queryKey: ["activity"] });
    void queryClient.invalidateQueries({ queryKey: ["teams"] });
    void queryClient.invalidateQueries({ queryKey: ["request-counts"] });
  }

  /** Runs one action, shows its result and refreshes the lists. */
  async function act(key: string, work: () => Promise<unknown>, success: string) {
    setBusy(key);
    try {
      await work();
      toast.success(success);
      refreshPeople();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function createInvite(role: TeamRole) {
    setBusy(`link-${role}`);
    try {
      const token = await createInviteLink(teamId, role);
      const link = `${window.location.origin}/invite/${token}`;
      await navigator.clipboard.writeText(link).catch(() => undefined);
      toast.success("Invitation link created and copied. It works once and expires in 7 days.");
      refreshPeople();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't create the link.");
    } finally {
      setBusy(null);
    }
  }

  const revokeInvite = (id: string) =>
    act(`revoke-${id}`, () => revokeInvitation(id), "Invitation cancelled");
  const decide = (requestId: string, approve: boolean) =>
    act(
      `req-${requestId}`,
      () => decideJoinRequest(requestId, approve),
      approve ? "Request approved. They're now a member." : "Request declined",
    );
  const changeRole = (userId: string, role: TeamRole) =>
    act(`role-${userId}`, () => setMemberRole(teamId, userId, role), "Role updated");

  async function leave() {
    setBusy("leave");
    try {
      const deleted = await leaveTeam(teamId);
      toast.success(
        deleted ? "You were the only member, so the team was deleted." : "You left the team",
      );
      void queryClient.invalidateQueries();
      navigate({ to: "/teams" });
    } catch (e) {
      setConfirm(null);
      toast.error(e instanceof Error ? e.message : "Couldn't leave the team.");
    } finally {
      setBusy(null);
    }
  }

  async function deleteTeam() {
    const { error } = await supabase.from("teams").delete().eq("id", teamId);
    if (error) return void toast.error(error.message);
    toast.success("Team deleted");
    void queryClient.invalidateQueries();
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
          <TabsTrigger value="meeting-times">Meeting times</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="members">
            Members
            {canManage && (requestsQuery.data ?? []).length > 0 && (
              <Badge
                className="ml-2"
                aria-label={`${(requestsQuery.data ?? []).length} join requests waiting`}
              >
                {(requestsQuery.data ?? []).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          {canManage && <TabsTrigger value="settings">Settings</TabsTrigger>}
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
            <div className="grid gap-3 sm:grid-cols-3">
              {STATUSES.map((s) => (
                <div key={s.key} className="rounded-xl border border-border p-3">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-semibold">
                    {tasks.filter((t) => columnOf(t.status) === s.key).length}
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

        <TabsContent value="meeting-times">
          <MeetingTimes teamId={team.id} teamName={team.name} />
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
            {members.map((m) => {
              const isSelf = m.user_id === user?.id;
              const actions = memberActions(myRole, m.role as TeamRole, isSelf);
              const name = m.profile?.display_name ?? "Teammate";
              return (
                <div key={m.user_id} className="flex flex-wrap items-center gap-3 p-4">
                  <UserAvatar name={name} path={m.profile?.avatar_url} className="size-10" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {name}
                      {isSelf && (
                        <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.profile?.university ?? "—"} · joined{" "}
                      {new Date(m.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                  {actions.changeRole ? (
                    <Select
                      value={m.role}
                      disabled={busy === `role-${m.user_id}`}
                      onValueChange={(v) => changeRole(m.user_id, v as TeamRole)}
                    >
                      <SelectTrigger className="w-[130px]" aria-label={`Role for ${name}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={m.role === "owner" ? "default" : "secondary"}>
                      {ROLE_LABEL[m.role as TeamRole]}
                    </Badge>
                  )}
                  {actions.transfer && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setMemberConfirm({ kind: "transfer", userId: m.user_id, name })
                      }
                    >
                      Make owner
                    </Button>
                  )}
                  {actions.remove && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMemberConfirm({ kind: "remove", userId: m.user_id, name })}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          <PermissionTable myRole={myRole} />

          {canManage && (
            <>
              <div className="surface-card space-y-3 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">
                    Join requests
                    {(requestsQuery.data ?? []).length > 0 && (
                      <Badge className="ml-2">{(requestsQuery.data ?? []).length}</Badge>
                    )}
                  </h3>
                  {team.visibility !== "public" && (
                    <span className="text-xs text-muted-foreground">
                      This team is private, so students can't request to join. Invite people
                      instead.
                    </span>
                  )}
                </div>
                {(requestsQuery.data ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending requests.</p>
                ) : (
                  <ul className="space-y-3">
                    {(requestsQuery.data ?? []).map((r) => (
                      <li
                        key={r.request_id}
                        className="space-y-2 rounded-xl border border-border p-3"
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <UserAvatar name={r.name} path={r.avatar} className="size-10" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{r.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {[r.major, r.university].filter(Boolean).join(" · ") || "Student"} ·
                              asked {new Date(r.requested_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              disabled={busy === `req-${r.request_id}`}
                              onClick={() => decide(r.request_id, true)}
                            >
                              {busy === `req-${r.request_id}` ? (
                                <Loader2 className="mr-1.5 size-4 animate-spin" />
                              ) : (
                                <Check className="mr-1.5 size-4" />
                              )}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busy === `req-${r.request_id}`}
                              onClick={() => decide(r.request_id, false)}
                            >
                              <X className="mr-1.5 size-4" />
                              Decline
                            </Button>
                          </div>
                        </div>
                        {r.message && <p className="text-sm">“{r.message}”</p>}
                        {r.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {r.skills.slice(0, 8).map((sk) => (
                              <Badge key={sk} variant="secondary" className="text-xs">
                                {sk}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {r.courses.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Courses: {r.courses.slice(0, 4).join(", ")}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="surface-card space-y-4 p-5">
                <h3 className="font-semibold">Invite students</h3>
                <InviteStudentSearch
                  teamId={teamId}
                  myRole={myRole}
                  memberIds={members.map((m) => m.user_id)}
                  onInvited={refreshPeople}
                />
              </div>

              <div className="surface-card space-y-3 p-5">
                <h3 className="font-semibold">Invitation links</h3>
                <p className="text-sm text-muted-foreground">
                  A link works for one person and expires after 7 days. TeamUp doesn't send email,
                  so share it yourself. You can cancel it any time.
                </p>
                <div className="flex flex-wrap gap-2">
                  {inviteRolesFor(myRole).map((r) => (
                    <Button
                      key={r}
                      variant={r === "member" ? "default" : "outline"}
                      disabled={busy === `link-${r}`}
                      onClick={() => createInvite(r)}
                    >
                      {busy === `link-${r}` && <Loader2 className="mr-2 size-4 animate-spin" />}
                      Create {r} link
                    </Button>
                  ))}
                </div>
                {(invitationsQuery.data ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No invitations yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {(invitationsQuery.data ?? []).slice(0, 25).map((inv) => (
                      <li
                        key={inv.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3 text-sm"
                      >
                        <span className="min-w-0 truncate">
                          {inv.invitee_id
                            ? `To ${inviteesQuery.data?.get(inv.invitee_id) ?? "a student"}`
                            : `Link ···${inv.token.slice(-6)}`}
                          {inv.status === "pending" && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              {expiresText(inv.expires_at)}
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{inv.role}</Badge>
                          <Badge variant={inv.status === "pending" ? "default" : "outline"}>
                            {inv.status}
                          </Badge>
                          {inv.status === "pending" && !inv.invitee_id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              aria-label="Copy invitation link"
                              onClick={() => {
                                void navigator.clipboard.writeText(
                                  `${window.location.origin}/invite/${inv.token}`,
                                );
                                toast.success("Link copied");
                              }}
                            >
                              <Copy className="size-4" />
                            </Button>
                          )}
                          {inv.status === "pending" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={busy === `revoke-${inv.id}`}
                              onClick={() => revokeInvite(inv.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </TabsContent>

        {canManage && (
          <TabsContent value="settings">
            <TeamSettings key={team.updated_at} team={team} myRole={myRole} />
          </TabsContent>
        )}

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
                  <p className="flex items-center gap-2">
                    <UserAvatar
                      name={
                        members.find((m) => m.user_id === a.actor_id)?.profile?.display_name ??
                        "Someone"
                      }
                      path={members.find((m) => m.user_id === a.actor_id)?.profile?.avatar_url}
                      className="size-6"
                      fallbackClassName="text-[10px]"
                    />
                    <span>
                      {members.find((m) => m.user_id === a.actor_id)?.profile?.display_name ??
                        "Someone"}{" "}
                      {a.summary}
                    </span>
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
                : isOwner && members.length > 1
                  ? "You own this team. Make another member the owner first (Members tab → Make owner), then you can leave."
                  : isOwner
                    ? "You're the only member, so leaving will delete the team and everything in it."
                    : "You'll lose access to this team's tasks, files and sessions. Tasks assigned to you become unassigned."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={confirm === "leave" && isOwner && members.length > 1}
              onClick={confirm === "delete" ? deleteTeam : leave}
            >
              {confirm === "delete"
                ? "Delete team"
                : isOwner && members.length === 1
                  ? "Leave and delete"
                  : "Leave team"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!memberConfirm} onOpenChange={(v) => !v && setMemberConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {memberConfirm?.kind === "transfer"
                ? `Make ${memberConfirm.name} the owner?`
                : `Remove ${memberConfirm?.name ?? "this person"}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {memberConfirm?.kind === "transfer"
                ? "They become the only owner and you become an admin. Only the new owner can undo this."
                : "They lose access to this team and their tasks become unassigned. They can ask to join again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const c = memberConfirm;
                setMemberConfirm(null);
                if (!c) return;
                if (c.kind === "transfer") {
                  void act(
                    `own-${c.userId}`,
                    () => transferOwnership(teamId, c.userId),
                    `${c.name} is now the owner`,
                  );
                } else {
                  void act(
                    `rm-${c.userId}`,
                    () => removeMember(teamId, c.userId),
                    `${c.name} was removed`,
                  );
                }
              }}
            >
              {memberConfirm?.kind === "transfer" ? "Transfer ownership" : "Remove"}
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
