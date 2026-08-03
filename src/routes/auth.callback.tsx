import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Signing you in | 10 Minute School" },
      { name: "description", content: "Completing your 10 Minute School sign-in." },
      { property: "og:title", content: "Signing you in | 10 Minute School" },
      { property: "og:description", content: "Completing your 10 Minute School sign-in." },
    ],
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const [message, setMessage] = useState("লগইন সম্পন্ন হচ্ছে...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    // TODO(10MS SDK): if the provider returns a `code`, exchange it for the
    // user profile here (or in a server function) before posting the message.
    const user = error
      ? null
      : {
          id: params.get("user_id") ?? params.get("sub") ?? params.get("code") ?? "",
          name: params.get("name") ?? undefined,
          phone: params.get("phone") ?? undefined,
          email: params.get("email") ?? undefined,
        };

    window.opener?.postMessage(
      { type: "tenms-auth", user: user?.id ? user : null, error },
      window.location.origin,
    );

    if (window.opener) window.close();
    else setMessage(error ? "লগইন সম্পন্ন হয়নি।" : "লগইন সম্পন্ন হয়েছে, এই উইন্ডোটি বন্ধ করো।");
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <p className="bn text-sm text-text-2">{message}</p>
    </main>
  );
}
