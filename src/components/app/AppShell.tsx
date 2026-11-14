import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Compass,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Sparkles,
  Sun,
  Users,
  FolderOpen,
  Handshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandMark } from "@/components/app/BrandMark";
import { UserAvatar } from "@/components/app/profile/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { fetchProfile } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { AIHelper } from "@/components/app/ai/AIHelper";
import { NotificationsBell } from "@/components/app/notifications/NotificationCenter";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/teams", label: "My Teams", icon: Users },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/partners", label: "Study Partners", icon: Handshake },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/resources", label: "Resources", icon: FolderOpen },
  { to: "/assistant", label: "AI Teammate Matching", icon: Sparkles },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const MOBILE_NAV = NAV.filter((n) =>
  ["/dashboard", "/teams", "/tasks", "/calendar", "/assistant"].includes(n.to),
);

export function AppShell({
  children,
  title,
  description,
  actions,
}: {
  children: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const stored = localStorage.getItem("studysync-nav-collapsed");
    if (stored) setCollapsed(stored === "1");
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      localStorage.setItem("studysync-nav-collapsed", prev ? "0" : "1");
      return !prev;
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 lg:flex",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        <div className="flex h-16 items-center gap-2 px-4">
          <BrandMark className="size-9" />
          {!collapsed && <span className="font-display text-lg font-bold">TeamUp</span>}
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV.map((item) => (
            <NavItem
              key={item.to}
              item={item}
              active={pathname.startsWith(item.to)}
              collapsed={collapsed}
            />
          ))}
        </nav>
        <div className="p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
            {!collapsed && <span className="ml-2">Collapse</span>}
          </Button>
        </div>
      </aside>

      <div
        className={cn("transition-[padding] duration-200", collapsed ? "lg:pl-[76px]" : "lg:pl-64")}
      >
        <TopBar />
        <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 lg:pb-12">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-6 flex flex-wrap items-end justify-between gap-3"
          >
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
              {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
          <AIHelper />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5">
          {MOBILE_NAV.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-[60px] flex-col items-center justify-center gap-1 text-[11px] transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-5" />
                {item.label.replace("AI ", "")}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function NavItem({
  item,
  active,
  collapsed,
}: {
  item: { to: string; label: string; icon: React.ElementType };
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      to={item.to}
      title={item.label}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
      )}
    >
      <item.icon className="size-[18px] shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

function TopBar() {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [query, setQuery] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "signin", redirect: undefined }, replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground">
          <SheetTitle className="px-5 pt-5 font-display text-lg text-sidebar-foreground">
            TeamUp
          </SheetTitle>
          <nav className="space-y-1 p-3">
            {NAV.map((item) => (
              <NavItem
                key={item.to}
                item={item}
                active={pathname.startsWith(item.to)}
                collapsed={false}
              />
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <form
        className="relative hidden max-w-sm flex-1 sm:block"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/tasks", search: query ? { q: query } : {} });
        }}
      >
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks…"
          className="pl-9"
          aria-label="Search tasks"
        />
      </form>

      <div className="ml-auto flex items-center gap-1">
        <NotificationsBell />

        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Account menu">
              <UserAvatar
                name={profile?.display_name ?? user?.email ?? "Student"}
                path={profile?.avatar_url}
                className="size-8"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-semibold">{profile?.display_name ?? "Student"}</p>
              {(profile?.university || profile?.major) && (
                <p className="truncate text-xs font-normal text-muted-foreground">
                  {[profile?.major, profile?.university].filter(Boolean).join(" · ")}
                </p>
              )}
              <p className="truncate text-xs font-normal text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <Settings className="mr-2 size-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
