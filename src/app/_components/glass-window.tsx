export function GlassWindow({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full p-0 sm:p-3 lg:p-5">
      <div className="h-full overflow-hidden rounded-none bg-[#f2f2f7] dark:bg-black sm:bg-[#f4f4f3]/80 sm:dark:bg-[#16131e]/80 sm:shadow-[0_30px_70px_-10px_rgba(0,0,0,0.35)] sm:dark:shadow-[0_30px_70px_-10px_rgba(0,0,0,0.6)] sm:ring-1 sm:ring-black/10 sm:backdrop-blur-2xl sm:dark:ring-white/10 sm:rounded-[1.4rem]">
        {children}
      </div>
    </div>
  );
}
