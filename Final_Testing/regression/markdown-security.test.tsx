// A note, a link or an AI answer is shown as Markdown. Whatever is written in it must never run code.
import { describe, expect, test } from "bun:test";
import { render, waitFor } from "@testing-library/react";
import { MessageResponse } from "../../src/components/ai-elements/message";

const show = async (markdown: string) => {
  const view = render(<MessageResponse>{markdown}</MessageResponse>);
  await new Promise((r) => setTimeout(r, 150));
  return view.container;
};

describe("Markdown can't run code", () => {
  test("a javascript: link is not clickable", async () => {
    const c = await show("[click me](javascript:alert(1))");
    const hrefs = [...c.querySelectorAll("a")].map((a) => a.getAttribute("href") ?? "");
    expect(hrefs.every((h) => !/^\s*javascript:/i.test(h))).toBe(true);
  });
  test("a data: link is not clickable", async () => {
    const c = await show("[x](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)");
    const hrefs = [...c.querySelectorAll("a")].map((a) => a.getAttribute("href") ?? "");
    expect(hrefs.every((h) => !/^\s*data:/i.test(h))).toBe(true);
  });
  test("raw script tags are not inserted", async () => {
    const c = await show("hello <script>window.__pwned = 1</script> world");
    expect(c.querySelector("script")).toBeNull();
    expect((window as unknown as { __pwned?: number }).__pwned).toBeUndefined();
  });
  test("inline event handlers are not inserted", async () => {
    const c = await show('<img src=x onerror="window.__pwned = 2"> <a href="#" onclick="window.__pwned = 3">x</a>');
    expect(c.querySelector("[onerror]")).toBeNull();
    expect(c.querySelector("[onclick]")).toBeNull();
  });
  test("iframes and forms are not inserted", async () => {
    const c = await show('<iframe src="https://evil.example"></iframe><form action="https://evil.example"><input></form>');
    expect(c.querySelector("iframe")).toBeNull();
    expect(c.querySelector("form")).toBeNull();
  });
  test("ordinary Markdown still works", async () => {
    const c = await show("# Title\n\n**bold** and [a site](https://example.com)");
    await waitFor(() => expect(c.textContent).toContain("bold"));
    expect(c.textContent).toContain("Title");
    expect(c.textContent).not.toContain("**");
    expect(c.textContent).toContain("a site");
  });
});
