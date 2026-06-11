import cn from "classnames";

/** Raised glass pill that wraps a group of toolbar buttons. */
export function Pill({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "items-center rounded-full border border-black/10 bg-gradient-to-b from-white/80 to-white/40 px-1 py-1 shadow-md dark:border-white/15 dark:from-white/[0.12] dark:to-white/[0.05]",
        className ?? "flex",
      )}
    >
      {children}
    </span>
  );
}
