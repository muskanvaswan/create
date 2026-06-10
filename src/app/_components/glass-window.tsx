export function GlassWindow({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full p-2 sm:p-3 lg:p-5">
      <div className="h-full overflow-hidden rounded-2xl bg-[#f4f4f3]/80 shadow-2xl ring-1 ring-black/10 backdrop-blur-2xl dark:bg-[#181818]/80 dark:ring-white/10 sm:rounded-[1.4rem]">
        {children}
      </div>
    </div>
  );
}
