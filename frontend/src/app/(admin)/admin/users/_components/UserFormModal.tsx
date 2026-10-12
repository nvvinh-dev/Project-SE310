"use client";

import { useForm } from "react-hook-form";
import { Button, Input, Modal, Select } from "@/components";
import { ROLE_VIETNAMESE_LABELS } from "@/components/DashboardLayout";
import type { Role } from "@/types/auth";
import type { UserResponse } from "@/types/user";
import { useCreateUser, useUpdateUser } from "../_lib/users-api";
import { ROLES, emailRules, fullNameRules, passwordRules, roleRules } from "../_lib/user-rules";
import { ApiErrorAlert } from "./ApiErrorAlert";

const ROLE_OPTIONS = ROLES.map((role) => ({ value: role, label: ROLE_VIETNAMESE_LABELS[role] }));

interface CreateUserFormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role | "";
}

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: (user: UserResponse) => void;
}

export function CreateUserModal({ onClose, onSuccess }: CreateUserModalProps) {
  const createUser = useCreateUser();
  const isPending = createUser.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    // Vai trò để rỗng: Admin phải tự chọn, không có vai trò chọn sẵn (D43 mục 5)
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", role: "" },
    mode: "onTouched",
  });

  function onSubmit(values: CreateUserFormValues) {
    createUser.mutate(
      {
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role as Role,
      },
      { onSuccess }
    );
  }

  const handleClose = () => {
    if (!isPending) onClose();
  };

  return (
    <Modal
      isOpen
      onClose={handleClose}
      size="lg"
      title="Thêm tài khoản"
      description="Admin đặt mật khẩu ban đầu rồi tự gửi cho người dùng. Mật khẩu không hiện lại ở bất kỳ đâu sau khi lưu."
      closeOnBackdropClick={!isPending}
      closeOnEscape={!isPending}
      showCloseButton={!isPending}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <ApiErrorAlert error={createUser.error} />

        <fieldset disabled={isPending} className="min-w-0 space-y-4">
          <Input
            label="Họ tên"
            required
            autoComplete="off"
            placeholder="Nguyễn Văn A"
            error={errors.fullName?.message}
            {...register("fullName", fullNameRules)}
          />

          <Input
            label="Email đăng nhập"
            required
            type="email"
            autoComplete="off"
            placeholder="nhanvien@truong.edu.vn"
            error={errors.email?.message}
            {...register("email", emailRules)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Mật khẩu"
              required
              type="password"
              autoComplete="new-password"
              helperText="Từ 8 đến 128 ký tự."
              error={errors.password?.message}
              {...register("password", passwordRules)}
            />

            <Input
              label="Nhập lại mật khẩu"
              required
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword", {
                validate: (value, formValues) =>
                  value === formValues.password || "Mật khẩu nhập lại không khớp.",
              })}
            />
          </div>

          <Select
            label="Vai trò"
            required
            placeholder="Chọn vai trò"
            options={ROLE_OPTIONS}
            helperText="Bắt buộc chọn 1 trong 5 vai trò."
            error={errors.role?.message}
            {...register("role", roleRules)}
          />
        </fieldset>

        <div className="flex items-center gap-3 pt-2">
          <Button variant="outline" onClick={handleClose} disabled={isPending} className="flex-1">
            Hủy
          </Button>
          <Button type="submit" isLoading={isPending} className="flex-1">
            Tạo tài khoản
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface EditUserFormValues {
  fullName: string;
  email: string;
}

interface EditUserModalProps {
  user: UserResponse;
  onClose: () => void;
  onSuccess: (user: UserResponse) => void;
}

// Sửa tài khoản chỉ đổi họ tên và email (D39 mục 7)
export function EditUserModal({ user, onClose, onSuccess }: EditUserModalProps) {
  const updateUser = useUpdateUser();
  const isPending = updateUser.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EditUserFormValues>({
    defaultValues: { fullName: user.fullName, email: user.email },
    mode: "onTouched",
  });

  function onSubmit(values: EditUserFormValues) {
    updateUser.mutate(
      { id: user.id, body: { fullName: values.fullName.trim(), email: values.email.trim() } },
      { onSuccess }
    );
  }

  const handleClose = () => {
    if (!isPending) onClose();
  };

  return (
    <Modal
      isOpen
      onClose={handleClose}
      size="lg"
      title="Sửa tài khoản"
      description="Chỉ sửa họ tên và email. Vai trò, mật khẩu và trạng thái đổi bằng các nút riêng trên danh sách."
      closeOnBackdropClick={!isPending}
      closeOnEscape={!isPending}
      showCloseButton={!isPending}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <ApiErrorAlert error={updateUser.error} />

        <fieldset disabled={isPending} className="min-w-0 space-y-4">
          <Input
            label="Họ tên"
            required
            autoComplete="off"
            error={errors.fullName?.message}
            {...register("fullName", fullNameRules)}
          />

          <Input
            label="Email đăng nhập"
            required
            type="email"
            autoComplete="off"
            error={errors.email?.message}
            {...register("email", emailRules)}
          />
        </fieldset>

        <div className="flex items-center gap-3 pt-2">
          <Button variant="outline" onClick={handleClose} disabled={isPending} className="flex-1">
            Hủy
          </Button>
          <Button type="submit" isLoading={isPending} disabled={!isDirty} className="flex-1">
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
}
