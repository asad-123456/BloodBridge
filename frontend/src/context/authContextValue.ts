import { createContext } from "react";
import type { User } from "../types";

export type PortalRole = "Admin" | "Hospital" | "Partner";
export interface AuthState {
  user: User | null;
  login: (role: PortalRole, user: User) => void;
  logout: () => void;
}
export const AuthContext = createContext<AuthState | undefined>(undefined);
