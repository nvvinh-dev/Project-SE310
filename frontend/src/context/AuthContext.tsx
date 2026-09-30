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

  const logout = useCallback(async () => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    try {
      await apiClient.post("/api/auth/logout");
    } catch {
      // API chưa có hoặc lỗi mạng — bỏ qua để khối finally vẫn dọn sạch phiên
    } finally {
      setToken(null);
      setUser(null);
      setAuthToken(null);
    }
  }, []);

  // Đặt timer tự logout đúng lúc token hết hạn
  const scheduleAutoLogout = useCallback(
    (expiresAtUtc: string) => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      const msUntilExpiry = new Date(expiresAtUtc).getTime() - Date.now();
      if (msUntilExpiry <= 0) {
        logout();
        return;
      }
      logoutTimerRef.current = setTimeout(() => {
        void logout();
      }, msUntilExpiry);
    },
    [logout]
  );

  // Khôi phục phiên từ token đã lưu khi tải lại trang.
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
          await logout();
        }
      } catch {
        setAuthToken(null);
      }
    }

    restoreSession().finally(() => setIsLoading(false));

    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [logout, scheduleAutoLogout]);

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