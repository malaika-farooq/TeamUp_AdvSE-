import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { createSampleWorkspace, removeSampleWorkspace } from "@/lib/sample.functions";

export const MIN_PASSWORD_LENGTH = 8;

/** Settings > Account: change password, sample workspace, sign out. */
export function AccountTab() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createSample = useServerFn(createSampleWorkspace);
  const removeSample = useServerFn(removeSampleWorkspace);
  const [password, setPassword] = useState({ current: "", next: "" });
  const [changing, setChanging] = useState(false);
  const [busy, setBusy] = useState<"create" | "remove" | null>(null);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.next.length < MIN_PASSWORD_LENGTH) {
      return void toast.error(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
    }
    if (password.current && password.current === password.next) {
      return void toast.error("Choose a new password that is different from the current one.");
    }
    setChanging(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password.next,
        ...(password.current ? { current_password: password.current } : {}),
      } as never);
      if (error) return void toast.error(error.message);
      toast.success("Password updated");
      setPassword({ current: "", next: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update your password.");
    } finally {
      setChanging(false);
    }
  }

  async function sample(kind: "create" | "remove") {
    setBusy(kind);
    try {
      await (kind === "create"
        ? createSample({ data: undefined })
        : removeSample({ data: undefined }));
      toast.success(kind === "create" ? "Sample workspace created" : "Sample workspace removed");
      void queryClient.invalidateQueries();
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : kind === "create"
            ? "Couldn't create the sample."
            : "Couldn't remove the sample.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function leave() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="space-y-5">
      <form
        noValidate
        aria-label="Change password"
        onSubmit={changePassword}
        className="surface-card max-w-xl space-y-4 p-6"
      >
        <h3 className="font-semibold">Change password</h3>
        <div className="space-y-1.5">
          <Label htmlFor="cp">Current password</Label>
          <Input
            id="cp"
            type="password"
            autoComplete="current-password"
            value={password.current}
            onChange={(e) => setPassword({ ...password, current: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="np">New password</Label>
          <Input
            id="np"
            type="password"
            autoComplete="new-password"
            value={password.next}
            onChange={(e) => setPassword({ ...password, next: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            At least {MIN_PASSWORD_LENGTH} characters.
          </p>
        </div>
        <Button type="submit" variant="outline" disabled={changing}>
          {changing && <Loader2 className="mr-2 size-4 animate-spin" />}
          Update password
        </Button>
      </form>

      <div className="surface-card max-w-xl space-y-3 p-6">
        <h3 className="font-semibold">Sample workspace</h3>
        <p className="text-sm text-muted-foreground">
          Creates a clearly labelled demo team visible only to you, with example tasks, sessions and
          notes. Remove it any time.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button disabled={busy !== null} onClick={() => void sample("create")}>
            {busy === "create" ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 size-4" />
            )}
            Create sample workspace
          </Button>
          <Button variant="outline" disabled={busy !== null} onClick={() => void sample("remove")}>
            <Trash2 className="mr-2 size-4" />
            Remove sample
          </Button>
        </div>
      </div>

      <Button variant="ghost" onClick={() => void leave()}>
        Sign out
      </Button>
    </div>
  );
}
