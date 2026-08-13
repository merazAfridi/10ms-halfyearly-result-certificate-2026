import { TenMSAuth } from '@tenminuteschool/auth-react';

export const CLIENT_ID = process.env.NEXT_PUBLIC_TENMS_CLIENT_ID!;

export const auth = new TenMSAuth({
  clientId: CLIENT_ID,
  storage: 'localStorage',
});
