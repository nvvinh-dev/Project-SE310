"use client";

import React from "react";
import type { AttendanceStatus } from "@/types/attendance";
import { ATTENDANCE_STATUS_LABELS } from "@/types/attendance";

// Tông theo design-system.md §3.2: Có mặt tích cực, Vắng có phép cảnh báo, Vắng không phép nguy
// hiểm, chưa điểm danh trung tính. Khuôn nhãn theo §5.1 (RoleBadge, StatusBadge của SCR-ADM-02)
const TONE_CLASSES: Record<AttendanceStatus | "Unrecorded", { badge: string; dot: string }> = {
  Present: { badge: "bg-primary-fixed/40 text-primary", dot: "bg-primary" },
  AbsentExcused: { badge: "bg-amber-100 text-amber-800", dot: "bg-amber-600" },
  AbsentUnexcused: { badge: "bg-error-container text-on-error-container", dot: "bg-error" },
  Unrecorded: { badge: "bg-slate-100 text-outline", dot: "bg-outline" },
};

export function AttendanceStatusBadge({ status }: { status?: AttendanceStatus }) {
  const key = status ?? "Unrecorded";
  const label = status ? ATTENDANCE_STATUS_LABELS[status] : "Chưa điểm danh";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${TONE_CLASSES[key].badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${TONE_CLASSES[key].dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}
