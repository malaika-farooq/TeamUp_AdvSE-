import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Download, FileText, Link2, Loader2, NotebookPen, Plus, Trash2 } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Badge } from "@/frontend/components/ui/badge";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";
import { Progress } from "@/frontend/components/ui/progress";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/frontend/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/frontend/features/auth/providers/AuthProvider";
import { EmptyState } from "@/frontend/components/shared/states";
import { logActivity } from "@/frontend/features/activity/api/queries";
import { type Resource, type Team } from "@/types/domain";

type TeamLike = Pick<Team, "id" | "name">;
const MAX_BYTES = 25 * 1024 * 1024;

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
  const queryClient = useQueryClient();
  const [kind, setKind] = useState<"all" | "note" | "link" | "file">("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);

  const filtered = useMemo(
    () =>
      resources.filter((r) => {
        if (kind !== "all" && r.kind !== kind) return false;
        if (!search.trim()) return true;
        const s = search.toLowerCase();
        return (
          r.title.toLowerCase().includes(s) ||
          (r.content ?? "").toLowerCase().includes(s) ||
          (r.tags ?? []).some((t) => t.toLowerCase().includes(s))
        );
      }),
    [resources, kind, search],
  );

  async function download(r: Resource) {
    if (!r.storage_path) return;
    const { data, error } = await supabase.storage
      .from("team-files")
      .createSignedUrl(r.storage_path, 60);
    if (error) return void toast.error(error.message);
    window.open(data.signedUrl, "_blank", "noopener");
  }

  async function remove(r: Resource) {
    const { error } = await supabase.from("resources").delete().eq("id", r.id);
    if (error) return void toast.error(error.message);
    if (r.storage_path) await supabase.storage.from("team-files").remove([r.storage_path]);
    toast.success("Resource removed");
    queryClient.invalidateQueries();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes, links, files, tags"
          className="w-full sm:w-64"
          aria-label="Search resources"
        />
        <Tabs value={kind} onValueChange={(v) => setKind(v as typeof kind)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="note">Notes</TabsTrigger>
            <TabsTrigger value="link">Links</TabsTrigger>
            <TabsTrigger value="file">Files</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          className="ml-auto"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-1.5 size-4" />
          Add resource
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title="No resources yet"
          description="Share notes, bookmark links, or upload files your team needs."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r, i) => (
            <motion.article
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="surface-card hover-lift flex flex-col gap-2 p-4"
            >
              <div className="flex items-center gap-2">
                {r.kind === "note" ? (
                  <NotebookPen className="size-4 text-teal" />
                ) : r.kind === "link" ? (
                  <Link2 className="size-4 text-blue" />
                ) : (
                  <FileText className="size-4 text-lavender" />
                )}
                <p className="truncate font-medium">{r.title}</p>
              </div>
              {r.kind === "note" && (
                <p className="line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">
                  {r.content}
                </p>
              )}
              {r.kind === "link" && r.url && (
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="truncate text-sm text-blue underline"
                >
                  {r.url}
                </a>
              )}
              <div className="flex flex-wrap gap-1">
                {(r.tags ?? []).map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
              <p className="mt-auto text-xs text-muted-foreground">
                Updated {new Date(r.updated_at).toLocaleString()}
              </p>
              <div className="flex gap-2">
                {r.kind === "file" && (
                  <Button size="sm" variant="outline" onClick={() => download(r)}>
                    <Download className="mr-1.5 size-4" />
                    Download
                  </Button>
                )}
                {r.kind === "note" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(r);
                      setOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                )}
                {r.created_by === user?.id && (
                  <Button size="sm" variant="ghost" onClick={() => remove(r)}>
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <ResourceDialog
        open={open}
        onOpenChange={setOpen}
        teams={teams}
        defaultTeamId={defaultTeamId}
        editing={editing}
      />
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
  const [kind, setKind] = useState<"note" | "link" | "file">("note");
  const [teamId, setTeamId] = useState(defaultTeamId ?? teams[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);

  const isEdit = !!editing;

  function reset() {
    setTitle("");
    setBody("");
    setUrl("");
    setTags("");
    setFile(null);
    setProgress(0);
  }

  // hydrate when editing
  useMemo(() => {
    if (editing) {
      setKind(editing.kind as "note");
      setTeamId(editing.team_id);
      setTitle(editing.title);
      setBody(editing.content ?? "");
      setUrl(editing.url ?? "");
      setTags((editing.tags ?? []).join(", "));
    }
  }, [editing]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !teamId) return;
    setBusy(true);
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (isEdit && editing) {
      const { data: current } = await supabase
        .from("resources")
        .select("updated_at")
        .eq("id", editing.id)
        .single();
      if (current && current.updated_at !== editing.updated_at) {
        setBusy(false);
        toast.error("Someone else updated this note. Reopen it to see the latest version.");
        return;
      }
      const { error } = await supabase
        .from("resources")
        .update({
          title,
          content: body,
          tags: tagList,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        })
        .eq("id", editing.id);
      setBusy(false);
      if (error) return void toast.error(error.message);
      toast.success("Note updated");
      onOpenChange(false);
      queryClient.invalidateQueries();
      return;
    }

    let storagePath: string | null = null;
    let fileSize: number | null = null;
    let mime: string | null = null;

    if (kind === "file") {
      if (!file) {
        setBusy(false);
        return void toast.error("Choose a file to upload.");
      }
      if (file.size > MAX_BYTES) {
        setBusy(false);
        return void toast.error("Files must be 25 MB or smaller.");
      }
      setProgress(35);
      const path = `${teamId}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
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

    const { error } = await supabase.from("resources").insert({
      team_id: teamId,
      kind,
      title,
      content: kind === "note" ? body : null,
      url: kind === "link" ? url : null,
      storage_path: storagePath,
      file_size: fileSize,
      mime_type: mime,
      tags: tagList,
      created_by: user.id,
      updated_by: user.id,
    });
    setBusy(false);
    setProgress(100);
    if (error) return void toast.error(error.message);
    await logActivity(teamId, user.id, "resource_added", `added "${title}"`);
    toast.success("Resource added");
    reset();
    onOpenChange(false);
    queryClient.invalidateQueries();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit note" : "Add a resource"}</DialogTitle>
          <DialogDescription>
            Files are stored privately and only team members can open them.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {!isEdit && (
            <>
              <Tabs value={kind} onValueChange={(v) => setKind(v as typeof kind)}>
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
            </>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="rt">Title</Label>
            <Input id="rt" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          {kind === "note" && (
            <div className="space-y-1.5">
              <Label htmlFor="rb">Note (Markdown supported)</Label>
              <Textarea id="rb" rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
            </div>
          )}
          {kind === "link" && !isEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="ru">URL</Label>
              <Input
                id="ru"
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://"
              />
            </div>
          )}
          {kind === "file" && !isEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="rf">File (max 25 MB)</Label>
              <Input id="rf" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
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
              {isEdit ? "Save note" : "Add resource"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
