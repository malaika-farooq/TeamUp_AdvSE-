import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  CalendarClock,
  Check,
  Clock,
  GraduationCap,
  Handshake,
  Loader2,
  Users,
  Wand2,
  X,
} from "lucide-react";
import { EmptyState, ErrorState } from "@/components/app/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { readableError } from "@/lib/ai-client";
import { DAY_LABELS, TIME_BLOCKS, nextOccurrence, type WorkloadLevel } from "@/lib/partner-ranking";
import {
  proposeStudySessions,
  suggestStudyPartners,
  type PartnerResult,
  type SessionProposal,
} from "@/lib/partners.functions";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/app/profile/UserAvatar";

const EMPTY: Record<NonNullable<PartnerResult["empty"]>, { title: string; description: string }> = {
  none_discoverable: {
    title: "No new students to suggest",
    description:
      "Everyone discoverable is already a partner or has a pending request with you. Check back later.",
  },
  profile_empty: {
    title: "Add your courses and skills first",
    description:
      "Matching compares your courses, skills and free time with other students. Add some in Settings.",
  },
  no_matches: {
    title: "Nobody matches yet",
    description:
      "No discoverable student shares a course, adds a skill, or has free time that overlaps. Adding skills and weekly availability in Settings gives better matches.",
  },
};

const LOAD_TONE: Record<WorkloadLevel, string> = {
  light: "border-teal/40 bg-teal/10",
  moderate: "border-blue/40 bg-blue/10",
  heavy: "border-destructive/40 bg-destructive/10",
};

