import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { History, Loader2 } from "lucide-react";
import { UserAvatar } from "@/components/app/profile/UserAvatar";
import { EmptyState, ErrorState } from "@/components/app/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { MemberWithProfile } from "@/lib/queries";
import { groupByDay, timeAgo } from "@/lib/notifications";
import {
  ACTIVITY_GROUPS,
  NO_ACTIVITY_FILTERS,
  activityMeta,
  type ActivityFilters,
  type ActivityGroup,
} from "@/lib/progress";
import { ACTIVITY_PAGE_SIZE, fetchActivityPage } from "@/lib/team-progress";

const selectClass = "h-9 rounded-md border border-input bg-background px-2 text-sm";

/** Everything that has happened in the team, newest first, with filters and "Load more". */
export function ActivityHistory({
  teamId,
  members,
}: {
  teamId: string;
  members: MemberWithProfile[];
}) {
  const [filters, setFilters] = useState<ActivityFilters>(NO_ACTIVITY_FILTERS);
  const person = (id: string) => members.find((m) => m.user_id === id);

  const query = useInfiniteQuery({
    queryKey: ["activity", "history", teamId, filters],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => fetchActivityPage(teamId, filters, pageParam),
    getNextPageParam: (last) =>
      last.length === ACTIVITY_PAGE_SIZE ? last[last.length - 1]!.created_at : undefined,
  });
  const items = (query.data?.pages ?? []).flat();
  const groups = groupByDay(items);
  const filtered = filters.actor !== "all" || filters.group !== "all" || filters.days > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor="ah-person" className="text-xs">
            Person
          </Label>
          <select
            id="ah-person"
            className={selectClass}
            value={filters.actor}
            onChange={(e) => setFilters({ ...filters, actor: e.target.value })}
          >
            <option value="all">Everyone</option>
            {members.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.profile?.display_name ?? "Teammate"}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="ah-type" className="text-xs">
            Type
          </Label>
          <select
            id="ah-type"
            className={selectClass}
            value={filters.group}
            onChange={(e) => setFilters({ ...filters, group: e.target.value as ActivityGroup | "all" })}
          >
            {ACTIVITY_GROUPS.map((g) => (
              <option key={g.key} value={g.key}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="ah-when" className="text-xs">
            When
          </Label>
          <select
            id="ah-when"
            className={selectClass}
            value={filters.days}
            onChange={(e) => setFilters({ ...filters, days: Number(e.target.value) })}
          >
            <option value={0}>All time</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
        {filtered && (
          <Button variant="ghost" size="sm" onClick={() => setFilters(NO_ACTIVITY_FILTERS)}>
            Clear filters
          </Button>
        )}
      </div>

      {query.isLoading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
          <Loader2 className="size-4 animate-spin" /> Loading history…
        </p>
      ) : query.isError ? (
        <ErrorState
          title="Couldn't load the activity history"
          message={(query.error as Error).message}
          onRetry={() => void query.refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={History}
          title={filtered ? "Nothing matches these filters" : "No activity yet"}
          description={
            filtered
              ? "Try a different person, type or time period."
              : "Task updates, new notes and meetings appear here as your team works."
          }
        />
      ) : (
        <div className="space-y-5">
          {groups.map((g) => (
            <section key={g.label} aria-label={g.label}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {g.label}
              </h3>
              <ol className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                {g.items.map((a) => {
                  const who = person(a.actor_id);
                  const name = who?.profile?.display_name ?? "A former member";
                  const meta = activityMeta(a.action);
                  return (
                    <li key={a.id} className="flex items-start gap-3 p-4 text-sm" data-action={a.action}>
                      <UserAvatar name={name} path={who?.profile?.avatar_url} className="size-7" />
                      <div className="min-w-0 flex-1">
                        <p>
                          <span className="font-medium">{name}</span> {a.summary}
                        </p>
                        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                            {meta.label}
                          </Badge>
                          <span title={new Date(a.created_at).toLocaleString()}>{timeAgo(a.created_at)}</span>
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing {items.length} event{items.length === 1 ? "" : "s"}
            </span>
            {query.hasNextPage && (
              <Button variant="outline" size="sm" onClick={() => void query.fetchNextPage()} disabled={query.isFetchingNextPage}>
                {query.isFetchingNextPage && <Loader2 className="mr-2 size-4 animate-spin" />}
                Load more
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
