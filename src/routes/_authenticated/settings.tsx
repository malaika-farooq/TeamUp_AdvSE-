import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Sparkles, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { AvailabilityEditor } from "@/components/app/profile/AvailabilityEditor";
import { CoursesEditor } from "@/components/app/profile/CoursesEditor";
import { PhotoField } from "@/components/app/profile/PhotoField";
import { SkillsEditor } from "@/components/app/profile/SkillsEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { fetchProfile } from "@/lib/queries";
import {
  profileCompleteness,
  tidy,
  totalHours,
  type CourseInput,
  type Range,
  type SkillInput,
} from "@/lib/profile-data";
import {
  changeAvatar,
  loadMyAvailability,
  loadMyCourses,
  loadMySkills,
  loadSuggestions,
  removeAvatar,
  saveAvailability,
  saveCourses,
  saveSkills,
} from "@/lib/profile-queries";
import { createSampleWorkspace, removeSampleWorkspace } from "@/lib/sample.functions";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — TeamUp" },
      { name: "description", content: "Profile, availability, theme and workspace preferences." },
      { property: "og:title", content: "Settings — TeamUp" },
      {
        property: "og:description",
        content: "Profile, availability, theme and workspace preferences.",
      },
    ],
  }),
  component: SettingsPage,
});

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const BLOCKS = [
  { label: "Morning", start: 8 * 60, end: 12 * 60 },
  { label: "Afternoon", start: 12 * 60, end: 17 * 60 },
  { label: "Evening", start: 17 * 60, end: 22 * 60 },
];

