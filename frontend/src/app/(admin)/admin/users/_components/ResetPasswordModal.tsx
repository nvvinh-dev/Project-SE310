"use client";

import { useForm } from "react-hook-form";
import { Button, ConfirmDialog, Input, Modal } from "@/components";
import type { UserResponse } from "@/types/user";
import { useResetPassword } from "../_lib/users-api";
import { passwordRules } from "../_lib/user-rules";
import { ApiErrorAlert } from "./ApiErrorAlert";

interface ResetPasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

interface ResetPasswordModalProps {
  user: UserResponse;
  onClose: () => void;
  onNext: (newPassword: string) => void;
}

// Bước 1: nhập mật khẩu mới. Admin đặt lại thủ công, không có quên mật khẩu tự động (D20)
export function ResetPasswordModal({ user, onClose, onNext }: ResetPasswordModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: { newPassword: "", confirmPassword: "" },
    mode: "onTouched",
  });

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Đặt lại mật khẩu"
      description="Đặt mật khẩu mới rồi tự gửi cho người dùng. Mật khẩu không hiện lại sau khi lưu."
    >
      <form onSubmit={handleSubmit((values) => onNext(values.newPassword))} noValidate className="space-y-4">
        <div className="rounded-2xl border border-slate-200/90 bg-surface-container-lowest p-4">
          <p className="font-semibold text-on-surface break-words">{user.fullName}</p>
          <p className="text-xs text-on-surface-variant break-all">{user.email}</p>
        </div>

        <Input
          label="Mật khẩu mới"
          required
          type="password"
          autoComplete="new-password"
          helperText="Từ 8 đến 128 ký tự."
          error={errors.newPassword?.message}
          {...register("newPassword", passwordRules)}
        />

        <Input
          label="Nhập lại mật khẩu mới"
          required
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            validate: (value, formValues) =>
              value === formValues.newPassword || "Mật khẩu nhập lại không khớp.",
          })}
        />

        <div className="flex items-center gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Hủy
          </Button>
          <Button type="submit" className="flex-1">
            Tiếp tục
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface ConfirmResetPasswordDialogProps {
  user: UserResponse;
  newPassword: string;
  isCurrentUser: boolean;
  onClose: () => void;
  onSuccess: (user: UserResponse) => void;
}

// Bước 2: hộp thoại xác nhận rồi mới gọi API. Đặt lại mật khẩu làm token cũ hết hiệu lực (D48)
export function ConfirmResetPasswordDialog({
  user,
  newPassword,
  isCurrentUser,
  onClose,
  onSuccess,
}: ConfirmResetPasswordDialogProps) {
  const resetPassword = useResetPassword();

  return (
    <ConfirmDialog
      isOpen
      onClose={onClose}
      onConfirm={() => resetPassword.mutate({ id: user.id, body: { newPassword } }, { onSuccess })}
      isLoading={resetPassword.isPending}
      variant="warning"
      title="Xác nhận đặt lại mật khẩu"
      confirmText="Đặt lại mật khẩu"
      message={
        <div className="space-y-3">
          <p>
            Đặt lại mật khẩu cho <strong className="text-on-surface break-words">{user.fullName}</strong>?
          </p>
          <p className="text-xs">
            {isCurrentUser
              ? "Đây là tài khoản bạn đang đăng nhập: phiên hiện tại sẽ hết hiệu lực và bạn phải đăng nhập lại bằng mật khẩu mới."
              : "Mật khẩu cũ không dùng được nữa; người này phải đăng nhập lại bằng mật khẩu mới."}
          </p>
          <ApiErrorAlert error={resetPassword.error} />
        </div>
      }
    />
  );
}
