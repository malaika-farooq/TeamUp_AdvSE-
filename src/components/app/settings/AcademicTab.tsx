import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CoursesEditor } from "@/components/app/profile/CoursesEditor";
import { SkillsEditor } from "@/components/app/profile/SkillsEditor";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import type { CourseInput, SkillInput } from "@/lib/profile-data";
import {
  loadMyCourses,
  loadMySkills,
  loadSuggestions,
  saveCourses,
  saveSkills,
} from "@/lib/profile-queries";

/** Settings > Courses & skills: enrolled courses and skills with a 1-5 level, saved together. */
export function AcademicTab() {
  const { user } = useAuth();
  const userId = user?.id;
  const coursesQuery = useQuery({
    queryKey: ["my-courses", userId],
    queryFn: () => loadMyCourses(userId!),
    enabled: !!userId,
  });
  const skillsQuery = useQuery({
    queryKey: ["my-skills", userId],
    queryFn: () => loadMySkills(userId!),
    enabled: !!userId,
  });
  const suggestionsQuery = useQuery({
    queryKey: ["profile-suggestions"],
    queryFn: loadSuggestions,
    staleTime: 5 * 60_000,
  });

  // Editable copies; "Save" writes them to the database in one go.
  const [courses, setCourses] = useState<CourseInput[]>([]);
  const [skills, setSkills] = useState<SkillInput[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (coursesQuery.data) setCourses(coursesQuery.data);
  }, [coursesQuery.data]);
  useEffect(() => {
    if (skillsQuery.data) setSkills(skillsQuery.data);
  }, [skillsQuery.data]);

  const dirty =
    JSON.stringify(courses) !== JSON.stringify(coursesQuery.data ?? []) ||
    JSON.stringify(skills) !== JSON.stringify(skillsQuery.data ?? []);

  async function save() {
    setSaving(true);
    try {
      await saveCourses(courses);
      await saveSkills(skills);
      toast.success("Courses and skills saved");
      await Promise.all([
        coursesQuery.refetch(),
        skillsQuery.refetch(),
        suggestionsQuery.refetch(),
      ]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save your courses and skills.");
    } finally {
      setSaving(false);
    }
  }

  const loadError = coursesQuery.isError
    ? (coursesQuery.error as Error)
    : skillsQuery.isError
      ? (skillsQuery.error as Error)
      : null;

  return (
    <div className="surface-card max-w-3xl space-y-6 p-6">
      {loadError && (
        <div role="alert" className="space-y-2 text-sm text-destructive">
          <p>Couldn't load your saved courses and skills. {loadError.message}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void coursesQuery.refetch();
              void skillsQuery.refetch();
            }}
          >
            Try again
          </Button>
        </div>
      )}
      <CoursesEditor
        value={courses}
        onChange={setCourses}
        suggestions={suggestionsQuery.data?.courses ?? []}
      />
      <hr className="border-border" />
      <SkillsEditor
        value={skills}
        onChange={setSkills}
        suggestions={suggestionsQuery.data?.skills ?? []}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={save} disabled={saving || !dirty}>
          {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
          Save courses &amp; skills
        </Button>
        {dirty && <span className="text-sm text-muted-foreground">You have unsaved changes.</span>}
      </div>
    </div>
  );
}
