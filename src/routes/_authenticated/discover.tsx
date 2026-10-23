import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "motion/react";
import { Compass, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/frontend/components/layout/AppShell";
import { CardSkeletons, EmptyState } from "@/frontend/components/shared/states";
import { Button } from "@/frontend/components/ui/button";
import { Badge } from "@/frontend/components/ui/badge";
import { Input } from "@/frontend/components/ui/input";
import { Avatar, AvatarFallback } from "@/frontend/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/frontend/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/frontend/features/auth/providers/AuthProvider";
import { accentClasses } from "@/frontend/features/teams/presentation";
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
        supabase.from("join_requests").select("team_id, status"),
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
          .select("id, display_name, university, major, bio, timezone, is_sample")
          .eq("discoverable", true),
        supabase.from("user_skills").select("user_id, skill_id, level"),
        supabase.from("skills").select("id, name"),
        supabase.from("user_courses").select("user_id, course_id"),
        supabase.from("courses").select("id, code, title"),
      ]);
      if (profiles.error) throw new Error(profiles.error.message);
      const skillName = new Map((skills.data ?? []).map((s) => [s.id, s.name]));
      const courseLabel = new Map((courses.data ?? []).map((c) => [c.id, `${c.code} ${c.title}`]));
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

  async function requestJoin(teamId: string) {
    if (!user) return;
    const { error } = await supabase
      .from("join_requests")
      .insert({ team_id: teamId, user_id: user.id, message: "I'd like to join this team." });
    if (error) {
      toast.error(
        error.message.includes("duplicate")
          ? "You've already requested to join this team."
          : error.message,
      );
      return;
    }
    toast.success("Join request sent — the team owner will review it.");
    queryClient.invalidateQueries({ queryKey: ["discover"] });
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
                    <Avatar className="size-10">
                      <AvatarFallback>
                        {p.display_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
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
                const pending = query.data?.requests.find(
                  (r) => r.team_id === t.id && r.status === "pending",
                );
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
                      ) : pending ? (
                        <Badge variant="secondary">Request pending</Badge>
                      ) : (
                        <Button size="sm" onClick={() => requestJoin(t.id)}>
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
    </AppShell>
  );
}
