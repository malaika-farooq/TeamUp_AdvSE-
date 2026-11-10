import owl from "@/assets/teamup-owl.png";
import { cn } from "@/lib/utils";

/** TeamUp AI's identity: the study owl. */
export function AssistantMark({ className }: { className?: string }) {
  return (
    <img
      src={owl}
      alt=""
      aria-hidden
      width={256}
      height={256}
      loading="lazy"
      className={cn("size-10 shrink-0 select-none object-contain", className)}
    />
  );
}
