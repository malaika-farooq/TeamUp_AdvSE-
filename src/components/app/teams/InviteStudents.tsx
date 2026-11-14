import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Loader2, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/app/profile/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { inviteStudent } from "@/lib/team-queries";
import { ROLE_HELP, ROLE_LABEL, inviteRolesFor, type Role } from "@/lib/team-rules";

const selectClass = "h-9 rounded-md border border-input bg-background px-2 text-sm";

export type ManagedTeam = { id: string; name: string; role: Role };

/** Choose which of your teams to invite one student to (used from Discover). */
export function InviteToTeamDialog({
  person,
  teams,
  open,
  onOpenChange,
}: {
  person: { id: string; name: string } | null;
  teams: ManagedTeam[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [teamId, setTeamId] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [busy, setBusy] = useState(false);

  const team = teams.find((t) => t.id === teamId) ?? teams[0];
  const roles = inviteRolesFor(team?.role);
  const chosenRole = roles.includes(role) ? role : "member";

  async function send() {
    if (!person || !team) return;
    setBusy(true);
    try {
      await inviteStudent(team.id, person.id, chosenRole);
      toast.success(`Invitation sent to ${person.name}.`);
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't send the invitation.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite {person?.name ?? "a student"} to a team</DialogTitle>
          <DialogDescription>
            They get a notification and can accept or decline. You can take the invitation back
            until they answer.
          </DialogDescription>
        </DialogHeader>
        {teams.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You can invite people to teams you own or administer. Create a team first.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="inv-team">Team</Label>
              <select
                id="inv-team"
                className={`${selectClass} w-full`}
                value={team?.id}
                onChange={(e) => setTeamId(e.target.value)}
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({ROLE_LABEL[t.role]})
                  </option>
                ))}
              </select>
            </div>
            {roles.length > 1 && (
              <div className="space-y-1.5">
                <Label htmlFor="inv-role">Their role</Label>
                <select
                  id="inv-role"
                  className={`${selectClass} w-full`}
                  value={chosenRole}
                  onChange={(e) => setRole(e.target.value as Role)}
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">{ROLE_HELP[chosenRole]}</p>
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={send} disabled={busy || teams.length === 0}>
            {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
            Send invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Search discoverable students by name and invite them to one team (used on the team's Members tab). */
export function InviteStudentSearch({
  teamId,
  myRole,
  memberIds,
  onInvited,
}: {
  teamId: string;
  myRole: Role;
  memberIds: string[];
  onInvited: () => void;
}) {
  const [term, setTerm] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [sent, setSent] = useState<Record<string, true>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const roles = inviteRolesFor(myRole);
  const chosenRole = roles.includes(role) ? role : "member";
  const clean = term.trim();

  const results = useQuery({
    queryKey: ["invite-search", teamId, clean],
    enabled: clean.length >= 2,
    queryFn: async () => {
      const escaped = clean.replace(/[\\%_]/g, "\\$&");
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, university, major")
        .eq("discoverable", true)
        .ilike("display_name", `%${escaped}%`)
        .limit(12);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  async function invite(id: string, name: string) {
    setBusy(id);
    try {
      await inviteStudent(teamId, id, chosenRole);
      setSent((s) => ({ ...s, [id]: true }));
      toast.success(`Invitation sent to ${name}.`);
      onInvited();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't send the invitation.");
    } finally {
      setBusy(null);
    }
  }

  const people = (results.data ?? []).filter((p) => !memberIds.includes(p.id));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search students by name"
            className="pl-9"
            placeholder="Search students by name"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </div>
        {roles.length > 1 && (
          <select
            aria-label="Role for the invited student"
            className={selectClass}
            value={chosenRole}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                Invite as {ROLE_LABEL[r].toLowerCase()}
              </option>
            ))}
          </select>
        )}
      </div>

      {clean.length >= 2 && results.isLoading && <Loader2 className="size-4 animate-spin" />}
      {clean.length >= 2 && !results.isLoading && people.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No matching students. Only students who chose to be discoverable can be invited by name.
        </p>
      )}
      <ul className="space-y-2">
        {people.map((p) => (
          <li key={p.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
            <UserAvatar name={p.display_name} path={p.avatar_url} className="size-9" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{p.display_name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {[p.major, p.university].filter(Boolean).join(" · ") || "Student"}
              </p>
            </div>
            {sent[p.id] ? (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Check className="size-4" />
                Invited
              </span>
            ) : (
              <Button
                size="sm"
                disabled={busy === p.id}
                onClick={() => invite(p.id, p.display_name)}
              >
                {busy === p.id ? (
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-1.5 size-4" />
                )}
                Invite
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
