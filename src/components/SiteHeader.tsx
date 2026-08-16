import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { auth, useAuth } from "@/lib/auth";

export function SiteHeader() {
  const navigate = useNavigate();
  const { user } = useAuth();

  async function handleLogout() {
    await auth.logout();
    navigate({ to: "/" });
  }

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

        {/* Top Right: Logout (only when logged in) */}
        {user ? (
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-2 transition hover:border-primary hover:text-primary cursor-pointer"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Logout
          </button>
        ) : null}
      </div>
    </header>
  );
}
