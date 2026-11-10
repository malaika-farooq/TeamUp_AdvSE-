const COLORS = ["#F97316", "#2DD4BF", "#A78BFA", "#60A5FA", "#34D399"];

export default function confettiBurst() {
  if (typeof document === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:100;overflow:hidden";
  document.body.appendChild(container);

  for (let i = 0; i < 40; i++) {
    const piece = document.createElement("span");
    const size = 6 + Math.random() * 6;
    piece.style.cssText = `position:absolute;top:-20px;left:${Math.random() * 100}%;width:${size}px;height:${size * 1.6}px;background:${COLORS[i % COLORS.length]};border-radius:2px;opacity:0.9`;
    container.appendChild(piece);
    piece.animate(
      [
        { transform: "translateY(0) rotate(0deg)", opacity: 1 },
        {
          transform: `translateY(${window.innerHeight + 60}px) rotate(${360 + Math.random() * 360}deg)`,
          opacity: 0.2,
        },
      ],
      { duration: 1600 + Math.random() * 900, easing: "cubic-bezier(.2,.6,.3,1)" },
    );
  }

  setTimeout(() => container.remove(), 2800);
}
