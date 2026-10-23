import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/frontend/components/layout/AppShell";
import { SessionsPanel } from "@/frontend/features/sessions/components/SessionsPanel";
import { CardSkeletons, ErrorState } from "@/frontend/components/shared/states";
import { fetchMyTeams } from "@/frontend/features/teams/api/queries";
import { fetchSessions } from "@/frontend/features/sessions/api/queries";
import { fetchTasks } from "@/frontend/features/tasks/api/queries";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — TeamUp" },
      {
        name: "description",
        content: "Study sessions and task deadlines together, in your own timezone.",
      },
      { property: "og:title", content: "Calendar — TeamUp" },
      {
        property: "og:description",
        content: "Study sessions and task deadlines together, in your own timezone.",
      },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const teamsQuery = useQuery({ queryKey: ["teams"], queryFn: fetchMyTeams });
  const teamIds = (teamsQuery.data ?? []).map((t) => t.id);
  const sessionsQuery = useQuery({
    queryKey: ["sessions", teamIds],
    queryFn: () => fetchSessions(teamIds),
    enabled: teamsQuery.isSuccess,
  });
  const tasksQuery = useQuery({
    queryKey: ["tasks", teamIds],
    queryFn: () => fetchTasks(teamIds),
    enabled: teamsQuery.isSuccess,
  });

  return (
    <AppShell title="Calendar" description="Sessions and deadlines across all of your teams.">
      {teamsQuery.isLoading || sessionsQuery.isLoading ? (
        <CardSkeletons count={3} />
      ) : sessionsQuery.error ? (
        <ErrorState
          message={(sessionsQuery.error as Error).message}
          onRetry={() => sessionsQuery.refetch()}
        />
      ) : (
        <SessionsPanel
          sessions={sessionsQuery.data ?? []}
          tasks={tasksQuery.data ?? []}
          teams={teamsQuery.data ?? []}
        />
      )}
    </AppShell>
  );
}
