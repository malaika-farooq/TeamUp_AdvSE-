import { cn } from "@/lib/utils";

/**
 * Soft, slow-drifting colour blobs for decorative backgrounds.
 * Accessibility: hidden from assistive tech, never receives pointer events,
 * kept low-opacity so text contrast is unaffected, and the animation is
 * disabled under `prefers-reduced-motion` (see styles.css).
 * Place inside a `relative overflow-hidden` parent.
 */
export function AnimatedBlobs({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
      <span className="animate-blob-a absolute -left-16 -top-20 size-72 rounded-full bg-primary/20 blur-3xl" />
      <span className="animate-blob-b absolute -right-20 top-1/4 size-80 rounded-full bg-lavender/25 blur-3xl" />
      <span className="animate-blob-a absolute -bottom-24 left-1/3 size-64 rounded-full bg-accent/60 blur-3xl" />
    </div>
  );
}
