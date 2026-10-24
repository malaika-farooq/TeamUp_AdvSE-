import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { toast } from "sonner";
import { CalendarClock, ListChecks, Loader2, Plus, Trash2 } from "lucide-react";
import confettiBurst from "@/lib/confetti";
import { Button } from "@/frontend/components/ui/button";
import { Badge } from "@/frontend/components/ui/badge";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";
import { Checkbox } from "@/frontend/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/frontend/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/frontend/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/frontend/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/frontend/features/auth/providers/AuthProvider";
import { EmptyState } from "@/frontend/components/shared/states";
import { PRIORITIES, STATUSES } from "@/frontend/features/tasks/constants";
import { fetchTeamMembers, type MemberWithProfile } from "@/frontend/features/teams/api/queries";
import { logActivity } from "@/frontend/features/activity/api/queries";
import { notify } from "@/frontend/features/notifications/api/queries";
import { type Task, type TaskPriority, type TaskStatus, type Team } from "@/types/domain";
import { cn } from "@/lib/utils";
import { taskErrorMessage } from "@/frontend/features/tasks/errors";

export { taskErrorMessage };

type TeamLike = Pick<Team, "id" | "name">;

export function TaskBoard({
  tasks,
  teams,
  defaultTeamId,
  createOpen,
  onCreateOpenChange,
  initialSearch = "",
}: {
  tasks: Task[];
  teams: TeamLike[];
  defaultTeamId?: string | undefined;
  createOpen: boolean;
  onCreateOpenChange: (v: boolean) => void;
  initialSearch?: string;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [view, setView] = useState<"board" | "list">("board");
  const [search, setSearch] = useState(initialSearch);
  const [teamFilter, setTeamFilter] = useState<string>(defaultTeamId ?? "all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [dueFilter, setDueFilter] = useState<string>("all");
  const [openTask, setOpenTask] = useState<Task | null>(null);
  const [local, setLocal] = useState<Task[]>(tasks);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => setLocal(tasks), [tasks]);
  useEffect(() => setSearch(initialSearch), [initialSearch]);

  const scopedTeamIds = teamFilter === "all" ? teams.map((t) => t.id) : [teamFilter];

  const membersQuery = useQuery({
    queryKey: ["members-multi", scopedTeamIds],
    queryFn: async () => {
      const all = await Promise.all(scopedTeamIds.map((id) => fetchTeamMembers(id)));
      const flat = all.flat();
      const seen = new Map<string, MemberWithProfile>();
      flat.forEach((m) => seen.set(m.user_id, m));
      return Array.from(seen.values());
    },
    enabled: scopedTeamIds.length > 0,
  });
  const members = membersQuery.data ?? [];
  const nameOf = (id: string | null) =>
    id
      ? (members.find((m) => m.user_id === id)?.profile?.display_name ?? "Teammate")
      : "Unassigned";

  const filtered = useMemo(() => {
    const now = Date.now();
    return local.filter((t) => {
      
      if (teamFilter !== "all" && t.team_id !== teamFilter) return false;
      if (assigneeFilter === "me" && t.assignee_id !== user?.id) return false;
      if (assigneeFilter !== "all" && assigneeFilter !== "me" && t.assignee_id !== assigneeFilter)
        return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (dueFilter === "overdue")
        if (!(t.due_date && new Date(t.due_date).getTime() < now && t.status !== "done"))
          return false;
      if (dueFilter === "week")
        if (!(t.due_date && new Date(t.due_date).getTime() < now + 7 * 864e5)) return false;
      if (search.trim()) {
        const s = search.trim().toLowerCase();
        if (!t.title.toLowerCase().includes(s) && !(t.description ?? "").toLowerCase().includes(s))
          return false;
      }
      return true;
    });
  }, [local, teamFilter, assigneeFilter, priorityFilter, statusFilter, dueFilter, search, user?.id]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  async function changeStatus(task: Task, status: TaskStatus) {
    if (task.status === status) return;
    const previous = local;
    const next = local.map((t) =>
      t.id === task.id
        ? { ...t, status, completed_at: status === "done" ? new Date().toISOString() : null }
        : t,
    );
    setLocal(next);
    const { error } = await supabase
      .from("tasks")
      .update({
        status,
        completed_at: status === "done" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", task.id);
    if (error) {
      setLocal(previous);
      toast.error(`Couldn't save that change. ${taskErrorMessage(error)}`);
      return;
    }
    if (user) {
      await logActivity(
        task.team_id,
        user.id,
        "task_updated",
        `moved "${task.title}" to ${status.replace("_", " ")}`,
        task.id,
      );
    }
    const teamTasks = next.filter((t) => t.team_id === task.team_id);
    if (status === "done" && teamTasks.length > 0 && teamTasks.every((t) => t.status === "done")) {
      confettiBurst();
      toast.success("Every task in this team is done. Nice work!");
    }
    queryClient.invalidateQueries({ queryKey: ["activity"] });
  }

  function onDragEnd(event: DragEndEvent) {
    const status = event.over?.id as TaskStatus | undefined;
    const task = local.find((t) => t.id === event.active.id);
    if (!status || !task) return;
    changeStatus(task, status);
  }

  if (teams.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        title="No tasks yet"
        description="Join or create a team first — tasks always belong to a team."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks"
          className="w-full sm:w-52"
          aria-label="Search tasks"
        />
        {!defaultTeamId && (
          <FilterSelect
            value={teamFilter}
            onChange={setTeamFilter}
            label="Team"
            options={[
              { value: "all", label: "All teams" },
              ...teams.map((t) => ({ value: t.id, label: t.name })),
            ]}
          />
        )}
        <FilterSelect
          value={assigneeFilter}
          onChange={setAssigneeFilter}
          label="Assignee"
          options={[
            { value: "all", label: "Anyone" },
            { value: "me", label: "My tasks" },
            ...members.map((m) => ({
              value: m.user_id,
              label: m.profile?.display_name ?? "Teammate",
            })),
          ]}
        />
        <FilterSelect
          value={priorityFilter}
          onChange={setPriorityFilter}
          label="Priority"
          options={[
            { value: "all", label: "Any priority" },
            ...PRIORITIES.map((p) => ({ value: p, label: p })),
          ]}
        />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          label="Status"
          options={[
            { value: "all", label: "All statuses" },
            ...STATUSES.map((status) => ({
              value: status.key,
              label: status.label,
            })),
          ]}
        />
        <FilterSelect
          value={dueFilter}
          onChange={setDueFilter}
          label="Due"
          options={[
            { value: "all", label: "Any date" },
            { value: "week", label: "Next 7 days" },
            { value: "overdue", label: "Overdue" },
          ]}
        />
        <Tabs
          value={view}
          onValueChange={(v) => setView(v as "board" | "list")}
          className="ml-auto"
        >
          <TabsList>
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button onClick={() => onCreateOpenChange(true)}>
          <Plus className="mr-1.5 size-4" />
          New task
        </Button>
      </div>

      {view === "board" ? (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {STATUSES.map((col) => (
              <Column
                key={col.key}
                status={col.key}
                label={col.label}
                tasks={filtered.filter((t) => t.status === col.key)}
                onOpen={setOpenTask}
                nameOf={nameOf}
                onStatusChange={changeStatus}
              />
            ))}
          </div>
        </DndContext>
      ) : (
        <ul className="space-y-2">
          {filtered.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => setOpenTask(t)}
                className="surface-card hover-lift flex w-full items-center justify-between gap-3 p-4 text-left"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {nameOf(t.assignee_id)} ·{" "}
                    {t.due_date ? new Date(t.due_date).toLocaleDateString() : "No due date"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <PriorityBadge priority={t.priority} />
                  <Badge variant="secondary">
                    {STATUSES.find((s) => s.key === t.status)?.label}
                  </Badge>
                </div>
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <EmptyState
              icon={ListChecks}
              title="No matching tasks"
              description="Adjust your filters, or create a new task for your team."
            />
          )}
        </ul>
      )}

      <CreateTaskDialog
        open={createOpen}
        onOpenChange={onCreateOpenChange}
        teams={teams}
        defaultTeamId={defaultTeamId ?? (teamFilter !== "all" ? teamFilter : teams[0]?.id)}
      />
      <TaskPanel
        task={openTask}
        onClose={() => setOpenTask(null)}
        onStatusChange={changeStatus}
        nameOf={nameOf}
        members={members}
      />
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[150px]" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const tone =
    priority === "urgent"
      ? "bg-destructive/15 text-destructive border-destructive/30"
      : priority === "high"
        ? "bg-primary/15 text-primary border-primary/30"
        : priority === "medium"
          ? "bg-blue/15 text-blue border-blue/30"
          : "bg-muted text-muted-foreground";
  return (
    <Badge variant="outline" className={tone}>
      {priority}
    </Badge>
  );
}

function Column({
  status,
  label,
  tasks,
  onOpen,
  nameOf,
  onStatusChange,
}: {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  onOpen: (t: Task) => void;
  nameOf: (id: string | null) => string;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-2xl border border-border bg-muted/40 p-3 transition-colors duration-200",
        isOver && "border-primary bg-primary/5",
      )}
    >
      <div className="flex items-center justify-between px-1 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onOpen={onOpen}
              nameOf={nameOf}
              onStatusChange={onStatusChange}
            />
          ))}
        </AnimatePresence>
        {tasks.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Drop tasks here
          </p>
        )}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onOpen,
  nameOf,
  onStatusChange,
}: {
  task: Task;
  onOpen: (t: Task) => void;
  nameOf: (id: string | null) => string;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });
  const overdue =
    task.due_date && new Date(task.due_date).getTime() < Date.now() && task.status !== "done";

  return (
    <motion.div
      ref={setNodeRef}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isDragging ? 0.6 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : "none",
      }}
      className={cn(
        "surface-card cursor-grab p-3 active:cursor-grabbing",
        isDragging && "shadow-[var(--shadow-lift)]",
      )}
      {...listeners}
      {...attributes}
    >
      <button onClick={() => onOpen(task)} className="w-full text-left">
        <p className="text-sm font-medium">{task.title}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
          {task.due_date && (
            <Badge variant={overdue ? "destructive" : "secondary"} className="gap-1">
              <CalendarClock className="size-3" />
              {new Date(task.due_date).toLocaleDateString()}
            </Badge>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{nameOf(task.assignee_id)}</p>
      </button>
      <div className="mt-2" onPointerDown={(e) => e.stopPropagation()}>
        <Select value={task.status} onValueChange={(v) => onStatusChange(task, v as TaskStatus)}>
          <SelectTrigger className="h-8 text-xs" aria-label={`Status for ${task.title}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s.key} value={s.key}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  );
}

function CreateTaskDialog({
  open,
  onOpenChange,
  teams,
  defaultTeamId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  teams: TeamLike[];
  defaultTeamId?: string | undefined;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [teamId, setTeamId] = useState(defaultTeamId ?? teams[0]?.id ?? "");
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
    status: "todo" as TaskStatus,
    due: "",
    assignee: "unassigned",
  });

  useEffect(() => {
    if (defaultTeamId) setTeamId(defaultTeamId);
  }, [defaultTeamId]);

  const membersQuery = useQuery({
    queryKey: ["members", teamId],
    queryFn: () => fetchTeamMembers(teamId),
    enabled: !!teamId && open,
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !teamId) return;
    setBusy(true);
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        team_id: teamId,
        title: form.title,
        description: form.description || null,
        priority: form.priority,
        status: form.status,
        due_date: form.due ? new Date(form.due).toISOString() : null,
        assignee_id: form.assignee === "unassigned" ? null : form.assignee,
        created_by: user.id,
        position: Date.now() % 1000000,
      })
      .select("*")
      .single();
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await logActivity(teamId, user.id, "task_created", `created "${form.title}"`, data.id);
    if (form.assignee !== "unassigned" && form.assignee !== user.id) {
      await notify(
        form.assignee,
        "task_assigned",
        "New task assigned to you",
        form.title,
        `/tasks`,
      );
    }
    toast.success("Task created");
    setForm({
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      due: "",
      assignee: "unassigned",
    });
    onOpenChange(false);
    queryClient.invalidateQueries();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tt">Title</Label>
            <Input
              id="tt"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tdesc">Description</Label>
            <Textarea
              id="tdesc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Team</Label>
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Assignee</Label>
              <Select
                value={form.assignee}
                onValueChange={(v) => setForm({ ...form, assignee: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {(membersQuery.data ?? []).map((m) => (
                    <SelectItem key={m.user_id} value={m.user_id}>
                      {m.profile?.display_name ?? "Teammate"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm({ ...form, priority: v as TaskPriority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tdue">Due date</Label>
              <Input
                id="tdue"
                type="datetime-local"
                value={form.due}
                onChange={(e) => setForm({ ...form, due: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !teamId}>
              {busy && <Loader2 className="mr-2 size-4 animate-spin" />}Create task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TaskPanel({
  task,
  onClose,
  onStatusChange,
  nameOf,
  members,
}: {
  task: Task | null;
  onClose: () => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  nameOf: (id: string | null) => string;
  members: MemberWithProfile[];
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [newItem, setNewItem] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const detail = useQuery({
    queryKey: ["task-detail", task?.id],
    queryFn: async () => {
      const [items, comments] = await Promise.all([
        supabase.from("task_checklist_items").select("*").eq("task_id", task!.id).order("position"),
        supabase.from("task_comments").select("*").eq("task_id", task!.id).order("created_at"),
      ]);
      return { items: items.data ?? [], comments: comments.data ?? [] };
    },
    enabled: !!task,
  });

  if (!task) return null;

  async function addComment() {
    if (!comment.trim() || !user || !task) return;
    const { error } = await supabase
      .from("task_comments")
      .insert({ task_id: task.id, author_id: user.id, body: comment.trim() });
    if (error) return void toast.error(error.message);
    setComment("");
    detail.refetch();
  }

  async function addItem() {
    if (!newItem.trim() || !task) return;
    const { error } = await supabase
      .from("task_checklist_items")
      .insert({ task_id: task.id, label: newItem.trim() });
    if (error) return void toast.error(error.message);
    setNewItem("");
    detail.refetch();
  }

  async function assign(userId: string) {
    if (!task) return;
    const { error } = await supabase
      .from("tasks")
      .update({ assignee_id: userId === "unassigned" ? null : userId })
      .eq("id", task.id);
    if (error) return void toast.error(taskErrorMessage(error));
    if (userId !== "unassigned" && userId !== user?.id) {
      await notify(userId, "task_assigned", "New task assigned to you", task.title, "/tasks");
    }
    toast.success("Assignee updated");
    queryClient.invalidateQueries();
    onClose();
  }

  async function remove() {
    if (!task) return;
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (error) return void toast.error(error.message);
    toast.success("Task deleted");
    setConfirmDelete(false);
    onClose();
    queryClient.invalidateQueries();
  }

  return (
    <Sheet open={!!task} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="pr-6 text-left">{task.title}</SheetTitle>
        </SheetHeader>
        <div className="space-y-5 px-4 pb-8">
          <p className="text-sm text-muted-foreground">
            {task.description || "No description provided."}
          </p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={task.status}
                onValueChange={(v) => onStatusChange(task, v as TaskStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.key} value={s.key}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Assignee</Label>
              <Select value={task.assignee_id ?? "unassigned"} onValueChange={assign}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.user_id} value={m.user_id}>
                      {m.profile?.display_name ?? "Teammate"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">Created by {nameOf(task.created_by)}</Badge>
            {task.due_date && (
              <Badge variant="secondary">Due {new Date(task.due_date).toLocaleString()}</Badge>
            )}
            <PriorityBadge priority={task.priority} />
          </div>

          <section>
            <h4 className="text-sm font-semibold">Checklist</h4>
            <ul className="mt-2 space-y-2">
              {(detail.data?.items ?? []).map((item) => (
                <li key={item.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={item.done}
                    onCheckedChange={async (v) => {
                      await supabase
                        .from("task_checklist_items")
                        .update({ done: !!v })
                        .eq("id", item.id);
                      detail.refetch();
                    }}
                  />
                  <span className={cn(item.done && "text-muted-foreground line-through")}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex gap-2">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add a checklist item"
              />
              <Button variant="outline" onClick={addItem}>
                Add
              </Button>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold">Comments</h4>
            <ul className="mt-2 space-y-2">
              {(detail.data?.comments ?? []).map((c) => (
                <li key={c.id} className="rounded-lg border border-border p-3 text-sm">
                  <p>{c.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {nameOf(c.author_id)} · {new Date(c.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex gap-2">
              <Textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment"
              />
              <Button variant="outline" onClick={addComment}>
                Post
              </Button>
            </div>
          </section>

          <Button variant="destructive" className="w-full" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="mr-2 size-4" />
            Delete task
          </Button>
        </div>
      </SheetContent>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the task, its checklist and comments for everyone in the team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
