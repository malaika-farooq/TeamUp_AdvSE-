import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { BrandMark } from "@/components/app/BrandMark";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup", "reset"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — TeamUp" },
      { name: "description", content: "Sign in or create your TeamUp student account." },
      { property: "og:title", content: "Sign in — TeamUp" },
      { property: "og:description", content: "Access your TeamUp study teams and tasks." },
    ],
  }),
  component: AuthPage,
});

function safePath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    // Someone who is already signed in never needs this page: send them on.
    if (!loading && user) {
      navigate({ to: safePath(search.redirect) ?? "/dashboard", replace: true });
    }
  }, [user, loading, navigate, search.redirect]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (!data.session) {
          // The account exists but the email must be confirmed first: move to the sign-in form
          // (email stays filled in) so the next step is obvious.
          setMode("signin");
          setPassword("");
          setSent(
            `Account created! We sent a confirmation link to ${email}. Open it, then sign in here.`,
          );
          toast.success("Account created. Check your email, then sign in.");
        } else {
          navigate({ to: safePath(search.redirect) ?? "/onboarding", replace: true });
        }
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: safePath(search.redirect) ?? "/dashboard", replace: true });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSent("If that address has an account, a reset link is on its way.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      if (/email not confirmed/i.test(message)) {
        setSent(`Please confirm ${email} first: open the link we emailed you, then sign in.`);
        toast.error("Your email isn't confirmed yet.");
      } else if (/failed to fetch|networkerror/i.test(message)) {
        toast.error(
          "Couldn't reach the server. Check your connection and the Supabase settings in .env.",
        );
      } else {
        toast.error(message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error("Google sign-in is unavailable right now.");
    // On success the browser is redirected to Google, then back here.
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-navy p-10 text-navy-foreground lg:flex">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <BrandMark className="size-8" />
          TeamUp
        </Link>
        <div>
          <h2 className="max-w-sm text-3xl font-bold leading-tight">
            Study together. Plan smarter. Finish stronger.
          </h2>
          <p className="mt-4 max-w-sm text-navy-foreground/70">
            Shared schedules, task ownership, team resources and progress tracking for every group
            project.
          </p>
        </div>
        <p className="text-xs text-navy-foreground/50">Made for students, by students.</p>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-sm"
        >
          <h1 className="text-2xl font-bold">
            {mode === "signup"
              ? "Create your account"
              : mode === "signin"
                ? "Welcome back"
                : "Reset your password"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "reset"
              ? "We'll send you a link to choose a new password."
              : "Use your school email or continue with Google."}
          </p>

          {sent ? (
            <div className="mt-6 rounded-xl border border-border bg-muted/50 p-4 text-sm">
              {sent}
            </div>
          ) : null}

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aditi Vishal"
                  autoComplete="name"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                autoComplete="email"
              />
            </div>
            {mode !== "reset" && (
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
              {mode === "signup" ? "Create account" : mode === "signin" ? "Sign in" : "Send link"}
            </Button>
          </form>

          {mode !== "reset" && (
            <>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> or{" "}
                <span className="h-px flex-1 bg-border" />
              </div>
              <Button variant="outline" className="w-full" onClick={google}>
                Continue with Google
              </Button>
            </>
          )}

          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            {mode !== "reset" && (
              <button
                className="underline-offset-4 hover:underline"
                onClick={() => {
                  setSent(null);
                  setMode(mode === "signin" ? "signup" : "signin");
                }}
              >
                {mode === "signin"
                  ? "New here? Create an account"
                  : "Already have an account? Sign in"}
              </button>
            )}
            <div>
              <button
                className="underline-offset-4 hover:underline"
                onClick={() => {
                  setSent(null);
                  setMode(mode === "reset" ? "signin" : "reset");
                }}
              >
                {mode === "reset" ? "Back to sign in" : "Forgot your password?"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
