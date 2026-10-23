import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Sparkles, Trash2 } from "lucide-react";
import { AppShell } from "@/frontend/components/layout/AppShell";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";
import { Switch } from "@/frontend/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/frontend/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/frontend/features/auth/providers/AuthProvider";
import { useTheme } from "@/frontend/providers/ThemeProvider";
import { fetchProfile } from "@/frontend/features/profiles/api/queries";
import {
  createSampleWorkspace,
  removeSampleWorkspace,
} from "@/backend/api/settings/sample.functions";
import { cn } from "@/lib/utils";

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
  const slotsQuery = useQuery({
    queryKey: ["availability", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

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

  const slots = slotsQuery.data ?? [];
  const isOn = (weekday: number, start: number) =>
    slots.some((s) => s.weekday === weekday && s.start_minute === start);

  async function toggleSlot(weekday: number, start: number, end: number) {
    if (!user) return;
    const existing = slots.find((s) => s.weekday === weekday && s.start_minute === start);
    if (existing) {
      const { error } = await supabase.from("availability_slots").delete().eq("id", existing.id);
      if (error) return void toast.error(error.message);
    } else {
      const { error } = await supabase.from("availability_slots").insert({
        user_id: user.id,
        weekday,
        start_minute: start,
        end_minute: end,
      });
      if (error) return void toast.error(error.message);
    }
    slotsQuery.refetch();
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ ...form, updated_at: new Date().toISOString() })
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

  return (
    <AppShell title="Settings" description="Your profile, availability and app preferences.">
      <Tabs defaultValue="profile" className="space-y-5">
        <TabsList className="flex flex-wrap justify-start">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
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

        <TabsContent value="availability">
          <div className="surface-card space-y-4 p-6">
            <p className="text-sm text-muted-foreground">
              Tap the blocks you're usually free. Teammates only see overlap results, never your raw
              schedule.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr>
                    <th className="p-2 text-left font-medium text-muted-foreground">Block</th>
                    {DAYS.map((d) => (
                      <th key={d} className="p-2 font-medium text-muted-foreground">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BLOCKS.map((b) => (
                    <tr key={b.label}>
                      <td className="p-2 text-muted-foreground">{b.label}</td>
                      {DAYS.map((d, i) => (
                        <td key={d} className="p-1">
                          <button
                            type="button"
                            aria-pressed={isOn(i, b.start)}
                            aria-label={`${d} ${b.label}`}
                            onClick={() => toggleSlot(i, b.start, b.end)}
                            className={cn(
                              "h-10 w-full rounded-lg border border-border transition-colors duration-200",
                              isOn(i, b.start)
                                ? "bg-teal/25 border-teal"
                                : "bg-muted/40 hover:bg-muted",
                            )}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
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
