// When Google (or any provider) sign-in fails, Supabase sends the person back to the site with the reason in the
// address, e.g. https://app.vercel.app/#error=access_denied&error_description=... This reads it so the
// student sees what happened instead of an unexplained return to the home page.

export type AuthUrlError = { code: string; message: string };

export function readAuthUrlError(href: string): AuthUrlError | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const params = new URLSearchParams(url.search);
  new URLSearchParams(url.hash.replace(/^#/, "")).forEach((v, k) => params.set(k, v));
  const code = params.get("error_code") ?? params.get("error");
  const description = params.get("error_description");
  if (!code && !description) return null;

  const text = (description ?? "").replace(/\+/g, " ").trim();
  if (code === "access_denied" && /denied|cancel/i.test(text + code)) {
    return {
      code: code ?? "access_denied",
      message: "Google sign-in was cancelled. You can try again.",
    };
  }
  if (/redirect|url/i.test(text)) {
    return {
      code: code ?? "redirect",
      message:
        "Google sign-in couldn't return to this site. The site's address must be added to Supabase → Authentication → URL Configuration.",
    };
  }
  return {
    code: code ?? "error",
    message: text
      ? `Sign-in didn't complete: ${text}`
      : "Sign-in didn't complete. Please try again.",
  };
}

/** The same address without the error parameters, so a refresh doesn't show the message again. */
export function withoutAuthError(href: string): string {
  const url = new URL(href);
  for (const k of ["error", "error_code", "error_description"]) url.searchParams.delete(k);
  const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
  for (const k of ["error", "error_code", "error_description"]) hash.delete(k);
  const h = hash.toString();
  return `${url.pathname}${url.search}${h ? `#${h}` : ""}`;
}
