"use client";

import { useForm } from "react-hook-form";
import { Button, ConfirmDialog, Modal, Select } from "@/components";
import { ROLE_VIETNAMESE_LABELS } from "@/components/DashboardLayout";
import type { Role } from "@/types/auth";
import type { UserResponse } from "@/types/user";
import { useChangeRole } from "../_lib/users-api";
import { ROLES, roleRules } from "../_lib/user-rules";
import { ApiErrorAlert } from "./ApiErrorAlert";
import { RoleBadge } from "./UserBadges";

interface ChangeRoleFormValues {
  role: Role | "";
}

interface ChangeRoleModalProps {
  user: UserResponse;
  onClose: () => void;
  onNext: (role: Role) => void;
}

// Bước 1: chọn vai trò mới. Chỉ 5 vai trò cố định, không có quyền chi tiết (D40 mục 1, D39 mục 13)
export function ChangeRoleModal({ user, onClose, onNext }: ChangeRoleModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangeRoleFormValues>({
    defaultValues: { role: "" },
    mode: "onTouched",
  });

  // Vai trò đang có bị khóa trong danh sách: đổi sang đúng vai trò đó backend trả 409 (D39 mục 7)
  const roleOptions = ROLES.map((role) => ({
    value: role,
    label: role === user.role ? `${ROLE_VIETNAMESE_LABELS[role]} (hiện tại)` : ROLE_VIETNAMESE_LABELS[role],
    disabled: role === user.role,
  }));

  return (
    <Modal isOpen onClose={onClose} title="Đổi vai trò" description="Chọn 1 trong 5 vai trò cố định của hệ thống.">
      <form onSubmit={handleSubmit((values) => onNext(values.role as Role))} noValidate className="space-y-4">
        <div className="rounded-2xl border border-slate-200/90 bg-surface-container-lowest p-4 space-y-2">
          <div>
            <p className="font-semibold text-on-surface break-words">{user.fullName}</p>
            <p className="text-xs text-on-surface-variant break-all">{user.email}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span>Vai trò hiện tại:</span>
            <RoleBadge role={user.role} />
          </div>
        </div>

        <Select
          label="Vai trò mới"
          required
          placeholder="Chọn vai trò mới"
          options={roleOptions}
          error={errors.role?.message}
          {...register("role", roleRules)}
        />

        <p className="text-xs text-on-surface-variant leading-relaxed">
          Người này mất quyền của vai trò cũ ngay ở lần thao tác kế tiếp và phải đăng nhập lại. Trạng thái
          hoạt động của tài khoản giữ nguyên.
        </p>

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

interface ConfirmChangeRoleDialogProps {
  user: UserResponse;
  role: Role;
  onClose: () => void;
  onSuccess: (user: UserResponse) => void;
}

// Bước 2: hộp thoại xác nhận rồi mới gọi API
export function ConfirmChangeRoleDialog({ user, role, onClose, onSuccess }: ConfirmChangeRoleDialogProps) {
  const changeRole = useChangeRole();

  return (
    <ConfirmDialog
      isOpen
      onClose={onClose}
      onConfirm={() => changeRole.mutate({ id: user.id, body: { role } }, { onSuccess })}
      isLoading={changeRole.isPending}
      variant="warning"
      title="Xác nhận đổi vai trò"
      confirmText="Đổi vai trò"
      message={
        <div className="space-y-3">
          <p>
            Đổi vai trò của <strong className="text-on-surface break-words">{user.fullName}</strong> từ{" "}
            <strong className="text-on-surface">{ROLE_VIETNAMESE_LABELS[user.role]}</strong> sang{" "}
            <strong className="text-on-surface">{ROLE_VIETNAMESE_LABELS[role]}</strong>?
          </p>
          <ApiErrorAlert error={changeRole.error} />
        </div>
      }
    />
  );
}
