import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    // getSession reads the saved sign-in on this device (and refreshes it if it ran out), so moving between
    // pages doesn't wait on a network round trip. The database still checks every request itself.
    const { data, error } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (error || !user) {
      throw redirect({ to: "/auth", search: { mode: "signin", redirect: location.href } });
    }
    return { user };
  },
  component: () => <Outlet />,
});
