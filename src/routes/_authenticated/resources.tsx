import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app/AppShell";
import { ResourcesPanel } from "@/components/app/ResourcesPanel";
import { CardSkeletons, ErrorState } from "@/components/app/states";
import { fetchMyTeams, fetchResources } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/resources")({
  head: () => ({
    meta: [
      { title: "Resources — TeamUp" },
      { name: "description", content: "Shared notes, links and files for every study team." },
      { property: "og:title", content: "Resources — TeamUp" },
      {
        property: "og:description",
        content: "Shared notes, links and files for every study team.",
      },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const teamsQuery = useQuery({ queryKey: ["teams"], queryFn: fetchMyTeams });
  const teamIds = (teamsQuery.data ?? []).map((t) => t.id);
  const resourcesQuery = useQuery({
    queryKey: ["resources", teamIds],
    queryFn: () => fetchResources(teamIds),
    enabled: teamsQuery.isSuccess,
  });

  return (
    <AppShell title="Resources" description="Everything your teams have shared, in one place.">
      {teamsQuery.isLoading || resourcesQuery.isLoading ? (
        <CardSkeletons count={3} />
      ) : resourcesQuery.error ? (
        <ErrorState
          message={(resourcesQuery.error as Error).message}
          onRetry={() => resourcesQuery.refetch()}
        />
      ) : (
        <ResourcesPanel resources={resourcesQuery.data ?? []} teams={teamsQuery.data ?? []} />
      )}
    </AppShell>
  );
}
