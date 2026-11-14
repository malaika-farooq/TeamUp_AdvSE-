import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import {
  NotificationFeed,
  useNotifications,
} from "@/components/app/notifications/NotificationCenter";
import { CardSkeletons, EmptyState, ErrorState } from "@/components/app/states";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — TeamUp" },
      {
        name: "description",
        content: "Task assignments, deadlines, meetings and shared notes from your teams.",
      },
    ],
  }),
  component: NotificationsPage,
});

export function NotificationsPage() {
  const center = useNotifications();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const readCount = center.items.filter((n) => n.read_at).length;

  return (
    <AppShell
      title="Notifications"
      description="Task assignments, deadlines, meetings and things your teammates share."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={center.markAllRead} disabled={!center.unread.length}>
            <CheckCheck className="mr-1.5 size-4" />
            Mark all read
          </Button>
          <Button variant="outline" onClick={center.clearRead} disabled={!readCount}>
            <Trash2 className="mr-1.5 size-4" />
            Clear read
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
          <TabsList>
            <TabsTrigger value="all">All ({center.items.length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({center.unread.length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {center.query.isLoading ? (
          <CardSkeletons count={2} />
        ) : center.query.isError ? (
          <ErrorState
            title="Couldn't load notifications"
            message={(center.query.error as Error).message}
            onRetry={() => void center.query.refetch()}
          />
        ) : (filter === "unread" ? center.unread : center.items).length === 0 ? (
          <EmptyState
            icon={Bell}
            title={filter === "unread" ? "No unread notifications" : "Nothing here yet"}
            description={
              filter === "unread"
                ? "You've seen everything. New assignments, deadlines and shared notes will show up here."
                : "When someone assigns you a task, a deadline is close, or a teammate shares a note, you'll see it here."
            }
          />
        ) : (
          <NotificationFeed filter={filter} center={center} />
        )}
      </div>
    </AppShell>
  );
}
