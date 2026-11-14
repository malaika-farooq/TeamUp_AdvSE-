import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { SettingsTabs } from "@/components/app/settings/SettingsTabs";

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

function SettingsPage() {
  return (
    <AppShell title="Settings" description="Your profile, availability and app preferences.">
      <SettingsTabs />
    </AppShell>
  );
}
