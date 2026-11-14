import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AvailabilityEditor } from "@/components/app/profile/AvailabilityEditor";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import type { Range } from "@/lib/profile-data";
import { loadMyAvailability, saveAvailability } from "@/lib/profile-queries";

/** Settings > Availability: weekly free time, saved as one all-or-nothing update. */
export function AvailabilityTab() {
  const { user } = useAuth();
  const userId = user?.id;
  const slotsQuery = useQuery({
    queryKey: ["availability", userId],
    queryFn: () => loadMyAvailability(userId!),
    enabled: !!userId,
  });
  const [ranges, setRanges] = useState<Range[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (slotsQuery.data) setRanges(slotsQuery.data);
  }, [slotsQuery.data]);

  const dirty = JSON.stringify(ranges) !== JSON.stringify(slotsQuery.data ?? []);

  async function save() {
    setSaving(true);
    try {
      await saveAvailability(ranges);
      toast.success("Availability saved");
      await slotsQuery.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save your availability.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="surface-card max-w-3xl space-y-5 p-6">
      {slotsQuery.isError && (
        <div role="alert" className="space-y-2 text-sm text-destructive">
          <p>Couldn't load your saved availability. {(slotsQuery.error as Error).message}</p>
          <Button variant="outline" size="sm" onClick={() => void slotsQuery.refetch()}>
            Try again
          </Button>
        </div>
      )}
      <AvailabilityEditor value={ranges} onChange={setRanges} />
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={save} disabled={saving || !dirty}>
          {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
          Save availability
        </Button>
        {dirty && <span className="text-sm text-muted-foreground">You have unsaved changes.</span>}
      </div>
    </div>
  );
}
