import { createContext, useContext } from 'react';
import type { User } from '@workspace/api-client-react';

export const AuthCtx = createContext<User | null>(null);

export function useMe(): User {
  const u = useContext(AuthCtx);
  if (!u) throw new Error('useMe outside guard');
  return u;
}
