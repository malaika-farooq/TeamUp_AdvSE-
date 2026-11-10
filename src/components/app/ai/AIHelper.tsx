import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Loader2, MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Suggestion } from "@/components/ai-elements/suggestion";
import { AssistantMark } from "./AssistantMark";
import { ChatWindow } from "./ChatWindow";
import { useAuth } from "@/lib/auth";
import { fetchMyTeams } from "@/lib/queries";
import { createThread, pagePrompts } from "@/lib/ai-client";

const GENERAL = "general";

/**
 * Page-aware AI helper: a "need a hand?" card at the end of each page plus a
 * floating button, both opening a side chat with suggestions for that page.
 */
export function AIHelper() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [pending, setPending] = useState<string | undefined>(undefined);
  const [starting, setStarting] = useState(false);
  const [teamChoice, setTeamChoice] = useState<string | null>(null);

  const teamsQuery = useQuery({ queryKey: ["teams"], queryFn: fetchMyTeams, enabled: !!user });
  const teams = teamsQuery.data ?? [];
  const routeTeam = pathname.match(/^\/teams\/([0-9a-f-]{36})/)?.[1];
  const teamId = teamChoice ?? (routeTeam && teams.some((t) => t.id === routeTeam) ? routeTeam : GENERAL);
  const { label, prompts } = pagePrompts(pathname);
  const teamName = teams.find((t) => t.id === teamId)?.name;

  if (pathname.startsWith("/assistant") || pathname.startsWith("/onboarding")) return null;

  function reset() {
    setThreadId(null);
    setPending(undefined);
  }

  async function start(prompt: string) {
    if (!user || starting) return;
    setStarting(true);
    try {
      const id = await createThread(user.id, teamId === GENERAL ? null : teamId);
      setPending(prompt);
      setThreadId(id);
      setOpen(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't start a chat.");
    } finally {
      setStarting(false);
    }
  }

  return (
    <>
      <section
        aria-label="Ask TeamUp AI"
        className="surface-card mt-10 flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
      >
        <AssistantMark className="size-14" />
        <div className="flex-1 space-y-2">
          <div>
            <p className="font-display font-semibold">Need a hand with {label}?</p>
            <p className="text-sm text-muted-foreground">
              TeamUp AI reads your real tasks, notes and schedule to help.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {prompts.map((p) => (
              <Suggestion
                key={p}
                suggestion={p}
                className="h-auto whitespace-normal py-1.5 text-left text-xs"
                disabled={starting}
                onClick={(s) => void start(s)}
              />
            ))}
          </div>
        </div>
      </section>

      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-4 shadow-lg transition-shadow hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:bottom-6 lg:right-6"
        aria-label="Open TeamUp AI"
      >
        <AssistantMark className="size-9" />
        <span className="text-sm font-semibold">Ask AI</span>
      </motion.button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          <div className="flex items-center gap-3 border-b border-border p-4 pr-12">
            <AssistantMark className="size-10" />
            <div className="min-w-0 flex-1">
              <SheetTitle className="font-display text-base">TeamUp AI</SheetTitle>
              <SheetDescription className="truncate text-xs">
                {teamName ? `Helping with ${teamName}` : "Helping across all your teams"}
              </SheetDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-border px-4 py-2">
            <Select
              value={teamId}
              onValueChange={(v) => {
                setTeamChoice(v);
                reset();
              }}
            >
              <SelectTrigger className="h-8 flex-1 text-xs" aria-label="What should the AI focus on?">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={GENERAL}>All my teams</SelectItem>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {threadId && (
              <>
                <Button size="sm" variant="ghost" onClick={reset} aria-label="New chat">
                  <MessageSquarePlus className="size-4" />
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link
                    to="/assistant/chat/$threadId"
                    params={{ threadId }}
                    onClick={() => setOpen(false)}
                    aria-label="Open in full chat"
                  >
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          <AnimatePresence mode="wait">
            {threadId ? (
              <motion.div
                key={threadId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex min-h-0 flex-1 flex-col p-3"
              >
                <ChatWindow
                  threadId={threadId}
                  initialMessages={[]}
                  initialPrompt={pending}
                  onInitialPromptSent={() => setPending(undefined)}
                  contextLabel={teamName ?? "your teams"}
                  className="flex-1"
                />
              </motion.div>
            ) : (
              <motion.div
                key="start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center"
              >
                <AssistantMark className="size-20" />
                <div>
                  <p className="font-display text-lg font-semibold">How can I help?</p>
                  <p className="text-sm text-muted-foreground">
                    Pick a suggestion for {label}, or start a blank chat.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2">
                  {prompts.map((p) => (
                    <Suggestion
                      key={p}
                      suggestion={p}
                      disabled={starting}
                      className="h-auto w-full justify-start whitespace-normal rounded-xl py-2 text-left"
                      onClick={(s) => void start(s)}
                    />
                  ))}
                </div>
                <Button
                  variant="outline"
                  disabled={starting || !user}
                  onClick={async () => {
                    if (!user) return;
                    setStarting(true);
                    try {
                      setThreadId(await createThread(user.id, teamId === GENERAL ? null : teamId));
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Couldn't start a chat.");
                    } finally {
                      setStarting(false);
                    }
                  }}
                >
                  {starting ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <MessageSquarePlus className="mr-2 size-4" />
                  )}
                  Blank chat
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </SheetContent>
      </Sheet>
    </>
  );
}
