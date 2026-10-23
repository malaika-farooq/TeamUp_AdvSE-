import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/frontend/components/layout/AppShell";
import { TaskBoard } from "@/frontend/features/tasks/components/TaskBoard";
import { CardSkeletons, ErrorState } from "@/frontend/components/shared/states";
import { fetchMyTeams } from "@/frontend/features/teams/api/queries";
import { fetchTasks } from "@/frontend/features/tasks/api/queries";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — TeamUp" },
      { name: "description", content: "Plan, assign and track every study task on one board." },
      { property: "og:title", content: "Tasks — TeamUp" },
      {
        property: "og:description",
        content: "Plan, assign and track every study task on one board.",
      },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  const teamsQuery = useQuery({ queryKey: ["teams"], queryFn: fetchMyTeams });
  const teamIds = (teamsQuery.data ?? []).map((t) => t.id);
  const tasksQuery = useQuery({
    queryKey: ["tasks", teamIds],
    queryFn: () => fetchTasks(teamIds),
    enabled: teamsQuery.isSuccess,
  });

  useEffect(() => {
    if (!teamIds.length) return;
    const channel = supabase
      .channel("tasks-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamIds.join(","), queryClient]);

  return (
    <AppShell
      title="Tasks"
      description="Drag cards between columns or use the status menu for keyboard control."
    >
      {teamsQuery.isLoading || tasksQuery.isLoading ? (
        <CardSkeletons count={4} />
      ) : tasksQuery.error ? (
        <ErrorState
          message={(tasksQuery.error as Error).message}
          onRetry={() => tasksQuery.refetch()}
        />
      ) : (
        <TaskBoard
          tasks={tasksQuery.data ?? []}
          teams={teamsQuery.data ?? []}
          createOpen={createOpen}
          onCreateOpenChange={setCreateOpen}
        />
      )}
    </AppShell>
  );
}
