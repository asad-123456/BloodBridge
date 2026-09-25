import { useEffect, useState, useMemo, useCallback, type ReactNode } from "react";
import type { User } from "../types";
import { AuthContext, type PortalRole } from "./authContextValue";
import { loginWithApi } from "../api/client";
import toast from "react-hot-toast";

const authKey = "bloodbridge-auth-session";
const tokenKey = "bloodbridge-access-token";

function readStoredSession(): User | null {
  try {
    const stored = JSON.parse(
      window.localStorage.getItem(authKey) ?? "null",
    ) as Partial<User> | null;
    if (!stored || !stored.isActive) return null;
    return {
      ...stored,
      password: undefined,
    } as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredSession());
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    window.localStorage.getItem(tokenKey),
  );

  useEffect(() => {
    if (user) {
      const safeUser = { ...user, password: undefined };
      window.localStorage.setItem(authKey, JSON.stringify(safeUser));
      return;
    }

    window.localStorage.removeItem(authKey);
  }, [user]);

  const login = useCallback((role: PortalRole, nextUser: User) => {
    setUser({ ...nextUser, password: undefined, role });
    setAccessToken(null);
    window.localStorage.removeItem(tokenKey);
  }, []);
  
  const loginWithBackend = useCallback(async (role: PortalRole, email: string, password: string) => {
    try {
      const result = await loginWithApi(role, email, password);
      setUser(result.user);
      setAccessToken(result.accessToken);
      window.localStorage.setItem(tokenKey, result.accessToken);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Login failed");
      throw e;
    }
  }, []);
  
  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    window.localStorage.removeItem(tokenKey);
  }, []);
  
  const value = useMemo(() => ({
    user,
    accessToken,
    login,
    loginWithBackend,
    logout
  }), [user, accessToken, login, loginWithBackend, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
