import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "motion/react";
import { Compass, Loader2, Search, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { CardSkeletons, EmptyState } from "@/components/app/states";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InviteToTeamDialog, type ManagedTeam } from "@/components/app/teams/InviteStudents";
import { UserAvatar } from "@/components/app/profile/UserAvatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { accentClasses, fetchMyTeams } from "@/lib/queries";
import { courseLabel as formatCourse } from "@/lib/profile-data";
import { cancelJoinRequest, requestToJoin } from "@/lib/team-queries";
import { canManage, requestState, type Role } from "@/lib/team-rules";
import { fadeUp, stagger } from "@/lib/motion";

export const Route = createFileRoute("/_authenticated/discover")({
  head: () => ({
    meta: [
      { title: "Discover teams — TeamUp" },
      { name: "description", content: "Find public study teams by course, skill or keyword." },
      { property: "og:title", content: "Discover teams — TeamUp" },
      { property: "og:description", content: "Browse public study teams looking for members." },
    ],
  }),
  component: Discover,
});

function Discover() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");

  const query = useQuery({
    queryKey: ["discover"],
    queryFn: async () => {
      const [teams, memberships, requests, courses] = await Promise.all([
        supabase.from("teams").select("*").eq("visibility", "public"),
        supabase.from("team_members").select("team_id"),
        supabase.from("join_requests").select("id, team_id, status, decided_at"),
        supabase.from("courses").select("*"),
      ]);
      if (teams.error) throw new Error(teams.error.message);
      return {
        teams: teams.data ?? [],
        memberIds: new Set((memberships.data ?? []).map((m) => m.team_id)),
        requests: requests.data ?? [],
        courses: courses.data ?? [],
      };
    },
    enabled: !!user,
  });

  const peopleQuery = useQuery({
    queryKey: ["discover-people"],
    queryFn: async () => {
      const [profiles, userSkills, skills, userCourses, courses] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, display_name, avatar_url, university, major, bio, timezone, is_sample")
          .eq("discoverable", true),
        supabase.from("user_skills").select("user_id, skill_id, level"),
        supabase.from("skills").select("id, name"),
        supabase.from("user_courses").select("user_id, course_id"),
        supabase.from("courses").select("id, code, title"),
      ]);
      if (profiles.error) throw new Error(profiles.error.message);
      const skillName = new Map((skills.data ?? []).map((s) => [s.id, s.name]));
      const courseLabel = new Map((courses.data ?? []).map((c) => [c.id, formatCourse(c)]));
      return (profiles.data ?? [])
        .filter((p) => p.id !== user?.id)
        .map((p) => ({
          ...p,
          skills: (userSkills.data ?? [])
            .filter((s) => s.user_id === p.id)
            .map((s) => skillName.get(s.skill_id) ?? "")
            .filter(Boolean),
          courses: (userCourses.data ?? [])
            .filter((c) => c.user_id === p.id)
            .map((c) => courseLabel.get(c.course_id) ?? "")
            .filter(Boolean),
        }));
    },
    enabled: !!user,
  });

  const term = q.trim().toLowerCase();
  const courseName = (id: string | null) => {
    const c = query.data?.courses.find((x) => x.id === id);
    return c ? `${c.code} ${c.title}` : null;
  };
  const results = (query.data?.teams ?? []).filter((t) => {
    if (!term) return true;
    return (
      t.name.toLowerCase().includes(term) ||
      (t.description ?? "").toLowerCase().includes(term) ||
      (t.project_goal ?? "").toLowerCase().includes(term) ||
      (courseName(t.course_id) ?? "").toLowerCase().includes(term)
    );
  });

  const [askTeam, setAskTeam] = useState<{ id: string; name: string } | null>(null);
  const [askMessage, setAskMessage] = useState("");
  const [asking, setAsking] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [inviting, setInviting] = useState<{ id: string; name: string } | null>(null);

  // Teams I can invite people to (I own or administer them).
  const myTeamsQuery = useQuery({ queryKey: ["teams"], queryFn: fetchMyTeams, enabled: !!user });
  const managedTeams: ManagedTeam[] = (myTeamsQuery.data ?? [])
    .filter((t) => canManage(t.role as Role))
    .map((t) => ({ id: t.id, name: t.name, role: t.role as Role }));

  async function sendRequest() {
    if (!askTeam) return;
    setAsking(true);
    try {
      await requestToJoin(askTeam.id, askMessage);
      toast.success(`Request sent. The owners of ${askTeam.name} will review it.`);
      setAskTeam(null);
      setAskMessage("");
      await queryClient.invalidateQueries({ queryKey: ["discover"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't send your request.");
    } finally {
      setAsking(false);
    }
  }

  async function withdraw(requestId: string) {
    setCancelling(requestId);
    try {
      await cancelJoinRequest(requestId);
      toast.success("Request cancelled.");
      await queryClient.invalidateQueries({ queryKey: ["discover"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't cancel the request.");
    } finally {
      setCancelling(null);
    }
  }

  const people = (peopleQuery.data ?? []).filter((p) => {
    if (!term) return true;
    return (
      p.display_name.toLowerCase().includes(term) ||
      (p.university ?? "").toLowerCase().includes(term) ||
      (p.major ?? "").toLowerCase().includes(term) ||
      (p.bio ?? "").toLowerCase().includes(term) ||
      p.skills.some((s) => s.toLowerCase().includes(term)) ||
      p.courses.some((c) => c.toLowerCase().includes(term))
    );
  });

  return (
    <AppShell
      title="Discover"
      description="Public study teams and classmates open to collaborating."
    >
      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by course, skill or keyword"
          className="pl-9"
          aria-label="Search teams and people"
        />
      </div>

      <Tabs defaultValue="teams">
        <TabsList className="mb-5">
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
        </TabsList>

        <TabsContent value="people">
          {peopleQuery.isLoading ? (
            <CardSkeletons />
          ) : people.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No classmates match"
              description="Only students who turned on discoverability in Settings appear here."
            />
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {people.map((p) => (
                <motion.article
                  key={p.id}
                  variants={fadeUp}
                  className="surface-card hover-lift p-5"
                >
                  <div className="flex items-start gap-3">
                    <UserAvatar name={p.display_name} path={p.avatar_url} className="size-10" />
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">{p.display_name}</h3>
                      <p className="truncate text-xs text-muted-foreground">
                        {[p.major, p.university].filter(Boolean).join(" · ") || "Student"}
                      </p>
                    </div>
                    {p.is_sample && (
                      <Badge variant="outline" className="ml-auto shrink-0">
                        Sample
                      </Badge>
                    )}
                  </div>
                  {p.bio && (
                    <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{p.bio}</p>
                  )}
                  {p.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.skills.slice(0, 5).map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {p.courses.length > 0 && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Courses: {p.courses.slice(0, 3).join(", ")}
                    </p>
                  )}
                  {managedTeams.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-4"
                      onClick={() => setInviting({ id: p.id, name: p.display_name })}
                    >
                      <UserPlus className="mr-1.5 size-4" />
                      Invite to a team
                    </Button>
                  )}
                </motion.article>
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="teams">
          {query.isLoading ? (
            <CardSkeletons />
          ) : results.length === 0 ? (
            <EmptyState
              icon={Compass}
              title="No public teams match"
              description="Try a different keyword, or create a public team so classmates can find you."
            />
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {results.map((t) => {
                const isMember = query.data?.memberIds.has(t.id);
                const myRequest = query.data?.requests.find((r) => r.team_id === t.id);
                const state = requestState(myRequest);
                return (
                  <motion.article
                    key={t.id}
                    variants={fadeUp}
                    className="surface-card hover-lift p-5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold">{t.name}</h3>
                      <Badge variant="outline" className={accentClasses(t.accent)}>
                        public
                      </Badge>
                    </div>
                    {courseName(t.course_id) && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {courseName(t.course_id)}
                      </p>
                    )}
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {t.description || t.project_goal || "No description yet."}
                    </p>
                    <div className="mt-4">
                      {isMember ? (
                        <Badge variant="secondary">You're a member</Badge>
                      ) : state.kind === "pending" && myRequest ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Request pending</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={cancelling === myRequest.id}
                            onClick={() => withdraw(myRequest.id)}
                          >
                            {cancelling === myRequest.id && (
                              <Loader2 className="mr-1.5 size-4 animate-spin" />
                            )}
                            Cancel request
                          </Button>
                        </div>
                      ) : state.kind === "wait" ? (
                        <Badge variant="outline">
                          Declined. You can ask again on {state.retryOn.toLocaleDateString()}
                        </Badge>
                      ) : (
                        <Button size="sm" onClick={() => setAskTeam({ id: t.id, name: t.name })}>
                          Request to join
                        </Button>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!askTeam} onOpenChange={(v) => !v && setAskTeam(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request to join {askTeam?.name}</DialogTitle>
            <DialogDescription>
              The team owner and admins will see your name, courses and skills with your message,
              then approve or decline.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Textarea
              aria-label="Message to the team"
              rows={3}
              maxLength={300}
              placeholder="Say hi and why you would like to join (optional)"
              value={askMessage}
              onChange={(e) => setAskMessage(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{askMessage.length}/300</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAskTeam(null)}>
              Cancel
            </Button>
            <Button onClick={sendRequest} disabled={asking}>
              {asking && <Loader2 className="mr-2 size-4 animate-spin" />}
              Send request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InviteToTeamDialog
        person={inviting}
        teams={managedTeams}
        open={!!inviting}
        onOpenChange={(v) => !v && setInviting(null)}
      />
    </AppShell>
  );
}
