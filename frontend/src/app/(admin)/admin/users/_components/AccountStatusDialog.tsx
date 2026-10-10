"use client";

import { ConfirmDialog } from "@/components";
import { ROLE_VIETNAMESE_LABELS } from "@/components/DashboardLayout";
import type { UserResponse } from "@/types/user";
import { useSetUserActive } from "../_lib/users-api";
import { ApiErrorAlert } from "./ApiErrorAlert";

interface AccountStatusDialogProps {
  user: UserResponse;
  // true = mở lại, false = vô hiệu hóa
  activate: boolean;
  onClose: () => void;
  onSuccess: (user: UserResponse) => void;
}

// Chỉ vô hiệu hóa, không xóa cứng; tài khoản đã vô hiệu hóa mở lại được (D39 mục 7)
export function AccountStatusDialog({ user, activate, onClose, onSuccess }: AccountStatusDialogProps) {
  const setUserActive = useSetUserActive();

  return (
    <ConfirmDialog
      isOpen
      onClose={onClose}
      onConfirm={() => setUserActive.mutate({ id: user.id, active: activate }, { onSuccess })}
      isLoading={setUserActive.isPending}
      variant={activate ? "primary" : "warning"}
      title={activate ? "Mở lại tài khoản" : "Vô hiệu hóa tài khoản"}
      confirmText={activate ? "Mở lại" : "Vô hiệu hóa"}
      message={
        <div className="space-y-3">
          {activate ? (
            <p>
              Mở lại tài khoản <strong className="text-on-surface break-words">{user.fullName}</strong>? Người
              này đăng nhập lại được với vai trò{" "}
              <strong className="text-on-surface">{ROLE_VIETNAMESE_LABELS[user.role]}</strong>.
            </p>
          ) : (
            <>
              <p>
                Vô hiệu hóa tài khoản <strong className="text-on-surface break-words">{user.fullName}</strong>?
              </p>
              <p className="text-xs">
                Người này không đăng nhập được và mất quyền ngay ở lần thao tác kế tiếp. Dữ liệu người này đã
                ghi nhận vẫn được giữ nguyên; bạn có thể mở lại tài khoản sau.
              </p>
            </>
          )}
          <ApiErrorAlert error={setUserActive.error} />
        </div>
      }
    />
  );
}
