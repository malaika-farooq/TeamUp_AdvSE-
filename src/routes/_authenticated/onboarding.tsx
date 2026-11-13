import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fetchProfile } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { AvailabilityEditor } from "@/components/app/profile/AvailabilityEditor";
import { CoursesEditor } from "@/components/app/profile/CoursesEditor";
import { PhotoField } from "@/components/app/profile/PhotoField";
import { SkillsEditor } from "@/components/app/profile/SkillsEditor";
import { tidy, type CourseInput, type Range, type SkillInput } from "@/lib/profile-data";
import {
  deleteAvatarFile,
  loadMyAvailability,
  loadMyCourses,
  loadMySkills,
  loadSuggestions,
  profileError,
  saveAvailability,
  saveCourses,
  saveSkills,
  uploadAvatar,
} from "@/lib/profile-queries";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your profile — TeamUp" },
      { name: "description", content: "Tell TeamUp about your courses, skills and availability." },
      { property: "og:title", content: "Set up your profile — TeamUp" },
      {
        property: "og:description",
        content: "Courses, skills, time zone and weekly availability.",
      },
    ],
  }),
  component: Onboarding,
});

const STEPS = ["About you", "Courses & skills", "Availability"];

function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [bio, setBio] = useState("");
  const [courses, setCourses] = useState<CourseInput[]>([]);
  const [skills, setSkills] = useState<SkillInput[]>([]);
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  );
  const [ranges, setRanges] = useState<Range[]>([]);
  const [discoverable, setDiscoverable] = useState(true);

  // Anyone who comes back here keeps what they already saved instead of starting from a blank form.
  const userId = user?.id;
  const profileQuery = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
  });
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

  const prefilled = useRef({ profile: false, courses: false, skills: false, slots: false });
  useEffect(() => {
    const p = profileQuery.data;
    if (!p || prefilled.current.profile) return;
    prefilled.current.profile = true;
    // A brand-new account's name is only its email prefix, so leave that blank for them to fill in.
    const isDefaultName =
      p.display_name === (user?.email?.split("@")[0] ?? "") || p.display_name === "Student";
    setName(p.onboarded || !isDefaultName ? p.display_name : "");
    setUniversity(p.university ?? "");
    setMajor(p.major ?? "");
    setBio(p.bio ?? "");
    // New accounts store "UTC" by default; keep the browser's detected zone for them.
    if (p.onboarded && p.timezone) setTimezone(p.timezone);
    setDiscoverable(p.onboarded ? p.discoverable : true);
  }, [profileQuery.data, user?.email]);
  useEffect(() => {
    if (coursesQuery.data && !prefilled.current.courses) {
      prefilled.current.courses = true;
      setCourses(coursesQuery.data);
    }
  }, [coursesQuery.data]);
  useEffect(() => {
    if (skillsQuery.data && !prefilled.current.skills) {
      prefilled.current.skills = true;
      setSkills(skillsQuery.data);
    }
  }, [skillsQuery.data]);
  useEffect(() => {
    if (slotsQuery.data && !prefilled.current.slots) {
      prefilled.current.slots = true;
      setRanges(slotsQuery.data);
    }
  }, [slotsQuery.data]);

  useEffect(() => {
    if (!avatarFile) return setAvatarPreview(null);
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  async function finish() {
    if (!user) return;
    const zone = timezone.trim() || "UTC";
    try {
      new Intl.DateTimeFormat("en", { timeZone: zone });
    } catch {
      setStep(2);
      return void toast.error(
        "That time zone isn't recognised. Try something like America/Toronto.",
      );
    }

    setBusy(true);
    try {
      // Each of these saves is all-or-nothing; any failure stops here and says which part failed.
      try {
        await saveCourses(courses);
      } catch (e) {
        setStep(1);
        throw new Error(
          `Your courses weren't saved. ${e instanceof Error ? e.message : ""}`.trim(),
        );
      }
      try {
        await saveSkills(skills);
      } catch (e) {
        setStep(1);
        throw new Error(`Your skills weren't saved. ${e instanceof Error ? e.message : ""}`.trim());
      }
      try {
        await saveAvailability(ranges);
      } catch (e) {
        setStep(2);
        throw new Error(
          `Your availability wasn't saved. ${e instanceof Error ? e.message : ""}`.trim(),
        );
      }

      // A photo is nice to have: if it fails, finish the setup and say so.
      let newAvatar: string | null = null;
      if (avatarFile) {
        try {
          newAvatar = await uploadAvatar(user.id, avatarFile);
        } catch (e) {
          toast.warning(
            `Your photo couldn't be uploaded (${e instanceof Error ? e.message : "unknown error"}). You can add it later in Settings.`,
          );
        }
      }

      const previousAvatar = profileQuery.data?.avatar_url ?? null;
      const { error: pErr } = await supabase.from("profiles").upsert({
        id: user.id,
        display_name: tidy(name) || user.email?.split("@")[0] || "Student",
        university: tidy(university) || null,
        major: tidy(major) || null,
        bio: bio.trim() || null,
        timezone: zone,
        discoverable,
        onboarded: true,
        ...(newAvatar ? { avatar_url: newAvatar } : {}),
      });
      if (pErr) {
        if (newAvatar) await deleteAvatarFile(newAvatar);
        throw profileError(pErr);
      }
      if (newAvatar) await deleteAvatarFile(previousAvatar);

      toast.success("Profile saved");
      await queryClient.invalidateQueries();
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-sm font-medium text-primary">
        Step {step + 1} of {STEPS.length}
      </p>
      <h1 className="mt-1 text-3xl font-bold">{STEPS[step]}</h1>
      <Progress value={((step + 1) / STEPS.length) * 100} className="mt-4" />

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.22 }}
        className="surface-card mt-6 space-y-5 p-6"
      >
        {step === 0 && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="n">Full name</Label>
              <Input id="n" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Profile photo (optional)</Label>
              <PhotoField
                name={name || user?.email || "Student"}
                path={profileQuery.data?.avatar_url}
                previewUrl={avatarPreview}
                onPick={setAvatarFile}
                onRemove={avatarFile ? () => setAvatarFile(null) : undefined}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="u">University</Label>
                <Input id="u" value={university} onChange={(e) => setUniversity(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m">Major</Label>
                <Input id="m" value={major} onChange={(e) => setMajor(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="b">Short bio</Label>
              <Textarea
                id="b"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={500}
              />
            </div>
          </>
        )}

        {step === 1 && (
          <>
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
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="tz">Time zone</Label>
              <Input id="tz" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
            </div>
            <AvailabilityEditor value={ranges} onChange={setRanges} />
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <p className="text-sm font-medium">Let classmates discover me</p>
                <p className="text-xs text-muted-foreground">
                  Shares your name, courses and skills for teammate matching. Availability details
                  stay private.
                </p>
              </div>
              <Switch
                checked={discoverable}
                onCheckedChange={setDiscoverable}
                aria-label="Let classmates discover me"
              />
            </div>
          </>
        )}

        <div className="flex justify-between pt-2">
          <Button
            variant="ghost"
            onClick={() => (step === 0 ? navigate({ to: "/dashboard" }) : setStep(step - 1))}
            disabled={busy}
          >
            {step === 0 ? "Skip for now" : "Back"}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)}>Continue</Button>
          ) : (
            <Button onClick={finish} disabled={busy}>
              {busy && <Loader2 className="mr-2 size-4 animate-spin" />}Finish setup
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
