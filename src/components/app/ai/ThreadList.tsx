import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { Skeleton } from "@/components/ui/skeleton";
import { deleteThread, threadsQuery, type AIThread } from "@/lib/ai-client";
import { fetchMyTeams } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function ThreadList({
  activeId,
  limit,
  onNavigate,
}: {
  activeId?: string;
  limit?: number;
  onNavigate?: () => void;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(threadsQuery());
  const { data: teams = [] } = useQuery({ queryKey: ["teams"], queryFn: fetchMyTeams });
  const [toDelete, setToDelete] = useState<AIThread | null>(null);
  const threads = (data ?? []).slice(0, limit ?? 50);

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteThread(toDelete.id);
      toast.success("Conversation deleted");
      await queryClient.invalidateQueries({ queryKey: ["ai-threads"] });
      if (toDelete.id === activeId) navigate({ to: "/assistant" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't delete the conversation.");
    } finally {
      setToDelete(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!threads.length) {
    return <p className="px-1 text-sm text-muted-foreground">No conversations yet.</p>;
  }

  return (
    <>
      <ul className="space-y-1">
        {threads.map((t) => (
          <li
            key={t.id}
            className={cn(
              "group flex items-center gap-1 rounded-xl transition-colors",
              t.id === activeId ? "bg-accent" : "hover:bg-muted",
            )}
          >
            <Link
              to="/assistant/chat/$threadId"
              params={{ threadId: t.id }}
              onClick={onNavigate}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{t.title}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {teams.find((x) => x.id === t.team_id)?.name ?? "All my teams"} ·{" "}
                  {new Date(t.updated_at).toLocaleDateString()}
                </span>
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setToDelete(t)}
              className="mr-1 grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              aria-label={`Delete conversation ${t.title}`}
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              "{toDelete?.title}" and all its messages will be removed. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
