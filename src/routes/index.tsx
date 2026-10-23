import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  CalendarDays,
  CheckCircle2,
  ListChecks,
  Sparkles,
  Users,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { fadeUp, stagger } from "@/lib/motion";
import { useAuth } from "@/frontend/features/auth/providers/AuthProvider";

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

function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid size-8 place-items-center rounded-xl bg-navy text-navy-foreground">
              <BookOpen className="size-4" />
            </span>
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
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-40 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="mx-auto max-w-6xl px-4 py-20 text-center"
          >
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
            </motion.div>

            <DashboardPreview />
          </motion.div>
        </section>

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
                <f.icon className={`size-6 ${f.tint}`} />
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section className="border-t border-border bg-navy py-16 text-navy-foreground">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-3xl font-bold">Your group project, finally under control.</h2>
            <p className="mt-3 text-navy-foreground/75">
              Create your first team in under a minute, or spin up a sample workspace to explore.
            </p>
            <Button asChild size="lg" className="mt-7">
              <Link to="/auth" search={{ mode: "signup", redirect: undefined }}>
                Create your free account
              </Link>
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
