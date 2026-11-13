import { useId, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MAX_SKILLS,
  MAX_SKILL_LENGTH,
  SKILL_LEVELS,
  addSkills,
  clampLevel,
  keyOf,
  type SkillInput,
} from "@/lib/profile-data";

/** Skills with a 1–5 level each. Teammate matching uses both the skill and how strong you are at it. */
export function SkillsEditor({
  value,
  onChange,
  suggestions = [],
}: {
  value: SkillInput[];
  onChange: (next: SkillInput[]) => void;
  suggestions?: string[];
}) {
  const id = useId();
  const [text, setText] = useState("");
  const full = value.length >= MAX_SKILLS;

  function add() {
    if (!text.trim()) return;
    onChange(addSkills(value, text));
    setText("");
  }

  const taken = new Set(value.map((s) => keyOf(s.name)));
  const options = suggestions.filter((s) => !taken.has(keyOf(s))).slice(0, 100);

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={id}>Skills and interests</Label>
        <div className="flex gap-2">
          <Input
            id={id}
            list={`${id}-options`}
            value={text}
            disabled={full}
            maxLength={200}
            placeholder="Python, research writing, UI design"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
          <Button type="button" variant="secondary" onClick={add} disabled={!text.trim() || full}>
            <Plus className="mr-1 size-4" />
            Add
          </Button>
        </div>
        <datalist id={`${id}-options`}>
          {options.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <p className="text-xs text-muted-foreground">
          Separate several with commas (up to {MAX_SKILL_LENGTH} characters each). Then set how
          strong you are.
        </p>
      </div>

      {value.length === 0 ? (
        <p className="text-sm text-muted-foreground">No skills yet.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2" aria-label="Your skills">
          {value.map((s) => (
            <li
              key={keyOf(s.name)}
              className="flex items-center gap-2 rounded-xl border border-border p-2 pl-3"
            >
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{s.name}</span>
              <select
                aria-label={`Level for ${s.name}`}
                value={s.level}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                onChange={(e) =>
                  onChange(
                    value.map((x) =>
                      keyOf(x.name) === keyOf(s.name)
                        ? { ...x, level: clampLevel(Number(e.target.value)) }
                        : x,
                    ),
                  )
                }
              >
                {SKILL_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={`Remove ${s.name}`}
                onClick={() => onChange(value.filter((x) => keyOf(x.name) !== keyOf(s.name)))}
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {full && (
        <p className="text-xs text-muted-foreground">You can list up to {MAX_SKILLS} skills.</p>
      )}
    </div>
  );
}
