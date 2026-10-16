"use client";

import React from "react";
import { Button, EmptyState, ErrorAlert, Icons, LoadingSpinner } from "@/components";
import type { ButtonVariant } from "@/components";
import type {
  AttendanceResponse,
  AttendanceStatus,
  HomeroomChildResponse,
} from "@/types/attendance";
import { ATTENDANCE_STATUS_LABELS } from "@/types/attendance";
import { formatCheckInTime } from "../_lib/attendance-helpers";

export interface AttendanceRowItem {
  child: HomeroomChildResponse;
  attendance?: AttendanceResponse;
}

export interface SubmittingCheckIn {
  childId: string;
  status: AttendanceStatus;
}

interface AttendanceListProps {
  items: AttendanceRowItem[];
  submitting: SubmittingCheckIn | null;
  onCheckIn: (childId: string, status: AttendanceStatus) => void;
  onOpenHealthNote: (child: HomeroomChildResponse) => void;
  isLoading: boolean;
  // Chỉ truyền khi chưa có dữ liệu: lỗi lúc tải lại thì trang giữ danh sách cũ (ui-screens.md §4.2)
  errorMessage: string | null;
  onRetry: () => void;
  isClassEmpty: boolean;
  onClearFilters: () => void;
}

const CHECK_IN_BUTTONS: { status: AttendanceStatus; variant: ButtonVariant; className: string }[] = [
  { status: "Present", variant: "primary", className: "font-semibold" },
  {
    status: "AbsentExcused",
    variant: "outline",
    className: "font-semibold border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100",
  },
  {
    status: "AbsentUnexcused",
    variant: "outline",
    className: "font-semibold border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100",
  },
];

const STATUS_BADGE_CLASSES: Record<AttendanceStatus, { badge: string; dot: string }> = {
  Present: { badge: "bg-emerald-100 text-emerald-800 border-emerald-300", dot: "bg-emerald-600" },
  AbsentExcused: { badge: "bg-amber-100 text-amber-800 border-amber-300", dot: "bg-amber-600" },
  AbsentUnexcused: { badge: "bg-rose-100 text-rose-800 border-rose-300", dot: "bg-rose-600" },
};

// Danh sách thiết kế cho điện thoại trước (ui-screens.md §4.5, NFR-USE-04): mỗi trẻ một thẻ, ba
// nút cao 44px bấm một lần là ghi. Từ lg trở lên tên trẻ và ba nút nằm trên cùng một dòng.
export function AttendanceList({
  items,
  submitting,
  onCheckIn,
  onOpenHealthNote,
  isLoading,
  errorMessage,
  onRetry,
  isClassEmpty,
  onClearFilters,
}: AttendanceListProps) {
  if (isLoading) {
    return <LoadingSpinner label="Đang tải danh sách trẻ..." />;
  }

  if (errorMessage) {
    return (
      <ErrorAlert
        title="Không tải được danh sách điểm danh"
        message={errorMessage}
        onRetry={onRetry}
      />
    );
  }

  if (isClassEmpty) {
    // Câu rỗng chung của mọi màn hình giáo viên (ui-screens.md §2.3)
    return (
      <EmptyState
        title="Chưa có trẻ trong lớp"
        message="Chưa có trẻ nào trong lớp chủ nhiệm của bạn. Nếu bạn chưa được phân công lớp, liên hệ Ban giám hiệu."
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Không tìm thấy trẻ"
        message="Không có trẻ nào khớp với bộ lọc đang chọn."
        actionText="Xóa bộ lọc"
        onAction={onClearFilters}
      />
    );
  }

  return (
    <ul className="space-y-2.5">
      {items.map(({ child, attendance }) => (
        <li
          key={child.id}
          className="rounded-2xl border border-slate-200/90 bg-surface-container-lowest p-3 sm:p-4 shadow-xs flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm uppercase shrink-0">
              {child.fullName.trim().charAt(0)}
            </div>
            <div className="min-w-0 space-y-1.5">
              <p className="font-semibold text-on-surface leading-snug">{child.fullName}</p>

              <div className="flex flex-wrap items-center gap-2">
                {/* Lưu ý sức khỏe (FR-HEALTH-07): đánh dấu nổi bật, bấm để xem nội dung, chỉ đọc */}
                {child.healthNotes && (
                  <button
                    type="button"
                    onClick={() => onOpenHealthNote(child)}
                    aria-label={`Xem lưu ý sức khỏe của ${child.fullName}`}
                    className="inline-flex min-h-8 max-w-full items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors cursor-pointer"
                  >
                    <span className="text-amber-600 shrink-0">
                      <Icons.Alert />
                    </span>
                    <span className="truncate max-w-48">{child.healthNotes}</span>
                  </button>
                )}

                {attendance && (
                  <>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_BADGE_CLASSES[attendance.status].badge}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${STATUS_BADGE_CLASSES[attendance.status].dot}`}
                      />
                      {ATTENDANCE_STATUS_LABELS[attendance.status]}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      lúc {formatCheckInTime(attendance.checkInTimeUtc)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bản ghi đã tạo không sửa, không xóa (BR-ATTENDANCE-04): đã điểm danh thì không còn nút */}
          {!attendance && (
            <div
              role="group"
              aria-label={`Điểm danh ${child.fullName}`}
              className="grid grid-cols-3 gap-2 lg:w-[27rem] lg:shrink-0"
            >
              {CHECK_IN_BUTTONS.map(({ status, variant, className }) => (
                <Button
                  key={status}
                  size="sm"
                  variant={variant}
                  disabled={submitting !== null}
                  isLoading={submitting?.childId === child.id && submitting.status === status}
                  onClick={() => onCheckIn(child.id, status)}
                  className={`min-h-11 w-full text-center leading-tight ${className}`}
                >
                  {ATTENDANCE_STATUS_LABELS[status]}
                </Button>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
