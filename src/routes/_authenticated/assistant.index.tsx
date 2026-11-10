import { useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CalendarClock,
  FileText,
  HelpCircle,
  ListChecks,
  Loader2,
  MessageSquarePlus,
  UserPlus,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { CardSkeletons, EmptyState } from "@/components/app/states";
import { AssistantMark } from "@/components/app/ai/AssistantMark";
import { ThreadList } from "@/components/app/ai/ThreadList";
import { BreakdownTool, PlanTool, TeammatesTool, WriterTool } from "@/components/app/ai/tools";
import { Suggestion } from "@/components/ai-elements/suggestion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export const Route = createFileRoute("/_authenticated/assistant/")({
  head: () => ({
    meta: [
      { title: "AI Assistant — TeamUp" },
      {
        name: "description",
        content:
          "Chat with TeamUp AI, plan tasks, summarize progress, write agendas, make study guides and quizzes.",
      },
      { property: "og:title", content: "AI Assistant — TeamUp" },
      {
        property: "og:description",
        content:
          "Chat with TeamUp AI, plan tasks, summarize progress, write agendas, make study guides and quizzes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AssistantHub,
});

type ToolId = "plan" | WriteTool | "breakdown" | "teammates";

const TOOLS: {
  id: ToolId;
  name: string;
  desc: string;
  icon: LucideIcon;
  tone: string;
  group: "Plan" | "Track" | "Study" | "Team";
}[] = [
  { id: "plan", name: "Plan tasks", desc: "Tasks with due dates and the best-fit teammate", icon: ListChecks, tone: "bg-primary/15 text-primary", group: "Plan" },
  { id: "breakdown", name: "Break down a task", desc: "Split a big task into checklist steps", icon: Wrench, tone: "bg-primary/15 text-primary", group: "Plan" },
  { id: "summary", name: "Progress summary", desc: "Decisions, blockers and next steps", icon: FileText, tone: "bg-teal/15 text-teal", group: "Track" },
  { id: "checkin", name: "Weekly check-in", desc: "What everyone did and what's coming up", icon: CalendarCheck, tone: "bg-teal/15 text-teal", group: "Track" },
  { id: "agenda", name: "Meeting agenda", desc: "A time-boxed plan for your next session", icon: CalendarClock, tone: "bg-blue/15 text-blue", group: "Track" },
  { id: "study_guide", name: "Study guide", desc: "Key ideas and terms from your notes", icon: BookOpen, tone: "bg-lavender/15 text-lavender", group: "Study" },
  { id: "quiz", name: "Practice quiz", desc: "Test yourself, with an answer key", icon: HelpCircle, tone: "bg-lavender/15 text-lavender", group: "Study" },
  { id: "teammates", name: "Teammate ideas", desc: "Students who fill your team's gaps", icon: UserPlus, tone: "bg-blue/15 text-blue", group: "Team" },
];

function AssistantHub() {
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
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  if (teamsQuery.isLoading) {
    return (
      <AppShell title="AI Assistant">
        <CardSkeletons count={3} />
      </AppShell>
    );
  }

  if (teamsQuery.isSuccess && teams.length === 0) {
    return (
      <AppShell title="AI Assistant">
        <EmptyState
          icon={Users}
          title="Join a team first"
          description="TeamUp AI works from your team's real tasks, notes and members. Create or join a team to get started."
        />
      </AppShell>
    );
  }

  const active = TOOLS.find((t) => t.id === tool);
  const prompts = pagePrompts(team ? `/teams/${team.id}` : "/dashboard").prompts;

  return (
    <AppShell
      title="AI Assistant"
      description="Everything the assistant writes is a draft — nothing is saved until you choose to."
      actions={
        <Select
          value={teamId}
          onValueChange={(v) => {
            setTeamChoice(v);
          }}
        >
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
      }
    >
      {/* Chat */}
      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="surface-card relative overflow-hidden p-5 sm:p-6"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <AssistantMark className="size-16 sm:size-20" />
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-xl font-bold">Ask TeamUp AI anything</h2>
              <p className="text-sm text-muted-foreground">
                It reads {team ? <strong className="text-foreground">{team.name}</strong> : "your team"}'s
                tasks, notes, sessions and members, and answers as it types.
              </p>
            </div>
          </div>
          <form
            className="relative mt-5 flex gap-2"
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
              {starting ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              <span className="sr-only sm:not-sr-only">Ask</span>
            </Button>
          </form>
          <div className="relative mt-3 flex flex-wrap gap-2">
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="surface-card flex flex-col p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display font-semibold">Recent chats</p>
            <Button size="sm" variant="ghost" onClick={() => void startChat()} disabled={starting}>
              <MessageSquarePlus className="mr-1 size-4" /> New
            </Button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            <ThreadList limit={6} />
          </div>
        </motion.div>
      </section>

      {/* Tools */}
      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold">AI tools</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Pick a tool for {team?.name ?? "your team"}. Results appear below.
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {TOOLS.map((t, i) => (
            <motion.button
              key={t.id}
              type="button"
              onClick={() => pickTool(t.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.03 * i }}
              aria-pressed={tool === t.id}
              className={cn(
                "surface-card hover-lift flex flex-col items-start gap-3 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
          ))}
        </div>
      </section>

      <div ref={panelRef} className="scroll-mt-24">
        <AnimatePresence mode="wait">
          {active && teamId && (
            <motion.section
              key={`${active.id}-${teamId}`}
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
                    {active.desc} · {team?.name}
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
    </AppShell>
  );
}
