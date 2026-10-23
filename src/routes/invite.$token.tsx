import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/frontend/features/auth/providers/AuthProvider";
import { Button } from "@/frontend/components/ui/button";

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
  const [preview, setPreview] = useState<{
    team_name: string | null;
    valid: boolean;
    reason: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.rpc("invitation_preview", { _token: token }).then(({ data, error }) => {
      if (error || !data?.length) {
        setPreview({ team_name: null, valid: false, reason: "not_found" });
        return;
      }
      setPreview(data[0] ?? { team_name: null, valid: false, reason: "not_found" });
    });
  }, [token]);

  async function accept() {
    setBusy(true);
    const { data, error } = await supabase.rpc("redeem_invitation", { _token: token });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("You've joined the team");
    navigate({ to: "/teams/$teamId", params: { teamId: data as string } });
  }

  if (loading || !preview) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="surface-card max-w-md p-8 text-center">
        <h1 className="text-2xl font-bold">
          {preview.valid ? `Join ${preview.team_name}` : "This invitation can't be used"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {preview.valid
            ? "Accepting adds you to the team workspace with member access."
            : preview.reason === "expired"
              ? "The link has expired. Ask the team owner for a new one."
              : preview.reason === "used"
                ? "This link was already used or revoked."
                : "We couldn't find that invitation."}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          {preview.valid ? (
            user ? (
              <>
                <Button onClick={accept} disabled={busy}>
                  {busy && <Loader2 className="mr-2 size-4 animate-spin" />}Accept invitation
                </Button>
                <Button variant="outline" onClick={() => navigate({ to: "/dashboard" })}>
                  Decline
                </Button>
              </>
            ) : (
              <Button
                onClick={() =>
                  navigate({
                    to: "/auth",
                    search: { mode: "signin", redirect: `/invite/${token}` },
                  })
                }
              >
                Sign in to accept
              </Button>
            )
          ) : (
            <Button variant="outline" onClick={() => navigate({ to: "/dashboard" })}>
              Go to dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
