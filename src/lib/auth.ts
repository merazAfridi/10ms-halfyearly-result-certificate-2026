import { TenMSAuth, type UserInfo } from '@tenminuteschool/auth-react';
import { useEffect, useState } from 'react';

export const CLIENT_ID = process.env.NEXT_PUBLIC_TENMS_CLIENT_ID ?? '';

function createAuth(): TenMSAuth {
  try {
    return new TenMSAuth({ clientId: CLIENT_ID, storage: 'localStorage' });
  } catch {
    // No client ID configured yet — fall back to a stub so pages that only
    // read auth state (e.g. the header's logout button) don't crash the
    // whole page before real credentials are set.
    return {
      isLoggedIn: () => false,
      getUser: () => null,
      logout: async () => {},
      loginWithPopup: async () => {
        throw new Error('10 Minute School login is not configured.');
      },
      handleLoginSuccess: async () => {
        throw new Error('10 Minute School login is not configured.');
      },
    } as unknown as TenMSAuth;
  }
}

export const auth = createAuth();

export function useAuth() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(auth.isLoggedIn() ? auth.getUser() : null);
    setReady(true);
  }, []);

  return { user, ready };
}
