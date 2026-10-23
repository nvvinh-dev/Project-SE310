"use client";

import type { AttendanceStatus } from "@/types/attendance";
import { ATTENDANCE_STATUS_LABELS } from "@/types/attendance";

// Tông màu trạng thái theo design-system.md §3.2:
// - Có mặt: Tích cực (bg-primary-fixed/40 text-primary, chấm bg-primary)
// - Vắng có phép: Cảnh báo (bg-amber-100 text-amber-800, chấm bg-amber-600)
// - Vắng không phép: Nguy hiểm (bg-error-container text-on-error-container, chấm bg-error)
const TONE_CLASSES: Record<AttendanceStatus, { badge: string; dot: string }> = {
  Present: { badge: "bg-primary-fixed/40 text-primary", dot: "bg-primary" },
  AbsentExcused: { badge: "bg-amber-100 text-amber-800", dot: "bg-amber-600" },
  AbsentUnexcused: { badge: "bg-error-container text-on-error-container", dot: "bg-error" },
};

export function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  const tone = TONE_CLASSES[status] ?? {
    badge: "bg-slate-100 text-outline",
    dot: "bg-outline",
  };
  const label = ATTENDANCE_STATUS_LABELS[status] ?? status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${tone.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}
