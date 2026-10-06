"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { ApiError, toApiError } from "@/lib/axios";

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { user, isLoading, login } = useAuth();
  const router = useRouter();

  const [apiError, setApiError] = useState<string | null>(null);
  const [apiErrors, setApiErrors] = useState<string[] | null>(null);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  // Chuyển hướng về trang chủ nếu người dùng đã đăng nhập
  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  // Bộ đếm ngược thời gian chờ khi gặp lỗi HTTP 429 (D54)
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  async function onSubmit(data: LoginFormValues) {
    if (cooldownSeconds > 0) return;
    setApiError(null);
    setApiErrors(null);
    setRateLimitError(null);

    try {
      await login(data.email, data.password);
      router.replace("/");
    } catch (err: unknown) {
      const error = err instanceof ApiError ? err : toApiError(err);

      if (error.status === 429) {
        setRateLimitError(error.message);
        setCooldownSeconds(60);
        setApiError(null);
        setApiErrors(null);
      } else {
        setRateLimitError(null);
        if (error.errors && error.errors.length > 0) {
          setApiErrors(error.errors);
          setApiError(null);
        } else {
          setApiError(error.message);
          setApiErrors(null);
        }
      }
    }
  }

  if (isLoading || user) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  const isButtonDisabled = isSubmitting || cooldownSeconds > 0;
  const activeErrorMessage = cooldownSeconds > 0 ? rateLimitError : apiError;

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-background">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="w-full max-w-sm space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-gray-900">Đăng nhập</h1>
          <p className="text-xs text-gray-500">
            Hệ thống Quản lý Nhà trẻ & Trường Mầm non
          </p>
        </div>

        {/* Thông báo lỗi từ server: có errors thì hiện danh sách từng dòng, không có thì hiện một thông báo duy nhất từ message (onboarding §4.0.2, §5.6) */}
        {apiErrors && apiErrors.length > 0 ? (
          <ul className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 list-disc list-inside space-y-1">
            {apiErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        ) : activeErrorMessage ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {activeErrorMessage}
          </div>
        ) : null}

        {/* Ô nhập Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            disabled={isButtonDisabled}
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email", {
              setValueAs: (v: string) => (typeof v === "string" ? v.trim() : v),
              required: "Vui lòng nhập email",
              maxLength: {
                value: 254,
                message: "Email không được vượt quá 254 ký tự",
              },
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Email không đúng định dạng",
              },
            })}
            className={`mt-1 w-full rounded-md border px-3 py-2 text-sm text-gray-900 transition focus:outline-none focus:ring-2 ${
              errors.email
                ? "border-red-500 focus:ring-red-300"
                : "border-gray-300 focus:border-black focus:ring-black/10"
            }`}
            placeholder="nhanvien@truong.edu.vn"
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-xs text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Ô nhập Mật khẩu */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            disabled={isButtonDisabled}
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password", {
              required: "Vui lòng nhập mật khẩu",
            })}
            className={`mt-1 w-full rounded-md border px-3 py-2 text-sm text-gray-900 transition focus:outline-none focus:ring-2 ${
              errors.password
                ? "border-red-500 focus:ring-red-300"
                : "border-gray-300 focus:border-black focus:ring-black/10"
            }`}
            placeholder="••••••••"
          />
          {errors.password && (
            <p id="password-error" className="mt-1 text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Nút Đăng nhập */}
        <button
          type="submit"
          disabled={isButtonDisabled}
          className="w-full rounded-md bg-black py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Đang đăng nhập..."
            : cooldownSeconds > 0
            ? `Thử lại sau (${cooldownSeconds}s)`
            : "Đăng nhập"}
        </button>
      </form>
    </main>
  );
}