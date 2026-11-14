import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bell,
  CalendarClock,
  CheckCheck,
  ClipboardCheck,
  Clock,
  Handshake,
  Share2,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  deleteNotifications,
  fetchAllNotifications,
  groupByDay,
  markRead,
  markUnread,
  notificationMeta,
  refreshDeadlineNotifications,
  safeLink,
  sortNotifications,
  timeAgo,
  unreadOf,
  type NotificationRow,
  type NotificationTone,
} from "@/lib/notifications";
import { cn } from "@/lib/utils";

const ICONS: Record<NotificationTone, LucideIcon> = {
  task: ClipboardCheck,
  deadline: Clock,
  meeting: CalendarClock,
  team: Users,
  share: Share2,
  partner: Handshake,
  general: Bell,
};
const TONES: Record<NotificationTone, string> = {
  task: "bg-primary/15 text-primary",
  deadline: "bg-destructive/15 text-destructive",
  meeting: "bg-blue/15 text-blue",
  team: "bg-teal/15 text-teal",
  share: "bg-lavender/15 text-lavender",
  partner: "bg-teal/15 text-teal",
  general: "bg-muted text-muted-foreground",
};

/** Everything the bell and the Notifications page need: the list, live updates, deadline reminders, actions. */
export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchAllNotifications,
    enabled: !!user,
  });
  const items = sortNotifications(query.data ?? []);
  const unread = unreadOf(items);

  // New notifications appear without a refresh.
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notifications-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => void queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Deadline reminders: asked for when the app opens and every ten minutes after.
  const reminders = useQuery({
    queryKey: ["deadline-check", user?.id],
    queryFn: refreshDeadlineNotifications,
    enabled: !!user,
    refetchInterval: 10 * 60_000,
    staleTime: 5 * 60_000,
    retry: false,
  });
  useEffect(() => {
    if ((reminders.data ?? 0) > 0)
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }, [reminders.data, queryClient]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["notifications"] });
  async function run(action: () => Promise<void>, failure: string) {
    try {
      await action();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : failure);
    } finally {
      await refresh();
    }
  }

  return {
    query,
    items,
    unread,
    markAllRead: () =>
      run(() => markRead(unread.map((n) => n.id)), "Couldn't mark the notifications as read."),
    setRead: (n: NotificationRow, read: boolean) =>
      run(
        () => (read ? markRead([n.id]) : markUnread([n.id])),
        "Couldn't update that notification.",
      ),
    remove: (n: NotificationRow) =>
      run(() => deleteNotifications([n.id]), "Couldn't delete that notification."),
    clearRead: () =>
      run(
        () => deleteNotifications(items.filter((n) => n.read_at).map((n) => n.id)),
        "Couldn't clear the read notifications.",
      ),
    /** Marks it read and goes to the page it is about. */
    open: async (n: NotificationRow) => {
      if (!n.read_at) await run(() => markRead([n.id]), "Couldn't update that notification.");
      const to = safeLink(n.link);
      if (to) navigate({ to });
    },
  };
}

/** One notification: what happened, when, and what you can do with it. */
export function NotificationItem({
  n,
  onOpen,
  onSetRead,
  onRemove,
  compact = false,
}: {
  n: NotificationRow;
  onOpen: (n: NotificationRow) => void;
  onSetRead?: (n: NotificationRow, read: boolean) => void;
  onRemove?: (n: NotificationRow) => void;
  compact?: boolean;
}) {
  const meta = notificationMeta(n.type);
  const Icon = ICONS[meta.tone];
  const unread = !n.read_at;
  const leads = !!safeLink(n.link);
  return (
    <li
      data-unread={unread || undefined}
      data-type={n.type}
      className={cn("flex items-start gap-3 p-3", unread && "bg-primary/5")}
    >
      <span
        className={cn(
          "mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg",
          TONES[meta.tone],
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <button
          type="button"
          className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => onOpen(n)}
          aria-label={`${n.title}${leads ? " (open)" : ""}`}
        >
          <span className="block text-sm font-medium">{n.title}</span>
          {n.body && <span className="block text-xs text-muted-foreground">{n.body}</span>}
        </button>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
            {meta.label}
          </Badge>
          <span className="text-[11px] text-muted-foreground">{timeAgo(n.created_at)}</span>
          {unread && (
            <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
              New
            </Badge>
          )}
        </div>
        {!compact && (onSetRead || onRemove) && (
          <div className="mt-2 flex gap-1">
            {onSetRead && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={() => onSetRead(n, unread)}
              >
                {unread ? "Mark as read" : "Mark as unread"}
              </Button>
            )}
            {onRemove && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                aria-label={`Delete notification: ${n.title}`}
                onClick={() => onRemove(n)}
              >
                <Trash2 className="mr-1 size-3.5" />
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

/** The bell in the top bar: unread count, the latest few notifications, and a link to all of them. */
export function NotificationsBell() {
  const n = useNotifications();
  const [open, setOpen] = useState(false);
  const latest = n.items.slice(0, 8);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={
            n.unread.length ? `Notifications (${n.unread.length} unread)` : "Notifications"
          }
        >
          <Bell className="size-5" />
          {n.unread.length > 0 && (
            <span
              data-testid="unread-count"
              className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
            >
              {n.unread.length > 9 ? "9+" : n.unread.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border p-3">
          <p className="text-sm font-semibold">Notifications</p>
          <Button variant="ghost" size="sm" onClick={n.markAllRead} disabled={!n.unread.length}>
            <CheckCheck className="mr-1 size-4" />
            Mark all read
          </Button>
        </div>
        <ScrollArea className="max-h-80">
          {n.query.isError ? (
            <p role="alert" className="p-6 text-center text-sm text-destructive">
              Couldn't load notifications. {(n.query.error as Error).message}
            </p>
          ) : latest.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">You're all caught up.</p>
          ) : (
            <ul className="divide-y divide-border">
              {latest.map((item) => (
                <NotificationItem
                  key={item.id}
                  n={item}
                  compact
                  onOpen={(x) => {
                    setOpen(false);
                    void n.open(x);
                  }}
                />
              ))}
            </ul>
          )}
        </ScrollArea>
        <div className="border-t border-border p-2 text-center">
          <Button variant="ghost" size="sm" asChild onClick={() => setOpen(false)}>
            <Link to="/notifications">View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** The full list for the Notifications page, grouped by day. */
export function NotificationFeed({
  filter,
  center,
}: {
  filter: "all" | "unread";
  center: ReturnType<typeof useNotifications>;
}) {
  const shown = filter === "unread" ? center.unread : center.items;
  const groups = groupByDay(shown);
  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <section key={g.label} aria-label={g.label}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {g.label}
          </h3>
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {g.items.map((item) => (
              <NotificationItem
                key={item.id}
                n={item}
                onOpen={(x) => void center.open(x)}
                onSetRead={(x, read) => void center.setRead(x, read)}
                onRemove={(x) => void center.remove(x)}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
