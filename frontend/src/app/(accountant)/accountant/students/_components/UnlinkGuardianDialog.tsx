"use client";

import { ApiErrorAlert, ConfirmDialog } from "@/components";
import type { ChildResponse, GuardianResponse } from "@/types/child";
import { useUnlinkGuardian } from "../_lib/children-api";

interface UnlinkGuardianDialogProps {
  child: ChildResponse;
  guardian: GuardianResponse;
  onClose: () => void;
  onSuccess: (guardian: GuardianResponse) => void;
}

// Gỡ liên kết chỉ xóa dòng liên kết, dữ liệu của trẻ giữ nguyên (D40 mục 1). Phụ huynh mất quyền xem trẻ
// ngay từ request kế tiếp (AC-STU-05)
export function UnlinkGuardianDialog({ child, guardian, onClose, onSuccess }: UnlinkGuardianDialogProps) {
  const unlinkGuardian = useUnlinkGuardian(child.id);

  return (
    <ConfirmDialog
      isOpen
      onClose={onClose}
      onConfirm={() => unlinkGuardian.mutate(guardian.userId, { onSuccess })}
      isLoading={unlinkGuardian.isPending}
      variant="danger"
      title="Gỡ liên kết phụ huynh"
      confirmText="Gỡ liên kết"
      message={
        <div className="space-y-3">
          <p>
            Gỡ liên kết giữa phụ huynh <strong className="text-on-surface break-words">{guardian.fullName}</strong>{" "}
            <span className="wrap-anywhere">({guardian.email})</span> và trẻ{" "}
            <strong className="text-on-surface break-words">{child.fullName}</strong>?
          </p>
          <p className="text-xs">
            Phụ huynh mất quyền xem dữ liệu của trẻ ngay. Điểm danh, sức khỏe, hóa đơn của trẻ vẫn giữ nguyên; bạn có
            thể liên kết lại sau.
          </p>
          <ApiErrorAlert error={unlinkGuardian.error} />
        </div>
      }
    />
  );
}
