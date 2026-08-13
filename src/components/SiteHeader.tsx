import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card shadow-xs">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Top Left: Single Logo */}
        <Link
          to="/"
          className="inline-flex items-center shrink-0"
          aria-label="10 Minute School Home"
        >
          <Logo height={26} className="shrink-0 sm:h-7" />
        </Link>
      </div>
    </header>
  );
}
