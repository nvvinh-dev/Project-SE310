"use client";

import { ApiErrorAlert, ConfirmDialog } from "@/components";
import type { PickupPersonResponse } from "@/types/pickup";
import { useDeletePickupPerson } from "../_lib/parent-pickup-api";

interface DeletePickupPersonDialogProps {
  childId: string;
  person: PickupPersonResponse;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

// Xóa người đón dự phòng qua hộp thoại xác nhận, không cần ô đồng ý (SCR-PAR-04 Hành vi 5).
// Lỗi API hiện ngay trong hộp thoại, chỉ đóng khi thành công (design-system.md §5, khuôn AccountStatusDialog)
export function DeletePickupPersonDialog({
  childId,
  person,
  onClose,
  onSuccess,
}: DeletePickupPersonDialogProps) {
  const deletePickupPerson = useDeletePickupPerson();

  return (
    <ConfirmDialog
      isOpen
      onClose={onClose}
      onConfirm={() =>
        deletePickupPerson.mutate(
          { childId, personId: person.id },
          { onSuccess: () => onSuccess("Đã xóa người đón dự phòng.") }
        )
      }
      isLoading={deletePickupPerson.isPending}
      variant="danger"
      title="Xóa người đón dự phòng"
      confirmText="Xóa"
      message={
        <div className="space-y-3">
          <p>
            Xóa người đón dự phòng{" "}
            <strong className="text-on-surface wrap-anywhere">{person.fullName}</strong> (
            {person.relationship})?
          </p>
          {/* AC-PICKUP-12: ảnh bị xóa khỏi hệ thống, lịch sử đón đã có không đổi */}
          <p className="text-xs">
            Thông tin và ảnh khuôn mặt của người này bị xóa khỏi hệ thống. Lịch sử đón đã ghi nhận
            không thay đổi.
          </p>
          <ApiErrorAlert error={deletePickupPerson.error} />
        </div>
      }
    />
  );
}
