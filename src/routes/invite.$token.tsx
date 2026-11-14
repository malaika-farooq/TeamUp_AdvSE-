import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  acceptInvitation,
  declineInvitation,
  previewInvitation,
  type InvitationPreview,
} from "@/lib/team-queries";
import { ROLE_HELP, ROLE_LABEL, invitationProblem, type Role } from "@/lib/team-rules";

export const Route = createFileRoute("/invite/$token")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Team invitation — TeamUp" },
      { name: "description", content: "Accept your TeamUp team invitation." },
      { property: "og:title", content: "Team invitation — TeamUp" },
      { property: "og:description", content: "Join a TeamUp study team." },
    ],
  }),
  component: InvitePage,
});

function InvitePage() {
  const { token } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | "accept" | "decline">(null);

  // Re-check when the person signs in, because "for someone else" depends on who is signed in.
  const userId = user?.id;
  useEffect(() => {
    let live = true;
    previewInvitation(token)
      .then((p) => live && setPreview(p))
      .catch(
        (e: unknown) =>
          live && setLoadError(e instanceof Error ? e.message : "Couldn't load the invitation."),
      );
    return () => {
      live = false;
    };
  }, [token, userId]);

  async function accept() {
    setBusy("accept");
    try {
      const teamId = await acceptInvitation(token);
      toast.success(`You're in${preview?.team_name ? `: ${preview.team_name}` : ""}.`);
      navigate({ to: "/teams/$teamId", params: { teamId } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't accept the invitation.");
      setBusy(null);
    }
  }

  async function decline() {
    setBusy("decline");
    try {
      await declineInvitation(token);
      toast.success("Invitation declined.");
    } catch {
      // A shareable link can't be declined, only left alone; either way there is nothing more to do.
    }
    navigate({ to: "/dashboard" });
  }

  if (loadError) {
    return (
      <Shell title="We couldn't load this invitation" text={loadError}>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </Shell>
    );
  }

  if (loading || !preview) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!preview.valid) {
    return (
      <Shell title="This invitation can't be used" text={invitationProblem(preview.reason)}>
        <Button variant="outline" onClick={() => navigate({ to: user ? "/dashboard" : "/auth" })}>
          {user ? "Go to dashboard" : "Sign in"}
        </Button>
      </Shell>
    );
  }

  const role = (preview.role ?? "member") as Role;
  const who = preview.inviter_name ?? "A teammate";
  const people = preview.member_count === 1 ? "1 member" : `${preview.member_count} members`;

  return (
    <Shell
      title={`Join ${preview.team_name}`}
      text={`${who} invited you to join as ${ROLE_LABEL[role].toLowerCase()}. ${ROLE_HELP[role]} The team has ${people}.`}
    >
      {user ? (
        <>
          <Button onClick={accept} disabled={busy !== null}>
            {busy === "accept" && <Loader2 className="mr-2 size-4 animate-spin" />}
            Accept invitation
          </Button>
          <Button variant="outline" onClick={decline} disabled={busy !== null}>
            {busy === "decline" && <Loader2 className="mr-2 size-4 animate-spin" />}
            Decline
          </Button>
        </>
      ) : (
        <>
          <Button
            onClick={() =>
              navigate({ to: "/auth", search: { mode: "signin", redirect: `/invite/${token}` } })
            }
          >
            Sign in to accept
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              navigate({ to: "/auth", search: { mode: "signup", redirect: `/invite/${token}` } })
            }
          >
            Create an account
          </Button>
        </>
      )}
    </Shell>
  );
}

function Shell({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="surface-card max-w-md p-8 text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">{children}</div>
      </div>
    </div>
  );
}
