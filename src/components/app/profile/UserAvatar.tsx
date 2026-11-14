import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initialsOf } from "@/lib/profile-data";
import { avatarSrc, signedAvatarUrl } from "@/lib/profile-queries";
import { cn } from "@/lib/utils";

/**
 * A person's photo, or their initials when they have none. `path` is the stored avatar path.
 * It tries the public address first; if the picture can't be loaded (for example the storage bucket is
 * private) it asks for a temporary signed link instead, so the photo shows either way.
 */
export function UserAvatar({
  name,
  path,
  className,
  fallbackClassName,
}: {
  name: string | null | undefined;
  path?: string | null | undefined;
  className?: string;
  fallbackClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [path]);

  const signed = useQuery({
    queryKey: ["avatar-signed", path],
    enabled: failed && !!path,
    staleTime: 50 * 60_000,
    queryFn: () => signedAvatarUrl(path!),
  });
  const src = failed ? (signed.data ?? undefined) : avatarSrc(path);

  return (
    <Avatar className={className}>
      {src && (
        <AvatarImage
          src={src}
          alt={name ? `${name}'s photo` : "Profile photo"}
          className="object-cover"
          onLoadingStatusChange={(status) => {
            if (status === "error" && !failed) setFailed(true);
          }}
        />
      )}
      <AvatarFallback
        className={cn("bg-navy text-xs font-semibold text-navy-foreground", fallbackClassName)}
      >
        {initialsOf(name)}
      </AvatarFallback>
    </Avatar>
  );
}
