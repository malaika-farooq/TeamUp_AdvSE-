import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountTab } from "./AccountTab";
import { AcademicTab } from "./AcademicTab";
import { AppearanceTab } from "./AppearanceTab";
import { AvailabilityTab } from "./AvailabilityTab";
import { ProfileTab } from "./ProfileTab";

/**
 * The five Settings sections. Every section stays mounted (inactive ones are only hidden) so that
 * unsaved edits survive a trip to another tab.
 */
export function SettingsTabs({ defaultTab = "profile" }: { defaultTab?: string }) {
  return (
    <Tabs defaultValue={defaultTab} className="space-y-5">
      <TabsList className="flex flex-wrap justify-start">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="academic">Courses &amp; skills</TabsTrigger>
        <TabsTrigger value="availability">Availability</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" forceMount className="data-[state=inactive]:hidden">
        <ProfileTab />
      </TabsContent>
      <TabsContent value="academic" forceMount className="data-[state=inactive]:hidden">
        <AcademicTab />
      </TabsContent>
      <TabsContent value="availability" forceMount className="data-[state=inactive]:hidden">
        <AvailabilityTab />
      </TabsContent>
      <TabsContent value="appearance" forceMount className="data-[state=inactive]:hidden">
        <AppearanceTab />
      </TabsContent>
      <TabsContent value="account" forceMount className="data-[state=inactive]:hidden">
        <AccountTab />
      </TabsContent>
    </Tabs>
  );
}
