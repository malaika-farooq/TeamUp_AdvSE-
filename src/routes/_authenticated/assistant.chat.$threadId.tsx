import { useCallback } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, History, MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState } from "@/components/app/states";
import { ChatWindow } from "@/components/app/ai/ChatWindow";
import { ThreadList } from "@/components/app/ai/ThreadList";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { fetchMyTeams } from "@/lib/queries";
import { createThread, pagePrompts, threadQuery } from "@/lib/ai-client";
import { MessageSquareX } from "lucide-react";

export const Route = createFileRoute("/_authenticated/assistant/chat/$threadId")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => {
    const q = s["q"];
    return typeof q === "string" && q ? { q: q.slice(0, 2000) } : {};
  },
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(threadQuery(params.threadId)),
  head: () => ({
    meta: [
      { title: "Chat — TeamUp AI" },
      { name: "description", content: "Chat with TeamUp AI about your team's tasks, notes and schedule." },
      { property: "og:title", content: "Chat — TeamUp AI" },
      {
        property: "og:description",
        content: "Chat with TeamUp AI about your team's tasks, notes and schedule.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = Route.useParams();
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data } = useSuspenseQuery(threadQuery(threadId));
  const { data: teams = [] } = useQuery({ queryKey: ["teams"], queryFn: fetchMyTeams });

  const clearPrompt = useCallback(() => {
    navigate({ to: "/assistant/chat/$threadId", params: { threadId }, search: {}, replace: true });
  }, [navigate, threadId]);

  async function newChat() {
    if (!user) return;
    try {
      const id = await createThread(user.id, data?.thread.team_id ?? null);
      navigate({ to: "/assistant/chat/$threadId", params: { threadId: id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't start a chat.");
    }
  }

  if (!data) {
    return (
      <AppShell title="Conversation not found">
        <EmptyState
          icon={MessageSquareX}
          title="This conversation doesn't exist"
          description="It may have been deleted. Start a new one from the AI Teammate Matching page."
        />
        <div className="mt-4 flex justify-center">
          <Button asChild>
            <Link to="/assistant">Back to AI Teammate Matching</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const team = teams.find((t) => t.id === data.thread.team_id);
  const prompts = team
    ? pagePrompts(`/teams/${team.id}`).prompts
    : pagePrompts("/dashboard").prompts;

  return (
    <AppShell
      title={data.thread.title}
      description={team ? `About ${team.name}` : "About all your teams"}
      actions={
        <>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/assistant">
              <ArrowLeft className="mr-1 size-4" /> AI tools
            </Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <History className="mr-1 size-4" /> Chats
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-4">
              <SheetTitle className="mb-3 font-display">Conversations</SheetTitle>
              <ThreadList activeId={threadId} />
            </SheetContent>
          </Sheet>
          <Button size="sm" onClick={newChat}>
            <MessageSquarePlus className="mr-1 size-4" /> New chat
          </Button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="surface-card sticky top-20 max-h-[calc(100vh-8rem)] overflow-y-auto p-3">
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Conversations
            </p>
            <ThreadList activeId={threadId} />
          </div>
        </aside>
        <div className="surface-card flex h-[calc(100dvh-15rem)] min-h-[420px] min-w-0 flex-col p-3 sm:p-4">
          <ChatWindow
            key={threadId}
            threadId={threadId}
            initialMessages={data.messages}
            initialPrompt={q}
            onInitialPromptSent={clearPrompt}
            suggestions={prompts}
            contextLabel={team ? team.name : "your teams, tasks and schedule"}
            className="flex-1"
          />
        </div>
      </div>
    </AppShell>
  );
}
