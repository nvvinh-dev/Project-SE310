"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { ApiError, toApiError } from "@/lib/axios";
import { Button, ErrorAlert, Icons, Input, LoadingSpinner } from "@/components";

interface LoginFormValues {
  email: string;
  password: string;
}

// Giới hạn đăng nhập 5 lần/phút theo IP: gặp 429 thì khóa form và đếm ngược 60 giây (D54, AC-AUTH-04)
const RATE_LIMIT_SECONDS = 60;

const HIGHLIGHTS = [
  { icon: <Icons.Heart />, text: "Theo dõi sức khỏe và sự cố của trẻ" },
  { icon: <Icons.Clock />, text: "Điểm danh, đón trả đúng người" },
  { icon: <Icons.FileText />, text: "Học phí và thông báo cho phụ huynh" },
];

// Logo và tên hệ thống (SCR-AUTH-01 vùng 5); light = đặt trên nền primary của cột trái
function Brand({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element -- logo SVG tĩnh trong public/, không cần tối ưu ảnh */}
      <img
        src="/logo.svg"
        alt=""
        width={48}
        height={48}
        className={`h-12 w-12 shrink-0 rounded-2xl ${light ? "ring-2 ring-on-primary/20" : ""}`}
      />
      <div className="flex flex-col">
        <span
          className={`text-lg font-bold leading-tight ${light ? "text-on-primary" : "text-primary"}`}
        >
          Hệ thống Quản lý Nhà trẻ
        </span>
        <span
          className={`text-sm font-medium ${light ? "text-primary-fixed" : "text-on-surface-variant"}`}
        >
          Chăm sóc, đón trả và học phí trên một nơi
        </span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { user, isLoading, login } = useAuth();
  const router = useRouter();

  const [serverError, setServerError] = useState<ApiError | null>(null);
  const [rateLimitError, setRateLimitError] = useState<ApiError | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [showPassword, setShowPassword] = useState<boolean>(false);

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
    setServerError(null);
    setRateLimitError(null);

    try {
      await login(data.email, data.password);
      router.replace("/");
    } catch (err: unknown) {
      // login() của AuthContext đã ném sẵn ApiError (câu chữ của backend); 401 là một thông báo chung,
      // không nói sai ô nào (AC-AUTH-03)
      const error = err instanceof ApiError ? err : toApiError(err);
      if (error.status === 429) {
        setRateLimitError(error);
        setCooldownSeconds(RATE_LIMIT_SECONDS);
      } else {
        setServerError(error);
      }
    }
  }

  if (isLoading || user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface p-4">
        <LoadingSpinner label="Đang kiểm tra phiên đăng nhập..." />
      </main>
    );
  }

  const isFormLocked = isSubmitting || cooldownSeconds > 0;
  // Hết thời gian chờ thì bỏ thông báo 429, để người dùng thử lại
  const activeError = cooldownSeconds > 0 ? rateLimitError : serverError;

  return (
    <main className="flex min-h-screen bg-surface md:grid md:grid-cols-2">
      {/* Cột trái: logo, tên hệ thống và hình minh họa nhẹ; dưới md thì ẩn, logo chuyển lên trên form */}
      <section
        className="relative hidden overflow-hidden bg-primary md:flex md:flex-col md:justify-between md:p-10 lg:p-14"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-container/40" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-primary-fixed/15" />
        <div className="pointer-events-none absolute bottom-24 right-12 h-24 w-24 rounded-full bg-primary-fixed/25" />

        <div className="relative">
          <Brand light />
        </div>

        <ul className="relative space-y-4">
          {HIGHLIGHTS.map((item) => (
            <li key={item.text} className="flex items-center gap-3 text-on-primary">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-on-primary/15 text-primary-fixed">
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.text}</span>
            </li>
          ))}
        </ul>

        <p className="relative text-xs text-primary-fixed">
          Dành cho Ban giám hiệu, giáo viên, kế toán, y tế và phụ huynh
        </p>
      </section>

      {/* Cột phải: form đăng nhập */}
      <section className="flex w-full flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="md:hidden">
            <Brand />
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5 rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-6 shadow-sm sm:p-8"
          >
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-on-surface">Đăng nhập</h1>
              <p className="text-sm text-on-surface-variant">
                Dùng tài khoản nhà trường cấp
              </p>
            </div>

            {/* Có errors thì hiện từng dòng dưới message, không có thì chỉ hiện message (vùng 1).
                Không dùng ApiErrorAlert vì nó gọi lại toApiError, mà toApiError không nhận ApiError */}
            {activeError &&
              (activeError.errors && activeError.errors.length > 0 ? (
                <ErrorAlert
                  title={activeError.message}
                  message={activeError.errors.map((line) => `• ${line}`).join("\n")}
                />
              ) : (
                <ErrorAlert title="Không đăng nhập được" message={activeError.message} />
              ))}

            <Input
              id="email"
              type="email"
              label="Email"
              autoComplete="email"
              disabled={isFormLocked}
              error={errors.email?.message}
              placeholder="nhanvien@truong.edu.vn"
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
            />

            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              label="Mật khẩu"
              autoComplete="current-password"
              disabled={isFormLocked}
              error={errors.password?.message}
              placeholder="••••••••"
              suffixAction={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isFormLocked}
                  aria-label="Hiện mật khẩu"
                  aria-pressed={showPassword}
                  aria-controls="password"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                </button>
              }
              {...register("password", {
                required: "Vui lòng nhập mật khẩu",
              })}
            />

            <Button
              type="submit"
              size="lg"
              disabled={cooldownSeconds > 0}
              isLoading={isSubmitting}
              className="w-full"
            >
              {isSubmitting
                ? "Đang đăng nhập..."
                : cooldownSeconds > 0
                ? `Thử lại sau (${cooldownSeconds}s)`
                : "Đăng nhập"}
            </Button>

            {/* Không có "quên mật khẩu": Admin đặt lại mật khẩu (FR-AUTH-01); dòng này chỉ hướng dẫn, không phải liên kết */}
            <p className="text-center text-xs text-on-surface-variant">
              Quên mật khẩu? Liên hệ Ban giám hiệu để được đặt lại.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
