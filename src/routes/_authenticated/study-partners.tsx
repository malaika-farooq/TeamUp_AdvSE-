import { createFileRoute, redirect } from "@tanstack/react-router";

// /study-partners is an alias for the Study Partners page at /partners.
export const Route = createFileRoute("/_authenticated/study-partners")({
  beforeLoad: () => {
    throw redirect({ to: "/partners", replace: true });
  },
});
