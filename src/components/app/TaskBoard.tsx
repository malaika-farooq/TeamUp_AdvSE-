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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { canDeleteComment, canDeleteTask, canEditTask } from "@/lib/team-rules";
import { useTeamRoles } from "@/lib/use-team-roles";
import { EmptyState } from "@/components/app/states";
import { UserAvatar } from "@/components/app/profile/UserAvatar";
import {
  PRIORITIES,
  STATUSES,
  fetchTeamMembers,
  logActivity,
  notify,
  type MemberWithProfile,
  type Task,
  type TaskPriority,
  type TaskStatus,
  type Team,
} from "@/lib/queries";
import { cn } from "@/lib/utils";
import {
  BOARD_COLUMNS,
  DESCRIPTION_MAX,
  TITLE_MAX,
  columnCounts,
  columnLabel,
  columnOf,
  describeChanges,
  dueState,
  filterTasks,
  isOverdue,
  progress,
  statusPatch,
  tasksInColumn,
  toLocalInput,
  validateTaskForm,
  type BoardStatus,
  type DueKind,
} from "@/lib/task-board";

type TeamLike = Pick<Team, "id" | "name">;

export function taskErrorMessage(error: { message: string; code?: string }) {
  if (error.code === "42501")
    return "You don't have permission to change this task — only its creator, its assignee, or a team admin can.";
  return error.message;
}

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
  const [openId, setOpenId] = useState<string | null>(null);
  const [createStatus, setCreateStatus] = useState<BoardStatus>("todo");
  const [local, setLocal] = useState<Task[]>(tasks);
  // The open task is looked up by id, so the panel always shows its latest status, assignee and dates.
  const openTask = local.find((t) => t.id === openId) ?? null;
  const setOpenTask = (t: Task | null) => setOpenId(t?.id ?? null);

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
  const { roleIn } = useTeamRoles();
  const editable = (t: Task) => canEditTask(roleIn(t.team_id), user?.id, t);
  const avatarOf = (id: string | null) =>
    id ? (members.find((m) => m.user_id === id)?.profile?.avatar_url ?? null) : null;

  const filtered = useMemo(
    () =>
      filterTasks(
        local,
        {
          team: teamFilter,
          assignee: assigneeFilter,
          priority: priorityFilter,
          due: dueFilter,
          search,
        },
        user?.id,
      ),
    [local, teamFilter, assigneeFilter, priorityFilter, dueFilter, search, user?.id],
  );
  const counts = columnCounts(filtered);
  const overall = progress(filtered);
  const overdueCount = filtered.filter((t) => isOverdue(t)).length;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  async function changeStatus(task: Task, status: TaskStatus) {
    if (columnOf(task.status) === status) return;
    if (!editable(task)) {
      toast.error("Only the task's creator, its assignee, or a team admin can change it.");
      return;
    }
    const previous = local;
    const patch = statusPatch(status as BoardStatus);
    const next = local.map((t) => (t.id === task.id ? { ...t, ...patch } : t));
    setLocal(next);
    const { error } = await supabase.from("tasks").update(patch).eq("id", task.id);
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
        `moved "${task.title}" to ${columnLabel(status)}`,
        task.id,
      );
      // Tell the person who asked for the work when someone else finishes it.
      if (status === "done" && task.created_by !== user.id) {
        await notify(
          task.created_by,
          "task_done",
          "A task you created is done",
          task.title,
          "/tasks",
        );
      }
    }
    const teamTasks = next.filter((t) => t.team_id === task.team_id);
    if (
      status === "done" &&
      teamTasks.length > 0 &&
      teamTasks.every((t) => columnOf(t.status) === "done")
    ) {
      confettiBurst();
      toast.success("Every task in this team is done. Nice work!");
    }
    queryClient.invalidateQueries({ queryKey: ["activity"] });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }

  /** Keeps the board in step with a task that was edited in the panel. */
  function updateLocal(task: Task) {
    setLocal((all) => all.map((t) => (t.id === task.id ? task : t)));
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }

  function onDragEnd(event: DragEndEvent) {
    const over = event.over?.id;
    const status = BOARD_COLUMNS.some((c) => c.key === over) ? (over as TaskStatus) : undefined;
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
        <Button
          onClick={() => {
            setCreateStatus("todo");
            onCreateOpenChange(true);
          }}
        >
          <Plus className="mr-1.5 size-4" />
          New task
        </Button>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {overall.done} of {overall.total} done ({overall.percent}%)
        {overdueCount > 0 && (
          <span className="ml-2 font-medium text-destructive">{overdueCount} overdue</span>
        )}
      </p>

      {view === "board" ? (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="grid gap-4 md:grid-cols-3">
            {BOARD_COLUMNS.map((col) => (
              <Column
                key={col.key}
                status={col.key}
                label={col.label}
                tasks={tasksInColumn(filtered, col.key)}
                total={counts[col.key]}
                onAdd={() => {
                  setCreateStatus(col.key);
                  onCreateOpenChange(true);
                }}
                onOpen={setOpenTask}
                nameOf={nameOf}
                avatarOf={avatarOf}
                canEdit={editable}
                onStatusChange={changeStatus}
              />
            ))}
          </div>
        </DndContext>
      ) : (
        <ul className="space-y-2">
          {BOARD_COLUMNS.flatMap((c) => tasksInColumn(filtered, c.key)).map((t) => (
            <li key={t.id}>
              <button
                onClick={() => setOpenTask(t)}
                className="surface-card hover-lift flex w-full items-center justify-between gap-3 p-4 text-left"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 align-middle">
                      {t.assignee_id && (
                        <UserAvatar
                          name={nameOf(t.assignee_id)}
                          path={avatarOf(t.assignee_id)}
                          className="size-4"
                          fallbackClassName="text-[8px]"
                        />
                      )}
                      {nameOf(t.assignee_id)}
                    </span>{" "}
                    · {dueState(t.due_date, t.status).label}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <PriorityBadge priority={t.priority} />
                  <Badge variant="secondary">{columnLabel(t.status)}</Badge>
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
        initialStatus={createStatus}
      />
      <TaskPanel
        task={openTask}
        onClose={() => setOpenTask(null)}
        onStatusChange={changeStatus}
        onUpdate={updateLocal}
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
  total,
  onAdd,
  onOpen,
  nameOf,
  avatarOf,
  canEdit,
  onStatusChange,
}: {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  total: number;
  onAdd: () => void;
  onOpen: (t: Task) => void;
  nameOf: (id: string | null) => string;
  avatarOf: (id: string | null) => string | null;
  canEdit: (t: Task) => boolean;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      role="group"
      aria-label={label}
      className={cn(
        "rounded-2xl border border-border bg-muted/40 p-3 transition-colors duration-200",
        isOver && "border-primary bg-primary/5",
      )}
    >
      <div className="flex items-center justify-between px-1 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="flex items-center gap-1">
          <Badge variant="secondary" aria-label={`${total} in ${label}`}>
            {total}
          </Badge>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-7"
            aria-label={`Add task to ${label}`}
            onClick={onAdd}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onOpen={onOpen}
              nameOf={nameOf}
              avatarOf={avatarOf}
              canEdit={canEdit(t)}
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
  avatarOf,
  canEdit,
  onStatusChange,
}: {
  task: Task;
  onOpen: (t: Task) => void;
  nameOf: (id: string | null) => string;
  avatarOf: (id: string | null) => string | null;
  canEdit: boolean;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: !canEdit,
  });
  const due = dueState(task.due_date, task.status);

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
        "surface-card p-3",
        canEdit ? "cursor-grab active:cursor-grabbing" : "cursor-default",
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
            <Badge
              variant={due.kind === "overdue" ? "destructive" : "secondary"}
              className={cn("gap-1", due.kind === "today" && "border-primary/40 bg-primary/10")}
              data-due={due.kind}
            >
              <CalendarClock className="size-3" />
              {due.label}
            </Badge>
          )}
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          {task.assignee_id && (
            <UserAvatar
              name={nameOf(task.assignee_id)}
              path={avatarOf(task.assignee_id)}
              className="size-5"
              fallbackClassName="text-[9px]"
            />
          )}
          {nameOf(task.assignee_id)}
        </p>
      </button>
      <div className="mt-2" onPointerDown={(e) => e.stopPropagation()}>
        <Select
          value={columnOf(task.status)}
          disabled={!canEdit}
          onValueChange={(v) => onStatusChange(task, v as TaskStatus)}
        >
          <SelectTrigger
            className="h-8 text-xs"
            aria-label={
              canEdit ? `Status for ${task.title}` : `Status for ${task.title} (view only)`
            }
            title={
              canEdit
                ? undefined
                : "Only the creator, the assignee or a team admin can change this task"
            }
          >
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
  initialStatus = "todo",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  teams: TeamLike[];
  defaultTeamId?: string | undefined;
  initialStatus?: BoardStatus;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [teamId, setTeamId] = useState(defaultTeamId ?? teams[0]?.id ?? "");
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
    status: initialStatus as string,
    due: "",
    assignee: "unassigned",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  useEffect(() => {
    if (defaultTeamId) setTeamId(defaultTeamId);
  }, [defaultTeamId]);
  // Opening from a column's "+" starts the task in that column.
  useEffect(() => {
    if (open) {
      setForm((f) => ({ ...f, status: initialStatus }));
      setErrors({});
    }
  }, [open, initialStatus]);

  const membersQuery = useQuery({
    queryKey: ["members", teamId],
    queryFn: () => fetchTeamMembers(teamId),
    enabled: !!teamId && open,
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !teamId) return;
    const checked = validateTaskForm(form);
    if (!checked.ok) {
      setErrors(checked.errors);
      return;
    }
    setErrors({});
    const clean = checked.clean;
    setBusy(true);
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        team_id: teamId,
        title: clean.title,
        description: clean.description,
        priority: clean.priority,
        due_date: clean.due_date,
        assignee_id: clean.assignee_id,
        created_by: user.id,
        position: Date.now() % 1000000,
        ...statusPatch(clean.status),
      })
      .select("*")
      .single();
    setBusy(false);
    if (error) {
      toast.error(taskErrorMessage(error));
      return;
    }
    await logActivity(teamId, user.id, "task_created", `created "${clean.title}"`, data.id);
    if (clean.assignee_id && clean.assignee_id !== user.id) {
      await notify(
        clean.assignee_id,
        "task_assigned",
        "New task assigned to you",
        clean.title,
        `/tasks`,
      );
    }
    toast.success("Task created");
    setForm({
      title: "",
      description: "",
      priority: "medium",
      status: initialStatus,
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
              value={form.title}
              maxLength={TITLE_MAX}
              aria-invalid={!!errors.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            {errors.title && (
              <p role="alert" className="text-xs text-destructive">
                {errors.title}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tdesc">Description</Label>
            <Textarea
              id="tdesc"
              rows={3}
              value={form.description}
              maxLength={DESCRIPTION_MAX}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Team</Label>
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger aria-label="Team">
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
                <SelectTrigger aria-label="Assignee">
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
                <SelectTrigger aria-label="Priority">
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
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger aria-label="Status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BOARD_COLUMNS.map((c) => (
                    <SelectItem key={c.key} value={c.key}>
                      {c.label}
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
                aria-invalid={!!errors.due}
                onChange={(e) => setForm({ ...form, due: e.target.value })}
              />
              {errors.due && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.due}
                </p>
              )}
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
  onUpdate,
  nameOf,
  members,
}: {
  task: Task | null;
  onClose: () => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  /** Called with the saved task after the assignee or the details change. */
  onUpdate?: (task: Task) => void;
  nameOf: (id: string | null) => string;
  members: MemberWithProfile[];
}) {
  const { user } = useAuth();
  const { roleIn } = useTeamRoles();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [newItem, setNewItem] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({ title: "", description: "", priority: "medium", due: "" });
  const [draftErrors, setDraftErrors] = useState<Record<string, string>>({});

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

  const myRole = roleIn(task.team_id);
  const mayEdit = canEditTask(myRole, user?.id, task);
  const mayDelete = canDeleteTask(myRole, user?.id, task);

  async function removeComment(id: string) {
    const { error } = await supabase.from("task_comments").delete().eq("id", id);
    if (error) return void toast.error(error.message);
    detail.refetch();
  }

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
    const assignee = userId === "unassigned" ? null : userId;
    if (assignee === task.assignee_id) return;
    const { error } = await supabase
      .from("tasks")
      .update({ assignee_id: assignee })
      .eq("id", task.id);
    if (error) return void toast.error(taskErrorMessage(error));
    if (assignee && assignee !== user?.id) {
      await notify(assignee, "task_assigned", "New task assigned to you", task.title, "/tasks");
    }
    if (user) {
      await logActivity(
        task.team_id,
        user.id,
        "task_updated",
        assignee ? `assigned "${task.title}" to ${nameOf(assignee)}` : `unassigned "${task.title}"`,
        task.id,
      );
    }
    toast.success("Assignee updated");
    onUpdate?.({ ...task, assignee_id: assignee });
    queryClient.invalidateQueries({ queryKey: ["activity"] });
  }

  function startEditing() {
    if (!task) return;
    setDraft({
      title: task.title,
      description: task.description ?? "",
      priority: task.priority,
      due: toLocalInput(task.due_date),
    });
    setDraftErrors({});
    setEditing(true);
  }

  async function saveDetails() {
    if (!task) return;
    const checked = validateTaskForm({
      ...draft,
      status: columnOf(task.status),
      assignee: task.assignee_id ?? "unassigned",
    });
    if (!checked.ok) {
      setDraftErrors(checked.errors as Record<string, string>);
      return;
    }
    setDraftErrors({});
    const c = checked.clean;
    const changed = describeChanges(task, {
      title: c.title,
      description: c.description,
      priority: c.priority,
      due_date: c.due_date,
    });
    if (!changed.length) {
      setEditing(false);
      return;
    }
    setSaving(true);
    const patch = {
      title: c.title,
      description: c.description,
      priority: c.priority,
      due_date: c.due_date,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("tasks").update(patch).eq("id", task.id);
    setSaving(false);
    if (error) return void toast.error(taskErrorMessage(error));
    if (user) {
      await logActivity(
        task.team_id,
        user.id,
        "task_updated",
        `edited "${c.title}" (${changed.join(", ")})`,
        task.id,
      );
      if (
        changed.some((x) => x.startsWith("due date")) &&
        task.assignee_id &&
        task.assignee_id !== user.id
      ) {
        await notify(
          task.assignee_id,
          "task_due_changed",
          c.due_date ? "A task's due date changed" : "A task's due date was removed",
          c.title,
          "/tasks",
        );
      }
    }
    toast.success("Task updated");
    setEditing(false);
    onUpdate?.({ ...task, ...patch });
    queryClient.invalidateQueries({ queryKey: ["activity"] });
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
          {editing ? (
            <form
              aria-label="Edit task details"
              className="space-y-3 rounded-xl border border-border p-3"
              onSubmit={(e) => {
                e.preventDefault();
                void saveDetails();
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="et-title">Title</Label>
                <Input
                  id="et-title"
                  value={draft.title}
                  maxLength={TITLE_MAX}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
                {draftErrors["title"] && (
                  <p role="alert" className="text-xs text-destructive">
                    {draftErrors["title"]}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="et-desc">Description</Label>
                <Textarea
                  id="et-desc"
                  rows={3}
                  value={draft.description}
                  maxLength={DESCRIPTION_MAX}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="et-priority">Priority</Label>
                  <select
                    id="et-priority"
                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                    value={draft.priority}
                    onChange={(e) => setDraft({ ...draft, priority: e.target.value })}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="et-due">Due date</Label>
                  <Input
                    id="et-due"
                    type="datetime-local"
                    value={draft.due}
                    onChange={(e) => setDraft({ ...draft, due: e.target.value })}
                  />
                  {draftErrors["due"] && (
                    <p role="alert" className="text-xs text-destructive">
                      {draftErrors["due"]}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!draft.due}
                  onClick={() => setDraft({ ...draft, due: "" })}
                >
                  Remove due date
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={saving}>
                    {saving && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                    Save changes
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {task.description || "No description provided."}
              </p>
              {mayEdit && (
                <Button variant="outline" size="sm" onClick={startEditing}>
                  Edit details
                </Button>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={columnOf(task.status)}
                disabled={!mayEdit}
                onValueChange={(v) => onStatusChange(task, v as TaskStatus)}
              >
                <SelectTrigger aria-label="Status">
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
              <Select
                value={task.assignee_id ?? "unassigned"}
                disabled={!mayEdit}
                onValueChange={assign}
              >
                <SelectTrigger aria-label="Assignee">
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

          {!mayEdit && (
            <p className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              View only. Only the creator, the assignee, or a team admin can change this task. You
              can still comment and tick checklist items.
            </p>
          )}

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">Created by {nameOf(task.created_by)}</Badge>
            {task.due_date && (
              <Badge
                variant={
                  dueState(task.due_date, task.status).kind === "overdue"
                    ? "destructive"
                    : "secondary"
                }
              >
                {dueState(task.due_date, task.status).label} ·{" "}
                {new Date(task.due_date).toLocaleString()}
              </Badge>
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
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <UserAvatar
                      name={nameOf(c.author_id)}
                      path={members.find((m) => m.user_id === c.author_id)?.profile?.avatar_url}
                      className="size-5"
                      fallbackClassName="text-[9px]"
                    />
                    {nameOf(c.author_id)} · {new Date(c.created_at).toLocaleString()}
                    {canDeleteComment(myRole, user?.id, c) && (
                      <button
                        type="button"
                        className="ml-auto text-xs underline-offset-2 hover:underline"
                        onClick={() => removeComment(c.id)}
                      >
                        Delete
                      </button>
                    )}
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

          {mayDelete && (
            <Button variant="destructive" className="w-full" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="mr-2 size-4" />
              Delete task
            </Button>
          )}
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
