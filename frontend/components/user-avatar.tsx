import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "size-8 text-sm",
  md: "size-10 text-sm",
  lg: "size-16 text-xl",
  xl: "size-56 text-4xl",
} as const;

type UserAvatarProps = {
  photoURL: string | null;
  name: string;
  size?: keyof typeof sizeClasses;
  className?: string;
};

export function UserAvatar({
  photoURL,
  name,
  size = "md",
  className,
}: UserAvatarProps) {
  const sizeClass = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground",
        sizeClass,
        className
      )}
    >
      {photoURL ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoURL}
          alt={name}
          className="size-full object-cover"
        />
      ) : (
        <span>{(name || "?").charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}
