import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CalendarClock,
  Clock,
  FileText,
  Gauge,
  GraduationCap,
  Handshake,
  HelpCircle,
  ListChecks,
  Loader2,
  MessageSquarePlus,
  Sparkles,
  UserPlus,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { AssistantMark } from "@/components/app/ai/AssistantMark";
import { ThreadList } from "@/components/app/ai/ThreadList";
import { BreakdownTool, PlanTool, TeammatesTool, WriterTool } from "@/components/app/ai/tools";
import { PartnerMatchTool, SessionPlanTool } from "@/components/app/ai/partner-tools";
import { Suggestion } from "@/components/ai-elements/suggestion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { fetchMyTeams } from "@/lib/queries";
import { createThread, pagePrompts, type WriteTool } from "@/lib/ai-client";
import { cn } from "@/lib/utils";

export type ToolId = "plan" | WriteTool | "breakdown" | "teammates";

/** What the matching looks at, as described in the feature requirements. */
export const MATCH_FACTORS: { name: string; desc: string; icon: LucideIcon }[] = [
  { name: "Profile", desc: "Shared courses, major and university", icon: GraduationCap },
  { name: "Skills", desc: "Skills you asked for and ones you don't have yet", icon: Sparkles },
  { name: "Availability", desc: "Weekly free time you share, or the times you pick", icon: Clock },
  { name: "Academic workload", desc: "Open tasks, due dates and booked sessions", icon: Gauge },
];

export const ADDITIONAL_FEATURES: {
  id: ToolId;
  name: string;
  desc: string;
  icon: LucideIcon;
  tone: string;
  group: "Plan" | "Track" | "Study" | "Team";
}[] = [
  {
    id: "plan",
    name: "Plan tasks",
    desc: "Tasks with due dates and the best-fit teammate",
    icon: ListChecks,
    tone: "bg-primary/15 text-primary",
    group: "Plan",
  },
  {
    id: "breakdown",
    name: "Break down a task",
    desc: "Split a big task into checklist steps",
    icon: Wrench,
    tone: "bg-primary/15 text-primary",
    group: "Plan",
  },
  {
    id: "summary",
    name: "Progress summary",
    desc: "Decisions, blockers and next steps",
    icon: FileText,
    tone: "bg-teal/15 text-teal",
    group: "Track",
  },
  {
    id: "checkin",
    name: "Weekly check-in",
    desc: "What everyone did and what's coming up",
    icon: CalendarCheck,
    tone: "bg-teal/15 text-teal",
    group: "Track",
  },
  {
    id: "agenda",
    name: "Meeting agenda",
    desc: "A time-boxed plan for your next session",
    icon: CalendarClock,
    tone: "bg-blue/15 text-blue",
    group: "Track",
  },
  {
    id: "study_guide",
    name: "Study guide",
    desc: "Key ideas and terms from your notes",
    icon: BookOpen,
    tone: "bg-lavender/15 text-lavender",
    group: "Study",
  },
  {
    id: "quiz",
    name: "Practice quiz",
    desc: "Test yourself, with an answer key",
    icon: HelpCircle,
    tone: "bg-lavender/15 text-lavender",
    group: "Study",
  },
  {
    id: "teammates",
    name: "Teammate ideas",
    desc: "Students who fill your team's gaps",
    icon: UserPlus,
    tone: "bg-blue/15 text-blue",
    group: "Team",
  },
];

