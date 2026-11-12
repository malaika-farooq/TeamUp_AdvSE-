import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  CalendarClock,
  Check,
  Clock,
  GraduationCap,
  ListPlus,
  Loader2,
  Square,
  UserPlus,
  Wand2,
  Wrench,
  X,
} from "lucide-react";
import { MessageResponse } from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, ErrorState } from "@/components/app/states";
import { AssistantMark } from "./AssistantMark";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  fetchResources,
  fetchSessions,
  fetchTasks,
  logActivity,
  notify,
  PRIORITIES,
  type TaskPriority,
} from "@/lib/queries";
import { readableError, streamWrite, type WriteTool } from "@/lib/ai-client";
import { tidyMarkdown } from "@/lib/markdown";
import { MAX_TEAMMATE_SUGGESTIONS } from "@/lib/teammate-ranking";
import {
  breakdownTask,
  draftTaskPlan,
  suggestTeammates,
  type PlannedTask,
  type TeammateResult,
} from "@/lib/ai.functions";

function Working({ text }: { text: string }) {
  return (
    <div className="surface-card flex items-center gap-3 p-4">
      <AssistantMark className="size-8" />
      <Shimmer>{text}</Shimmer>
    </div>
  );
}

/* ------------------------------ Written tools ------------------------------ */

/** Calmer heading sizes and spacing for written answers inside a card. */
const AI_PROSE =
  "leading-relaxed [&_h1]:mt-6 [&_h1]:mb-2 [&_h1]:font-display [&_h1]:text-xl [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-lg [&_h2]:text-foreground [&_h3]:mt-4 [&_h3]:mb-1 [&_h3]:font-display [&_h3]:text-base [&_strong]:text-foreground [&_ol]:space-y-1 [&_ul]:space-y-1";

const WRITER_COPY: Record<WriteTool, { button: string; working: string; noteTitle: string }> = {
  summary: { button: "Summarize progress", working: "Reading your tasks, notes and activity…", noteTitle: "Progress summary" },
  study_guide: { button: "Make a study guide", working: "Turning your notes into a study guide…", noteTitle: "Study guide" },
  quiz: { button: "Make a practice quiz", working: "Writing quiz questions from your notes…", noteTitle: "Practice quiz" },
  agenda: { button: "Draft the agenda", working: "Planning your meeting…", noteTitle: "Meeting agenda" },
  checkin: { button: "Write the weekly check-in", working: "Reviewing this week's work…", noteTitle: "Weekly check-in" },
};

