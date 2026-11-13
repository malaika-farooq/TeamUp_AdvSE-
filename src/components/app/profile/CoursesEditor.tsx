import { useId, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MAX_COURSES,
  addCourses,
  courseKey,
  courseLabel,
  type CourseInput,
} from "@/lib/profile-data";

/** Enrolled courses: type "CS101 Intro to Programming" (several at once with commas) and press Add. */
export function CoursesEditor({
  value,
  onChange,
  suggestions = [],
}: {
  value: CourseInput[];
  onChange: (next: CourseInput[]) => void;
  suggestions?: CourseInput[];
}) {
  const id = useId();
  const [text, setText] = useState("");
  const full = value.length >= MAX_COURSES;

  function add() {
    if (!text.trim()) return;
    onChange(addCourses(value, text));
    setText("");
  }

  const taken = new Set(value.map(courseKey));
  const options = suggestions.filter((s) => !taken.has(courseKey(s))).slice(0, 100);

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={id}>Enrolled courses</Label>
        <div className="flex gap-2">
          <Input
            id={id}
            list={`${id}-options`}
            value={text}
            disabled={full}
            placeholder="CS201 Data Structures, MATH210 Linear Algebra"
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
            <option
              key={courseKey(s)}
              value={s.code && s.code !== s.title ? `${s.code} ${s.title}` : s.title}
            />
          ))}
        </datalist>
        <p className="text-xs text-muted-foreground">
          Start with the course code if you have one. Press Enter or Add; separate several with
          commas.
        </p>
      </div>

      {value.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No courses yet. Courses help match you with classmates.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2" aria-label="Your courses">
          {value.map((c) => (
            <li
              key={courseKey(c)}
              className="flex items-center gap-1 rounded-full border border-border bg-muted/50 py-1 pl-3 pr-1 text-sm"
            >
              <span>{courseLabel(c)}</span>
              <button
                type="button"
                className="grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={`Remove ${courseLabel(c)}`}
                onClick={() => onChange(value.filter((x) => courseKey(x) !== courseKey(c)))}
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {full && (
        <p className="text-xs text-muted-foreground">You can list up to {MAX_COURSES} courses.</p>
      )}
    </div>
  );
}
