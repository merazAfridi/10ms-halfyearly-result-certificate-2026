import { TenMSAuth } from "@tenminuteschool/auth-react";
import { useEffect, useState } from "react";

export const auth = new TenMSAuth({
  clientId:
    import.meta.env.NEXT_PUBLIC_TENMS_CLIENT_ID ||
    import.meta.env.VITE_TENMS_CLIENT_ID ||
    "",
  storage: "localStorage",
});

export function useAuth() {
  const [user, setUser] = useState(auth.getUser());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Just a simple polling or storage listener can be used,
    // but auth.getUser() uses localStorage so storage event works.
    const sync = () => setUser(auth.getUser());
    sync();
    setReady(true);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { user, ready, auth };
}
