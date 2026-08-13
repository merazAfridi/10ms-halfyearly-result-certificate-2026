import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      navigate({ to: "/" });
    } else {
      setUser(auth.getUser());
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-6 py-12 text-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="mx-auto mt-8 max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">
          {user.picture && (
            <img
              src={user.picture}
              alt="Profile"
              className="mx-auto h-20 w-20 rounded-full object-cover mb-4"
            />
          )}
          <h2 className="text-xl font-semibold">Welcome, {user.name || "Student"}!</h2>
          {user.email && <p className="mt-2 text-text-2">Email: {user.email}</p>}
          {user.sub && <p className="mt-1 text-text-2 text-sm">ID: {user.sub}</p>}
          <button
            onClick={async () => {
              await auth.logout();
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
