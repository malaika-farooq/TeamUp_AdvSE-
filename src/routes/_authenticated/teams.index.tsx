import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Users } from "lucide-react";
import { AppShell } from "@/frontend/components/layout/AppShell";
import { CardSkeletons, EmptyState, ErrorState } from "@/frontend/components/shared/states";
import { Button } from "@/frontend/components/ui/button";
import { Badge } from "@/frontend/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ACCENTS, accentClasses } from "@/frontend/features/teams/presentation";
import { fetchMyTeams } from "@/frontend/features/teams/api/queries";
import { fadeUp, stagger } from "@/lib/motion";

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
      let courseId: string | null = null;
      if (form.course.trim()) {
        const parts = form.course.trim().split(" ");
        const code = parts[0] ?? form.course.trim();
        const title = parts.slice(1).join(" ") || form.course.trim();
        const existing = await supabase
          .from("courses")
          .select("id")
          .eq("code", code)
          .eq("title", title)
          .maybeSingle();
        courseId =
          existing.data?.id ??
          (await supabase.from("courses").insert({ code, title }).select("id").single()).data?.id ??
          null;
      }

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
