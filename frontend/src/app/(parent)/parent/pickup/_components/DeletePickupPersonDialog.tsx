"use client";

import { ConfirmDialog } from "@/components";
import type { PickupPersonResponse } from "@/types/pickup";

interface DeletePickupPersonDialogProps {
  isOpen: boolean;
  person: PickupPersonResponse | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeletePickupPersonDialog({
  isOpen,
  person,
  isLoading,
  onClose,
  onConfirm,
}: DeletePickupPersonDialogProps) {
  if (!person) return null;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Xóa người đón dự phòng"
      message={
        <div className="space-y-2 text-sm text-on-surface-variant min-w-0">
          <p className="wrap-anywhere">
            Bạn có chắc chắn muốn xóa người đón dự phòng{" "}
            <span className="font-semibold text-on-surface">{person.fullName}</span> ({person.relationship}) không?
          </p>
          <p className="text-xs text-slate-500 wrap-anywhere">
            Sau khi xóa, ảnh khuôn mặt và thông tin đăng ký của người này sẽ bị xóa hoàn toàn khỏi hệ thống.
          </p>
        </div>
      }
      confirmText="Xóa người dự phòng"
      cancelText="Hủy"
      variant="danger"
      isLoading={isLoading}
    />
  );
}
