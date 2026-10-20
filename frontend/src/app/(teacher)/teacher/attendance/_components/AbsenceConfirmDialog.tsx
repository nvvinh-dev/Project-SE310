"use client";

import React from "react";
import { ConfirmDialog } from "@/components";
import type { AttendanceStatus, HomeroomChildResponse } from "@/types/attendance";
import { ATTENDANCE_STATUS_LABELS } from "@/types/attendance";

export interface PendingAbsence {
  child: HomeroomChildResponse;
  status: Exclude<AttendanceStatus, "Present">;
}

export interface WriteError {
  message: string;
  errors: string[] | null;
}

interface AbsenceConfirmDialogProps {
  pending: PendingAbsence | null;
  error: WriteError | null;
  isLoading: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

// Điểm danh vắng phải xác nhận (ui-screens.md SCR-TCH-01 Hành vi 3, §4.3): bản ghi không sửa được,
// và trẻ vắng không có nút giao trẻ ở SCR-TCH-04. Lỗi hiện ngay trong hộp thoại, hộp thoại chỉ
// đóng khi ghi thành công.
export function AbsenceConfirmDialog({
  pending,
  error,
  isLoading,
  onConfirm,
  onClose,
}: AbsenceConfirmDialogProps) {
  if (!pending) return null;

  const statusLabel = ATTENDANCE_STATUS_LABELS[pending.status];

  return (
    <ConfirmDialog
      isOpen
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
      variant="warning"
      title="Xác nhận điểm danh vắng"
      confirmText={`Ghi ${statusLabel.toLowerCase()}`}
      message={
        <div className="space-y-3">
          <p>
            Ghi <strong className="text-on-surface">{statusLabel}</strong> cho{" "}
            <strong className="text-on-surface break-words">{pending.child.fullName}</strong>?
          </p>
          <p className="text-xs">
            Bản điểm danh không sửa được sau khi ghi. Trẻ vắng sẽ không có nút giao trẻ ở màn hình
            Đón về hôm nay.
          </p>
          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-error/30 bg-error-container/40 p-3 text-left text-xs font-medium text-error"
            >
              {error.errors ? (
                <ul className="list-disc list-inside space-y-0.5">
                  {error.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              ) : (
                <p>{error.message}</p>
              )}
            </div>
          )}
        </div>
      }
    />
  );
}
