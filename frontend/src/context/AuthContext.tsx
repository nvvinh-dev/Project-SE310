"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import {
  apiClient,
  getStoredToken,
  getStoredExpiresAt,
  setAuthToken,
  toApiError,
  ApiError,
} from "@/lib/axios";
import type { ApiResponse, LoginResponseData, Role } from "@/types/auth";

interface AuthUser {
  userId: string;
  fullName: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tách clearSession (hủy timer, xóa state, xóa token local) - Không gọi API
  const clearSession = useCallback(() => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    setToken(null);
    setUser(null);
    setAuthToken(null);
  }, []);


  const logout = useCallback(async () => {
    try {
      await apiClient.post("/api/auth/logout");
    } catch {

    } finally {
      clearSession();
    }
  }, [clearSession]);

 
  const scheduleAutoLogout = useCallback(
    (expiresAtUtc: string) => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      const msUntilExpiry = new Date(expiresAtUtc).getTime() - Date.now();
      if (msUntilExpiry <= 0) {
        clearSession();
        return;
      }
      logoutTimerRef.current = setTimeout(() => {
        clearSession(); 
      }, msUntilExpiry);
    },
    [clearSession]
  );

  useEffect(() => {
    async function restoreSession() {
      const storedToken = getStoredToken();
      if (!storedToken) return;

      setAuthToken(storedToken);
      try {
        const res = await apiClient.get<
          ApiResponse<{ userId: string; fullName: string; role: Role }>
        >("/api/auth/me");
        if (!res.data.success || !res.data.data) {
          setAuthToken(null);
          return;
        }

        setToken(storedToken);
        setUser({
          userId: res.data.data.userId,
          fullName: res.data.data.fullName,
          role: res.data.data.role,
        });

        const storedExpiry = getStoredExpiresAt();
        if (storedExpiry) {
          scheduleAutoLogout(storedExpiry);
        } else {
          clearSession();
        }
      } catch {
        setAuthToken(null);
      }
    }

    restoreSession().finally(() => setIsLoading(false));

    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [clearSession, scheduleAutoLogout]);

  async function login(email: string, password: string) {
    try {
      const res = await apiClient.post<ApiResponse<LoginResponseData>>(
        "/api/auth/login",
        { email, password }
      );

      const loginData = res.data.data;
      if (!loginData) {
        throw new ApiError(
          res.data.message ?? "Đăng nhập thất bại.",
          res.data.errors,
          null
        );
      }

      const { token: newToken, userId, fullName, role, expiresAtUtc } = loginData;

      setAuthToken(newToken, expiresAtUtc); 
      setToken(newToken);
      setUser({ userId, fullName, role });
      scheduleAutoLogout(expiresAtUtc);
    } catch (err) {
      if (err instanceof ApiError) throw err; 
      throw toApiError(err);
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth phải được gọi bên trong AuthProvider");
  }
  return context;
}