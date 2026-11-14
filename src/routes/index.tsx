import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  CalendarDays,
  CheckCircle2,
  ListChecks,
  Sparkles,
  Users,
  ArrowRight,
  Bell,
  Wand2,
} from "lucide-react";
import owl from "@/assets/teamup-owl.png";
import { AnimatedBlobs } from "@/components/app/AnimatedBlobs";
import { BrandMark } from "@/components/app/BrandMark";
import { Button } from "@/components/ui/button";
import { fadeUp, stagger } from "@/lib/motion";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TeamUp — Study together. Plan smarter. Finish stronger." },
      {
        name: "description",
        content:
          "TeamUp is a collaborative hub for students: shared schedules, assigned project tasks, team resources, progress tracking and AI planning help.",
      },
      { property: "og:title", content: "TeamUp — Collaborative Study & Team Planning Hub" },
      {
        property: "og:description",
        content:
          "Plan study sessions, assign tasks, share notes and track your group project progress in one place.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Users,
    title: "Teams that actually stay organised",
    body: "Create a study group, invite classmates with a secure link, approve join requests, and keep owner, admin and member roles clear.",
    tint: "text-teal",
  },
  {
    icon: CalendarDays,
    title: "Scheduling without the group chat",
    body: "Month, week and agenda views, weekly recurring sessions, RSVP responses and a Find a Meeting Time helper built on real availability.",
    tint: "text-blue",
  },
  {
    icon: ListChecks,
    title: "Task ownership that sticks",
    body: "A drag-and-drop board with To Do, In Progress, In Review and Done, plus checklists, comments, due dates and overdue warnings.",
    tint: "text-lavender",
  },
  {
    icon: Sparkles,
    title: "AI that drafts, never decides",
    body: "Draft a project plan, summarise team notes, or find teammates by course and skills. You review everything before it is saved.",
    tint: "text-primary",
  },
];

