import { createFileRoute } from "@tanstack/react-router";
import { TeammateMatchingHub } from "@/components/app/ai/TeammateMatchingHub";

const DESCRIPTION =
  "AI Teammate Matching suggests study partners and group sessions from your profile, skills, availability and academic workload.";

export const Route = createFileRoute("/_authenticated/assistant/")({
  head: () => ({
    meta: [
      { title: "AI Teammate Matching — TeamUp" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "AI Teammate Matching — TeamUp" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeammateMatchingHub,
});
