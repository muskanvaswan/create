export function GlassWindow({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full p-2 sm:p-3 lg:p-5">
      <div className="h-full overflow-hidden rounded-2xl bg-[#f4f4f3]/60 shadow-[0_30px_70px_-10px_rgba(0,0,0,0.35)] dark:shadow-[0_30px_70px_-10px_rgba(0,0,0,0.6)] ring-1 ring-black/10 backdrop-blur-2xl dark:bg-[#15121c]/65 dark:ring-white/10 sm:rounded-[1.4rem]">
        {children}
      </div>
    </div>
  );
}