export function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Signed-in students never need the sales page: take them to their dashboard.
  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <BrandMark className="size-8" />
            TeamUp
          </Link>
          <nav className="flex items-center gap-2">
            {user ? (
              <Button asChild>
                <Link to="/dashboard">Open dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link to="/auth" search={{ mode: "signin", redirect: undefined }}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/auth" search={{ mode: "signup", redirect: undefined }}>
                    Get Started
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden">
          <AnimatedBlobs />
          <div className="pointer-events-none absolute -top-40 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="mx-auto max-w-6xl px-4 py-20 text-center"
          >
            <motion.img
              variants={fadeUp}
              src={owl}
              alt=""
              aria-hidden="true"
              className="animate-float mx-auto mb-4 size-24 object-contain drop-shadow-lg"
            />
            <motion.p
              variants={fadeUp}
              className="mx-auto w-fit rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-muted-foreground"
            >
              Built for group projects, labs and finals week
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-extrabold leading-tight sm:text-6xl"
            >
              Study together. <span className="text-gradient-warm">Plan smarter.</span> Finish
              stronger.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg"
            >
              TeamUp brings your study group's schedule, tasks, notes and progress into one calm
              workspace — so everyone knows what is due, who owns it, and when you are meeting next.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap justify-center gap-3">
              {user ? (
                <Button asChild size="lg" className="shadow-[var(--shadow-glow)]">
                  <Link to="/dashboard">
                    Open dashboard <ArrowRight className="ml-1 size-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="shadow-[var(--shadow-glow)]">
                    <Link to="/auth" search={{ mode: "signup", redirect: undefined }}>
                      Get Started <ArrowRight className="ml-1 size-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/auth" search={{ mode: "signin", redirect: undefined }}>
                      Sign In
                    </Link>
                  </Button>
                </>
              )}
            </motion.div>

            <div className="relative mx-auto max-w-4xl">
              <FloatingChips />
              <DashboardPreview />
            </div>
          </motion.div>
        </section>

        <HowItWorks />

        <section className="mx-auto max-w-6xl px-4 pb-24">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid gap-5 sm:grid-cols-2"
          >
            {features.map((f) => (
              <motion.article
                key={f.title}
                variants={fadeUp}
                className="surface-card hover-lift p-6 text-left"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-muted">
                  <f.icon className={`size-6 ${f.tint}`} />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section className="border-t border-border bg-navy py-16 text-navy-foreground">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <img
              src={owl}
              alt=""
              aria-hidden="true"
              className="animate-float mx-auto mb-4 size-16 object-contain"
            />
            <h2 className="text-3xl font-bold">Your group project, finally under control.</h2>
            <p className="mt-3 text-navy-foreground/75">
              Create your first team in under a minute, or spin up a sample workspace to explore.
            </p>
            <Button asChild size="lg" className="mt-7">
              {user ? (
                <Link to="/dashboard">Open dashboard</Link>
              ) : (
                <Link to="/auth" search={{ mode: "signup", redirect: undefined }}>
                  Create your free account
                </Link>
              )}
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        TeamUp — collaborative study & team planning hub.
      </footer>
    </div>
  );
}

/** Decorative chips that float around the dashboard preview (large screens only). */
function FloatingChips() {
  const chips = [
    { icon: Bell, text: "Due tomorrow", pos: "-left-6 top-10", rot: "-4deg", tint: "text-primary" },
    { icon: CheckCircle2, text: "Everyone RSVP'd", pos: "-right-6 top-28", rot: "3deg", tint: "text-success" },
    { icon: Wand2, text: "AI plan ready", pos: "-left-4 bottom-16", rot: "2deg", tint: "text-lavender" },
  ];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 hidden lg:block">
      {chips.map((c, i) => (
        <span
          key={c.text}
          style={{ "--float-rot": c.rot, animationDelay: `${i * 0.9}s` } as React.CSSProperties}
          className={`animate-float absolute flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold shadow-lg ${c.pos}`}
        >
          <c.icon className={`size-4 ${c.tint}`} />
          {c.text}
        </span>
      ))}
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Users, title: "Create your team", body: "Start a group and invite classmates with one link." },
    { icon: CalendarDays, title: "Plan together", body: "Schedule sessions and assign tasks with clear owners." },
    { icon: CheckCircle2, title: "Finish stronger", body: "Track progress and hit every deadline as a team." },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20">
      <h2 className="text-center text-3xl font-bold">How TeamUp works</h2>
      <ol className="mt-10 grid gap-8 md:grid-cols-3">
        {steps.map((st, i) => (
          <li key={st.title} className="relative text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-[#FFAA55] to-[#E8622A] text-white shadow-lg">
              <st.icon className="size-7" />
            </span>
            <span className="absolute left-1/2 top-0 -ml-10 grid size-6 place-items-center rounded-full bg-navy text-xs font-bold text-navy-foreground">
              {i + 1}
            </span>
            <h3 className="mt-4 text-lg font-semibold">{st.title}</h3>
            <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">{st.body}</p>
            {i < steps.length - 1 && (
              <ArrowRight
                aria-hidden="true"
                className="absolute -right-5 top-5 hidden size-8 text-primary/60 md:block"
              />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function DashboardPreview() {
  const cards = [
    { label: "Due soon", value: "4", tint: "bg-primary/10 text-primary" },
    { label: "Active teams", value: "3", tint: "bg-teal/15 text-teal" },
    { label: "Completion", value: "68%", tint: "bg-lavender/15 text-lavender" },
  ];
  const board = [
    { col: "To Do", items: ["Draft survey", "Book study room"] },
    { col: "In Progress", items: ["Literature review"] },
    { col: "In Review", items: ["Slide deck v2"] },
    { col: "Done", items: ["Topic proposal", "Team charter"] },
  ];

  return (
    <motion.div
      variants={fadeUp}
      className="surface-card mx-auto mt-14 max-w-4xl overflow-hidden p-4 text-left sm:p-6"
    >
      <div className="flex items-center gap-2 pb-4">
        <span className="size-2.5 rounded-full bg-destructive/60" />
        <span className="size-2.5 rounded-full bg-warning/70" />
        <span className="size-2.5 rounded-full bg-success/60" />
        <span className="ml-2 text-xs text-muted-foreground">TeamUp · Dashboard</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.25 }}
            className="rounded-xl border border-border p-4"
          >
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className={`mt-1 inline-block rounded-lg px-2 text-2xl font-bold ${c.tint}`}>
              {c.value}
            </p>
          </motion.div>
        ))}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        {board.map((col, ci) => (
          <motion.div
            key={col.col}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + ci * 0.08, duration: 0.25 }}
            className="rounded-xl bg-muted/60 p-3"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {col.col}
            </p>
            <div className="mt-2 space-y-2">
              {col.items.map((t) => (
                <div
                  key={t}
                  className="flex items-center gap-2 rounded-lg bg-card p-2 text-xs shadow-[var(--shadow-card)]"
                >
                  {col.col === "Done" && <CheckCircle2 className="size-3.5 text-success" />}
                  {t}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
