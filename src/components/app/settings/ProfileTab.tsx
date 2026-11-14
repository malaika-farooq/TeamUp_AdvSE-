import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PhotoField } from "@/components/app/profile/PhotoField";
import { ErrorState } from "@/components/app/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import {
  PROFILE_LIMITS,
  profileCompleteness,
  totalHours,
  validateProfile,
  type ProfileForm,
} from "@/lib/profile-data";
import {
  changeAvatar,
  loadMyAvailability,
  loadMyCourses,
  loadMySkills,
  removeAvatar,
  saveProfile,
} from "@/lib/profile-queries";
import { fetchProfile } from "@/lib/queries";

const emptyForm = (timezone: string): ProfileForm => ({
  display_name: "",
  university: "",
  major: "",
  bio: "",
  timezone,
  discoverable: false,
});

export function CompletenessCard({ percent, missing }: { percent: number; missing: string[] }) {
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

/** Settings > Profile: photo, name, university, major, time zone, bio and discoverability. */
export function ProfileTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  const profileQuery = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
  });
  // Only used for the completeness card.
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

  const [form, setForm] = useState<ProfileForm>(emptyForm(browserZone));
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);

  // Fill the form from the saved profile. If the profile row is missing (the save below creates it),
  // start from the name given at sign-up so the form is never a blank wall.
  useEffect(() => {
    if (!profileQuery.isSuccess) return;
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
    } else {
      const meta = user?.user_metadata as { display_name?: string } | undefined;
      setForm({
        ...emptyForm(browserZone),
        display_name: meta?.display_name ?? user?.email?.split("@")[0] ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileQuery.isSuccess, profileQuery.data]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const checked = validateProfile(form);
    if (!checked.ok) return void toast.error(checked.error);
    setSaving(true);
    try {
      await saveProfile(user.id, checked.value);
      toast.success("Profile saved");
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save your profile.");
    } finally {
      setSaving(false);
    }
  }

  async function pickPhoto(file: File) {
    if (!user) return;
    setPhotoBusy(true);
    try {
      await changeAvatar(user.id, file, profileQuery.data?.avatar_url);
      toast.success("Photo updated");
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't upload that photo.");
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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't remove your photo.");
    } finally {
      setPhotoBusy(false);
    }
  }

  if (profileQuery.isError) {
    return (
      <ErrorState
        title="Couldn't load your profile"
        message={(profileQuery.error as Error).message}
        onRetry={() => void profileQuery.refetch()}
      />
    );
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
  const avatarPath = profileQuery.data?.avatar_url;

  return (
    <div className="space-y-5">
      <CompletenessCard percent={completeness.percent} missing={completeness.missing} />

      <div className="surface-card max-w-xl space-y-3 p-6">
        <h3 className="font-semibold">Profile photo</h3>
        <PhotoField
          name={form.display_name || user?.email || "Student"}
          path={avatarPath}
          busy={photoBusy}
          onPick={pickPhoto}
          onRemove={avatarPath ? dropPhoto : undefined}
        />
      </div>

      <form
        noValidate
        onSubmit={submit}
        aria-label="Profile details"
        className="surface-card max-w-xl space-y-4 p-6"
      >
        <div className="space-y-1.5">
          <Label htmlFor="dn">Display name</Label>
          <Input
            id="dn"
            value={form.display_name}
            maxLength={PROFILE_LIMITS.name}
            disabled={profileQuery.isLoading}
            onChange={(e) => setForm({ ...form, display_name: e.target.value })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="uni">University</Label>
            <Input
              id="uni"
              value={form.university}
              maxLength={PROFILE_LIMITS.university}
              disabled={profileQuery.isLoading}
              onChange={(e) => setForm({ ...form, university: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="maj">Major</Label>
            <Input
              id="maj"
              value={form.major}
              maxLength={PROFILE_LIMITS.major}
              disabled={profileQuery.isLoading}
              onChange={(e) => setForm({ ...form, major: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tz">Time zone</Label>
          <Input
            id="tz"
            value={form.timezone}
            disabled={profileQuery.isLoading}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio">About you</Label>
          <Textarea
            id="bio"
            rows={3}
            value={form.bio}
            maxLength={PROFILE_LIMITS.bio}
            disabled={profileQuery.isLoading}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            {form.bio.length}/{PROFILE_LIMITS.bio}
          </p>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border p-3">
          <div>
            <p id="disc-label" className="text-sm font-medium">
              Show me in Discover
            </p>
            <p className="text-xs text-muted-foreground">
              Only your name, university, major and courses are shared.
            </p>
          </div>
          <Switch
            aria-labelledby="disc-label"
            checked={form.discoverable}
            onCheckedChange={(v) => setForm({ ...form, discoverable: v })}
          />
        </div>
        <Button type="submit" disabled={saving || profileQuery.isLoading}>
          {saving && <Loader2 className="mr-2 size-4 animate-spin" />}Save profile
        </Button>
      </form>
    </div>
  );
}
