import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { auth, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (ready && !user) {
      navigate({ to: "/" });
    }
  }, [ready, user, navigate]);

  if (!ready || !user) return null;

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-6 py-12 text-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="mx-auto mt-8 max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Welcome, {user.name || "Student"}!</h2>
          {user.email && <p className="mt-2 text-text-2">Email: {user.email}</p>}
          {user.phone && <p className="mt-1 text-text-2">Phone: {user.phone}</p>}
          <button
            onClick={() => {
              auth.logout();
              navigate({ to: "/" });
            }}
            className="mt-6 rounded-full bg-brand-red px-6 py-2.5 font-medium text-white transition-colors hover:bg-brand-red-deep cursor-pointer"
          >
            Logout
          </button>
        </div>
      </section>
    </main>
  );
}
