import { useEffect, useState, type ReactNode } from "react";
import type { User } from "../types";
import { AuthContext, type PortalRole } from "./authContextValue";
const authKey = "hemalink-auth-session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem(authKey) ?? "null",
      ) as User | null;
      return stored?.isActive ? stored : null;
    } catch {
      return null;
    }
  });
  useEffect(() => {
    if (user) localStorage.setItem(authKey, JSON.stringify(user));
    else localStorage.removeItem(authKey);
  }, [user]);
  const login = (role: PortalRole, nextUser: User) =>
    setUser({ ...nextUser, password: undefined, role });
  const logout = () => setUser(null);
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
