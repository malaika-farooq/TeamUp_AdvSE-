import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Download,
  ExternalLink,
  Eye,
  FileText,
  Link2,
  Loader2,
  NotebookPen,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth";
import { canChangeItem } from "@/lib/team-rules";
import { useTeamRoles } from "@/lib/use-team-roles";
import { EmptyState } from "@/components/app/states";
import { MessageResponse } from "@/components/ai-elements/message";
import { fetchTeamMembers, logActivity, type Resource, type Team } from "@/lib/queries";
import { notifyMany } from "@/lib/notifications";
import {
  NOTE_MAX,
  NO_RESOURCE_FILTERS,
  TITLE_MAX,
  URL_MAX,
  allTags,
  filterResources,
  formatFileSize,
  hostOf,
  isSafeHref,
  kindLabel,
  sortResources,
  storagePathFor,
  validateResource,
  type ResourceFilters,
  type ResourceKind,
} from "@/lib/resources";
import { UserAvatar } from "@/components/app/profile/UserAvatar";

type TeamLike = Pick<Team, "id" | "name">;

export function ResourcesPanel({
  resources,
  teams,
  defaultTeamId,
}: {
  resources: Resource[];
  teams: TeamLike[];
  defaultTeamId?: string | undefined;
}) {
  const { user } = useAuth();
  const { roleIn } = useTeamRoles();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ResourceFilters>(NO_RESOURCE_FILTERS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [viewing, setViewing] = useState<Resource | null>(null);
  const [deleting, setDeleting] = useState<Resource | null>(null);
  const manyTeams = teams.length > 1 && !defaultTeamId;
  const teamName = (id: string) => teams.find((t) => t.id === id)?.name ?? "Team";

  const shown = useMemo(
    () => sortResources(filterResources(resources, filters)),
    [resources, filters],
  );
  const tags = useMemo(() => allTags(resources), [resources]);

  // Who shared each thing.
  const authorIds = [...new Set(resources.map((r) => r.created_by))].sort();
  const authors = useQuery({
    queryKey: ["resource-authors", authorIds],
    enabled: authorIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", authorIds);
      if (error) throw new Error(error.message);
      return (data ?? []) as { id: string; display_name: string; avatar_url: string | null }[];
    },
  });
  const author = (id: string) => authors.data?.find((p) => p.id === id);

  async function download(r: Resource) {
    if (!r.storage_path) return;
    const { data, error } = await supabase.storage
      .from("team-files")
      .createSignedUrl(r.storage_path, 60);
    if (error) return void toast.error(error.message);
    window.open(data.signedUrl, "_blank", "noopener");
  }

  async function confirmDelete() {
    const r = deleting;
    if (!r) return;
    const { error } = await supabase.from("resources").delete().eq("id", r.id);
    if (error) {
      setDeleting(null);
      return void toast.error(error.message);
    }
    if (r.storage_path) {
      const { error: storageError } = await supabase.storage
        .from("team-files")
        .remove([r.storage_path]);
      if (storageError) toast.warning("Removed, but the stored file couldn't be cleaned up.");
    }
    if (user) await logActivity(r.team_id, user.id, "resource_removed", `removed "${r.title}"`);
    toast.success(`${kindLabel(r.kind)[0]!.toUpperCase()}${kindLabel(r.kind).slice(1)} removed`);
    setDeleting(null);
    void queryClient.invalidateQueries();
  }

  const set = (patch: Partial<ResourceFilters>) => setFilters((f) => ({ ...f, ...patch }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          placeholder="Search notes, links, files, tags"
          className="w-full sm:w-64"
          aria-label="Search resources"
        />
        <Tabs
          value={filters.kind}
          onValueChange={(v) => set({ kind: v as ResourceFilters["kind"] })}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="note">Notes</TabsTrigger>
            <TabsTrigger value="link">Links</TabsTrigger>
            <TabsTrigger value="file">Files</TabsTrigger>
          </TabsList>
        </Tabs>
        {manyTeams && (
          <Select value={filters.team} onValueChange={(v) => set({ team: v })}>
            <SelectTrigger className="w-44" aria-label="Team">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All teams</SelectItem>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button
          className="ml-auto"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-1.5 size-4" />
          Add resource
        </Button>
      </div>

      {tags.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Filter by tag"
        >
          <span className="text-xs text-muted-foreground">Tags:</span>
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={filters.tag === t}
              onClick={() => set({ tag: filters.tag === t ? "all" : t })}
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Badge variant={filters.tag === t ? "default" : "secondary"}>{t}</Badge>
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title={resources.length === 0 ? "No resources yet" : "Nothing matches"}
          description={
            resources.length === 0
              ? "Share notes, bookmark links, or upload files your team needs."
              : "Try a different search, tag or filter."
          }
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" aria-label="Shared resources">
          {shown.map((r, i) => {
            const mayChange = canChangeItem(roleIn(r.team_id), user?.id, r);
            const by = author(r.created_by);
            return (
              <motion.li
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                className="surface-card hover-lift flex flex-col gap-2 p-4"
                data-kind={r.kind}
              >
                <div className="flex items-center gap-2">
                  {r.kind === "note" ? (
                    <NotebookPen className="size-4 shrink-0 text-teal" />
                  ) : r.kind === "link" ? (
                    <Link2 className="size-4 shrink-0 text-blue" />
                  ) : (
                    <FileText className="size-4 shrink-0 text-lavender" />
                  )}
                  <p className="truncate font-medium">{r.title}</p>
                </div>
                {manyTeams && (
                  <p className="text-xs text-muted-foreground">{teamName(r.team_id)}</p>
                )}
                {r.kind === "note" && r.content && (
                  <div className="relative max-h-28 overflow-hidden text-sm text-muted-foreground">
                    <MessageResponse className="[&_h1]:my-1 [&_h1]:text-sm [&_h2]:my-1 [&_h2]:text-sm [&_h3]:my-1 [&_h3]:text-sm [&_li]:py-0 [&_p]:my-1">
                      {r.content}
                    </MessageResponse>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-card to-transparent" />
                  </div>
                )}
                {r.kind === "link" &&
                  (isSafeHref(r.url) ? (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 truncate text-sm text-blue underline"
                    >
                      <ExternalLink className="size-3.5 shrink-0" />
                      {hostOf(r.url) || r.url}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">This link can't be opened.</p>
                  ))}
                {r.kind === "file" && r.file_size ? (
                  <p className="text-xs text-muted-foreground">{formatFileSize(r.file_size)}</p>
                ) : null}
                {(r.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(r.tags ?? []).map((t) => (
                      <Badge key={t} variant="secondary">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                  {by && (
                    <UserAvatar name={by.display_name} path={by.avatar_url} className="size-4" />
                  )}
                  {by ? `${by.display_name} · ` : ""}Updated{" "}
                  {new Date(r.updated_at).toLocaleString()}
                </p>
                <div className="flex flex-wrap gap-2">
                  {r.kind === "note" && (
                    <Button
                      size="sm"
                      variant="outline"
                      aria-label={`Read ${r.title}`}
                      onClick={() => setViewing(r)}
                    >
                      <Eye className="mr-1.5 size-4" />
                      Read
                    </Button>
                  )}
                  {r.kind === "file" && (
                    <Button size="sm" variant="outline" onClick={() => download(r)}>
                      <Download className="mr-1.5 size-4" />
                      Download
                    </Button>
                  )}
                  {mayChange && (
                    <Button
                      size="sm"
                      variant="outline"
                      aria-label={`Edit ${r.title}`}
                      onClick={() => {
                        setEditing(r);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="mr-1.5 size-4" />
                      Edit
                    </Button>
                  )}
                  {mayChange && (
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Delete ${r.title}`}
                      onClick={() => setDeleting(r)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}

      <ResourceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        teams={teams}
        defaultTeamId={defaultTeamId}
        editing={editing}
      />

      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewing?.title}</DialogTitle>
            <DialogDescription>
              {viewing && (
                <>
                  {author(viewing.created_by)?.display_name ?? "A teammate"} · Updated{" "}
                  {new Date(viewing.updated_at).toLocaleString()}
                  {manyTeams && viewing ? ` · ${teamName(viewing.team_id)}` : ""}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {viewing?.content ? (
            <MessageResponse>{viewing.content}</MessageResponse>
          ) : (
            <p className="text-sm text-muted-foreground">This note is empty.</p>
          )}
          {(viewing?.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {(viewing?.tags ?? []).map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleting?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.kind === "file"
                ? "The file is removed for everyone in the team."
                : `This ${deleting ? kindLabel(deleting.kind) : "item"} is removed for everyone in the team.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ResourceDialog({
  open,
  onOpenChange,
  teams,
  defaultTeamId,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  teams: TeamLike[];
  defaultTeamId?: string | undefined;
  editing: Resource | null;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [kind, setKind] = useState<ResourceKind>("note");
  const [teamId, setTeamId] = useState(defaultTeamId ?? teams[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<"title" | "body" | "url" | "file", string>>>(
    {},
  );

  const isEdit = !!editing;
  const firstTeamId = teams[0]?.id;

  // Every time the form opens it starts fresh, or with the item being edited.
  useEffect(() => {
    if (!open) return;
    setErrors({});
    setProgress(0);
    setFile(null);
    if (editing) {
      setKind(editing.kind as ResourceKind);
      setTeamId(editing.team_id);
      setTitle(editing.title);
      setBody(editing.content ?? "");
      setUrl(editing.url ?? "");
      setTags((editing.tags ?? []).join(", "));
    } else {
      setKind("note");
      setTeamId(defaultTeamId ?? firstTeamId ?? "");
      setTitle("");
      setBody("");
      setUrl("");
      setTags("");
    }
  }, [open, editing, defaultTeamId, firstTeamId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !teamId || busy) return;
    const checked = validateResource(
      { kind, title, body, url, tags, file: file ? { name: file.name, size: file.size } : null },
      isEdit,
    );
    if (!checked.ok) {
      setErrors(checked.errors);
      return;
    }
    setErrors({});
    const clean = checked.clean;
    setBusy(true);

    if (isEdit && editing) {
      // Only save over the version that was opened, so two people editing at once don't overwrite each other.
      const patch: Database["public"]["Tables"]["resources"]["Update"] = {
        title: clean.title,
        tags: clean.tags,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      };
      if (clean.kind === "note") patch.content = clean.content;
      if (clean.kind === "link") patch.url = clean.url;
      const { data, error } = await supabase
        .from("resources")
        .update(patch)
        .eq("id", editing.id)
        .eq("version", editing.version)
        .select("id");
      setBusy(false);
      if (error) return void toast.error(error.message);
      if (!data || data.length === 0) {
        toast.error(
          "Someone else changed this just now. Close it and open it again to see their version.",
        );
        return;
      }
      await logActivity(teamId, user.id, "resource_updated", `edited "${clean.title}"`, editing.id);
      toast.success(
        `${kindLabel(clean.kind)[0]!.toUpperCase()}${kindLabel(clean.kind).slice(1)} updated`,
      );
      onOpenChange(false);
      void queryClient.invalidateQueries();
      return;
    }

    let storagePath: string | null = null;
    let fileSize: number | null = null;
    let mime: string | null = null;
    if (clean.kind === "file" && file) {
      setProgress(35);
      const path = storagePathFor(teamId, file.name);
      const { error: upErr } = await supabase.storage.from("team-files").upload(path, file);
      if (upErr) {
        setBusy(false);
        setProgress(0);
        return void toast.error(upErr.message);
      }
      setProgress(80);
      storagePath = path;
      fileSize = file.size;
      mime = file.type || null;
    }

    const { data: created, error } = await supabase
      .from("resources")
      .insert({
        team_id: teamId,
        kind: clean.kind,
        title: clean.title,
        content: clean.content,
        url: clean.url,
        storage_path: storagePath,
        file_size: fileSize,
        mime_type: mime,
        tags: clean.tags,
        created_by: user.id,
        updated_by: user.id,
      })
      .select("id")
      .single();
    setBusy(false);
    if (error) {
      // The upload happened but the record didn't: don't leave an orphan file behind.
      if (storagePath) await supabase.storage.from("team-files").remove([storagePath]);
      setProgress(0);
      return void toast.error(error.message);
    }
    setProgress(100);
    await logActivity(teamId, user.id, "resource_added", `added "${clean.title}"`, created?.id);
    // Tell the rest of the team. Failing to notify never blocks the share itself.
    try {
      const members = await fetchTeamMembers(teamId);
      const teamLabel = teams.find((t) => t.id === teamId)?.name ?? "your team";
      await notifyMany(
        members.map((m) => m.user_id).filter((id) => id !== user.id),
        {
          type: "resource_shared",
          title: `New ${kindLabel(clean.kind)} shared in ${teamLabel}`,
          body: clean.title,
          link: "/resources",
        },
      );
    } catch {
      /* the notification is a courtesy */
    }
    toast.success("Resource added");
    onOpenChange(false);
    void queryClient.invalidateQueries();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${kindLabel(kind)}` : "Add a resource"}</DialogTitle>
          <DialogDescription>
            Everyone in the team can read it. Files are stored privately and only team members can
            open them.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate>
          {!isEdit && (
            <>
              <Tabs value={kind} onValueChange={(v) => setKind(v as ResourceKind)}>
                <TabsList className="w-full">
                  <TabsTrigger value="note" className="flex-1">
                    Note
                  </TabsTrigger>
                  <TabsTrigger value="link" className="flex-1">
                    Link
                  </TabsTrigger>
                  <TabsTrigger value="file" className="flex-1">
                    File
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              {teams.length > 1 && (
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
              )}
            </>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="rt">Title</Label>
            <Input
              id="rt"
              value={title}
              maxLength={TITLE_MAX}
              aria-invalid={!!errors.title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && (
              <p role="alert" className="text-xs text-destructive">
                {errors.title}
              </p>
            )}
          </div>
          {kind === "note" && (
            <div className="space-y-1.5">
              <Label htmlFor="rb">Note (Markdown supported)</Label>
              <Textarea
                id="rb"
                rows={8}
                value={body}
                maxLength={NOTE_MAX}
                onChange={(e) => setBody(e.target.value)}
              />
              {errors.body && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.body}
                </p>
              )}
            </div>
          )}
          {kind === "link" && (
            <div className="space-y-1.5">
              <Label htmlFor="ru">Web address</Label>
              <Input
                id="ru"
                value={url}
                maxLength={URL_MAX}
                inputMode="url"
                aria-invalid={!!errors.url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://"
              />
              {errors.url && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.url}
                </p>
              )}
            </div>
          )}
          {kind === "file" && !isEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="rf">File (max 25 MB)</Label>
              <Input id="rf" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              {errors.file && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.file}
                </p>
              )}
              {progress > 0 && <Progress value={progress} className="h-2" />}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="rtags">Tags (comma separated)</Label>
            <Input id="rtags" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !teamId}>
              {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEdit ? "Save changes" : "Add resource"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
