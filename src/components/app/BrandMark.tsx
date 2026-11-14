import owl from "@/assets/teamup-owl.png";
import { cn } from "@/lib/utils";

/** The TeamUp logo: the owl mascot, same as the browser icon (public/icon.svg). */
export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src={owl}
      alt=""
      aria-hidden="true"
      className={cn("shrink-0 object-contain", className)}
    />
  );
}