function fmtWhen(d: Date) {
  return d.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/* ----------------------------- Find study partners ----------------------------- */

export function PartnerMatchTool() {
  const queryClient = useQueryClient();
  const onChanged = () => void queryClient.invalidateQueries({ queryKey: ["partner-requests"] });
  const suggest = useServerFn(suggestStudyPartners);
  const [result, setResult] = useState<PartnerResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wanted, setWanted] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState<string | null>(null);
  // Requested study times as "weekday-blockIndex" keys, e.g. "1-2" = Monday evening.
  const [times, setTimes] = useState<string[]>([]);
  const [avoidHeavy, setAvoidHeavy] = useState(false);

  const toggleTime = (key: string) =>
    setTimes((t) => (t.includes(key) ? t.filter((x) => x !== key) : [...t, key]));

  function addWanted() {
    const parts = input
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    if (!parts.length) return;
    setWanted((w) => [...new Set([...w, ...parts])].slice(0, 8));
    setInput("");
  }

  async function run() {
    setBusy(true);
    setError(null);
    setResult(null);
    setSent({});
    setDismissed({});
    try {
      const windows = times.map((k) => {
        const [d, b] = k.split("-").map(Number) as [number, number];
        return { weekday: d, start: TIME_BLOCKS[b]!.start, end: TIME_BLOCKS[b]!.end };
      });
      const res = await suggest({
        data: {
          wantedSkills: wanted.length ? wanted : undefined,
          windows: windows.length ? windows : undefined,
          avoidHeavy: avoidHeavy || undefined,
        },
      });
      if (!res || !Array.isArray(res.suggestions))
        throw new Error("The assistant returned an unreadable answer.");
      setResult(res);
    } catch (e) {
      setError(readableError(e));
    } finally {
      setBusy(false);
    }
  }

  async function send(id: string, name: string) {
    setPending(id);
    const { error: err } = await supabase.rpc("send_partner_request", { _to: id });
    setPending(null);
    if (err) return void toast.error(err.message);
    setSent((s) => ({ ...s, [id]: true }));
    toast.success(`Request sent to ${name}.`);
    onChanged();
  }

  const people = result?.suggestions ?? [];
  const empty = result && people.length === 0 ? EMPTY[result.empty ?? "no_matches"] : null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Ranked by shared courses, skills you don't have, overlapping free hours and how busy each
        student is this week. Only students who chose to be discoverable are considered, and
        nobody's schedule or task list is shown.
      </p>
      <div className="space-y-2">
        <Label htmlFor="pw">What kind of partner do you want? (optional)</Label>
        <div className="flex max-w-xl gap-2">
          <Input
            id="pw"
            value={input}
            placeholder="Skills you need, e.g. SQL, React"
            onChange={(e) => setInput(e.target.value)}
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
      </div>
      <div className="space-y-2">
        <Label>When do you want to study? (optional)</Label>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] max-w-xl text-sm">
            <thead>
              <tr>
                <th />
                {DAY_LABELS.map((d) => (
                  <th key={d} className="p-1 text-xs font-medium text-muted-foreground">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_BLOCKS.map((b, bi) => (
                <tr key={b.label}>
                  <td className="pr-2 text-xs text-muted-foreground">{b.label}</td>
                  {DAY_LABELS.map((d, di) => {
                    const key = `${di}-${bi}`;
                    const on = times.includes(key);
                    return (
                      <td key={key} className="p-0.5">
                        <button
                          type="button"
                          aria-pressed={on}
                          aria-label={`${d} ${b.label}`}
                          onClick={() => toggleTime(key)}
                          className={cn(
                            "h-8 w-full rounded-md border border-border transition-colors",
                            on ? "border-teal bg-teal/25" : "bg-muted/40 hover:bg-muted",
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
        <p className="text-xs text-muted-foreground">
          {times.length
            ? "Only students free for at least an hour within these times are suggested."
            : "Leave empty to match on your saved weekly availability instead."}
        </p>
        <div className="flex items-center gap-2">
          <Checkbox
            id="light"
            checked={avoidHeavy}
            onCheckedChange={(v) => setAvoidHeavy(v === true)}
          />
          <Label htmlFor="light" className="cursor-pointer text-sm">
            Only students who aren't overloaded right now
          </Label>
        </div>
      </div>
      <Button onClick={run} disabled={busy}>
        {busy ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <Wand2 className="mr-2 size-4" />
        )}
        {result ? "Find again" : "Find study partners"}
      </Button>
      {error && <ErrorState title="Couldn't find partners" message={error} onRetry={run} />}
      {empty && (
        <EmptyState
          icon={Handshake}
          title={empty.title}
          description={empty.description}
          action={
            result?.empty !== "none_discoverable" ? (
              <Button variant="outline" asChild>
                <Link to="/settings">Open Settings</Link>
              </Button>
            ) : undefined
          }
        />
      )}
      <ol
        className="grid gap-3 md:grid-cols-2"
        aria-label="Suggested study partners, best match first"
      >
        {people
          .filter((p) => !dismissed[p.id])
          .map((p) => (
            <li key={p.id} className="surface-card space-y-3 p-4">
              <div className="flex items-center gap-3">
                <UserAvatar name={p.name} path={p.avatar} className="size-10" />
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {p.rank}. {p.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[p.major, p.university].filter(Boolean).join(" · ") || "Student"}
                  </p>
                </div>
                <Badge variant="outline" className={`ml-auto shrink-0 ${LOAD_TONE[p.workload]}`}>
                  {p.workload} workload
                </Badge>
              </div>
              {p.reason && <p className="text-sm">{p.reason}</p>}
              <div className="flex flex-wrap gap-1.5">
                {p.wantedSkills.map((s) => (
                  <Badge key={`w${s}`} className="bg-primary/15 text-primary hover:bg-primary/15">
                    {s}
                  </Badge>
                ))}
                {p.sharedCourses.map((c) => (
                  <Badge
                    key={c}
                    variant="outline"
                    className="border-teal/40 bg-teal/10 text-foreground"
                  >
                    <GraduationCap className="mr-1 size-3" />
                    {c}
                  </Badge>
                ))}
                {p.newSkills
                  .filter((s) => !p.wantedSkills.includes(s))
                  .map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="border-lavender/40 bg-lavender/10 text-foreground"
                    >
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
              {sent[p.id] ? (
                <Badge className="bg-teal/15 text-foreground hover:bg-teal/15">
                  <Check className="mr-1 size-3" />
                  Request sent
                </Badge>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" disabled={pending !== null} onClick={() => send(p.id, p.name)}>
                    {pending === p.id ? (
                      <Loader2 className="mr-1 size-4 animate-spin" />
                    ) : (
                      <Handshake className="mr-1 size-4" />
                    )}
                    Send request
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDismissed((d) => ({ ...d, [p.id]: true }))}
                  >
                    Not now
                  </Button>
                </div>
              )}
            </li>
          ))}
      </ol>
    </div>
  );
}

/* ------------------------------ Plan a study session ------------------------------ */

export function SessionPlanTool() {
  const queryClient = useQueryClient();
  const propose = useServerFn(proposeStudySessions);
  const requestsQuery = useQuery({
    queryKey: ["partner-requests"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("my_partner_requests");
      if (error) throw error;
      return data ?? [];
    },
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposals, setProposals] = useState<SessionProposal[] | null>(null);
  const [creating, setCreating] = useState<number | null>(null);

  const partners = (requestsQuery.data ?? []).filter((r) => r.status === "accepted");

  async function find() {
    setBusy(true);
    setError(null);
    setProposals(null);
    try {
      const res = await propose({ data: { partnerIds: selected } });
      setProposals(res.proposals);
    } catch (e) {
      setError(readableError(e));
    } finally {
      setBusy(false);
    }
  }

  async function create(i: number, p: SessionProposal) {
    const starts = nextOccurrence(p.weekday, p.startMinute);
    const ends = new Date(starts.getTime() + (p.endMinute - p.startMinute) * 60000);
    setCreating(i);
    const { error: err } = await supabase.rpc("create_study_session", {
      _title: p.title,
      _note: p.agenda,
      _starts: starts.toISOString(),
      _ends: ends.toISOString(),
      _invitees: selected,
    });
    setCreating(null);
    if (err) return void toast.error(err.message);
    toast.success("Session created. Your partners were invited.");
    setProposals(null);
    void queryClient.invalidateQueries({ queryKey: ["study-sessions"] });
  }

  if (requestsQuery.isLoading) return <Loader2 className="size-5 animate-spin" />;
  if (requestsQuery.isError) {
    return (
      <ErrorState
        title="Couldn't load your partners"
        message={readableError(requestsQuery.error)}
        onRetry={() => requestsQuery.refetch()}
      />
    );
  }
  if (!partners.length) {
    return (
      <EmptyState
        icon={Users}
        title="No study partners yet"
        description="Find a partner first with the Find study partners tool. Once someone accepts your request (or you accept theirs) they show up here."
        action={
          <Button variant="outline" asChild>
            <Link to="/partners">Open Study Partners</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choose up to 5 partners. The assistant finds times when you are all free, based on
        everyone's saved weekly availability, and writes a title and agenda for each option.
      </p>
      <ul className="grid gap-2 md:grid-cols-2">
        {partners.map((r) => (
          <li key={r.id} className="surface-card flex items-center gap-3 p-3">
            <Checkbox
              id={`sp-${r.other_id}`}
              checked={selected.includes(r.other_id)}
              onCheckedChange={(v) =>
                setSelected((s) =>
                  v ? [...s, r.other_id].slice(0, 5) : s.filter((x) => x !== r.other_id),
                )
              }
            />
            <Label htmlFor={`sp-${r.other_id}`} className="flex-1 cursor-pointer">
              <span className="inline-flex items-center gap-2 align-middle">
                <UserAvatar name={r.other_name} path={r.other_avatar} className="size-7" />
                <span className="font-semibold">{r.other_name}</span>
              </span>
              {r.other_major && (
                <span className="ml-2 text-xs text-muted-foreground">{r.other_major}</span>
              )}
            </Label>
          </li>
        ))}
      </ul>
      <Button onClick={find} disabled={busy || selected.length === 0}>
        {busy ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <CalendarClock className="mr-2 size-4" />
        )}
        Suggest session times
      </Button>
      {error && <ErrorState title="Couldn't plan a session" message={error} onRetry={find} />}
      {proposals && proposals.length === 0 && (
        <EmptyState
          icon={CalendarClock}
          title="No shared free time"
          description="You and the chosen partners have no overlapping free blocks of at least 30 minutes. Update availability in Settings or pick fewer partners."
        />
      )}
      <ul className="grid gap-3 md:grid-cols-3">
        {proposals?.map((p, i) => {
          const starts = nextOccurrence(p.weekday, p.startMinute);
          return (
            <li key={`${p.weekday}-${p.startMinute}`} className="surface-card space-y-2 p-4">
              <p className="font-semibold">{p.title}</p>
              <p className="text-sm">
                {fmtWhen(starts)} · {p.endMinute - p.startMinute} min
              </p>
              <p className="text-xs text-muted-foreground">{p.agenda}</p>
              <Badge variant="outline">
                {p.freeCount} of {selected.length + 1} free
              </Badge>
              <div>
                <Button size="sm" disabled={creating !== null} onClick={() => create(i, p)}>
                  {creating === i && <Loader2 className="mr-1 size-4 animate-spin" />}
                  Create &amp; invite
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