export function WriterTool({ tool, teamId }: { tool: WriteTool; teamId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "waiting" | "streaming" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [instructions, setInstructions] = useState("");
  const [noteIds, setNoteIds] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);
  const copy = WRITER_COPY[tool];

  const needsNotes = tool === "study_guide" || tool === "quiz";
  const notesQuery = useQuery({
    queryKey: ["resources", [teamId]],
    queryFn: () => fetchResources([teamId]),
    enabled: needsNotes,
  });
  const notes = (notesQuery.data ?? []).filter((r) => r.kind === "note");
  const sessionsQuery = useQuery({
    queryKey: ["sessions", [teamId]],
    queryFn: () => fetchSessions([teamId]),
    enabled: tool === "agenda",
  });
  const upcoming = (sessionsQuery.data ?? []).filter(
    (s) => new Date(s.ends_at).getTime() > Date.now() || s.recurrence === "weekly",
  );

  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => {
    abortRef.current?.abort();
    setText("");
    setStatus("idle");
    setError(null);
    setNoteIds([]);
    setSessionId("");
  }, [teamId, tool]);

  async function run() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setText("");
    setError(null);
    setStatus("waiting");
    try {
      await streamWrite(
        {
          tool,
          teamId,
          ...(noteIds.length ? { noteIds } : {}),
          ...(sessionId ? { sessionId } : {}),
          ...(instructions.trim() ? { instructions: instructions.trim() } : {}),
        },
        (t) => {
          setText(t);
          if (t) setStatus("streaming");
        },
        controller.signal,
      );
      setStatus("done");
    } catch (e) {
      if (controller.signal.aborted) {
        setStatus("done");
        return;
      }
      setError(e instanceof Error ? e.message : "The assistant is unavailable right now.");
      setStatus("error");
    }
  }

  async function save() {
    if (!user || !text) return;
    const { error: err } = await supabase.from("resources").insert({
      team_id: teamId,
      kind: "note" as const,
      title: `${copy.noteTitle} — ${new Date().toLocaleDateString()}`,
      content: tidyMarkdown(text),
      tags: ["ai", tool.replace("_", "-")],
      created_by: user.id,
      updated_by: user.id,
    });
    if (err) return void toast.error(err.message);
    toast.success("Saved to your team's notes in Resources");
    queryClient.invalidateQueries({ queryKey: ["resources"] });
  }

  const busy = status === "waiting" || status === "streaming";

  return (
    <div className="space-y-4">
      {needsNotes && (
        <div className="space-y-2">
          <Label>Which notes? (leave empty to use the latest)</Label>
          {notesQuery.isSuccess && notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This team has no notes yet.{" "}
              <Link to="/resources" className="font-medium text-primary underline-offset-4 hover:underline">
                Add one in Resources
              </Link>{" "}
              first.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {notes.slice(0, 12).map((n) => {
                const on = noteIds.includes(n.id);
                return (
                  <button
                    key={n.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      setNoteIds((prev) => (on ? prev.filter((x) => x !== n.id) : [...prev, n.id].slice(-6)))
                    }
                    className={
                      on
                        ? "rounded-full border border-teal bg-teal/15 px-3 py-1 text-xs font-medium text-foreground transition-colors"
                        : "rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-teal/50 hover:text-foreground"
                    }
                  >
                    {n.title}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tool === "agenda" && (
        <div className="max-w-sm space-y-2">
          <Label>Meeting</Label>
          <Select value={sessionId || "next"} onValueChange={(v) => setSessionId(v === "next" ? "" : v)}>
            <SelectTrigger aria-label="Meeting">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="next">
                {upcoming.length ? "Next scheduled session" : "No session scheduled (45 min)"}
              </SelectItem>
              {upcoming.slice(0, 10).map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.title} · {new Date(s.starts_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={`instr-${tool}`}>Anything to focus on? (optional)</Label>
        <Input
          id={`instr-${tool}`}
          value={instructions}
          maxLength={500}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder={
            tool === "quiz"
              ? "e.g. focus on chapter 3, make it harder"
              : tool === "agenda"
                ? "e.g. we need to pick a presentation date"
                : "e.g. keep it short"
          }
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {busy ? (
          <Button variant="outline" onClick={() => abortRef.current?.abort()}>
            <Square className="mr-2 size-4" /> Stop
          </Button>
        ) : (
          <Button onClick={run}>
            <Wand2 className="mr-2 size-4" />
            {status === "done" ? "Write it again" : copy.button}
          </Button>
        )}
        {status === "done" && text && (
          <Button variant="outline" onClick={save}>
            Save as team note
          </Button>
        )}
      </div>

      {status === "waiting" && <Working text={copy.working} />}
      {error && <ErrorState message={error} onRetry={run} />}
      {text && (
        <motion.article
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="surface-card p-5 text-sm sm:p-6"
        >
          <MessageResponse isAnimating={status === "streaming"} className={AI_PROSE}>
            {text}
          </MessageResponse>
        </motion.article>
      )}
    </div>
  );
}

/* -------------------------------- Task plan -------------------------------- */

type Draft = PlannedTask & { selected: boolean };

export function PlanTool({ teamId }: { teamId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const plan = useServerFn(draftTaskPlan);
  const [focus, setFocus] = useState("");
  const [count, setCount] = useState("6");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDrafts([]);
    setError(null);
  }, [teamId]);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const res = await plan({
        data: { teamId, count: Number(count), ...(focus.trim() ? { focus: focus.trim() } : {}) },
      });
      setMembers(res.members);
      setDrafts(res.tasks.map((t) => ({ ...t, selected: true })));
      if (!res.tasks.length) setError("The assistant didn't suggest any tasks. Try adding a focus.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "The assistant is unavailable right now.");
    } finally {
      setBusy(false);
    }
  }

  function update(i: number, patch: Partial<Draft>) {
    setDrafts((prev) => prev.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  }

  async function save() {
    if (!user) return;
    const chosen = drafts.filter((d) => d.selected && d.title.trim());
    if (!chosen.length) return void toast.error("Select at least one task to save.");
    setSaving(true);
    const base = Date.now() % 1000000;
    const { data: created, error: err } = await supabase
      .from("tasks")
      .insert(
        chosen.map((d, i) => ({
          team_id: teamId,
          title: d.title.trim(),
          description: d.description,
          priority: d.priority as TaskPriority,
          status: "todo" as const,
          due_date: d.dueDate,
          assignee_id: d.assigneeId,
          created_by: user.id,
          position: base + i,
        })),
      )
      .select("id, title, assignee_id");
    if (err || !created) {
      setSaving(false);
      return void toast.error(err?.message ?? "Couldn't save the tasks.");
    }
    const items = created.flatMap((t, i) =>
      (chosen[i]?.checklist ?? []).map((label, position) => ({ task_id: t.id, label, position })),
    );
    if (items.length) {
      const { error: itemErr } = await supabase.from("task_checklist_items").insert(items);
      if (itemErr) toast.error(`Tasks saved, but checklists failed: ${itemErr.message}`);
    }
    await Promise.all(
      created
        .filter((t) => t.assignee_id && t.assignee_id !== user.id)
        .map((t) => notify(t.assignee_id!, "task_assigned", "New task assigned to you", t.title, "/tasks")),
    );
    await logActivity(teamId, user.id, "task_created", `added ${created.length} planned tasks`);
    setSaving(false);
    toast.success(`${created.length} tasks added to the board`);
    setDrafts([]);
    queryClient.invalidateQueries();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
        <div className="space-y-2">
          <Label htmlFor="plan-focus">What should the plan focus on? (optional)</Label>
          <Input
            id="plan-focus"
            value={focus}
            maxLength={500}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="e.g. the final presentation and report"
          />
        </div>
        <div className="space-y-2">
          <Label>How many tasks</Label>
          <Select value={count} onValueChange={setCount}>
            <SelectTrigger aria-label="How many tasks">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["4", "6", "8", "10"].map((n) => (
                <SelectItem key={n} value={n}>
                  {n} tasks
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={run} disabled={busy}>
        {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Wand2 className="mr-2 size-4" />}
        {drafts.length ? "Draft a new plan" : "Draft a plan"}
      </Button>

      {busy && <Working text="Matching tasks to your team's skills and deadline…" />}
      {error && <ErrorState message={error} onRetry={run} />}

      {drafts.length > 0 && (
        <p className="text-sm text-muted-foreground">
          These are suggestions only. Edit anything, untick what you don't want, then save.
        </p>
      )}
      {drafts.map((d, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: i * 0.04 }}
          className="surface-card p-4"
        >
          <div className="flex items-start gap-3">
            <Checkbox
              className="mt-2.5"
              checked={d.selected}
              onCheckedChange={(v) => update(i, { selected: !!v })}
              aria-label={`Include ${d.title}`}
            />
            <div className="min-w-0 flex-1 space-y-3">
              <Input
                value={d.title}
                onChange={(e) => update(i, { title: e.target.value })}
                className="font-medium"
                aria-label="Task title"
              />
              <Textarea
                rows={2}
                value={d.description}
                onChange={(e) => update(i, { description: e.target.value })}
                aria-label="Task description"
              />
              <div className="grid gap-2 sm:grid-cols-3">
                <Select
                  value={d.priority}
                  onValueChange={(v) => update(i, { priority: v as PlannedTask["priority"] })}
                >
                  <SelectTrigger aria-label="Priority" className="capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={d.assigneeId ?? "none"}
                  onValueChange={(v) =>
                    update(i, {
                      assigneeId: v === "none" ? null : v,
                      assigneeName: members.find((m) => m.id === v)?.name ?? null,
                    })
                  }
                >
                  <SelectTrigger aria-label="Assignee">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  aria-label="Due date"
                  value={d.dueDate.slice(0, 10)}
                  onChange={(e) =>
                    e.target.value && update(i, { dueDate: new Date(`${e.target.value}T17:00:00Z`).toISOString() })
                  }
                />
              </div>
              {d.assigneeReason && d.assigneeId && (
                <p className="flex items-start gap-2 text-xs text-muted-foreground">
                  <GraduationCap className="mt-0.5 size-3.5 shrink-0 text-teal" />
                  {d.assigneeReason}
                </p>
              )}
              {d.checklist.length > 0 && (
                <ul className="space-y-1 rounded-lg bg-muted/50 p-3 text-xs">
                  {d.checklist.map((c, ci) => (
                    <li key={ci} className="flex gap-2">
                      <span className="text-muted-foreground">☐</span>
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>
      ))}
      {drafts.length > 0 && (
        <div className="sticky bottom-20 flex justify-end lg:bottom-4">
          <Button onClick={save} disabled={saving} className="shadow-lg">
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save {drafts.filter((d) => d.selected).length} selected tasks
          </Button>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Teammate ideas ----------------------------- */

const TEAMMATE_EMPTY: Record<NonNullable<TeammateResult["empty"]>, { title: string; description: string }> = {
  none_discoverable: {
    title: "No discoverable students yet",
    description:
      "Nobody else has chosen to be discoverable, so there's no one to suggest. Check back once more students join TeamUp.",
  },
  all_members: {
    title: "Everyone discoverable is already on this team",
    description: "Every student who chose to be discoverable is already a member, so there's nobody new to suggest.",
  },
  no_matches: {
    title: "Nobody matches yet",
    description:
      "No discoverable student shares a course with your team, adds a skill it's missing, or has free time that overlaps. Adding your team's courses, skills and weekly availability in Settings gives better matches.",
  },
};

export function TeammatesTool({ teamId }: { teamId: string }) {
  const suggest = useServerFn(suggestTeammates);
  const [result, setResult] = useState<TeammateResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [decisions, setDecisions] = useState<Record<string, "accepted" | "declined">>({});
  const [pending, setPending] = useState<string | null>(null);
  const [wanted, setWanted] = useState<string[]>([]);
  const [wantedInput, setWantedInput] = useState("");

  function addWanted() {
    const parts = wantedInput
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    if (!parts.length) return;
    setWanted((w) => [...new Set([...w, ...parts])].slice(0, 8));
    setWantedInput("");
  }

  useEffect(() => {
    setResult(null);
    setError(null);
    setDecisions({});
  }, [teamId]);

  /** Accept = invite this student: they get a notification pointing them to the team. */
  async function accept(p: { id: string; name: string }) {
    if (!user || pending) return;
    setPending(p.id);
    const { error: err } = await supabase.from("notifications").insert({
      user_id: p.id,
      type: "team_suggestion",
      title: "A team would like you to join",
      body: "A student team thinks you'd be a great fit. Open the team and request to join.",
      link: "/discover",
      dedupe_key: `suggest:${teamId}:${p.id}`,
    });
    setPending(null);
    // 23505 = already invited earlier; treat as accepted.
    if (err && err.code !== "23505") {
      toast.error("Couldn't send the invitation. Please try again.");
      return;
    }
    setDecisions((d) => ({ ...d, [p.id]: "accepted" }));
    void logActivity(teamId, user.id, "teammate_suggested", `invited ${p.name} to join`, p.id);
    toast.success(`Invitation sent to ${p.name}.`);
  }

  function decline(id: string) {
    setDecisions((d) => ({ ...d, [id]: "declined" }));
  }

  function undo(id: string) {
    setDecisions((d) => {
      const { [id]: _removed, ...rest } = d;
      return rest;
    });
  }

  async function run() {
    setBusy(true);
    setError(null);
    setResult(null);
    setDecisions({});
    try {
      const res = await suggest({ data: { teamId, wantedSkills: wanted.length ? wanted : undefined } });
      if (!res || !Array.isArray(res.suggestions)) {
        throw new Error("The assistant returned an unreadable answer. Please try again.");
      }
      setResult(res);
    } catch (e) {
      setError(readableError(e) || "The assistant is unavailable right now.");
    } finally {
      setBusy(false);
    }
  }

  const people = result?.suggestions ?? null;
  const empty = result && people?.length === 0 ? TEAMMATE_EMPTY[result.empty ?? "no_matches"] : null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Up to {MAX_TEAMMATE_SUGGESTIONS} students, best match first. Only students who chose to be
        discoverable and aren't on this team are considered. Matches use shared courses, skills your
        team doesn't have yet, and how many hours of free time overlap each week — nobody's exact
        schedule is shown.
      </p>
      <div className="space-y-2">
        <Label htmlFor="wanted-skills">What kind of teammate do you want? (optional)</Label>
        <div className="flex gap-2">
          <Input
            id="wanted-skills"
            value={wantedInput}
            placeholder="Skills you need, e.g. SQL, React, UI Design"
            onChange={(e) => setWantedInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addWanted();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addWanted}>
            Add
          </Button>
        </div>
        {wanted.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {wanted.map((w) => (
              <Badge key={w} variant="secondary" className="gap-1">
                {w}
                <button
                  type="button"
                  aria-label={`Remove ${w}`}
                  onClick={() => setWanted((x) => x.filter((y) => y !== w))}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {wanted.length
            ? "Only students with at least one of these skills are suggested."
            : "Leave empty to get the best overall matches."}
        </p>
      </div>
      <Button onClick={run} disabled={busy}>
        {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Wand2 className="mr-2 size-4" />}
        {result ? "Suggest again" : "Suggest teammates"}
      </Button>
      {busy && <Working text="Comparing courses, skills and free time…" />}
      {error && <ErrorState title="Couldn't suggest teammates" message={error} onRetry={run} />}
      {empty && (
        <EmptyState
          icon={UserPlus}
          title={empty.title}
          description={empty.description}
          action={
            result?.empty === "no_matches" ? (
              <Button variant="outline" asChild>
                <Link to="/settings">Update your profile</Link>
              </Button>
            ) : undefined
          }
        />
      )}
      <ol className="grid gap-3 md:grid-cols-2" aria-label="Suggested teammates, best match first">
        {people?.map((p, i) => (
          <motion.li
            key={p.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.05 }}
            className="surface-card hover-lift space-y-3 p-4"
          >
            <div className="flex items-center gap-3">
              <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-navy font-display text-sm font-bold text-navy-foreground">
                {p.name.slice(0, 2).toUpperCase()}
                <span
                  className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-card"
                  aria-label={`Rank ${p.rank}`}
                >
                  {p.rank}
                </span>
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[p.major, p.university].filter(Boolean).join(" · ") || "Student"}
                </p>
              </div>
              {p.rank === 1 && (
                <Badge className="ml-auto shrink-0 bg-primary/15 text-primary hover:bg-primary/15">Best match</Badge>
              )}
            </div>
            {p.reason && <p className="text-sm">{p.reason}</p>}
            <div className="flex flex-wrap gap-1.5">
              {p.sharedCourses.map((c) => (
                <Badge key={c} variant="outline" className="border-teal/40 bg-teal/10 text-foreground">
                  <GraduationCap className="mr-1 size-3" />
                  {c}
                </Badge>
              ))}
              {p.newSkills.map((s) => (
                <Badge key={s} variant="outline" className="border-lavender/40 bg-lavender/10 text-foreground">
                  + {s}
                </Badge>
              ))}
              {p.overlapHours > 0 && (
                <Badge variant="outline" className="border-blue/40 bg-blue/10 text-foreground">
                  <Clock className="mr-1 size-3" />
                  {p.overlapHours} h/week free together
                </Badge>
              )}
            </div>
            {decisions[p.id] === "accepted" ? (
              <Badge className="bg-teal/15 text-foreground hover:bg-teal/15">
                <Check className="mr-1 size-3" />
                Invitation sent
              </Badge>
            ) : decisions[p.id] === "declined" ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <X className="size-4" />
                Declined
                <Button size="sm" variant="ghost" onClick={() => undo(p.id)}>
                  Undo
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => accept(p)} disabled={pending !== null}>
                  {pending === p.id ? (
                    <Loader2 className="mr-1 size-4 animate-spin" />
                  ) : (
                    <Check className="mr-1 size-4" />
                  )}
                  Accept
                </Button>
                <Button size="sm" variant="outline" onClick={() => decline(p.id)} disabled={pending === p.id}>
                  <X className="mr-1 size-4" />
                  Decline
                </Button>
              </div>
            )}
          </motion.li>
        ))}
      </ol>
      {people && people.length > 0 && (
        <Button variant="outline" asChild>
          <Link to="/discover">Find them in Discover</Link>
        </Button>
      )}
    </div>
  );
}

/* ------------------------------ Task breakdown ----------------------------- */

export function BreakdownTool({ teamId }: { teamId: string }) {
  const queryClient = useQueryClient();
  const breakdown = useServerFn(breakdownTask);
  const tasksQuery = useQuery({ queryKey: ["tasks", [teamId]], queryFn: () => fetchTasks([teamId]) });
  const open = (tasksQuery.data ?? []).filter((t) => t.status !== "done");
  const [taskId, setTaskId] = useState("");
  const [steps, setSteps] = useState<{ label: string; selected: boolean }[]>([]);
  const [tip, setTip] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTaskId("");
    setSteps([]);
    setTip("");
  }, [teamId]);

  async function run() {
    if (!taskId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await breakdown({ data: { taskId } });
      setSteps(res.steps.map((label) => ({ label, selected: true })));
      setTip(res.tip);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The assistant is unavailable right now.");
    } finally {
      setBusy(false);
    }
  }

  async function addToChecklist() {
    const chosen = steps.filter((s) => s.selected && s.label.trim());
    if (!chosen.length) return void toast.error("Select at least one step.");
    const { count } = await supabase
      .from("task_checklist_items")
      .select("id", { count: "exact", head: true })
      .eq("task_id", taskId);
    const { error: err } = await supabase.from("task_checklist_items").insert(
      chosen.map((s, i) => ({ task_id: taskId, label: s.label.trim(), position: (count ?? 0) + i })),
    );
    if (err) return void toast.error(err.message);
    toast.success(`${chosen.length} steps added to the task's checklist`);
    setSteps([]);
    setTip("");
    queryClient.invalidateQueries({ queryKey: ["task-detail", taskId] });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Select value={taskId} onValueChange={setTaskId}>
          <SelectTrigger className="sm:max-w-md" aria-label="Task to break down">
            <SelectValue placeholder={open.length ? "Choose a task" : "No open tasks in this team"} />
          </SelectTrigger>
          <SelectContent>
            {open.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={run} disabled={!taskId || busy}>
          {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Wrench className="mr-2 size-4" />}
          Break it down
        </Button>
      </div>
      {busy && <Working text="Splitting the task into small steps…" />}
      {error && <ErrorState message={error} onRetry={run} />}
      {steps.length > 0 && (
        <div className="surface-card space-y-3 p-4">
          {steps.map((s, i) => (
            <label key={i} className="flex items-center gap-3">
              <Checkbox
                checked={s.selected}
                onCheckedChange={(v) =>
                  setSteps((prev) => prev.map((p, j) => (j === i ? { ...p, selected: !!v } : p)))
                }
              />
              <Input
                value={s.label}
                onChange={(e) =>
                  setSteps((prev) => prev.map((p, j) => (j === i ? { ...p, label: e.target.value } : p)))
                }
                aria-label={`Step ${i + 1}`}
              />
            </label>
          ))}
          {tip && (
            <p className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs">
              <CalendarClock className="mt-0.5 size-3.5 shrink-0 text-primary" />
              {tip}
            </p>
          )}
          <Button onClick={addToChecklist}>
            <ListPlus className="mr-2 size-4" /> Add to the task's checklist
          </Button>
        </div>
      )}
    </div>
  );
}
