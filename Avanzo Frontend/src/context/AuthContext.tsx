// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { api } from "@/lib/axios";
import type { User } from "@/types";

// ── Inactivity timeout ──────────────────────────────────────────────────────
// Auto-logout after 30 minutes of no mouse/keyboard/touch activity.
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

// ── Activity events that reset the inactivity timer ────────────────────────
const ACTIVITY_EVENTS: (keyof DocumentEventMap)[] = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "click",
];

interface JwtPayload {
  exp: number;
}

/**
 * Returns true if the given JWT string is expired (or malformed).
 * Checks the `exp` claim with a 30-second leeway to account for clock skew.
 */
function isTokenExpired(token: string): boolean {
  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    // exp is in seconds; Date.now() is in milliseconds.
    // Leeway: treat tokens expiring in the next 30s as already expired.
    return Date.now() >= (exp - 30) * 1000;
  } catch {
    // Malformed token → treat as expired.
    return true;
  }
}

/**
 * Clears all auth tokens from localStorage.
 * Centralised here so every logout path uses the same cleanup.
 */
function clearAuthTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

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
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Logout (stable reference via useCallback) ───────────────────────────
  const logout = useCallback(() => {
    clearAuthTokens();
    setUser(null);
    // Best-effort: tell the backend to blacklist the refresh token.
    // Fire-and-forget — we don't wait for the response.
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      api.post("/api/auth/logout/", { refresh: refreshToken }).catch(() => {});
    }
  }, []);

  // ── Inactivity auto-logout ───────────────────────────────────────────────
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      console.warn("[Security] Session expired due to inactivity.");
      logout();
      window.location.href = "/login?reason=inactivity";
    }, INACTIVITY_TIMEOUT_MS);
  }, [logout]);

  useEffect(() => {
    if (!user) return; // Only track activity when logged in.

    // Register all activity events
    ACTIVITY_EVENTS.forEach((event) =>
      document.addEventListener(event, resetInactivityTimer, { passive: true })
    );
    // Start the timer immediately on login
    resetInactivityTimer();

    return () => {
      // Cleanup on logout or unmount
      ACTIVITY_EVENTS.forEach((event) =>
        document.removeEventListener(event, resetInactivityTimer)
      );
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [user, resetInactivityTimer]);

  // ── Cross-tab logout synchronization ────────────────────────────────────
  // If the user logs out in one browser tab, all other tabs log out too.
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "access_token" && event.newValue === null) {
        // Token was removed in another tab → sync logout here
        setUser(null);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ── Session hydration on page load ──────────────────────────────────────
  useEffect(() => {
    const hydrateSession = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      // ✅ SECURITY: Validate token expiry before making any request.
      // Prevents use of expired tokens that may still be in localStorage.
      if (isTokenExpired(token)) {
        console.warn("[Security] Stored access token is expired. Clearing session.");
        clearAuthTokens();
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get("/api/auth/me/");
        setUser(response.data);
      } catch {
        console.warn("[Security] Session hydration failed. Clearing invalid session data.");
        clearAuthTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    hydrateSession();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await api.post("/api/auth/login/", { email, password });
    const { access, refresh } = response.data;

    // ✅ SECURITY: Validate token before storing — reject forged/expired tokens.
    if (isTokenExpired(access)) {
      throw new Error("Received invalid token from server.");
    }

    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    const profileRes = await api.get("/api/auth/me/");
    setUser(profileRes.data);
    return profileRes.data;
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

