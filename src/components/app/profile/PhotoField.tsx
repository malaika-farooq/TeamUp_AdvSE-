import { useRef } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AVATAR_TYPES, checkAvatarFile } from "@/lib/profile-data";
import { UserAvatar } from "./UserAvatar";

/**
 * Profile photo chooser. It only picks and validates the file; the parent decides when to upload it
 * (immediately in Settings, on "Finish" during onboarding).
 */
export function PhotoField({
  name,
  path,
  previewUrl,
  busy = false,
  onPick,
  onRemove,
}: {
  name: string;
  /** Stored avatar path of the current photo. */
  path?: string | null | undefined;
  /** Local preview of a picked, not yet uploaded file. */
  previewUrl?: string | null | undefined;
  busy?: boolean;
  onPick: (file: File) => void;
  onRemove?: (() => void) | undefined;
}) {
  const input = useRef<HTMLInputElement>(null);
  const hasPhoto = !!previewUrl || !!path;

  function chosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again
    if (!file) return;
    const check = checkAvatarFile(file);
    if (!check.ok) return void toast.error(check.reason);
    onPick(file);
  }

  return (
    <div className="flex items-center gap-4">
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Selected profile photo"
          className="size-20 rounded-full object-cover"
        />
      ) : (
        <UserAvatar name={name} path={path} className="size-20" fallbackClassName="text-xl" />
      )}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => input.current?.click()}
          >
            {busy ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Upload className="mr-2 size-4" />
            )}
            {hasPhoto ? "Change photo" : "Upload photo"}
          </Button>
          {hasPhoto && onRemove && (
            <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={onRemove}>
              <Trash2 className="mr-2 size-4" />
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">JPG, PNG, WebP or GIF, up to 2 MB.</p>
        <input
          ref={input}
          type="file"
          accept={AVATAR_TYPES.join(",")}
          className="sr-only"
          aria-label="Choose a profile photo"
          onChange={chosen}
        />
      </div>
    </div>
  );
}
