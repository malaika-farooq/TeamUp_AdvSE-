import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { CalendarClock, Check, Handshake, Loader2, Sparkles, Users, X } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState, ErrorState } from "@/components/app/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { readableError } from "@/lib/ai-client";

export const Route = createFileRoute("/_authenticated/partners")({
  head: () => ({
    meta: [
      { title: "Study Partners — TeamUp" },
      { name: "description", content: "Your study partner requests, partners and study sessions." },
    ],
  }),
  component: PartnersPage,
});

function fmtWhen(d: Date) {
  return d.toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function PartnersPage() {
  const queryClient = useQueryClient();
  const requestsQuery = useQuery({
    queryKey: ["partner-requests"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("my_partner_requests");
      if (error) throw error;
      return data ?? [];
    },
  });
  const incoming = (requestsQuery.data ?? []).filter((r) => r.direction === "incoming" && r.status === "pending");
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["partner-requests"] });
    void queryClient.invalidateQueries({ queryKey: ["study-sessions"] });
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  return (
    <AppShell
      title="Study Partners"
      description="Answer requests, see your partners and your upcoming study sessions."
      actions={
        <Button variant="outline" asChild>
          <Link to="/assistant">
            <Sparkles className="mr-2 size-4" />
            Find partners with AI
          </Link>
        </Button>
      }
    >
      <Tabs defaultValue={incoming.length ? "requests" : "partners"} className="space-y-5">
        <TabsList className="flex flex-wrap justify-start">
          <TabsTrigger value="requests">
            Requests{incoming.length > 0 && <Badge className="ml-2">{incoming.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="partners">My partners</TabsTrigger>
          <TabsTrigger value="sessions">Study sessions</TabsTrigger>
        </TabsList>
        <TabsContent value="requests">
          <RequestsTab query={requestsQuery} onChanged={refresh} />
        </TabsContent>
        <TabsContent value="partners">
          <PartnersTab query={requestsQuery} />
        </TabsContent>
        <TabsContent value="sessions">
          <SessionsTab onChanged={refresh} />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

/* --------------------------------- Requests --------------------------------- */

type RequestsQuery = UseQueryResult<Database["public"]["Functions"]["my_partner_requests"]["Returns"]>;

function RequestsTab({ query, onChanged }: { query: RequestsQuery; onChanged: () => void }) {
  const respond = useMutation({
    mutationFn: async ({ id, accept }: { id: string; accept: boolean }) => {
      const { error } = await supabase.rpc("respond_partner_request", { _request: id, _accept: accept });
      if (error) throw error;
      return accept;
    },
    onSuccess: (accept) => {
      toast.success(accept ? "You're now study partners." : "Request declined.");
      onChanged();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't update the request."),
  });

  if (query.isLoading) return <Loader2 className="size-5 animate-spin" />;
  if (query.isError) return <ErrorState title="Couldn't load requests" message={readableError(query.error)} onRetry={() => query.refetch()} />;
  const rows = query.data ?? [];
  if (!rows.length) {
    return <EmptyState icon={Handshake} title="No requests yet" description="Requests you send or receive show up here." />;
  }
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {rows.map((r) => (
        <li key={r.id} className="surface-card space-y-2 p-4">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{r.other_name}</p>
            <Badge variant="outline" className="ml-auto capitalize">
              {r.direction === "incoming" ? "Wants to study with you" : "You asked"} · {r.status}
            </Badge>
          </div>
          {r.other_major && <p className="text-xs text-muted-foreground">{r.other_major}</p>}
          {r.message && <p className="text-sm">{r.message}</p>}
          {r.direction === "incoming" && r.status === "pending" && (
            <div className="flex gap-2">
              <Button size="sm" disabled={respond.isPending} onClick={() => respond.mutate({ id: r.id, accept: true })}>
                <Check className="mr-1 size-4" />
                Accept
              </Button>
              <Button size="sm" variant="outline" disabled={respond.isPending} onClick={() => respond.mutate({ id: r.id, accept: false })}>
                <X className="mr-1 size-4" />
                Decline
              </Button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

/* --------------------------------- Partners --------------------------------- */

function PartnersTab({ query }: { query: RequestsQuery }) {
  if (query.isLoading) return <Loader2 className="size-5 animate-spin" />;
  const partners = (query.data ?? []).filter((r) => r.status === "accepted");
  if (!partners.length) {
    return (
      <EmptyState
        icon={Users}
        title="No study partners yet"
        description="Use the AI Assistant to find students who fit your courses, skills, free time and workload."
        action={
          <Button asChild>
            <Link to="/assistant">
              <Sparkles className="mr-2 size-4" />
              Find partners with AI
            </Link>
          </Button>
        }
      />
    );
  }
  return (
    <div className="space-y-4">
      <ul className="grid gap-3 md:grid-cols-2">
        {partners.map((r) => (
          <li key={r.id} className="surface-card flex items-center gap-3 p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-navy font-display text-sm font-bold text-navy-foreground">
              {r.other_name.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{r.other_name}</p>
              {r.other_major && <p className="truncate text-xs text-muted-foreground">{r.other_major}</p>}
            </div>
          </li>
        ))}
      </ul>
      <Button variant="outline" asChild>
        <Link to="/assistant">
          <CalendarClock className="mr-2 size-4" />
          Plan a study session with AI
        </Link>
      </Button>
    </div>
  );
}

/* --------------------------------- Sessions --------------------------------- */

function SessionsTab({ onChanged }: { onChanged: () => void }) {
  const sessionsQuery = useQuery({
    queryKey: ["study-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("my_study_sessions");
      if (error) throw error;
      return data ?? [];
    },
  });
  const respond = useMutation({
    mutationFn: async ({ id, accept }: { id: string; accept: boolean }) => {
      const { error } = await supabase.rpc("respond_study_session", { _session: id, _accept: accept });
      if (error) throw error;
      return accept;
    },
    onSuccess: (accept) => {
      toast.success(accept ? "You're in." : "Declined.");
      onChanged();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't update the invitation."),
  });

  if (sessionsQuery.isLoading) return <Loader2 className="size-5 animate-spin" />;
  if (sessionsQuery.isError) {
    return <ErrorState title="Couldn't load sessions" message={readableError(sessionsQuery.error)} onRetry={() => sessionsQuery.refetch()} />;
  }
  const rows = sessionsQuery.data ?? [];
  if (!rows.length) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="No study sessions"
        description="Plan one from My partners and your invited partners will see it here."
      />
    );
  }
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {rows.map((s) => (
        <li key={s.id} className="surface-card space-y-2 p-4">
          <div className="flex items-start gap-2">
            <div>
              <p className="font-semibold">{s.title}</p>
              <p className="text-sm">{fmtWhen(new Date(s.starts_at))}</p>
              <p className="text-xs text-muted-foreground">
                {s.is_creator ? "You organised this" : `Organised by ${s.creator_name}`}
              </p>
            </div>
            <Badge variant="outline" className="ml-auto capitalize">{s.my_status}</Badge>
          </div>
          {s.note && <p className="text-sm text-muted-foreground">{s.note}</p>}
          <div className="flex flex-wrap gap-1.5">
            {s.attendees.map((a) => (
              <Badge key={a.name} variant="secondary" className="capitalize">
                {a.name} · {a.status}
              </Badge>
            ))}
          </div>
          {s.my_status === "invited" && (
            <div className="flex gap-2">
              <Button size="sm" disabled={respond.isPending} onClick={() => respond.mutate({ id: s.id, accept: true })}>
                <Check className="mr-1 size-4" />
                Accept
              </Button>
              <Button size="sm" variant="outline" disabled={respond.isPending} onClick={() => respond.mutate({ id: s.id, accept: false })}>
                <X className="mr-1 size-4" />
                Decline
              </Button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
