"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getErrorMessage, request } from "./api";
import type { Status, User } from "./types";

type AuthContextValue = {
  token: string;
  user: User | null;
  status: Status;
  message: string;
  isInitializing: boolean;
  isBusy: boolean;
  requiresPlacementTest: boolean;
  authHeaders: Record<string, string>;
  setMessage: (message: string) => void;
  setStatus: (status: Status) => void;
  setRequiresPlacementTest: (value: boolean) => void;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  apiRequest: <T>(path: string, options?: RequestInit) => Promise<T>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [requiresPlacementTest, setRequiresPlacementTest] = useState(false);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token],
  );

  const apiRequest = useCallback(
    async <T,>(path: string, options: RequestInit = {}) => {
      return request<T>(path, options);
    },
    [],
  );

  const persistSession = useCallback((accessToken: string, nextUser: User) => {
    setToken(accessToken);
    setUser(nextUser);
    window.localStorage.setItem("edu_token", accessToken);
    window.localStorage.setItem("edu_user", JSON.stringify(nextUser));
  }, []);

  const persistPlacementRequirement = useCallback((value: boolean) => {
    setRequiresPlacementTest(value);
    window.localStorage.setItem("edu_requires_placement", value ? "1" : "0");
  }, []);

  const clearSession = useCallback(() => {
    window.localStorage.removeItem("edu_token");
    window.localStorage.removeItem("edu_user");
    window.localStorage.removeItem("edu_requires_placement");
    setToken("");
    setUser(null);
    setMessage("");
    setRequiresPlacementTest(false);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    router.push("/login");
  }, [clearSession, router]);

  const routeAfterLogin = useCallback(
    async (accessToken: string, nextUser: User, requiresPlacementTest: boolean, nextStep: string) => {
      persistPlacementRequirement(requiresPlacementTest);

      if (nextStep === "admin" || nextUser.role === "ADMIN") {
        router.push("/admin/subjects");
        return;
      }

      if (requiresPlacementTest) {
        router.push("/placement");
        return;
      }

      try {
        await request("/subjects", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        persistPlacementRequirement(false);
        router.push("/subjects");
      } catch (error) {
        const text = getErrorMessage(error);
        if (text.toLowerCase().includes("placement")) {
          persistPlacementRequirement(true);
          router.push("/placement");
        } else {
          throw error;
        }
      }
    },
    [persistPlacementRequirement, router],
  );

  const login = useCallback(
    async (username: string, password: string) => {
      setStatus("loading");
      setMessage("");

      try {
        const data = await request<{
          accessToken: string;
          requiresPlacementTest: boolean;
          nextStep: "admin" | "placement-test" | "subjects";
          user: User;
        }>("/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        persistSession(data.accessToken, data.user);
        await routeAfterLogin(
          data.accessToken,
          data.user,
          data.requiresPlacementTest,
          data.nextStep,
        );
      } catch (error) {
        setMessage(getErrorMessage(error));
        throw error;
      } finally {
        setStatus("idle");
      }
    },
    [persistSession, routeAfterLogin],
  );

  const register = useCallback(
    async (username: string, password: string) => {
      setStatus("loading");
      setMessage("");

      try {
        await request<User>("/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        await login(username, password);
      } catch (error) {
        setMessage(getErrorMessage(error));
        setStatus("idle");
        throw error;
      }
    },
    [login],
  );

  useEffect(() => {
    let active = true;

    void (async () => {
      const savedToken = window.localStorage.getItem("edu_token");
      const savedUser = window.localStorage.getItem("edu_user");
      const savedPlacementRequirement = window.localStorage.getItem("edu_requires_placement");

      if (!savedToken || !savedUser) {
        if (active) setIsInitializing(false);
        return;
      }

      const parsedUser = JSON.parse(savedUser) as User;
      if (!active) return;
      setToken(savedToken);
      setUser(parsedUser);
      setRequiresPlacementTest(savedPlacementRequirement === "1");

      try {
        if (parsedUser.role === "ADMIN") {
          router.replace("/admin/subjects");
        } else {
          try {
            await request("/subjects", {
              headers: { Authorization: `Bearer ${savedToken}` },
            });
            if (active) persistPlacementRequirement(false);
            router.replace("/subjects");
          } catch (error) {
            const text = getErrorMessage(error);
            if (text.toLowerCase().includes("placement")) {
              if (active) persistPlacementRequirement(true);
              router.replace("/placement");
            }
          }
        }
      } finally {
        if (active) setIsInitializing(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [persistPlacementRequirement, router]);

  const value = useMemo(
    () => ({
      token,
      user,
      status,
      message,
      isInitializing,
      isBusy: status === "loading",
      requiresPlacementTest,
      authHeaders,
      setMessage,
      setStatus,
      setRequiresPlacementTest: persistPlacementRequirement,
      login,
      register,
      logout,
      apiRequest,
    }),
    [
      token,
      user,
      status,
      message,
      isInitializing,
      requiresPlacementTest,
      authHeaders,
      login,
      register,
      logout,
      apiRequest,
      persistPlacementRequirement,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