function SettingsPage() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createSample = useServerFn(createSampleWorkspace);
  const removeSample = useServerFn(removeSampleWorkspace);

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
  });
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
  const slotsQuery = useQuery({
    queryKey: ["availability", userId],
    queryFn: () => loadMyAvailability(userId!),
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
  const [ranges, setRanges] = useState<Range[]>([]);
  const [savingAcademic, setSavingAcademic] = useState(false);
  const [savingTimes, setSavingTimes] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);

  useEffect(() => {
    if (coursesQuery.data) setCourses(coursesQuery.data);
  }, [coursesQuery.data]);
  useEffect(() => {
    if (skillsQuery.data) setSkills(skillsQuery.data);
  }, [skillsQuery.data]);
  useEffect(() => {
    if (slotsQuery.data) setRanges(slotsQuery.data);
  }, [slotsQuery.data]);

  const academicDirty =
    JSON.stringify(courses) !== JSON.stringify(coursesQuery.data ?? []) ||
    JSON.stringify(skills) !== JSON.stringify(skillsQuery.data ?? []);
  const timesDirty = JSON.stringify(ranges) !== JSON.stringify(slotsQuery.data ?? []);

  async function saveAcademic() {
    setSavingAcademic(true);
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
      setSavingAcademic(false);
    }
  }

  async function saveTimes() {
    setSavingTimes(true);
    try {
      await saveAvailability(ranges);
      toast.success("Availability saved");
      await slotsQuery.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save your availability.");
    } finally {
      setSavingTimes(false);
    }
  }

  async function pickPhoto(file: File) {
    if (!user) return;
    setPhotoBusy(true);
    try {
      await changeAvatar(user.id, file, profileQuery.data?.avatar_url);
      toast.success("Photo updated");
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't upload that photo.");
    } finally {
      setPhotoBusy(false);
    }
  }

  async function dropPhoto() {
    if (!user) return;
    setPhotoBusy(true);
    try {
      await removeAvatar(user.id, profileQuery.data?.avatar_url);
      toast.success("Photo removed");
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't remove your photo.");
    } finally {
      setPhotoBusy(false);
    }
  }

  const [form, setForm] = useState({
    display_name: "",
    university: "",
    major: "",
    bio: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    discoverable: false,
  });
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [password, setPassword] = useState({ current: "", next: "" });

  useEffect(() => {
    const p = profileQuery.data;
    if (p) {
      setForm({
        display_name: p.display_name,
        university: p.university ?? "",
        major: p.major ?? "",
        bio: p.bio ?? "",
        timezone: p.timezone,
        discoverable: p.discoverable,
      });
    }
  }, [profileQuery.data]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const displayName = tidy(form.display_name);
    if (!displayName) return void toast.error("Please enter your name.");
    const timezone = form.timezone.trim() || "UTC";
    try {
      new Intl.DateTimeFormat("en", { timeZone: timezone });
    } catch {
      return void toast.error(
        "That time zone isn't recognised. Try something like America/Toronto.",
      );
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        university: tidy(form.university) || null,
        major: tidy(form.major) || null,
        bio: form.bio.trim() || null,
        timezone,
        discoverable: form.discoverable,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) return void toast.error(error.message);
    toast.success("Profile saved");
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.next.length < 8) return void toast.error("Use at least 8 characters.");
    const { error } = await supabase.auth.updateUser({
      password: password.next,
      ...(password.current ? { current_password: password.current } : {}),
    } as never);
    if (error) return void toast.error(error.message);
    toast.success("Password updated");
    setPassword({ current: "", next: "" });
  }

  const completeness = profileCompleteness({
    hasPhoto: !!profileQuery.data?.avatar_url,
    university: profileQuery.data?.university,
    major: profileQuery.data?.major,
    bio: profileQuery.data?.bio,
    courseCount: coursesQuery.data?.length ?? 0,
    skillCount: skillsQuery.data?.length ?? 0,
    availableMinutes: Math.round(totalHours(slotsQuery.data ?? []) * 60),
  });

  return (
    <AppShell title="Settings" description="Your profile, availability and app preferences.">
      <Tabs defaultValue="profile" className="space-y-5">
        <TabsList className="flex flex-wrap justify-start">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="academic">Courses &amp; skills</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-5">
          <CompletenessCard percent={completeness.percent} missing={completeness.missing} />
          <div className="surface-card max-w-xl space-y-3 p-6">
            <h3 className="font-semibold">Profile photo</h3>
            <PhotoField
              name={form.display_name || user?.email || "Student"}
              path={profileQuery.data?.avatar_url}
              busy={photoBusy}
              onPick={pickPhoto}
              onRemove={profileQuery.data?.avatar_url ? dropPhoto : undefined}
            />
          </div>
          <form onSubmit={saveProfile} className="surface-card max-w-xl space-y-4 p-6">
            <div className="space-y-1.5">
              <Label htmlFor="dn">Display name</Label>
              <Input
                id="dn"
                required
                value={form.display_name}
                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="uni">University</Label>
                <Input
                  id="uni"
                  value={form.university}
                  onChange={(e) => setForm({ ...form, university: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maj">Major</Label>
                <Input
                  id="maj"
                  value={form.major}
                  onChange={(e) => setForm({ ...form, major: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tz">Time zone</Label>
              <Input
                id="tz"
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">About you</Label>
              <Textarea
                id="bio"
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p className="text-sm font-medium">Show me in Discover</p>
                <p className="text-xs text-muted-foreground">
                  Only your name, university, major and courses are shared.
                </p>
              </div>
              <Switch
                checked={form.discoverable}
                onCheckedChange={(v) => setForm({ ...form, discoverable: v })}
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}Save profile
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="academic">
          <div className="surface-card max-w-3xl space-y-6 p-6">
            {(coursesQuery.isError || skillsQuery.isError) && (
              <p role="alert" className="text-sm text-destructive">
                Couldn't load your saved courses and skills.{" "}
                {((coursesQuery.error ?? skillsQuery.error) as Error | null)?.message}
              </p>
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
              <Button onClick={saveAcademic} disabled={savingAcademic || !academicDirty}>
                {savingAcademic && <Loader2 className="mr-2 size-4 animate-spin" />}
                Save courses &amp; skills
              </Button>
              {academicDirty && (
                <span className="text-sm text-muted-foreground">You have unsaved changes.</span>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="availability">
          <div className="surface-card max-w-3xl space-y-5 p-6">
            {slotsQuery.isError && (
              <p role="alert" className="text-sm text-destructive">
                Couldn't load your saved availability. {(slotsQuery.error as Error | null)?.message}
              </p>
            )}
            <AvailabilityEditor value={ranges} onChange={setRanges} />
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={saveTimes} disabled={savingTimes || !timesDirty}>
                {savingTimes && <Loader2 className="mr-2 size-4 animate-spin" />}
                Save availability
              </Button>
              {timesDirty && (
                <span className="text-sm text-muted-foreground">You have unsaved changes.</span>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appearance">
          <div className="surface-card flex max-w-xl items-center justify-between p-6">
            <div>
              <p className="font-medium">Dark theme</p>
              <p className="text-sm text-muted-foreground">
                Your choice is remembered on this device.
              </p>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
            />
          </div>
        </TabsContent>

        <TabsContent value="account" className="space-y-5">
          <form onSubmit={changePassword} className="surface-card max-w-xl space-y-4 p-6">
            <h3 className="font-semibold">Change password</h3>
            <div className="space-y-1.5">
              <Label htmlFor="cp">Current password</Label>
              <Input
                id="cp"
                type="password"
                value={password.current}
                onChange={(e) => setPassword({ ...password, current: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="np">New password</Label>
              <Input
                id="np"
                type="password"
                required
                value={password.next}
                onChange={(e) => setPassword({ ...password, next: e.target.value })}
              />
            </div>
            <Button type="submit" variant="outline">
              Update password
            </Button>
          </form>

          <div className="surface-card max-w-xl space-y-3 p-6">
            <h3 className="font-semibold">Sample workspace</h3>
            <p className="text-sm text-muted-foreground">
              Creates a clearly labelled demo team visible only to you, with example tasks, sessions
              and notes. Remove it any time.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={busy === "create"}
                onClick={async () => {
                  setBusy("create");
                  try {
                    await createSample({ data: undefined });
                    toast.success("Sample workspace created");
                    queryClient.invalidateQueries();
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Couldn't create the sample.");
                  } finally {
                    setBusy(null);
                  }
                }}
              >
                {busy === "create" ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 size-4" />
                )}
                Create sample workspace
              </Button>
              <Button
                variant="outline"
                disabled={busy === "remove"}
                onClick={async () => {
                  setBusy("remove");
                  try {
                    await removeSample({ data: undefined });
                    toast.success("Sample workspace removed");
                    queryClient.invalidateQueries();
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Couldn't remove the sample.");
                  } finally {
                    setBusy(null);
                  }
                }}
              >
                <Trash2 className="mr-2 size-4" />
                Remove sample
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={async () => {
              await queryClient.cancelQueries();
              queryClient.clear();
              await signOut();
              navigate({ to: "/auth", replace: true });
            }}
          >
            Sign out
          </Button>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function CompletenessCard({ percent, missing }: { percent: number; missing: string[] }) {
  return (
    <div className="surface-card max-w-xl space-y-3 p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Profile completeness</h3>
        <span className="text-sm font-medium">{percent}%</span>
      </div>
      <Progress value={percent} aria-label="Profile completeness" />
      {missing.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Your profile is complete. Great for matching!
        </p>
      ) : (
        <ul className="list-disc space-y-0.5 pl-5 text-sm text-muted-foreground">
          {missing.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
