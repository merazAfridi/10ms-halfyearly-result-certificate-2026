import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error("Root Error Component caught:", error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error?.message || "Something went wrong on our end. You can try refreshing or head back home."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "কৃতি শিক্ষার্থী সার্টিফিকেট | 10 Minute School" },
      {
        name: "description",
        content:
          "তোমার হাফ ইয়ারলি বা প্রি-টেস্ট পরীক্ষার ফলাফল জমা দাও এবং 10 Minute School থেকে বিশেষ কৃতি শিক্ষার্থী সার্টিফিকেট সংগ্রহ করো।",
      },
      { name: "author", content: "10 Minute School" },
      { name: "robots", content: "index, follow" },
      { name: "theme-color", content: "#E5241B" },
      /* ── Open Graph ── */
      { property: "og:site_name", content: "10 Minute School" },
      { property: "og:locale", content: "bn_BD" },
      { property: "og:locale:alternate", content: "en_US" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://ks.10minuteschool.com/" },
      { property: "og:title", content: "কৃতি শিক্ষার্থী সার্টিফিকেট | 10 Minute School" },
      {
        property: "og:description",
        content:
          "তোমার হাফ ইয়ারলি বা প্রি-টেস্ট পরীক্ষার ফলাফল জমা দাও এবং 10 Minute School থেকে বিশেষ কৃতি শিক্ষার্থী সার্টিফিকেট সংগ্রহ করো।",
      },
      { property: "og:image", content: "https://ks.10minuteschool.com/og-image.jpg" },
      { property: "og:image:alt", content: "10 Minute School কৃতি শিক্ষার্থী সার্টিফিকেট" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      /* ── Twitter / X Card ── */
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@10minuteschool" },
      { name: "twitter:creator", content: "@10minuteschool" },
      { name: "twitter:title", content: "কৃতি শিক্ষার্থী সার্টিফিকেট | 10 Minute School" },
      {
        name: "twitter:description",
        content:
          "তোমার পরীক্ষার ফলাফল জমা দাও এবং 10 Minute School থেকে বিশেষ কৃতি শিক্ষার্থী সার্টিফিকেট সংগ্রহ করো।",
      },
      { name: "twitter:image", content: "https://ks.10minuteschool.com/og-image.jpg" },
      { name: "twitter:image:alt", content: "10 Minute School কৃতি শিক্ষার্থী সার্টিফিকেট" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/10ms_logo.jfif" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Anek+Bangla:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
