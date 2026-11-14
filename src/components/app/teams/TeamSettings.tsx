import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { ACCENTS, type Team } from "@/lib/queries";
import { courseLabel, parseCourse } from "@/lib/profile-data";
import { ensureCourse } from "@/lib/team-queries";
import { canChangeVisibility, canEditTeamDetails, type Role } from "@/lib/team-rules";

const selectClass = "h-9 w-full rounded-md border border-input bg-background px-2 text-sm";

/** Edit a team's details. Owners and admins can; only the owner can switch public/private. */
export function TeamSettings({ team, myRole }: { team: Team; myRole: Role }) {
  const queryClient = useQueryClient();
  const editable = canEditTeamDetails(myRole);
  const mayChangeVisibility = canChangeVisibility(myRole);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: team.name,
    description: team.description ?? "",
    course: "",
    goal: team.project_goal ?? "",
    deadline: team.deadline ?? "",
    visibility: team.visibility as string,
    accent: team.accent,
  });

  // The course is stored as an id; show it back as "CS201 Data Structures".
  const courseQuery = useQuery({
    queryKey: ["course", team.course_id],
    enabled: !!team.course_id,
    queryFn: async () => {
      const { data } = await supabase
        .from("courses")
        .select("code, title")
        .eq("id", team.course_id!)
        .maybeSingle();
      return data ? courseLabel(data).replace(" · ", " ") : "";
    },
  });
  useEffect(() => {
    if (courseQuery.data !== undefined) setForm((f) => ({ ...f, course: courseQuery.data ?? "" }));
  }, [courseQuery.data]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (form.name.trim().length < 2)
      return void toast.error("A team name needs at least 2 characters.");
    setBusy(true);
    try {
      const course = parseCourse(form.course);
      const courseId = course ? await ensureCourse(course.code, course.title) : null;
      const { error } = await supabase
        .from("teams")
        .update({
          name: form.name.trim(),
          description: form.description.trim() || null,
          course_id: courseId,
          project_goal: form.goal.trim() || null,
          deadline: form.deadline || null,
          accent: form.accent,
          ...(mayChangeVisibility ? { visibility: form.visibility as "public" | "private" } : {}),
        })
        .eq("id", team.id);
      if (error) throw new Error(error.message);
      toast.success("Team settings saved");
      await queryClient.invalidateQueries();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save the team settings.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="surface-card max-w-2xl space-y-4 p-6">
      <div className="space-y-1.5">
        <Label htmlFor="ts-name">Team name</Label>
        <Input
          id="ts-name"
          value={form.name}
          disabled={!editable}
          maxLength={80}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ts-desc">Description</Label>
        <Textarea
          id="ts-desc"
          rows={2}
          value={form.description}
          disabled={!editable}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="ts-course">Course</Label>
          <Input
            id="ts-course"
            placeholder="CS201 Data Structures"
            value={form.course}
            disabled={!editable}
            onChange={(e) => setForm({ ...form, course: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ts-deadline">Deadline</Label>
          <Input
            id="ts-deadline"
            type="date"
            value={form.deadline}
            disabled={!editable}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ts-goal">Project goal</Label>
        <Textarea
          id="ts-goal"
          rows={2}
          value={form.goal}
          disabled={!editable}
          onChange={(e) => setForm({ ...form, goal: e.target.value })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="ts-visibility">Who can find this team</Label>
          <select
            id="ts-visibility"
            className={selectClass}
            value={form.visibility}
            disabled={!mayChangeVisibility}
            onChange={(e) => setForm({ ...form, visibility: e.target.value })}
          >
            <option value="private">Private: invite only</option>
            <option value="public">Public: listed in Discover</option>
          </select>
          {!mayChangeVisibility && (
            <p className="text-xs text-muted-foreground">Only the team owner can change this.</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ts-accent">Accent colour</Label>
          <select
            id="ts-accent"
            className={selectClass}
            value={form.accent}
            disabled={!editable}
            onChange={(e) => setForm({ ...form, accent: e.target.value })}
          >
            {ACCENTS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>
      {form.visibility === "private" && team.visibility === "public" && (
        <p className="text-sm text-muted-foreground">
          Making this team private hides it from Discover. Current members stay, and open join
          requests are kept until someone answers them.
        </p>
      )}
      <Button type="submit" disabled={busy || !editable}>
        {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
        Save settings
      </Button>
    </form>
  );
}
