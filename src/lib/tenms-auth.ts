/**
 * 10 Minute School login SDK integration point.
 *
 * Fill these in `.env` (they are public, client-side values):
 *   VITE_TENMS_AUTH_URL=https://<10ms-login-endpoint>/authorize
 *   VITE_TENMS_CLIENT_ID=<client id>
 *
 * The popup must finish on this app's `/auth/callback` route, which forwards
 * the signed-in user back to the opener window.
 */
import { useEffect, useState } from "react";

export const TENMS_AUTH_URL = import.meta.env.VITE_TENMS_AUTH_URL as string | undefined;
export const TENMS_CLIENT_ID = import.meta.env.VITE_TENMS_CLIENT_ID as string | undefined;

export const isTenmsAuthConfigured = () => Boolean(TENMS_AUTH_URL && TENMS_CLIENT_ID);

export type TenmsUser = {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
};

const STORAGE_KEY = "tenms.session";
const EVENT = "tenms-session-change";

export function getTenmsUser(): TenmsUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TenmsUser) : null;
  } catch {
    return null;
  }
}

export function setTenmsUser(user: TenmsUser | null) {
  if (typeof window === "undefined") return;
  if (user) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function useTenmsUser() {
  const [user, setUser] = useState<TenmsUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setUser(getTenmsUser());
    sync();
    setReady(true);
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { user, ready };
}

/** Opens the 10MS login popup and resolves with the signed-in student. */
export function loginWithTenms(): Promise<TenmsUser> {
  return new Promise((resolve, reject) => {
    if (!isTenmsAuthConfigured()) {
      reject(new Error("10MS login SDK is not configured yet."));
      return;
    }
    const redirectUri = `${window.location.origin}/auth/callback`;
    const url = new URL(TENMS_AUTH_URL!);
    url.searchParams.set("client_id", TENMS_CLIENT_ID!);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");

    const popup = window.open(url.toString(), "tenms-login", "width=520,height=680");
    if (!popup) {
      reject(new Error("Popup blocked. Allow popups and try again."));
      return;
    }

    function cleanup() {
      window.removeEventListener("message", onMessage);
      window.clearInterval(poll);
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "tenms-auth") return;
      cleanup();
      popup!.close();
      if (event.data.user?.id) {
        const user = event.data.user as TenmsUser;
        setTenmsUser(user);
        resolve(user);
      } else {
        reject(new Error(event.data.error ?? "Login failed."));
      }
    }

    window.addEventListener("message", onMessage);
    const poll = window.setInterval(() => {
      if (!popup.closed) return;
      cleanup();
      reject(new Error("Login window closed."));
    }, 500);
  });
}

export function logoutTenms() {
  setTenmsUser(null);
}
