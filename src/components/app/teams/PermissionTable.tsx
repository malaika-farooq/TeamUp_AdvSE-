import { Check, Minus, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { LEVEL_TEXT, PERMISSION_ROWS, ROLE_LABEL, type Level, type Role } from "@/lib/team-rules";

const ROLES: Role[] = ["owner", "admin", "member"];

function Cell({ level }: { level: Level }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs",
        level === "no" && "text-muted-foreground",
        level === "own" && "text-foreground",
      )}
    >
      {level === "yes" && <Check className="size-4 text-teal" aria-hidden="true" />}
      {level === "own" && <UserRound className="size-4 text-blue" aria-hidden="true" />}
      {level === "no" && <Minus className="size-4" aria-hidden="true" />}
      {LEVEL_TEXT[level]}
    </span>
  );
}

/** What each role can do in a team, with the viewer's own column highlighted. */
export function PermissionTable({ myRole }: { myRole: Role }) {
  return (
    <section className="surface-card overflow-x-auto p-5" aria-label="What each role can do">
      <h3 className="font-semibold">What each role can do</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        You are {myRole === "admin" ? "an" : "a"}{" "}
        <strong>{ROLE_LABEL[myRole].toLowerCase()}</strong> of this team. "Own only" means the
        things you created (for tasks, also ones assigned to you).
      </p>
      <table className="mt-3 w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th scope="col" className="py-2 pr-3 font-medium text-muted-foreground">
              Action
            </th>
            {ROLES.map((r) => (
              <th
                key={r}
                scope="col"
                className={cn(
                  "px-3 py-2 font-medium",
                  r === myRole && "rounded-t-lg bg-primary/10",
                )}
              >
                {ROLE_LABEL[r]}
                {r === myRole && (
                  <span className="ml-1 text-xs font-normal text-muted-foreground">(you)</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERMISSION_ROWS.map((row) => (
            <tr key={row.label} className="border-b border-border/60 last:border-0">
              <th scope="row" className="py-2 pr-3 text-left font-normal">
                {row.label}
              </th>
              {ROLES.map((r) => (
                <td key={r} className={cn("px-3 py-2", r === myRole && "bg-primary/10")}>
                  <Cell level={row[r]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
