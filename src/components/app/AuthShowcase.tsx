import { CalendarDays, CheckCircle2, TrendingUp } from "lucide-react";
import owl from "@/assets/teamup-owl.png";

/** Curved arrow pointing from one card to the next. Flows via a dashed stroke. */
function Arrow({ flip }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 160 56"
      className={`auth-arrow h-12 w-40 text-primary ${flip ? "-scale-x-100" : ""} ${flip ? "self-start ml-16" : "self-end mr-16"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path className="auth-arrow-line" d="M8 6 C 100 0, 150 14, 140 44" strokeDasharray="6 8" />
      <path d="M128 36 L140 46 L148 32" />
    </svg>
  );
}

/**
 * Decorative preview of the TeamUp workflow: plan -> assign -> track.
 * Hidden from assistive tech; the panel's heading carries the real message.
 */
export function AuthShowcase() {
  return (
    <div aria-hidden="true" className="mx-auto flex w-full max-w-sm flex-col py-6">
      <div className="self-start w-64 rotate-[-2deg] rounded-2xl bg-white p-4 text-navy shadow-xl">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
            <CalendarDays className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">Study session</p>
            <p className="text-xs text-navy/70">Thu 6:00 PM · Library</p>
          </div>
        </div>
      </div>

      <Arrow />

      <div className="self-end w-64 rotate-[2deg] rounded-2xl bg-white p-4 text-navy shadow-xl">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600">
            <CheckCircle2 className="size-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Draft the slides</p>
            <p className="text-xs text-navy/70">Assigned to a teammate</p>
          </div>
          <img src={owl} alt="" className="size-8 object-contain" />
        </div>
      </div>

      <Arrow flip />

      <div className="self-start w-64 rotate-[-1deg] rounded-2xl bg-white p-4 text-navy shadow-xl">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-sky-500/15 text-sky-600">
            <TrendingUp className="size-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Team progress</p>
            <div className="mt-2 h-2 rounded-full bg-navy/10">
              <div className="h-2 w-[72%] rounded-full bg-primary" />
            </div>
          </div>
          <span className="text-xs font-semibold">72%</span>
        </div>
      </div>
    </div>
  );
}