export function TeammateMatchingHub() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const teamsQuery = useQuery({ queryKey: ["teams"], queryFn: fetchMyTeams });
  const teams = teamsQuery.data ?? [];
  const [teamChoice, setTeamChoice] = useState("");
  const teamId = teamChoice || teams[0]?.id || "";
  const team = teams.find((t) => t.id === teamId);
  const [tool, setTool] = useState<ToolId | null>(null);
  const [question, setQuestion] = useState("");
  const [starting, setStarting] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  async function startChat(prompt?: string) {
    if (!user || starting) return;
    setStarting(true);
    try {
      const id = await createThread(user.id, teamId || null);
      const q = prompt?.trim();
      navigate({
        to: "/assistant/chat/$threadId",
        params: { threadId: id },
        search: q ? { q } : {},
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't start a chat.");
      setStarting(false);
    }
  }

  function pickTool(id: ToolId) {
    setTool(id);
    requestAnimationFrame(() =>
      panelRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" }),
    );
  }

  const active = ADDITIONAL_FEATURES.find((t) => t.id === tool);
  const prompts = pagePrompts(team ? `/teams/${team.id}` : "/dashboard").prompts;
  const noTeam = teamsQuery.isSuccess && teams.length === 0;

  return (
    <AppShell
      title="AI Teammate Matching"
      description="Suggests the best study partners and group sessions from each student's profile, skills, availability and current academic workload."
    >
      {/* Required feature: matching */}
      <section aria-labelledby="matching-heading" className="space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="surface-card relative overflow-hidden p-5 sm:p-6"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <AssistantMark className="size-14 sm:size-16" />
            <div className="min-w-0 flex-1">
              <h2 id="matching-heading" className="font-display text-xl font-bold">
                Find your best-fit study partners
              </h2>
              <p className="text-sm text-muted-foreground">
                Matches are ranked by these four things. Only students who chose to be discoverable
                are considered, and nobody's schedule or task list is shown to anyone else.
              </p>
            </div>
          </div>
          <ul
            className="relative mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4"
            aria-label="What matching looks at"
          >
            {MATCH_FACTORS.map((f) => (
              <li key={f.name} className="flex items-start gap-2 rounded-xl bg-muted/50 p-3">
                <f.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  <span className="block text-sm font-semibold leading-tight">{f.name}</span>
                  <span className="block text-xs text-muted-foreground">{f.desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        <Tabs defaultValue="partners" className="space-y-4">
          <TabsList>
            <TabsTrigger value="partners">
              <Handshake className="mr-1.5 size-4" /> Study partners
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <CalendarClock className="mr-1.5 size-4" /> Group sessions
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="partners"
            className="rounded-2xl border border-border bg-muted/30 p-4 sm:p-6"
          >
            <PartnerMatchTool />
          </TabsContent>
          <TabsContent
            value="sessions"
            className="rounded-2xl border border-border bg-muted/30 p-4 sm:p-6"
          >
            <SessionPlanTool />
          </TabsContent>
        </Tabs>
      </section>

      {/* Everything else */}
      <section aria-labelledby="additional-heading" className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="additional-heading" className="font-display text-lg font-semibold">
              Additional AI features
            </h2>
            <p className="text-sm text-muted-foreground">
              Chat, plan and write for {team?.name ?? "your team"}. Everything is a draft — nothing
              is saved until you choose to.
            </p>
          </div>
          {teams.length > 0 && (
            <Select value={teamId} onValueChange={setTeamChoice}>
              <SelectTrigger className="w-56" aria-label="Team">
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
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="surface-card p-5">
            <h3 className="font-display text-base font-semibold">Ask TeamUp AI anything</h3>
            <p className="text-sm text-muted-foreground">
              {team ? (
                <>
                  It reads <strong className="text-foreground">{team.name}</strong>'s tasks, notes,
                  sessions and members, and answers as it types.
                </>
              ) : (
                "Ask a question about studying or working in a team."
              )}
            </p>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (question.trim()) void startChat(question);
              }}
            >
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={`e.g. What should ${team?.name ?? "we"} do next?`}
                aria-label="Ask TeamUp AI"
                maxLength={2000}
                className="h-11"
              />
              <Button type="submit" className="h-11" disabled={starting || !question.trim()}>
                {starting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowRight className="size-4" />
                )}
                <span className="sr-only sm:not-sr-only">Ask</span>
              </Button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              {prompts.map((p) => (
                <Suggestion
                  key={p}
                  suggestion={p}
                  disabled={starting}
                  className="h-auto whitespace-normal py-1.5 text-left text-xs"
                  onClick={(s) => void startChat(s)}
                />
              ))}
            </div>
          </div>
          <div className="surface-card flex flex-col p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display font-semibold">Recent chats</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void startChat()}
                disabled={starting}
              >
                <MessageSquarePlus className="mr-1 size-4" /> New
              </Button>
            </div>
            <div className="max-h-60 overflow-y-auto">
              <ThreadList limit={6} />
            </div>
          </div>
        </div>

        {noTeam && (
          <p
            role="note"
            className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground"
          >
            <Users className="size-4 shrink-0" />
            Join or create a team to use the tools below. They work from your team's real tasks,
            notes and members.
          </p>
        )}

        <ul
          className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4"
          aria-label="Additional AI features"
        >
          {ADDITIONAL_FEATURES.map((t, i) => (
            <li key={t.id} className="contents">
              <motion.button
                type="button"
                onClick={() => pickTool(t.id)}
                disabled={noTeam}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.03 * i }}
                aria-pressed={tool === t.id}
                className={cn(
                  "surface-card hover-lift flex flex-col items-start gap-3 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                  tool === t.id && "ring-2 ring-primary",
                )}
              >
                <span className={cn("grid size-10 place-items-center rounded-xl", t.tone)}>
                  <t.icon className="size-5" />
                </span>
                <span>
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t.group}
                  </span>
                  <span className="block font-semibold leading-tight">{t.name}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{t.desc}</span>
                </span>
              </motion.button>
            </li>
          ))}
        </ul>

        <div ref={panelRef} className="scroll-mt-24">
          <AnimatePresence mode="wait">
            {active && teamId && (
              <motion.section
                key={`${active.id}-${teamId}`}
                aria-label={active.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-6 rounded-2xl border border-border bg-muted/30 p-4 sm:p-6"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className={cn("grid size-10 place-items-center rounded-xl", active.tone)}>
                    <active.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold">{active.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {active.desc} · {team?.name ?? ""}
                    </p>
                  </div>
                </div>
                {active.id === "plan" ? (
                  <PlanTool teamId={teamId} />
                ) : active.id === "teammates" ? (
                  <TeammatesTool teamId={teamId} />
                ) : active.id === "breakdown" ? (
                  <BreakdownTool teamId={teamId} />
                ) : (
                  <WriterTool tool={active.id} teamId={teamId} />
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </section>
    </AppShell>
  );
}
