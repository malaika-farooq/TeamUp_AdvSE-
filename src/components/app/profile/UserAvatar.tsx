import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initialsOf } from "@/lib/profile-data";
import { avatarSrc } from "@/lib/profile-queries";
import { cn } from "@/lib/utils";

/** A person's photo, or their initials when they have none. `path` is the stored avatar path. */
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
  const src = avatarSrc(path);
  return (
    <Avatar className={className}>
      {src && (
        <AvatarImage
          src={src}
          alt={name ? `${name}'s photo` : "Profile photo"}
          className="object-cover"
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
