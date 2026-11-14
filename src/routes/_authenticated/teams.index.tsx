import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { z } from "zod";
import { toast } from "sonner";
import { Check, Loader2, Plus, Users, X } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { CardSkeletons, EmptyState, ErrorState } from "@/components/app/states";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ACCENTS, accentClasses, fetchMyTeams } from "@/lib/queries";
import { fadeUp, stagger } from "@/lib/motion";
import { UserAvatar } from "@/components/app/profile/UserAvatar";
import { parseCourse } from "@/lib/profile-data";
import {
  acceptInvitation,
  declineInvitation,
  ensureCourse,
  myInvitations,
  requestCounts,
  type TeamInvitation,
} from "@/lib/team-queries";
import { ROLE_LABEL, canManage, expiresText, type Role } from "@/lib/team-rules";

export const Route = createFileRoute("/_authenticated/teams/")({
  validateSearch: z.object({ create: z.boolean().optional() }),
  head: () => ({
    meta: [
      { title: "My Teams — TeamUp" },
      { name: "description", content: "All the study teams and project groups you belong to." },
      { property: "og:title", content: "My Teams — TeamUp" },
      { property: "og:description", content: "Manage your study teams and project groups." },
    ],
  }),
  component: TeamsPage,
});

function TeamsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(!!search.create);
  const teamsQuery = useQuery({ queryKey: ["teams"], queryFn: fetchMyTeams });
  const invitesQuery = useQuery({ queryKey: ["my-invitations"], queryFn: myInvitations });
  const countsQuery = useQuery({
    queryKey: ["request-counts"],
    queryFn: async () => {
      try {
        return await requestCounts();
      } catch {
        return {} as Record<string, number>;
      }
    },
  });

  useEffect(() => {
    if (search.create) setOpen(true);
  }, [search.create]);

  function closeDialog(next: boolean) {
    setOpen(next);
    if (!next && search.create) navigate({ to: "/teams", search: {}, replace: true });
  }

  const teams = teamsQuery.data ?? [];

  return (
    <AppShell
      title="My Teams"
      description="Study groups, labs and project teams you are part of."
      actions={
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-1.5 size-4" />
          Create Team
        </Button>
      }
    >
      <InvitationsPanel invitations={invitesQuery.data ?? []} />

      {teamsQuery.isLoading ? (
        <CardSkeletons />
      ) : teamsQuery.isError ? (
        <ErrorState
          message={(teamsQuery.error as Error).message}
          onRetry={() => teamsQuery.refetch()}
        />
      ) : teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="You're not in a team yet"
          description="Create a team for your next group project, or browse public teams looking for members."
          action={
            <div className="flex gap-2">
              <Button onClick={() => setOpen(true)}>Create a team</Button>
              <Button asChild variant="outline">
                <Link to="/discover">Discover teams</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {teams.map((t) => (
            <motion.div key={t.id} variants={fadeUp}>
              <Link
                to="/teams/$teamId"
                params={{ teamId: t.id }}
                className="surface-card hover-lift block h-full p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{t.name}</h3>
                  <Badge variant="outline" className={accentClasses(t.accent)}>
                    {t.role}
                  </Badge>
                </div>
                {canManage(t.role as Role) && (countsQuery.data?.[t.id] ?? 0) > 0 && (
                  <Badge className="mt-2">
                    {countsQuery.data?.[t.id]} join request
                    {countsQuery.data?.[t.id] === 1 ? "" : "s"} waiting
                  </Badge>
                )}
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {t.description || "No description yet."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">{t.visibility}</Badge>
                  {t.deadline && <Badge variant="secondary">Due {t.deadline}</Badge>}
                  {t.is_sample && <Badge variant="secondary">Sample</Badge>}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      <CreateTeamDialog open={open} onOpenChange={closeDialog} />
    </AppShell>
  );
}

export function CreateTeamDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    course: "",
    goal: "",
    deadline: "",
    visibility: "private",
    accent: "teal",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.name.trim().length < 2) {
      toast.error("Give your team a name with at least 2 characters.");
      return;
    }
    setBusy(true);
    try {
      // Same careful parsing as profiles: "CS201 Data Structures" -> code + title, matched ignoring case.
      const course = parseCourse(form.course);
      const courseId = course ? await ensureCourse(course.code, course.title) : null;

      const { data, error } = await supabase.rpc("create_team", {
        _name: form.name.trim(),
        _description: form.description || null,
        _course_id: courseId,
        _project_goal: form.goal || null,
        _deadline: form.deadline || null,
        _visibility: form.visibility as "public" | "private",
        _accent: form.accent,
      } as never);
      if (error) throw error;
      toast.success("Team created");
      queryClient.invalidateQueries();
      onOpenChange(false);
      navigate({ to: "/teams/$teamId", params: { teamId: data as string } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create the team");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a team</DialogTitle>
          <DialogDescription>
            Public teams appear in Discover so classmates can request to join.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tn">Team name</Label>
            <Input
              id="tn"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="td">Description</Label>
            <Textarea
              id="td"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tc">Course</Label>
              <Input
                id="tc"
                placeholder="CS201 Data Structures"
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tdl">Deadline (optional)</Label>
              <Input
                id="tdl"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tg">Project goal</Label>
            <Textarea
              id="tg"
              rows={2}
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Visibility</Label>
              <Select
                value={form.visibility}
                onValueChange={(v) => setForm({ ...form, visibility: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private — invite only</SelectItem>
                  <SelectItem value="public">Public — listed in Discover</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Accent colour</Label>
              <Select value={form.accent} onValueChange={(v) => setForm({ ...form, accent: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCENTS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="mr-2 size-4 animate-spin" />}Create team
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InvitationsPanel({ invitations }: { invitations: TeamInvitation[] }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);

  if (invitations.length === 0) return null;

  async function answer(inv: TeamInvitation, accept: boolean) {
    setBusy(inv.id);
    try {
      if (accept) {
        const teamId = await acceptInvitation(inv.token);
        toast.success(`You joined ${inv.team_name}.`);
        await queryClient.invalidateQueries();
        navigate({ to: "/teams/$teamId", params: { teamId } });
      } else {
        await declineInvitation(inv.token);
        toast.success("Invitation declined.");
        await queryClient.invalidateQueries({ queryKey: ["my-invitations"] });
        await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't answer the invitation.");
      void queryClient.invalidateQueries({ queryKey: ["my-invitations"] });
    } finally {
      setBusy(null);
    }
  }

  return (
    <section aria-label="Team invitations" className="mb-6 space-y-3">
      <h2 className="text-sm font-semibold">
        Invitations for you <Badge className="ml-1">{invitations.length}</Badge>
      </h2>
      <ul className="grid gap-3 md:grid-cols-2">
        {invitations.map((inv) => (
          <li key={inv.id} className="surface-card space-y-3 p-4">
            <div className="flex items-center gap-3">
              <UserAvatar name={inv.inviter_name} path={inv.inviter_avatar} className="size-10" />
              <div className="min-w-0">
                <p className="truncate font-semibold">{inv.team_name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {inv.inviter_name ?? "A teammate"} invited you as{" "}
                  {ROLE_LABEL[inv.role as Role].toLowerCase()} · {expiresText(inv.expires_at)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" disabled={busy === inv.id} onClick={() => answer(inv, true)}>
                {busy === inv.id ? (
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                ) : (
                  <Check className="mr-1.5 size-4" />
                )}
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy === inv.id}
                onClick={() => answer(inv, false)}
              >
                <X className="mr-1.5 size-4" />
                Decline
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
