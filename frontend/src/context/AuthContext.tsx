import { useEffect, useState, type ReactNode } from "react";
import type { User } from "../types";
import { AuthContext, type PortalRole } from "./authContextValue";
import { loginWithApi } from "../api/client";
import { demoUserIds } from "../utils/mockData";
const authKey = "bloodbridge-auth-session";
const tokenKey = "bloodbridge-access-token";

function readStoredSession(): User | null {
  try {
    const stored = JSON.parse(
      window.sessionStorage.getItem(authKey) ?? "null",
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
    window.sessionStorage.getItem(tokenKey),
  );
  const [isDemo, setIsDemo] = useState(() =>
    demoUserIds.includes(readStoredSession()?.id ?? ""),
  );

  useEffect(() => {
    if (user) {
      const safeUser = { ...user, password: undefined };
      window.sessionStorage.setItem(authKey, JSON.stringify(safeUser));
      return;
    }

    window.sessionStorage.removeItem(authKey);
  }, [user]);

  const login = (role: PortalRole, nextUser: User) => {
    setUser({ ...nextUser, password: undefined, role });
    setIsDemo(true);
    setAccessToken(null);
    window.sessionStorage.removeItem(tokenKey);
  };
  const loginWithBackend = async (role: PortalRole, email: string, password: string) => {
    const result = await loginWithApi(role, email, password);
    setUser(result.user);
    setIsDemo(false);
    setAccessToken(result.accessToken);
    window.sessionStorage.setItem(tokenKey, result.accessToken);
  };
  const logout = () => {
    setUser(null);
    setIsDemo(false);
    setAccessToken(null);
    window.sessionStorage.removeItem(tokenKey);
  };
  return (
    <AuthContext.Provider value={{ user, isDemo, accessToken, login, loginWithBackend, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
