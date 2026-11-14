import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/lib/theme";

/** Settings > Appearance: light or dark theme, remembered on this device. */
export function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="surface-card flex max-w-xl items-center justify-between p-6">
      <div>
        <p id="dark-label" className="font-medium">
          Dark theme
        </p>
        <p className="text-sm text-muted-foreground">Your choice is remembered on this device.</p>
      </div>
      <Switch
        aria-labelledby="dark-label"
        checked={theme === "dark"}
        onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
      />
    </div>
  );
}
