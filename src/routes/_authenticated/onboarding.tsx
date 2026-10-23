import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/frontend/features/auth/providers/AuthProvider";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";
import { Switch } from "@/frontend/components/ui/switch";
import { Progress } from "@/frontend/components/ui/progress";
import { Badge } from "@/frontend/components/ui/badge";

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

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const BLOCKS = [
  { label: "Morning", start: 8 * 60, end: 12 * 60 },
  { label: "Afternoon", start: 12 * 60, end: 17 * 60 },
  { label: "Evening", start: 17 * 60, end: 22 * 60 },
];

function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [bio, setBio] = useState("");
  const [courses, setCourses] = useState("");
  const [skills, setSkills] = useState("");
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  );
  const [slots, setSlots] = useState<Record<string, boolean>>({});
  const [discoverable, setDiscoverable] = useState(true);

  const steps = ["About you", "Courses & skills", "Availability"];

  function toggleSlot(day: number, blockIndex: number) {
    const key = `${day}-${blockIndex}`;
    setSlots((s) => ({ ...s, [key]: !s[key] }));
  }

  async function finish() {
    if (!user) return;
    setBusy(true);
    try {
      let avatarUrl: string | null = null;
      if (avatarFile) {
        const path = `${user.id}/${Date.now()}-${avatarFile.name.replace(/[^\w.-]/g, "_")}`;
        const { error } = await supabase.storage.from("avatars").upload(path, avatarFile);
        if (error) throw error;
        avatarUrl = path;
      }

      const { error: pErr } = await supabase.from("profiles").upsert({
        id: user.id,
        display_name: name || user.email?.split("@")[0] || "Student",
        university: university || null,
        major: major || null,
        bio: bio || null,
        timezone,
        discoverable,
        onboarded: true,
        avatar_url: avatarUrl,
      });
      if (pErr) throw pErr;

      const courseList = courses
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      for (const c of courseList) {
        const parts = c.split(" ");
        const code = parts[0] ?? c;
        const title = parts.slice(1).join(" ") || c;
        const existing = await supabase
          .from("courses")
          .select("id")
          .eq("code", code)
          .eq("title", title)
          .maybeSingle();
        let courseId = existing.data?.id;
        if (!courseId) {
          const ins = await supabase.from("courses").insert({ code, title }).select("id").single();
          courseId = ins.data?.id;
        }
        if (courseId) {
          await supabase.from("user_courses").upsert({ user_id: user.id, course_id: courseId });
        }
      }

      const skillList = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      for (const s of skillList) {
        const existing = await supabase.from("skills").select("id").eq("name", s).maybeSingle();
        let skillId = existing.data?.id;
        if (!skillId) {
          const ins = await supabase.from("skills").insert({ name: s }).select("id").single();
          skillId = ins.data?.id;
        }
        if (skillId) {
          await supabase.from("user_skills").upsert({ user_id: user.id, skill_id: skillId });
        }
      }

      await supabase.from("availability_slots").delete().eq("user_id", user.id);
      const rows = Object.entries(slots)
        .filter(([, v]) => v)
        .map(([key]) => {
          const parts = key.split("-").map(Number);
          const block = BLOCKS[parts[1] ?? 0]!;
          return {
            user_id: user.id,
            weekday: parts[0] ?? 0,
            start_minute: block.start,
            end_minute: block.end,
          };
        });
      if (rows.length) await supabase.from("availability_slots").insert(rows);

      toast.success("Profile saved");
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
        Step {step + 1} of {steps.length}
      </p>
      <h1 className="mt-1 text-3xl font-bold">{steps[step]}</h1>
      <Progress value={((step + 1) / steps.length) * 100} className="mt-4" />

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.22 }}
        className="surface-card mt-6 space-y-4 p-6"
      >
        {step === 0 && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="n">Full name</Label>
              <Input id="n" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ph">Profile photo (optional)</Label>
              <Input
                id="ph"
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
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
              <Textarea id="b" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="c">Courses</Label>
              <Input
                id="c"
                value={courses}
                onChange={(e) => setCourses(e.target.value)}
                placeholder="CS201 Data Structures, MATH210 Linear Algebra"
              />
              <p className="text-xs text-muted-foreground">Separate each course with a comma.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s">Skills & interests</Label>
              <Input
                id="s"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Python, research writing, design"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((s) => (
                  <Badge key={s} variant="secondary">
                    {s}
                  </Badge>
                ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="tz">Time zone</Label>
              <Input id="tz" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
            </div>
            <div>
              <Label className="mb-2 block">Weekly availability</Label>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <thead>
                    <tr>
                      <th className="p-1 text-left text-xs text-muted-foreground">Day</th>
                      {BLOCKS.map((b) => (
                        <th key={b.label} className="p-1 text-xs text-muted-foreground">
                          {b.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {WEEKDAYS.map((d, di) => (
                      <tr key={d}>
                        <td className="p-1 text-xs font-medium">{d}</td>
                        {BLOCKS.map((b, bi) => {
                          const on = slots[`${di}-${bi}`];
                          return (
                            <td key={b.label} className="p-1">
                              <button
                                type="button"
                                aria-pressed={!!on}
                                aria-label={`${d} ${b.label}`}
                                onClick={() => toggleSlot(di, bi)}
                                className={`h-9 w-full rounded-lg border transition-colors duration-150 ${
                                  on
                                    ? "border-primary bg-primary/15 text-primary"
                                    : "border-border bg-muted/40 hover:bg-muted"
                                }`}
                              >
                                {on ? "Free" : ""}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <p className="text-sm font-medium">Let classmates discover me</p>
                <p className="text-xs text-muted-foreground">
                  Shares your name, courses and skills for teammate matching. Availability details
                  stay private.
                </p>
              </div>
              <Switch checked={discoverable} onCheckedChange={setDiscoverable} />
            </div>
          </>
        )}

        <div className="flex justify-between pt-2">
          <Button
            variant="ghost"
            onClick={() => (step === 0 ? navigate({ to: "/dashboard" }) : setStep(step - 1))}
          >
            {step === 0 ? "Skip for now" : "Back"}
          </Button>
          {step < steps.length - 1 ? (
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
