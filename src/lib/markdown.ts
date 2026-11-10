// Small fixes for Markdown written by the AI so it renders cleanly.

/**
 * - `** Title **` (spaces inside the stars) doesn't render as bold, so trim the spaces.
 * - A heading glued to the previous line doesn't render as a heading, so add a blank line.
 */
export function tidyMarkdown(text: string): string {
  return text
    .replace(/\*\*[ \t]*([^*\n]*?[^*\s])[ \t]*\*\*/g, "**$1**")
    .replace(/([^\n])\n(#{1,6} )/g, "$1\n\n$2");
}
