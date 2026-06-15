/**
 * Polish layout — escapes the root macos-wallpaper body entirely.
 * Uses a fixed full-screen black surface so the dashboard always renders
 * on a pure `#000` background regardless of what the body does.
 */
export default function PolishLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-black font-sans antialiased">
      {children}
    </div>
  );
}
