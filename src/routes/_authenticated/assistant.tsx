import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Loader2, Sparkles, UserPlus, Wand2 } from "lucide-react";
import { AppShell } from "@/frontend/components/layout/AppShell";
import { EmptyState, ErrorState } from "@/frontend/components/shared/states";
import { Button } from "@/frontend/components/ui/button";
import { Badge } from "@/frontend/components/ui/badge";
import { Input } from "@/frontend/components/ui/input";
import { Checkbox } from "@/frontend/components/ui/checkbox";
import { Textarea } from "@/frontend/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/frontend/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/frontend/features/auth/providers/AuthProvider";
import { fetchMyTeams } from "@/frontend/features/teams/api/queries";
import { logActivity } from "@/frontend/features/activity/api/queries";
import { type TaskPriority } from "@/types/domain";
import { draftTaskPlan, suggestTeammates, summarizeTeam } from "@/backend/ai/ai.functions";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — TeamUp" },
      {
        name: "description",
        content: "Draft a task plan, summarize progress and find teammates with AI.",
      },
      { property: "og:title", content: "AI Assistant — TeamUp" },
      {
        property: "og:description",
        content: "Draft a task plan, summarize progress and find teammates with AI.",
      },
    ],
  }),
  component: AssistantPage,
});

type Draft = {
  title: string;
  description: string;
  priority: string;
  dueOffsetDays: number;
  selected: boolean;
};

function AssistantPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const teamsQuery = useQuery({ queryKey: ["teams"], queryFn: fetchMyTeams });
  const teams = teamsQuery.data ?? [];
  const [teamId, setTeamId] = useState<string>("");
  const activeTeam = teamId || teams[0]?.id || "";

  const plan = useServerFn(draftTaskPlan);
  const summarize = useServerFn(summarizeTeam);
  const suggest = useServerFn(suggestTeammates);

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [summary, setSummary] = useState("");
  const [people, setPeople] = useState<{ name: string; reason: string }[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(kind: "plan" | "summary" | "people") {
    if (!activeTeam) return;
    setBusy(kind);
    setError(null);
    try {
      if (kind === "plan") {
        const res = await plan({ data: { teamId: activeTeam } });
        setDrafts(
          res.suggestions.map((s) => ({
            title: s.title,
            description: s.description ?? "",
            priority: s.priority ?? "medium",
            dueOffsetDays: Number(s.dueOffsetDays ?? 7),
            selected: true,
          })),
        );
      } else if (kind === "summary") {
        const res = await summarize({ data: { teamId: activeTeam } });
        setSummary(res.summary);
      } else {
        const res = await suggest({ data: { teamId: activeTeam } });
        setPeople(res.suggestions);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "The assistant is unavailable right now.");
    } finally {
      setBusy(null);
    }
  }

  async function saveDrafts() {
    if (!user) return;
    const chosen = drafts.filter((d) => d.selected);
    if (!chosen.length) return void toast.error("Select at least one task to save.");
    const { error: err } = await supabase.from("tasks").insert(
      chosen.map((d, i) => ({
        team_id: activeTeam,
        title: d.title,
        description: d.description,
        priority: (["low", "medium", "high", "urgent"].includes(d.priority)
          ? d.priority
          : "medium") as TaskPriority,
        status: "todo" as const,
        due_date: new Date(Date.now() + d.dueOffsetDays * 864e5).toISOString(),
        created_by: user.id,
        position: (Date.now() % 100000) + i,
      })),
    );
    if (err) return void toast.error(err.message);
    await logActivity(activeTeam, user.id, "task_created", `added ${chosen.length} planned tasks`);
    toast.success(`${chosen.length} tasks added to the board`);
    setDrafts([]);
    queryClient.invalidateQueries();
  }

  async function saveSummary() {
    if (!user || !summary) return;
    const { error: err } = await supabase.from("resources").insert({
      team_id: activeTeam,
      kind: "note" as const,
      title: `Progress summary — ${new Date().toLocaleDateString()}`,
      content: summary,
      tags: ["summary"],
      created_by: user.id,
      updated_by: user.id,
    });
    if (err) return void toast.error(err.message);
    toast.success("Saved as a team note");
    queryClient.invalidateQueries();
  }

  if (teamsQuery.isSuccess && teams.length === 0) {
    return (
      <AppShell title="AI Assistant">
        <EmptyState
          icon={Sparkles}
          title="Join a team first"
          description="The assistant works from your team's real tasks, notes and members."
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="AI Assistant"
      description="Suggestions are drafts — nothing is saved until you choose to save it."
    >
      <div className="mb-5 max-w-sm">
        <Select value={activeTeam} onValueChange={setTeamId}>
          <SelectTrigger aria-label="Team">
            <SelectValue placeholder="Choose a team" />
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

      {error && (
        <div className="mb-4">
          <ErrorState message={error} onRetry={() => setError(null)} />
        </div>
      )}

      <Tabs defaultValue="plan" className="space-y-5">
        <TabsList>
          <TabsTrigger value="plan">Task plan</TabsTrigger>
          <TabsTrigger value="summary">Progress summary</TabsTrigger>
          <TabsTrigger value="people">Teammate ideas</TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="space-y-4">
          <Button onClick={() => run("plan")} disabled={busy === "plan"}>
            {busy === "plan" ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 size-4" />
            )}
            Draft a plan
          </Button>
          {drafts.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="surface-card space-y-3 p-4"
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={d.selected}
                  onCheckedChange={(v) =>
                    setDrafts((prev) => prev.map((p, j) => (j === i ? { ...p, selected: !!v } : p)))
                  }
                  aria-label={`Include ${d.title}`}
                />
                <div className="flex-1 space-y-2">
                  <Input
                    value={d.title}
                    onChange={(e) =>
                      setDrafts((prev) =>
                        prev.map((p, j) => (j === i ? { ...p, title: e.target.value } : p)),
                      )
                    }
                  />
                  <Textarea
                    rows={2}
                    value={d.description}
                    onChange={(e) =>
                      setDrafts((prev) =>
                        prev.map((p, j) => (j === i ? { ...p, description: e.target.value } : p)),
                      )
                    }
                  />
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{d.priority}</Badge>
                    <Badge variant="outline">due in {d.dueOffsetDays} days</Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {drafts.length > 0 && <Button onClick={saveDrafts}>Save selected tasks</Button>}
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <Button onClick={() => run("summary")} disabled={busy === "summary"}>
            {busy === "summary" ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 size-4" />
            )}
            Summarize progress
          </Button>
          {summary && (
            <div className="surface-card space-y-3 p-5">
              <pre className="whitespace-pre-wrap font-sans text-sm">{summary}</pre>
              <Button variant="outline" onClick={saveSummary}>
                Save as team note
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="people" className="space-y-4">
          <Button onClick={() => run("people")} disabled={busy === "people"}>
            {busy === "people" ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <UserPlus className="mr-2 size-4" />
            )}
            Suggest teammates
          </Button>
          {people.length === 0 && busy !== "people" && (
            <p className="text-sm text-muted-foreground">
              Only students who opted into discovery can be suggested.
            </p>
          )}
          {people.map((p, i) => (
            <div key={i} className="surface-card p-4">
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-muted-foreground">{p.reason}</p>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
