import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

/** The TeamUp logo: the same open book on the orange tile as the browser icon (public/icon.svg). */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#FFAA55] to-[#E8622A] text-white shadow-sm ring-1 ring-black/5",
        className,
      )}
    >
      <BookOpen className="size-[56%]" strokeWidth={2.2} />
    </span>
  );
}
