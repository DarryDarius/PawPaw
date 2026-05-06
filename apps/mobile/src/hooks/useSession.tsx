import * as SecureStore from "expo-secure-store";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";

const tokenKey = "pawpaw-session-token";

type SessionContextValue = {
  token: string | null;
  hydrated: boolean;
  setSessionToken: (token: string) => Promise<void>;
  clearSession: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(tokenKey)
      .then((value) => setToken(value))
      .finally(() => setHydrated(true));
  }, []);

  const setSessionToken = useCallback(async (nextToken: string) => {
    await SecureStore.setItemAsync(tokenKey, nextToken);
    setToken(nextToken);
  }, []);

  const clearSession = useCallback(async () => {
    await SecureStore.deleteItemAsync(tokenKey);
    setToken(null);
  }, []);

  const value = useMemo(() => ({ token, hydrated, setSessionToken, clearSession }), [token, hydrated, setSessionToken, clearSession]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return value;
}
