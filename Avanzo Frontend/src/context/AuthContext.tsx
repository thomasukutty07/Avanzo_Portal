// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { api } from "@/lib/axios";
import type { User } from "@/types";
import {
  DUMMY_ACCESS_TOKEN,
  DUMMY_REFRESH_TOKEN,
  DUMMY_USER_STORAGE_KEY,
  tryDummyLogin,
} from "@/lib/dummyAuth";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate session on page load
  useEffect(() => {
    const hydrateSession = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await api.get("/api/auth/me/");
        setUser(response.data);
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      } finally {
        setIsLoading(false);
      }
    };
    hydrateSession();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const dummyUser = tryDummyLogin(email, password);
    if (dummyUser) {
      localStorage.setItem("access_token", DUMMY_ACCESS_TOKEN);
      localStorage.setItem("refresh_token", DUMMY_REFRESH_TOKEN);
      localStorage.setItem(DUMMY_USER_STORAGE_KEY, JSON.stringify(dummyUser));
      setUser(dummyUser);
      return dummyUser;
    }
    const response = await api.post("/api/auth/login/", { email, password });
    localStorage.setItem("access_token", response.data.access);
    localStorage.setItem("refresh_token", response.data.refresh);
    const profileRes = await api.get("/api/auth/me/");
    setUser(profileRes.data);
    return profileRes.data;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem(DUMMY_USER_STORAGE_KEY);
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm font-medium">Securing Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
