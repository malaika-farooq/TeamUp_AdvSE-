export const ACCENTS = ["teal", "lavender", "blue", "primary"] as const;

export function accentClasses(accent: string | null | undefined) {
  switch (accent) {
    case "lavender":
      return "bg-lavender/15 text-lavender border-lavender/30";
    case "blue":
      return "bg-blue/15 text-blue border-blue/30";
    case "primary":
      return "bg-primary/15 text-primary border-primary/30";
    default:
      return "bg-teal/15 text-teal border-teal/30";
  }
}
