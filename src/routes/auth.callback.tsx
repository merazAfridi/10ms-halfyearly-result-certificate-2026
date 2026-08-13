import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "লগইন হচ্ছে | 10 Minute School" },
      { name: "description", content: "তোমার 10 Minute School অ্যাকাউন্টে লগইন সম্পন্ন হচ্ছে।" },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "লগইন হচ্ছে | 10 Minute School" },
      { property: "og:description", content: "তোমার 10 Minute School অ্যাকাউন্টে লগইন সম্পন্ন হচ্ছে।" },
      { property: "og:image", content: "https://ks.10minuteschool.com/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://ks.10minuteschool.com/og-image.jpg" },
    ],
  }),
  component: AuthCallback,
});

function AuthCallback() {
  // The @tenminuteschool/auth-react SDK's loginWithPopup will monitor this window's URL
  // and close it automatically when the OAuth redirect completes.
  // We can also call handleRedirectCallback in case it's a redirect flow.

  useEffect(() => {
    try {
      auth.handleRedirectCallback();
      // If we got here in a redirect flow, we should probably redirect to /dashboard
      // But loginWithPopup is the primary flow used in this app.
    } catch (err) {
      // Ignore errors; loginWithPopup flow doesn't have sessionStorage state here.
    }
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <p className="bn text-sm text-text-2">লগইন সম্পন্ন হচ্ছে...</p>
    </main>
  );
}
