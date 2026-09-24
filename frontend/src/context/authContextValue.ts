import { createContext } from "react";
import type { User } from "../types";

export type PortalRole = "Admin" | "Hospital" | "Partner" | "Citizen";
export interface AuthState {
  user: User | null;
  isDemo: boolean;
  accessToken: string | null;
  login: (role: PortalRole, user: User) => void;
  loginWithBackend: (role: PortalRole, email: string, password: string) => Promise<void>;
  logout: () => void;
}
export const AuthContext = createContext<AuthState | undefined>(undefined);

