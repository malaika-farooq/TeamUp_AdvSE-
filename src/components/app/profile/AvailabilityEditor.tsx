import { useId, useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DAY_LABELS,
  TIME_BLOCKS,
  addRange,
  checkRange,
  covers,
  formatRange,
  mergeRanges,
  removeRange,
  timeOptions,
  toggleBlock,
  totalHours,
  type Range,
} from "@/lib/profile-data";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TARGETS: { value: string; label: string; days: number[] }[] = [
  ...DAY_NAMES.map((n, i) => ({ value: String(i), label: n, days: [i] })),
  { value: "weekdays", label: "Every weekday", days: [1, 2, 3, 4, 5] },
  { value: "weekends", label: "Every weekend day", days: [0, 6] },
  { value: "all", label: "Every day", days: [0, 1, 2, 3, 4, 5, 6] },
];
const TIMES = timeOptions();

const selectClass = "h-9 rounded-md border border-input bg-background px-2 text-sm";

/** Weekly free time: quick Morning / Afternoon / Evening toggles per day, plus exact custom times. */
export function AvailabilityEditor({
  value,
  onChange,
}: {
  value: Range[];
  onChange: (next: Range[]) => void;
}) {
  const id = useId();
  const [target, setTarget] = useState("1");
  const [start, setStart] = useState(9 * 60);
  const [end, setEnd] = useState(11 * 60);
  const merged = mergeRanges(value);

  function addCustom() {
    const check = checkRange(start, end);
    if (!check.ok) return void toast.error(check.reason);
    const days = TARGETS.find((t) => t.value === target)?.days ?? [];
    onChange(days.reduce((acc, d) => addRange(acc, d, start, end), merged));
  }

  const hours = totalHours(merged);

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Mark when you're usually free to study. Tap a block, or add exact times below. Classmates
        only see how much free time you share with them, never your schedule.
      </p>

      <ul className="space-y-2" aria-label="Weekly availability">
        {DAY_LABELS.map((label, day) => {
          const dayRanges = merged.filter((r) => r.weekday === day);
          return (
            <li key={label} className="rounded-xl border border-border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-20 font-medium">{DAY_NAMES[day]}</span>
                <div className="flex flex-wrap gap-1.5">
                  {TIME_BLOCKS.map((b) => {
                    const on = covers(merged, day, b.start, b.end);
                    const partial =
                      !on && dayRanges.some((r) => r.start < b.end && r.end > b.start);
                    return (
                      <button
                        key={b.label}
                        type="button"
                        aria-pressed={on}
                        aria-label={`${DAY_NAMES[day]} ${b.label}`}
                        onClick={() => onChange(toggleBlock(merged, day, b.start, b.end))}
                        className={cn(
                          "h-9 rounded-lg border px-3 text-sm transition-colors duration-150",
                          on
                            ? "border-teal bg-teal/20 font-medium"
                            : partial
                              ? "border-dashed border-teal bg-teal/5"
                              : "border-border bg-muted/40 hover:bg-muted",
                        )}
                      >
                        {b.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {dayRanges.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {dayRanges.map((r) => (
                    <li
                      key={`${r.start}-${r.end}`}
                      className="flex items-center gap-1 rounded-full bg-muted py-0.5 pl-2.5 pr-1 text-xs"
                    >
                      {formatRange(r)}
                      <button
                        type="button"
                        className="grid size-5 place-items-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
                        aria-label={`Remove ${DAY_NAMES[day]} ${formatRange(r)}`}
                        onClick={() => onChange(removeRange(merged, r))}
                      >
                        <X className="size-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <fieldset className="rounded-xl border border-border p-3">
        <legend className="px-1 text-sm font-medium">Add exact times</legend>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor={`${id}-day`} className="text-xs">
              Day
            </Label>
            <select
              id={`${id}-day`}
              className={selectClass}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              {TARGETS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${id}-from`} className="text-xs">
              From
            </Label>
            <select
              id={`${id}-from`}
              className={selectClass}
              value={start}
              onChange={(e) => setStart(Number(e.target.value))}
            >
              {TIMES.slice(0, -1).map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${id}-to`} className="text-xs">
              To
            </Label>
            <select
              id={`${id}-to`}
              className={selectClass}
              value={end}
              onChange={(e) => setEnd(Number(e.target.value))}
            >
              {TIMES.slice(1).map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" variant="secondary" onClick={addCustom}>
            <Plus className="mr-1 size-4" />
            Add
          </Button>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-muted-foreground" aria-live="polite">
          {hours > 0 ? `You're free about ${hours} h a week.` : "No free time marked yet."}
        </p>
        {merged.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange([])}>
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
}
