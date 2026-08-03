import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { isTenmsAuthConfigured, loginWithTenms, useTenmsUser } from "@/lib/tenms-auth";
import { toast } from "sonner";

export function SiteHeader({
  showLogin = true,
}: {
  showLogin?: boolean;
}) {
  const navigate = useNavigate();
  const { user } = useTenmsUser();

  async function handleLogin() {
    if (user || !isTenmsAuthConfigured()) {
      navigate({ to: "/form" });
      return;
    }
    try {
      await loginWithTenms();
      navigate({ to: "/form" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "লগইন সম্পন্ন হয়নি।");
    }
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

        {/* Top Right: Login button */}
        <div className="ml-auto flex items-center shrink-0">
          {showLogin && (
            <button
              type="button"
              onClick={handleLogin}
              className="bn inline-flex items-center gap-2 sm:gap-2.5 rounded-full bg-brand-red px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-primary-foreground transition hover:bg-brand-red-deep shadow-xs shrink-0 cursor-pointer"
            >
              <span className="inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-background shrink-0">
                <Logo variant="icon-color" height={14} />
              </span>
              <span className="whitespace-nowrap">Login with 10 Minute School</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

